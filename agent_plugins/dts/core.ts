import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"

export type LogSource = "bash" | "chat" | "user-file" | "manual"

export interface OpenInput {
  domain: string
  slug: string
  question: string
  sessionId?: string
}

export interface CaseInput {
  title: string
  steps?: string
  expected?: string
  result?: string
}

export interface ResolveInput {
  fix: string
  lesson?: string
}

export interface DtsRecord {
  id: string
  domain: string
  slug: string
  title: string
  status: "open" | "resolved"
  created: string
  resolved: string
  commit: string
  branch: string
  platform: string
  session: string
  dir: string
}

const SECTIONS = [
  "问题",
  "环境",
  "调查过程",
  "日志与摘录",
  "测试场景与 E2E 用例",
  "证据截图",
  "修复方案",
  "复盘",
]

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

function tzOffset(): string {
  const off = -new Date().getTimezoneOffset()
  const sign = off < 0 ? "-" : "+"
  return `${sign}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`
}

function now() {
  const d = new Date()
  const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${tzOffset()}`
  const clock = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
    d.getHours(),
  )}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  const hhmmss = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  return { iso, clock, stamp, hhmmss }
}

function sanitize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function yaml(v: string): string {
  return `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
}

function gitInfo(root: string): { commit: string; branch: string } {
  const run = (args: string[]) =>
    execFileSync("git", args, { cwd: root, timeout: 3000, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim()
  let commit = "unknown"
  let branch = "unknown"
  try {
    commit = run(["rev-parse", "--short", "HEAD"])
  } catch {}
  try {
    branch = run(["rev-parse", "--abbrev-ref", "HEAD"])
  } catch {}
  return { commit, branch }
}

function fenceFor(content: string): string {
  let max = 2
  for (const m of content.matchAll(/`{3,}/g)) max = Math.max(max, m[0].length)
  return "`".repeat(max + 1)
}

function dtsDir(root: string): string {
  return path.join(root, "dts")
}

function locate(root: string, id: string): { dir: string; file: string } {
  const dir = path.join(dtsDir(root), id)
  const file = path.join(dir, "dts.md")
  if (!fs.existsSync(file)) throw new Error(`dts record not found: ${id}`)
  return { dir, file }
}

function readMd(file: string): string {
  return fs.readFileSync(file, "utf8")
}

function parseFm(md: string): Record<string, string> {
  const m = md.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return {}
  const out: Record<string, string> = {}
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":")
    if (i === -1) continue
    const k = line.slice(0, i).trim()
    let v = line.slice(i + 1).trim()
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1).replace(/\\"/g, '"')
    out[k] = v
  }
  return out
}

function replaceFm(md: string, key: string, value: string): string {
  const re = new RegExp(`^(${key}: ).*$`, "m")
  if (re.test(md)) return md.replace(re, `$1${yaml(value)}`)
  return md.replace(/^---\n/, `---\n${key}: ${yaml(value)}\n`)
}

function appendToSection(md: string, section: string, block: string): string {
  const header = `## ${section}`
  const start = md.indexOf(header)
  if (start === -1) {
    const base = md.endsWith("\n") ? md : `${md}\n`
    return `${base}\n${header}\n\n${block}\n`
  }
  const next = md.indexOf("\n## ", start + header.length)
  const insertAt = next === -1 ? md.length : next
  const before = md.slice(0, insertAt).replace(/\s+$/, "")
  const lines = before.split("\n")
  const lastLine = lines[lines.length - 1]
  const contiguous =
    (block.startsWith("|") && lastLine.startsWith("|")) ||
    (block.startsWith("- ") && lastLine.startsWith("- "))
  const sep = contiguous ? "\n" : "\n\n"
  const after = md.slice(insertAt)
  return `${before}${sep}${block}\n${after.startsWith("\n") ? "" : "\n"}${after}`
}

function replaceSection(md: string, section: string, content: string): string {
  const header = `## ${section}`
  const start = md.indexOf(header)
  if (start === -1) return appendToSection(md, section, content)
  const next = md.indexOf("\n## ", start + header.length)
  const end = next === -1 ? md.length : next
  return `${md.slice(0, start)}${header}\n\n${content}\n${md.slice(end)}`
}

function appendTimeline(md: string, entry: string): string {
  return appendToSection(md, "调查过程", `- [${now().clock}] ${entry}`)
}

function nextSeq(dir: string): string {
  const shotsDir = path.join(dir, "shots")
  let max = 0
  if (fs.existsSync(shotsDir)) {
    for (const f of fs.readdirSync(shotsDir)) {
      const m = f.match(/^(\d+)/)
      if (m) max = Math.max(max, parseInt(m[1], 10))
    }
  }
  return String(max + 1).padStart(3, "0")
}

function addShotsEntries(md: string, entries: { rel: string; note: string; isImage: boolean }[]): string {
  const block = entries
    .map((e) => (e.isImage ? `![${e.note}](${e.rel})` : `[文本快照: ${e.note}](${e.rel})`))
    .join("\n\n")
  md = appendToSection(md, "证据截图", block)
  return appendTimeline(md, `记录证据 ${entries.length} 项`)
}

function renderRecord(
  id: string,
  domain: string,
  slug: string,
  question: string,
  meta: { commit: string; branch: string },
  sessionId: string,
): string {
  const t = now()
  const title = question.trim().split("\n")[0].slice(0, 80)
  return `---
id: ${yaml(id)}
domain: ${yaml(domain)}
slug: ${yaml(slug)}
title: ${yaml(title)}
status: "open"
created: ${yaml(t.iso)}
resolved: ""
commit: ${yaml(meta.commit)}
branch: ${yaml(meta.branch)}
platform: ${yaml(process.platform)}
session: ${yaml(sessionId)}
---

# ${id}

## 问题

${question.trim()}

## 环境

| 项 | 值 |
|----|----|
| git commit | ${meta.commit} |
| 分支 | ${meta.branch} |
| 平台 | ${process.platform} |
| 建档时间 | ${t.iso} |
| 会话 | ${sessionId || "-"} |

## 调查过程

- [${t.clock}] 建档

## 日志与摘录

## 测试场景与 E2E 用例

| # | 用例 | 步骤 | 预期 | 结果 |
|---|------|------|------|------|

## 证据截图

## 修复方案

## 复盘
`
}

export function openRecord(root: string, input: OpenInput): { id: string; dir: string; file: string } {
  const domain = sanitize(input.domain) || "misc"
  const slug = sanitize(input.slug) || "issue"
  let id = `${domain}_${slug}`
  let dir = path.join(dtsDir(root), id)
  if (fs.existsSync(dir)) {
    id = `${id}-${now().stamp}`
    dir = path.join(dtsDir(root), id)
  }
  fs.mkdirSync(path.join(dir, "shots"), { recursive: true })
  fs.mkdirSync(path.join(dir, "logs"), { recursive: true })
  const meta = gitInfo(root)
  const file = path.join(dir, "dts.md")
  fs.writeFileSync(file, renderRecord(id, domain, slug, input.question, meta, input.sessionId ?? ""))
  renderIndex(root)
  return { id, dir, file }
}

export function appendLog(
  root: string,
  id: string,
  content: string,
  source: LogSource,
  summary?: string,
): void {
  const { file } = locate(root, id)
  const t = now()
  const fence = fenceFor(content)
  const heading = `### [${source}] ${t.iso}${summary ? ` · ${summary}` : ""}`
  let md = readMd(file)
  md = appendToSection(md, "日志与摘录", `${heading}\n\n${fence}\n${content.trimEnd()}\n${fence}`)
  md = appendTimeline(md, `记录日志 (${source})${summary ? `: ${summary}` : ""}`)
  fs.writeFileSync(file, md)
}

function cell(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ").trim() || "-"
}

export function appendCase(root: string, id: string, c: CaseInput): void {
  const { file } = locate(root, id)
  let md = readMd(file)
  const section = "测试场景与 E2E 用例"
  const start = md.indexOf(`## ${section}`)
  const next = start === -1 ? -1 : md.indexOf("\n## ", start)
  const body = start === -1 ? "" : md.slice(start, next === -1 ? md.length : next)
  const n = body.split("\n").filter((l) => /^\|\s*\d+\s*\|/.test(l)).length + 1
  md = appendToSection(md, section, `| ${n} | ${cell(c.title)} | ${cell(c.steps ?? "")} | ${cell(c.expected ?? "")} | ${cell(c.result ?? "")} |`)
  md = appendTimeline(md, `新增 E2E 用例: ${c.title}`)
  fs.writeFileSync(file, md)
}

export function addEvidence(root: string, id: string, srcPaths: string[], note?: string): string[] {
  const { dir, file } = locate(root, id)
  const shotsDir = path.join(dir, "shots")
  fs.mkdirSync(shotsDir, { recursive: true })
  const entries: { rel: string; note: string; isImage: boolean }[] = []
  for (const src of srcPaths) {
    if (!fs.existsSync(src)) throw new Error(`evidence file not found: ${src}`)
    const seq = nextSeq(dir)
    const ext = path.extname(src) || ".bin"
    const name = `${seq}${ext}`
    fs.copyFileSync(src, path.join(shotsDir, name))
    const rel = `shots/${name}`
    const isImage = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".heic"].includes(ext.toLowerCase())
    entries.push({ rel, note: note ?? path.basename(src), isImage })
  }
  let md = readMd(file)
  md = addShotsEntries(md, entries)
  fs.writeFileSync(file, md)
  return entries.map((e) => e.rel)
}

const IMG_EXTS = ".png"

function captureFullScreen(dest: string): void {
  const platform = process.platform
  if (platform === "darwin") {
    execFileSync("screencapture", ["-x", dest], { timeout: 15000 })
    return
  }
  if (platform === "win32") {
    const ps = [
      "Add-Type -AssemblyName System.Windows.Forms,System.Drawing;",
      "$b=[System.Windows.Forms.SystemInformation]::VirtualScreen;",
      "$bmp=New-Object System.Drawing.Bitmap $b.Width,$b.Height;",
      "$g=[System.Drawing.Graphics]::FromImage($bmp);",
      "$g.CopyFromScreen($b.X,$b.Y,0,0,$bmp.Size);",
      `$bmp.Save('${dest.replace(/'/g, "''")}',[System.Drawing.Imaging.ImageFormat]::Png);`,
      "$g.Dispose();$bmp.Dispose()",
    ].join("")
    execFileSync("powershell", ["-NoProfile", "-Command", ps], { timeout: 30000 })
    return
  }
  const candidates: [string, string[]][] = [
    ["import", ["-window", "root", dest]],
    ["gnome-screenshot", ["-f", dest]],
    ["scrot", [dest]],
  ]
  let lastErr: unknown
  for (const [cmd, args] of candidates) {
    try {
      execFileSync(cmd, args, { timeout: 15000 })
      return
    } catch (e) {
      lastErr = e
    }
  }
  throw new Error(`no screenshot tool available on ${platform}: ${String(lastErr)}`)
}

export function screenshot(root: string, id: string, note?: string, text?: string): string {
  const { dir, file } = locate(root, id)
  const shotsDir = path.join(dir, "shots")
  fs.mkdirSync(shotsDir, { recursive: true })
  const seq = nextSeq(dir)
  const t = now()
  let rel: string
  let isImage: boolean
  if (text) {
    const name = `${seq}-${t.hhmmss}.txt`
    fs.writeFileSync(path.join(shotsDir, name), text)
    rel = `shots/${name}`
    isImage = false
  } else {
    const name = `${seq}-${t.hhmmss}${IMG_EXTS}`
    const dest = path.join(shotsDir, name)
    captureFullScreen(dest)
    rel = `shots/${name}`
    isImage = true
  }
  let md = readMd(file)
  md = addShotsEntries(md, [{ rel, note: note ?? (text ? "终端文本快照" : "全屏截图"), isImage }])
  md = appendTimeline(md, text ? "记录终端文本快照" : "记录全屏截图")
  fs.writeFileSync(file, md)
  return rel
}

export function resolve(root: string, id: string, input: ResolveInput): void {
  const { file } = locate(root, id)
  let md = readMd(file)
  const t = now()
  md = replaceFm(md, "status", "resolved")
  md = replaceFm(md, "resolved", t.iso)
  md = replaceSection(md, "修复方案", input.fix.trim())
  md = replaceSection(md, "复盘", input.lesson?.trim() || "-")
  md = appendTimeline(md, "结案")
  fs.writeFileSync(file, md)
  renderIndex(root)
}

export function listRecords(root: string): DtsRecord[] {
  const base = dtsDir(root)
  if (!fs.existsSync(base)) return []
  const records: DtsRecord[] = []
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const file = path.join(base, entry.name, "dts.md")
    if (!fs.existsSync(file)) continue
    const fm = parseFm(readMd(file))
    records.push({
      id: fm.id ?? entry.name,
      domain: fm.domain ?? "misc",
      slug: fm.slug ?? "",
      title: fm.title ?? "",
      status: fm.status === "resolved" ? "resolved" : "open",
      created: fm.created ?? "",
      resolved: fm.resolved ?? "",
      commit: fm.commit ?? "",
      branch: fm.branch ?? "",
      platform: fm.platform ?? "",
      session: fm.session ?? "",
      dir: path.join(base, entry.name),
    })
  }
  return records.sort((a, b) => b.created.localeCompare(a.created))
}

export function renderIndex(root: string): void {
  const base = dtsDir(root)
  fs.mkdirSync(base, { recursive: true })
  const records = listRecords(root)
  const open = records.filter((r) => r.status === "open").length
  const groups = new Map<string, DtsRecord[]>()
  for (const r of records) {
    if (!groups.has(r.domain)) groups.set(r.domain, [])
    groups.get(r.domain)!.push(r)
  }
  const domainOrder = [...groups.keys()].sort((a, b) => {
    const la = groups.get(a)![0].created
    const lb = groups.get(b)![0].created
    return lb.localeCompare(la)
  })
  const lines: string[] = [
    "# dts 问题档案索引",
    "",
    `共 ${records.length} 条 · 未解决 ${open} · 已解决 ${records.length - open} · 更新于 ${now().iso}`,
    "",
  ]
  if (records.length === 0) lines.push("暂无记录。", "")
  for (const domain of domainOrder) {
    lines.push(`## ${domain}`, "", "| id | 日期 | 摘要 | 状态 |", "|----|------|------|------|")
    for (const r of groups.get(domain)!) {
      const date = r.created.slice(0, 10)
      const status = r.status === "resolved" ? "resolved" : "**open**"
      lines.push(`| [${r.id}](${r.id}/dts.md) | ${date} | ${r.title} | ${status} |`)
    }
    lines.push("")
  }
  fs.writeFileSync(path.join(base, "INDEX.md"), lines.join("\n"))
}
