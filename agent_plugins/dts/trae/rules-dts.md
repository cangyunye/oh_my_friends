<!-- dts-plugin:begin v1 -->
## dts 问题档案(插件注入,勿删本标记行)

本项目通过 MCP 服务(dts)维护问题档案:每个问题建档为 `dts/<id>/dts.md`(问题 → 环境 → 调查过程 → 日志 → E2E 用例 → 证据截图 → 修复方案 → 复盘),供日后回顾学习。

### 何时建档

- 用户报告报错、崩溃、行为不符合预期、测试失败,或提出需要排查的疑问 → 立即调用 dts_open(先建档再动手)
- 用户明确要求"记一下这个问题"
- 不建档:闲聊、纯知识问答、一步完成的琐碎任务

### 建档与排查

- dts_open 参数:domain 功能域前缀(如 feat-login / fix-payment);slug 问题短标识(kebab-case);question 用户原话或一句话概括
- 一个问题一条 dts;同一会话出现新的无关问题 → 另开一条
- 关键命令输出、错误堆栈 → dts_log(source=bash);对话关键结论 → dts_log(source=chat);用户提供的日志文件 → dts_log(source=user-file,只摘录关键内容)
- 即时生成的或用户提出的 E2E 用例 → dts_case;用户贴图/文件 → dts_evidence
- E2E 验证完成后 → dts_shot:桌面/浏览器场景做全屏截图;终端场景把关键输出传 text 存文本快照

### 结案

- 修复并验证通过 → dts_resolve:fix 写具体改动与生效原因,不空泛;lesson 写根因、踩坑点、下次如何避免,写不出就写事实,不要编
- 只有 workaround 未根治 → fix 中如实说明,不要假装已解决

### 注意

- 档案默认建在当前工作区根目录的 dts/ 下;若落错位置,调用工具时传 root 参数(项目根绝对路径)
- dts/INDEX.md 由 MCP 服务自动维护,不要手动编辑;可用 read 工具随时回看某条 dts/<id>/dts.md
<!-- dts-plugin:end -->
