# dts 问题档案规则

你有 `dts_*` 系列工具,用于把开发中遇到的问题建档到项目 `dts/` 目录,供日后回顾学习。

## 何时建档

- 用户报告报错、崩溃、行为不符合预期、测试失败,或提出需要排查的疑问 → **立即 `dts_open`**,先建档再动手
- 用户明确要求"记一下这个问题"
- 不建档:闲聊、纯知识问答、一步完成的琐碎任务

## 建档参数

- `domain`:功能域前缀,小写,如 `feat-login` / `fix-payment` / `infra-build` / `chore-deps`
- `slug`:问题短标识,kebab-case,如 `btn-crash-after-upgrade`
- 一个问题一条 dts;同一会话出现新的无关问题 → 另开一条

## 排查过程中追加

- 关键命令输出、错误堆栈 → `dts_log`(source=bash)
- 对话中的关键结论、排查思路转折 → `dts_log`(source=chat)
- 用户提供的日志文件 → `dts_log`(source=user-file,content 为关键摘录)
- 即时生成的或用户提出的 E2E 用例 → `dts_case`
- 用户贴图或给出的截图/文件路径 → `dts_evidence`
- **E2E 验证完成后** → `dts_shot`:桌面/浏览器场景留空 text 做全屏截图;终端场景把关键输出传 text 存文本快照

## 结案

- 修复并验证通过 → `dts_resolve`
  - `fix`:具体改动内容与生效原因,不空泛
  - `lesson`:根因、踩坑点、下次如何避免;写不出来就写一两句事实,不要编
- 只有 workaround 未根治 → `fix` 中如实说明,不要假装已解决

## 注意

- `dts/INDEX.md` 由插件自动维护,**不要手动编辑**
- 排查中可随时 `read` 该条 `dts.md` 回看已记录内容
