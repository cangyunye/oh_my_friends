import fs from "node:fs"
import path from "node:path"
import * as core from "./core"

// pi agent 适配层。与 opencode 版 dts.ts 同构:本文件不 import pi 的任何包,
// registerTool 需要的 typebox Type 与 ExtensionAPI 由 install-pi 生成的 loader 注入
// (pi 通过 jiti 加载扩展,但依赖注入可避免 loader/仓库目录解析 node_modules 的差异)。

// deno-lint-ignore no-explicit-any
type AnyRecord = Record<string, any>

export interface PiApiLike {
  registerTool(def: AnyRecord): void
  registerCommand(name: string, opts: AnyRecord): void
  on(event: string, handler: (event: any, ctx: any) => unknown): void
  sendUserMessage(content: string, opts?: AnyRecord): void
}

export interface PiDeps {
  pi: PiApiLike
  // typebox 的 Type 命名空间,由 loader 从 pi 内置的 "typebox" 包导入后传入
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Type: any
  // 可选:pi-ai 的 StringEnum(Google 兼容枚举);不传则用 Type.Union 字面量枚举
  StringEnum?: ((values: readonly string[]) => unknown) | undefined
  // 仓库内 RULES.md 绝对路径,用于 before_agent_start 注入 system prompt
  rulesPath?: string
}

interface ToolCtx {
  cwd?: string
  sessionManager?: { getSessionId?: () => string | undefined }
}

const rootOf = (ctx: ToolCtx) => ctx.cwd ?? process.cwd()

function sessionIdOf(ctx: ToolCtx): string {
  try {
    return ctx.sessionManager?.getSessionId?.() ?? ""
  } catch {
    return ""
  }
}

function textResult(text: string) {
  return { content: [{ type: "text", text }], details: {} }
}

const LOG_SOURCES = ["bash", "chat", "user-file", "manual"] as const

export function createDtsPiExtension(deps: PiDeps): void {
  const { pi, Type } = deps

  // 规则注入:pi 没有全局 instructions 配置,改用 before_agent_start 把 RULES.md
  // 追加到 system prompt(每轮基于基础 prompt 重新链式构建,不会跨轮累积)
  if (deps.rulesPath) {
    let rules = ""
    try {
      rules = fs.readFileSync(deps.rulesPath, "utf8").trim()
    } catch {}
    if (rules) {
      pi.on("before_agent_start", async (event: { systemPrompt: string }) => {
        return { systemPrompt: `${event.systemPrompt}\n\n---\n\n${rules}` }
      })
    }
  }

  const sourceSchema = deps.StringEnum
    ? (deps.StringEnum as (v: readonly string[]) => unknown)(LOG_SOURCES)
    : Type.Union(
        LOG_SOURCES.map((s) => Type.Literal(s)),
        { description: "日志来源" },
      )

  pi.registerTool({
    name: "dts_open",
    label: "Dts Open",
    description:
      "创建一条 dts 问题档案。当用户提出问题/报错/异常行为/需要排查的疑问时立即调用(先建档再开始排查)。闲聊与纯知识问答不记录。",
    promptGuidelines: [
      "用户报告报错/崩溃/行为异常/测试失败等需要排查的问题时,先用 dts_open 建档再开始排查;闲聊与纯知识问答不建档",
    ],
    parameters: Type.Object({
      domain: Type.String({ description: "功能域前缀,小写,如 feat-login / fix-payment / infra-build" }),
      slug: Type.String({ description: "问题短标识,kebab-case,如 btn-crash-after-upgrade" }),
      question: Type.String({ description: "用户原话或问题一句话概括" }),
    }),
    async execute(_id: string, params: AnyRecord, _signal: unknown, _onUpdate: unknown, ctx: ToolCtx) {
      const r = core.openRecord(rootOf(ctx), {
        domain: String(params.domain),
        slug: String(params.slug),
        question: String(params.question),
        sessionId: sessionIdOf(ctx),
      })
      return textResult(
        [
          `已建档: ${r.id}`,
          `文件: ${r.file}`,
          `后续用 dts_log / dts_case / dts_evidence / dts_shot 追加证据,修复验证后用 dts_resolve 结案`,
        ].join("\n"),
      )
    },
  })

  pi.registerTool({
    name: "dts_log",
    label: "Dts Log",
    description:
      "向 dts 档案追加日志:命令输出(source=bash)、会话关键结论(source=chat)、用户提供的日志摘录(source=user-file)、其他(source=manual)。",
    parameters: Type.Object({
      id: Type.String({ description: "dts id" }),
      content: Type.String({ description: "日志内容原文或摘录" }),
      source: sourceSchema,
      summary: Type.Optional(Type.String({ description: "一句话说明这段日志证明了什么,可省略" })),
    }),
    async execute(_id: string, params: AnyRecord, _signal: unknown, _onUpdate: unknown, ctx: ToolCtx) {
      core.appendLog(
        rootOf(ctx),
        String(params.id),
        String(params.content),
        params.source as core.LogSource,
        params.summary ? String(params.summary) : undefined,
      )
      return textResult(`已追加日志到 ${params.id}`)
    },
  })

  pi.registerTool({
    name: "dts_case",
    label: "Dts Case",
    description: "向 dts 档案记录一条即时产生的 E2E 用例(AI 生成或用户提出)。",
    parameters: Type.Object({
      id: Type.String({ description: "dts id" }),
      title: Type.String({ description: "用例标题" }),
      steps: Type.Optional(Type.String({ description: "操作步骤,可省略" })),
      expected: Type.Optional(Type.String({ description: "预期结果,可省略" })),
      result: Type.Optional(Type.String({ description: "实际结果,如 pass / fail,可省略" })),
    }),
    async execute(_id: string, params: AnyRecord, _signal: unknown, _onUpdate: unknown, ctx: ToolCtx) {
      core.appendCase(rootOf(ctx), String(params.id), {
        title: String(params.title),
        steps: params.steps ? String(params.steps) : undefined,
        expected: params.expected ? String(params.expected) : undefined,
        result: params.result ? String(params.result) : undefined,
      })
      return textResult(`已记录用例到 ${params.id}`)
    },
  })

  pi.registerTool({
    name: "dts_evidence",
    label: "Dts Evidence",
    description: "把用户贴图/提供的截图或其他文件归档到 dts 档案的 shots/ 目录并在 md 中引用。",
    parameters: Type.Object({
      id: Type.String({ description: "dts id" }),
      paths: Type.Array(Type.String(), { description: "文件路径列表" }),
      note: Type.Optional(Type.String({ description: "证据说明,可省略" })),
    }),
    async execute(_id: string, params: AnyRecord, _signal: unknown, _onUpdate: unknown, ctx: ToolCtx) {
      const paths = Array.isArray(params.paths) ? params.paths.map(String) : []
      const rels = core.addEvidence(
        rootOf(ctx),
        String(params.id),
        paths,
        params.note ? String(params.note) : undefined,
      )
      return textResult(`已归档 ${rels.length} 个文件: ${rels.join(", ")}`)
    },
  })

  pi.registerTool({
    name: "dts_shot",
    label: "Dts Shot",
    description:
      "为 dts 档案截图。E2E 验证完成后调用:桌面/浏览器场景不传 text 做全屏截图;终端场景把关键输出传入 text 存文本快照。",
    parameters: Type.Object({
      id: Type.String({ description: "dts id" }),
      note: Type.Optional(Type.String({ description: "截图说明,可省略" })),
      text: Type.Optional(
        Type.String({ description: "终端文本快照内容,非空则不截屏改存 .txt,可省略" }),
      ),
    }),
    async execute(_id: string, params: AnyRecord, _signal: unknown, _onUpdate: unknown, ctx: ToolCtx) {
      try {
        const rel = core.screenshot(
          rootOf(ctx),
          String(params.id),
          params.note ? String(params.note) : undefined,
          params.text ? String(params.text) : undefined,
        )
        return textResult(`已保存: ${rel}`)
      } catch (e) {
        return textResult(
          `截图失败: ${e instanceof Error ? e.message : String(e)}。请改用 dts_shot 的 text 参数保存终端文本快照。`,
        )
      }
    },
  })

  pi.registerTool({
    name: "dts_resolve",
    label: "Dts Resolve",
    description: "结案一条 dts:问题已修复并验证后调用,必须写清修复方案与复盘(根因、教训)。",
    parameters: Type.Object({
      id: Type.String({ description: "dts id" }),
      fix: Type.String({ description: "修复方案:做了什么改动、为什么有效" }),
      lesson: Type.Optional(Type.String({ description: "复盘:根因、踩坑点、下次如何避免,可省略" })),
    }),
    async execute(_id: string, params: AnyRecord, _signal: unknown, _onUpdate: unknown, ctx: ToolCtx) {
      core.resolve(rootOf(ctx), String(params.id), {
        fix: String(params.fix),
        lesson: params.lesson ? String(params.lesson) : undefined,
      })
      return textResult(`已结案: ${params.id}`)
    },
  })

  pi.registerTool({
    name: "dts_list",
    label: "Dts List",
    description: "列出当前项目所有 dts 档案摘要。",
    parameters: Type.Object({}),
    async execute(_id: string, _params: AnyRecord, _signal: unknown, _onUpdate: unknown, ctx: ToolCtx) {
      const records = core.listRecords(rootOf(ctx))
      if (records.length === 0) return textResult("暂无 dts 记录")
      return textResult(
        records
          .map(
            (r) =>
              `${r.status === "open" ? "[open]    " : "[resolved]"} ${r.id} (${r.created.slice(0, 10)}) ${r.title}`,
          )
          .join("\n"),
      )
    },
  })

  // /dts 命令:等价 opencode 版 command-dts.md,经 sendUserMessage 触发一轮回顾
  pi.registerCommand("dts", {
    description: "回顾 dts 问题档案(列表 / 未解决 / 按域或 id 查看)",
    getArgumentCompletions: (prefix: string) => {
      const items: { value: string; label: string }[] = []
      for (const v of ["list", "open"]) {
        if (v.startsWith(prefix)) items.push({ value: v, label: v })
      }
      try {
        for (const d of new Set(core.listRecords(process.cwd()).map((r) => r.domain))) {
          if (d.startsWith(prefix)) items.push({ value: d, label: d })
        }
      } catch {}
      return items.length > 0 ? items : null
    },
    handler: async (args: string, ctx: ToolCtx) => {
      const root = rootOf(ctx)
      let index: string
      try {
        index = fs.readFileSync(path.join(root, "dts", "INDEX.md"), "utf8")
      } catch {
        index = "(暂无 dts/ 目录)"
      }
      const q = (args ?? "").trim()
      let task: string
      if (!q || q === "list") {
        task = "输出所有记录的摘要表(id、日期、摘要、状态)"
      } else if (q === "open" || q === "未解决") {
        task = "只列 open 记录,并逐条读取对应 dts/<id>/dts.md,给出当前进展"
      } else if (fs.existsSync(path.join(root, "dts", q, "dts.md"))) {
        task = `读取 dts/${q}/dts.md,完整复述:问题 → 调查时间线 → 证据 → 修复方案 → 复盘,并提炼 1-3 条学习要点`
      } else {
        task = `列出域 ${q} 的所有记录并总结共性教训`
      }
      const prompt = [
        "回顾 dts 问题档案。",
        "当前项目的 dts 索引:",
        "",
        index,
        "",
        task,
        '回答用中文,聚焦"这个案例能教会我什么"。',
      ].join("\n")
      try {
        deps.pi.sendUserMessage(prompt, { deliverAs: "followUp" })
      } catch {
        deps.pi.sendUserMessage(prompt)
      }
    },
  })
}
