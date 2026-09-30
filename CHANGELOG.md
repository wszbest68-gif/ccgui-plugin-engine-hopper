# 变更说明

## 0.1.2 — 2026-09-30

**修复：市场安装/加载被宿主拒绝（`unknown permission 'host:models'`）。**

- **权限对齐官方契约**：移除 `host:models`——该权限与对应的 `ctx.models.*` API 只存在于未合入上游的宿主候选分支，官方宿主（1.1.0）与官方 SDK（0.3.15）均不存在，声明即被宿主权限门禁拒绝。
- **引擎/模型目录改走官方 `agent` 能力**：`ctx.models.catalog()` → `ctx.agent.catalog(workspacePath)`（SDK 0.3.14 起）；目录为空时面板挂载与芯片打开会触发兜底刷新。
- **版本握手修正**：`sdkVersion` `^0.3.16` → `^0.3.14`（官方 SDK 最新为 0.3.15，`^0.3.16` 在任何官方宿主上握手必败）；`minAppVersion` `1.0.10` → `1.0.9`。
- **校验器修正**：`scripts/validate-manifest.mjs` 白名单对齐官方 `spec/permissions.json`，移除对私有契约的硬编码（固定 minAppVersion/sdkVersion 等值断言、"必须声明全部权限"反向校验），新增官方宿主不存在 API（`ctx.models.*` / `ctx.window.*`）的调用点硬门禁。

版本号说明：跳过 0.1.1——该号曾用于本地未发布的中间态（仅手工摘除权限声明、代码未适配），为避免同号不同物直接从 0.1.0 升至 0.1.2。

## 0.1.0 — 2026-09-24

首个公开版本：跨引擎接力、智能分层交接、接力链回跳与增量续接。
