@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
if not exist "%~dp0node_modules\electron\dist\electron.exe" (
    echo Electron runtime is missing.
    pause
    exit /b 1
)
if not exist "%~dp0dist\main\app.js" (
    echo Build is missing. Run npm run build first.
    pause
    exit /b 1
)
start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0dist\main\app.js" "--data-dir=%~dp0out\local-preview\profile" "--user-data-dir=%~dp0out\local-preview\electron-profile" "--init-repo=试用知识库" "--init-file=/首页.md"
