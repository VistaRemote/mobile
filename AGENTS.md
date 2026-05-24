# @vistaremote/mobile — Agent 协作说明

面向 Cursor 等 AI 协作者。人类开发者见 Meta-Repo [CONTRIBUTING.md](../CONTRIBUTING.md)（若在 Meta 内开发）。

## 本仓库

| 项 | 说明 |
| :--- | :--- |
| Spec | spec/SPEC.md · Meta `spec/mobile-spec.md` |
| 常用命令 | `pnpm start` · `pnpm test` |
| 格式化 | Biome — `pnpm lint` |
| 测试 | Rstest — `pnpm test` |
| Node | ≥ 24（`.nvmrc` → 24.11 LTS） |

## 硬约束

- 跨端契约只改 **shared**，再改本仓。
- 遵循 [.cursor/rules/](./.cursor/rules/) 与 Meta `spec/`。
- 提交：Conventional Commits（Husky commitlint）。

## Meta-Repo 全览

克隆父仓库时使用 `vista-remote.code-workspace` 多根工作区。
