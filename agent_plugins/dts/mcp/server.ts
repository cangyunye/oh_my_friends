import * as core from "../core.ts"
import readline from "node:readline"

// dts MCP stdio server:零依赖,把 core.ts 的 7 个能力以 MCP 工具暴露给
// reasonix / trae cn 等支持 MCP 的 agent。协议:newline-delimited JSON-RPC 2.0。
// 运行时:Node ≥ 22.18 原生 type stripping 直接跑 .ts;旧 Node 22.6+ 用
// --experimental-strip-types;或 Bun。由 launch.mjs 自动选择。

interface JsonRpcRequest {
  jsonrpc?: string
  id?: string | number | null
  method?: string
  params?: Record<string, unknown>
}

const PROTOCOL_FALLBACK = "2024-11-05"
const SERVER_INFO = { name: "dts", version: "1.0.0" }

function resolveRoot(explicit?: string): string {
  const e = (explicit ?? "").trim()
  if (e) return e
  return (
    process.env.DTS_ROOT ||
    process.env.REASONIX_WORKSPACE_ROOT ||
    process.env.CLAUDE_PROJECT_DIR ||
    process.cwd()
  )
}

function resolveSession(): string {
  return process.env.REASONIX_SESSION_ID || process.env.CLAUDE_SESSION_ID || ""
}

const stringSchema = (description: string) => ({ type: "string", description })

const TOOLS = [
  {
    name: "dts_open",
    description:
      "创建一条 dts 问题档案。当用户提出问题/报错/异常行为/需要排查的疑问时立即调用(先建档再开始排查)。闲聊与纯知识问答不记录。",
    inputSchema: {
      type: "object",
      properties: {
        domain: stringSchema("功能域前缀,小写,如 feat-login / fix-payment / infra-build"),
        slug: stringSchema("问题短标识,kebab-case,如 btn-crash-after-upgrade"),
        question: stringSchema("用户原话或问题一句话概括"),
        root: stringSchema("项目根目录绝对路径,默认取 DTS_ROOT 环境变量或服务启动 cwd,可省略"),
      },
      required: ["domain", "slug", "question"],
      additionalProperties: false,
    },
  },
  {
    name: "dts_log",
    description:
      "向 dts 档案追加日志:命令输出(source=bash)、会话关键结论(source=chat)、用户提供的日志摘录(source=user-file)、其他(source=manual)。",
    inputSchema: {
      type: "object",
      properties: {
        id: stringSchema("dts id"),
        content: stringSchema("日志内容原文或摘录"),
        source: { type: "string", enum: ["bash", "chat", "user-file", "manual"], description: "日志来源" },
        summary: stringSchema("一句话说明这段日志证明了什么,可省略"),
        root: stringSchema("项目根目录绝对路径,可省略"),
      },
      required: ["id", "content", "source"],
      additionalProperties: false,
    },
  },
  {
    name: "dts_case",
    description: "向 dts 档案记录一条即时产生的 E2E 用例(AI 生成或用户提出)。",
    inputSchema: {
      type: "object",
      properties: {
        id: stringSchema("dts id"),
        title: stringSchema("用例标题"),
        steps: stringSchema("操作步骤,可省略"),
        expected: stringSchema("预期结果,可省略"),
        result: stringSchema("实际结果,如 pass / fail,可省略"),
        root: stringSchema("项目根目录绝对路径,可省略"),
      },
      required: ["id", "title"],
      additionalProperties: false,
    },
  },
  {
    name: "dts_evidence",
    description: "把用户贴图/提供的截图或其他文件归档到 dts 档案的 shots/ 目录并在 md 中引用。",
    inputSchema: {
      type: "object",
      properties: {
        id: stringSchema("dts id"),
        paths: { type: "array", items: { type: "string" }, description: "文件路径列表" },
        note: stringSchema("证据说明,可省略"),
        root: stringSchema("项目根目录绝对路径,可省略"),
      },
      required: ["id", "paths"],
      additionalProperties: false,
    },
  },
  {
    name: "dts_shot",
    description:
      "为 dts 档案截图。E2E 验证完成后调用:桌面/浏览器场景不传 text 做全屏截图;终端场景把关键输出传入 text 存文本快照。",
    inputSchema: {
      type: "object",
      properties: {
        id: stringSchema("dts id"),
        note: stringSchema("截图说明,可省略"),
        text: stringSchema("终端文本快照内容,非空则不截屏改存 .txt,可省略"),
        root: stringSchema("项目根目录绝对路径,可省略"),
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "dts_resolve",
    description: "结案一条 dts:问题已修复并验证后调用,必须写清修复方案与复盘(根因、教训)。",
    inputSchema: {
      type: "object",
      properties: {
        id: stringSchema("dts id"),
        fix: stringSchema("修复方案:做了什么改动、为什么有效"),
        lesson: stringSchema("复盘:根因、踩坑点、下次如何避免,可省略"),
        root: stringSchema("项目根目录绝对路径,可省略"),
      },
      required: ["id", "fix"],
      additionalProperties: false,
    },
  },
  {
    name: "dts_list",
    description: "列出当前项目所有 dts 档案摘要。",
    inputSchema: {
      type: "object",
      properties: {
        root: stringSchema("项目根目录绝对路径,可省略"),
      },
      required: [],
      additionalProperties: false,
    },
  },
]

function callTool(name: string, args: Record<string, unknown>): string {
  const root = resolveRoot(typeof args.root === "string" ? args.root : undefined)
  switch (name) {
    case "dts_open": {
      const r = core.openRecord(root, {
        domain: String(args.domain),
        slug: String(args.slug),
        question: String(args.question),
        sessionId: resolveSession(),
      })
      return [
        `已建档: ${r.id}`,
        `文件: ${r.file}`,
        `后续用 dts_log / dts_case / dts_evidence / dts_shot 追加证据,修复验证后用 dts_resolve 结案`,
      ].join("\n")
    }
    case "dts_log":
      core.appendLog(
        root,
        String(args.id),
        String(args.content),
        args.source as core.LogSource,
        args.summary ? String(args.summary) : undefined,
      )
      return `已追加日志到 ${args.id}`
    case "dts_case":
      core.appendCase(root, String(args.id), {
        title: String(args.title),
        steps: args.steps ? String(args.steps) : undefined,
        expected: args.expected ? String(args.expected) : undefined,
        result: args.result ? String(args.result) : undefined,
      })
      return `已记录用例到 ${args.id}`
    case "dts_evidence": {
      const paths = Array.isArray(args.paths) ? args.paths.map(String) : []
      const rels = core.addEvidence(root, String(args.id), paths, args.note ? String(args.note) : undefined)
      return `已归档 ${rels.length} 个文件: ${rels.join(", ")}`
    }
    case "dts_shot":
      try {
        return `已保存: ${core.screenshot(
          root,
          String(args.id),
          args.note ? String(args.note) : undefined,
          args.text ? String(args.text) : undefined,
        )}`
      } catch (e) {
        return `截图失败: ${e instanceof Error ? e.message : String(e)}。请改用 dts_shot 的 text 参数保存终端文本快照。`
      }
    case "dts_resolve":
      core.resolve(root, String(args.id), {
        fix: String(args.fix),
        lesson: args.lesson ? String(args.lesson) : undefined,
      })
      return `已结案: ${args.id}`
    case "dts_list": {
      const records = core.listRecords(root)
      if (records.length === 0) return "暂无 dts 记录"
      return records
        .map(
          (r) =>
            `${r.status === "open" ? "[open]    " : "[resolved]"} ${r.id} (${r.created.slice(0, 10)}) ${r.title}`,
        )
        .join("\n")
    }
    default:
      throw new Error(`unknown tool: ${name}`)
  }
}

function send(obj: unknown): void {
  process.stdout.write(`${JSON.stringify(obj)}\n`)
}

function handleMessage(msg: JsonRpcRequest): void {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return
  const isNotification = msg.id === undefined || msg.id === null
  if (isNotification) return // notifications/initialized 等,无需应答
  switch (msg.method) {
    case "initialize":
      // 回显客户端请求的协议版本,兼容不同 spec(MCP 允许服务端选择支持版本)
      send({
        jsonrpc: "2.0",
        id: msg.id,
        result: {
          protocolVersion:
            typeof msg.params?.protocolVersion === "string" ? msg.params.protocolVersion : PROTOCOL_FALLBACK,
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER_INFO,
        },
      })
      break
    case "ping":
      send({ jsonrpc: "2.0", id: msg.id, result: {} })
      break
    case "tools/list":
      send({ jsonrpc: "2.0", id: msg.id, result: { tools: TOOLS } })
      break
    case "tools/call": {
      const params = (msg.params ?? {}) as { name?: string; arguments?: Record<string, unknown> }
      try {
        const text = callTool(String(params.name ?? ""), params.arguments ?? {})
        send({ jsonrpc: "2.0", id: msg.id, result: { content: [{ type: "text", text }] } })
      } catch (e) {
        send({
          jsonrpc: "2.0",
          id: msg.id,
          result: {
            content: [{ type: "text", text: `错误: ${e instanceof Error ? e.message : String(e)}` }],
            isError: true,
          },
        })
      }
      break
    }
    default:
      send({ jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: `method not found: ${msg.method}` } })
  }
}

const rl = readline.createInterface({ input: process.stdin, terminal: false })
rl.on("line", (line) => {
  const trimmed = line.trim()
  if (!trimmed) return
  let msg: JsonRpcRequest
  try {
    msg = JSON.parse(trimmed) as JsonRpcRequest
  } catch {
    return // 忽略无法解析的行,保持服务存活
  }
  try {
    handleMessage(msg)
  } catch (e) {
    if (msg.id !== undefined && msg.id !== null) {
      send({ jsonrpc: "2.0", id: msg.id, error: { code: -32603, message: String(e) } })
    }
  }
})
rl.on("close", () => process.exit(0))
