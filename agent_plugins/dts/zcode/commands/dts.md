---
description: 回顾 dts 问题档案(列表 / 未解决 / 按域或 id 查看)
argument-hint: [list|open|<domain>|<id>]
---

回顾当前项目的 dts 问题档案。用户输入: "$ARGUMENTS"

步骤:

1. 用 read 工具读取 `dts/INDEX.md`(读不到就回答"暂无 dts/ 目录,遇到问题时 dts_open 建档"并结束)
2. 按 "$ARGUMENTS" 决定动作:

- 为空或 `list` → 输出所有记录的摘要表(id、日期、摘要、状态)
- `open` / `未解决` → 只列 open 记录,并逐条读取对应 `dts/<id>/dts.md`,给出当前进展
- 给出 domain(如 `feat-login`)→ 列出该域所有记录并总结共性教训
- 给出具体 id → 读取 `dts/<id>/dts.md`,完整复述:问题 → 调查时间线 → 证据 → 修复方案 → 复盘,并提炼 1-3 条学习要点

回答用中文,聚焦"这个案例能教会我什么"。
