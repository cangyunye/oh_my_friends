import * as core from "./core"

export interface ToolCtx {
  directory?: string
  worktree?: string
  sessionID?: string
}

// deno-lint-ignore no-explicit-any
type ToolHelper = ((def: any) => any) & { schema: any }

const root = (ctx: ToolCtx) => ctx.worktree ?? ctx.directory ?? process.cwd()

export function createDtsTools(tool: ToolHelper): Record<string, unknown> {
  return {
    dts_open: tool({
      description:
        "创建一条 dts 问题档案。当用户提出问题/报错/异常行为/需要排查的疑问时立即调用(先建档再开始排查)。闲聊与纯知识问答不记录。",
      args: {
        domain: tool.schema.string().describe("功能域前缀,小写,如 feat-login / fix-payment / infra-build"),
        slug: tool.schema.string().describe("问题短标识,kebab-case,如 btn-crash-after-upgrade"),
        question: tool.schema.string().describe("用户原话或问题一句话概括"),
      },
      async execute(args, ctx) {
        const r = core.openRecord(root(ctx), {
          domain: String(args.domain),
          slug: String(args.slug),
          question: String(args.question),
          sessionId: ctx.sessionID,
        })
        return [
          `已建档: ${r.id}`,
          `文件: ${r.file}`,
          `后续用 dts_log / dts_case / dts_evidence / dts_shot 追加证据,修复验证后用 dts_resolve 结案`,
        ].join("\n")
      },
    }),
    dts_log: tool({
      description:
        "向 dts 档案追加日志:命令输出(source=bash)、会话关键结论(source=chat)、用户提供的日志摘录(source=user-file)、其他(source=manual)。",
      args: {
        id: tool.schema.string().describe("dts id"),
        content: tool.schema.string().describe("日志内容原文或摘录"),
        source: tool.schema.enum(["bash", "chat", "user-file", "manual"]).describe("日志来源"),
        summary: tool.schema.string().describe("一句话说明这段日志证明了什么,可省略"),
      },
      async execute(args, ctx) {
        core.appendLog(root(ctx), String(args.id), String(args.content), args.source as core.LogSource, args.summary ? String(args.summary) : undefined)
        return `已追加日志到 ${args.id}`
      },
    }),
    dts_case: tool({
      description: "向 dts 档案记录一条即时产生的 E2E 用例(AI 生成或用户提出)。",
      args: {
        id: tool.schema.string().describe("dts id"),
        title: tool.schema.string().describe("用例标题"),
        steps: tool.schema.string().describe("操作步骤,可省略"),
        expected: tool.schema.string().describe("预期结果,可省略"),
        result: tool.schema.string().describe("实际结果,如 pass / fail,可省略"),
      },
      async execute(args, ctx) {
        core.appendCase(root(ctx), String(args.id), {
          title: String(args.title),
          steps: args.steps ? String(args.steps) : undefined,
          expected: args.expected ? String(args.expected) : undefined,
          result: args.result ? String(args.result) : undefined,
        })
        return `已记录用例到 ${args.id}`
      },
    }),
    dts_evidence: tool({
      description: "把用户贴图/提供的截图或其他文件归档到 dts 档案的 shots/ 目录并在 md 中引用。",
      args: {
        id: tool.schema.string().describe("dts id"),
        paths: tool.schema.array(tool.schema.string()).describe("文件路径列表"),
        note: tool.schema.string().describe("证据说明,可省略"),
      },
      async execute(args, ctx) {
        const paths = Array.isArray(args.paths) ? args.paths.map(String) : []
        const rels = core.addEvidence(root(ctx), String(args.id), paths, args.note ? String(args.note) : undefined)
        return `已归档 ${rels.length} 个文件: ${rels.join(", ")}`
      },
    }),
    dts_shot: tool({
      description:
        "为 dts 档案截图。E2E 验证完成后调用:桌面/浏览器场景不传 text 做全屏截图;终端场景把关键输出传入 text 存文本快照。",
      args: {
        id: tool.schema.string().describe("dts id"),
        note: tool.schema.string().describe("截图说明,可省略"),
        text: tool.schema.string().describe("终端文本快照内容,非空则不截屏改存 .txt,可省略"),
      },
      async execute(args, ctx) {
        try {
          const rel = core.screenshot(
            root(ctx),
            String(args.id),
            args.note ? String(args.note) : undefined,
            args.text ? String(args.text) : undefined,
          )
          return `已保存: ${rel}`
        } catch (e) {
          return `截图失败: ${e instanceof Error ? e.message : String(e)}。请改用 dts_shot 的 text 参数保存终端文本快照。`
        }
      },
    }),
    dts_resolve: tool({
      description: "结案一条 dts:问题已修复并验证后调用,必须写清修复方案与复盘(根因、教训)。",
      args: {
        id: tool.schema.string().describe("dts id"),
        fix: tool.schema.string().describe("修复方案:做了什么改动、为什么有效"),
        lesson: tool.schema.string().describe("复盘:根因、踩坑点、下次如何避免,可省略"),
      },
      async execute(args, ctx) {
        core.resolve(root(ctx), String(args.id), {
          fix: String(args.fix),
          lesson: args.lesson ? String(args.lesson) : undefined,
        })
        return `已结案: ${args.id}`
      },
    }),
    dts_list: tool({
      description: "列出当前项目所有 dts 档案摘要。",
      args: {},
      async execute(_args, ctx) {
        const records = core.listRecords(root(ctx))
        if (records.length === 0) return "暂无 dts 记录"
        return records
          .map((r) => `${r.status === "open" ? "[open]    " : "[resolved]"} ${r.id} (${r.created.slice(0, 10)}) ${r.title}`)
          .join("\n")
      },
    }),
  }
}

export function createDtsPlugin(tool: ToolHelper) {
  return async () => ({ tool: createDtsTools(tool) })
}
