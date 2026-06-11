@echo off
title 极客开发者 API 中转平台 - 启动控制台
color 0b

echo ===================================================================
echo               极客开发者 API 中转平台 - 一键启动助手
echo ===================================================================
echo.

rem 检查 Go 编译环境
where go >nul 2>nul
if %errorlevel% equ 0 (
    echo [*] 检测到系统安装了 Go 语言 SDK，正在自动为您构建最新版后端...
    echo.
    go build -o new-api.exe main.go
    if %errorlevel% equ 0 (
        echo [OK] 后端编译成功！已生成可执行程序 [new-api.exe]。
    ) else (
        echo [ERROR] Go 后端编译发生错误，请检查错误提示。
    )
) else (
    echo [*] 提示：当前系统未检测到 Go SDK。
    echo     若您需要编译最新 Go 代码，请前往 https://go.dev/ 官方下载并配置。
    echo     系统将尝试运行已有的编译程序，或仅启动前端服务。
)
echo -------------------------------------------------------------------
echo.

rem 准备启动后端
set START_BACKEND=0
if exist new-api.exe (
    set START_BACKEND=1
    echo [*] 发现已就绪的后端主程序 [new-api.exe]，准备后台运行...
    start "New API - 后端服务 (网关)" cmd /k "color 0a && echo [正在启动 Go 后端网关...] && echo. && new-api.exe"
) else (
    echo [提示] 未在根目录找到 [new-api.exe]。
    echo.
)
echo.

rem 准备启动前端
echo [*] 正在准备拉起前端开发调试服务器...
echo     1. 默认主题 (React 19 + Tailwind v4 + Rsbuild) [推荐]
echo     2. 经典主题 (React 18 + Semi UI)
echo.

set theme_choice=1
set /p theme_choice="请选择要启动的前端主题 [1 或 2, 默认: 1]: "

if "%theme_choice%"=="2" (
    echo.
    echo [*] 正在为 [经典主题] 启动开发服务器...
    start "New API - 经典前端服务器" cmd /k "cd /d web\classic && color 0b && echo [正在启动经典版前端开发服务...] && echo. && npm run dev"
) else (
    echo.
    echo [*] 正在为 [默认主题] 启动开发服务器...
    start "New API - 默认前端服务器" cmd /k "cd /d web\default && color 0d && echo [正在启动默认极客版前端开发服务...] && echo. && npm run dev"
)

echo.
echo ===================================================================
echo                              启动完毕
echo ===================================================================
echo.
if "%START_BACKEND%"=="1" (
    echo  [^] 后端接口服务：已在新窗口启动，默认端口为 3000。
)
echo  [^] 前端开发服务：已在新窗口启动，系统将使用 Rspack 编译。
echo  [^] 浏览器访问：请在前端编译完成后，访问本地地址。
echo.
echo  提示：您可以随时关闭独立的子窗口来终止对应的服务。
echo.
echo ===================================================================
echo 按任意键退出本管理窗口...
pause >nul
