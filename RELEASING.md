# Loy NoteMaster Windows 发布

本 fork 使用 `.github/workflows/release.yml` 在 **GitHub Actions 的 Windows runner** 上打包，不需要在本机打包。

## 发布步骤

提交代码后，在包含工作流的提交上手动创建并推送版本 tag：

```powershell
git push origin develop
git tag -a v1.0.0 -m "Loy NoteMaster 1.0.0"
git push origin v1.0.0
```

下一版使用新的版本号，例如 `v1.0.1`。测试版可用 `v1.0.1-rc.1`，会自动标记为 GitHub Pre-release。
单纯推送分支或仅在本地创建 tag 不会触发打包。已有的 tag 不会被追溯打包。

CI 自动将 tag 中的版本写入构建时的 package.json，无需另外手改源码版本号。

## 下载

- Actions：<https://github.com/LoyWork/Loy_NoteMaster/actions>，工作流名称为 **Loy NoteMaster Windows Release**。
- Release：<https://github.com/LoyWork/Loy_NoteMaster/releases>。

每次发布包含 Windows x64 的 `.exe` 安装包、`.zip` 便携包、更新元数据和 `SHA256SUMS.txt`。
Actions 也会保留产物 14 天。正式 Release 中的文件持续保留。

## fork 的独立配置

- 打包配置：`electron-builder.fork.json`，应用名 **Loy NoteMaster**，安装标识 `com.loywork.notemaster`。
- 打包版本仅从 `LoyWork/Loy_NoteMaster` 获取更新，不会更新回上游 Yank Note。
- 不打包 macOS/Linux，不上传腾讯云 COS，不需要上游的签名或云存储密钥。
- GitHub Release 使用工作流自带的 `GITHUB_TOKEN`，无需配置个人访问令牌。
- Windows 包未做商业代码签名。
- CI 使用 node-pty 自带的 Windows N-API 预编译模块，并在打包后运行终端、全文搜索和 Pandoc 检查。

首次使用 fork 时，若 GitHub 提示 Actions 尚未启用，先在仓库 Actions 页面启用。
工作流限制只在 `LoyWork/Loy_NoteMaster` 执行；仓库改名时需同步修改工作流、打包配置和 `src/main/fork-release.ts`。
