---
name: site-image-gen
description: 当用户需要通过当前网站、私有中转站、OpenAI 兼容网关或 Codex Pro 外接版分组使用 gpt-image-2 进行文生图、图生图、图片编辑，或需要编写相关流式生图脚本时使用本技能。本技能强制走用户所在站点的 /v1 base URL 和站点 API Key。
---

# 站点生图技能

## 资源导航

如果本技能是以完整目录安装，需要时读取这些文件：

- `scripts/node/image-gen.js`：Node.js 统一可执行模板，使用 `--mode text|image|edit` 切换文生图、文+图生图、图片编辑。
- `scripts/python/image_gen.py`：Python 统一可执行模板，参数与 Node.js 版本一致。
- `references/api-recipes.md`：文生图、图生图、图片编辑的可复制流式请求示例。
- `agents/openai.yaml`：可选的技能列表 UI 元数据。
- `package.json`：让 Node.js 模板在独立安装目录中按 CommonJS 运行。

优先从技能目录安装完整包，而不是只复制 `SKILL.md`，这样引用文件会一起保留。

如果只拿到 `SKILL.md` 链接，例如 `https://aijuhe.fun/install/skill/image-gen/SKILL.md`，不要假设所有 AI 客户端都会自动获取同目录文件。需要示例或脚本时，请根据目录 URL 显式读取：

- `https://aijuhe.fun/install/skill/image-gen/references/api-recipes.md`
- `https://aijuhe.fun/install/skill/image-gen/scripts/node/image-gen.js`
- `https://aijuhe.fun/install/skill/image-gen/scripts/python/image_gen.py`
- `https://aijuhe.fun/install/skill/image-gen/agents/openai.yaml`

## 核心规则

所有图片请求都必须走用户所在站点的 OpenAI 兼容 `/v1` 接口。不要把请求地址改成其他服务域名。

优先使用当前工具或客户端配置里的站点 API Key：

- `OPENAI_API_KEY`：推荐给用户配置为你网站发放的 token。
- `SITE_API_KEY`：也支持作为站点专用 token 环境变量。
- `SITE_IMAGE_BASE_URL`：可选，默认站点 API base URL 是 `https://aijuhe.fun/v1`，需要换域名时再覆盖。
- `OPENAI_BASE_URL`：也支持，但要确认它指向你的站点，而不是其他服务地址。

不要要求用户在聊天中粘贴完整 API Key。如果本地缺少 key，让用户在本机环境变量或客户端 provider 设置里配置后确认。

## 接口模式

根据任务选择三种模式之一：

1. **文生图**：`POST {SITE_BASE_URL}/images/generations` 或 `POST {SITE_ROOT}/v1/images/generations`
   - 图片模型：`gpt-image-2`
   - 必填：`prompt`、`stream: true`、`response_format: "b64_json"`

2. **图生图（Responses 图片工具）**：`POST {SITE_BASE_URL}/responses` 或 `POST {SITE_ROOT}/v1/responses`
   - 顶层模型：使用站点支持的 OpenAI/Codex 兼容模型，例如 `gpt-5.4-mini`，或用户指定的模型。
   - 图片工具模型：`gpt-image-2`
   - 必填：`stream: true`、包含 `input_text` + `input_image` 的 `input`、`tools: [{ type: "image_generation", ... }]`、`tool_choice: { type: "image_generation" }`

3. **图片编辑**：`POST {SITE_BASE_URL}/images/edits` 或 `POST {SITE_ROOT}/v1/images/edits`
   - 图片模型：`gpt-image-2`
   - multipart 必填字段：`image`、`prompt`、`model`、`stream: "true"`、`response_format: "b64_json"`

需要复制代码时，读取 `references/api-recipes.md`。需要直接执行时，优先使用 `scripts/node/image-gen.js` 或 `scripts/python/image_gen.py`，不要每次临时重写请求脚本。

## 可执行模板优先

完整安装本技能包后，优先复用内置脚本。

脚本成功时输出 JSON：

```json
{ "ok": true, "mode": "text", "paths": ["/abs/path/generated-image.png"] }
```

脚本失败时输出 JSON 到 stderr：

```json
{ "ok": false, "code": "missing_argument", "message": "缺少站点 API Key：请传入 --api-key 或设置 SITE_API_KEY/OPENAI_API_KEY", "detail": { "key": "api-key" } }
```

统一参数：

- `--mode text|image|edit`：`text` 文生图，`image` 文+图生图，`edit` 图片编辑。
- `--api-key <key>`：站点 API Key；不传时读取 `SITE_API_KEY` 或 `OPENAI_API_KEY`。
- `--base-url <url>`：站点 API base URL；不传时读取 `SITE_IMAGE_BASE_URL` 或 `OPENAI_BASE_URL`，未配置时默认 `https://aijuhe.fun/v1`。
- `--prompt <text>`：提示词。
- `--image <path|url>`：`image` 和 `edit` 模式必填，支持本地路径或 URL。
- `--n <number>`：生成数量，默认 `1`。
- `--out <path|dir>`：保存文件或目录。
- `--size <size>`：图片尺寸，例如 `1024x1024`、`3840x2160`、`2160x3840`。
- `--model <model>`：`text/edit` 默认 `gpt-image-2`；`image` 默认 `gpt-5.4-mini`。
- `--image-model <model>`：仅 `image` 模式使用，默认 `gpt-image-2`。
- `--quality <quality>`：默认 `auto`。
- `--timeout <seconds>`：默认 `900`。

Node.js 示例：

```bash
node scripts/node/image-gen.js --mode text --prompt "生成一张4K产品宣传图" --size 3840x2160 --out ./poster.png
node scripts/node/image-gen.js --mode image --prompt "参考图片生成科技风品牌图" --image ./logo.png --out ./brand.png
node scripts/node/image-gen.js --mode edit --prompt "把背景改成蓝色，主体不变" --image ./source.png --out ./edited.png
```

Python 示例：

```bash
python scripts/python/image_gen.py --mode text --prompt "生成一张4K产品宣传图" --size 3840x2160 --out ./poster.png
python scripts/python/image_gen.py --mode image --prompt "参考图片生成科技风品牌图" --image ./logo.png --out ./brand.png
python scripts/python/image_gen.py --mode edit --prompt "把背景改成蓝色，主体不变" --image ./source.png --out ./edited.png
```

选择运行环境：

- 如果有 Node.js 18+，优先使用 `scripts/node/image-gen.js`，无需额外依赖。
- 如果没有 Node.js，但有 Python 3，使用 `scripts/python/image_gen.py`，只依赖标准库。
- 如果两个环境都不可执行，再读取 `references/api-recipes.md` 让智能体生成适配当前环境的请求代码。

## 工作流程

1. 判断任务类型：
   - 没有输入图片：文生图。
   - 输入图片只作为风格、主体、构图、配色参考：走 `/v1/responses` 图生图。
   - 要修改现有图片并尽量保留其中内容：走 `/v1/images/edits` 图片编辑。

2. 确认站点密钥和模型：
   - 优先使用已有 `SITE_API_KEY`、`OPENAI_API_KEY`、provider 配置或客户端里配置的站点 key。
   - base URL 默认指向你的站点 `https://aijuhe.fun/v1`，不要使用其他服务地址。
   - 如果 base URL 带 `/v1`，脚本会拼 `/images/generations`；如果 base URL 不带 `/v1`，脚本会拼 `/v1/images/generations`。
   - 确认站点已对用户分组开放 `gpt-image-2`，并支持图片接口的流式转发。

3. 构造流式请求：
   - 优先调用 `scripts/node/image-gen.js` 或 `scripts/python/image_gen.py`。
   - JSON 接口使用 `stream: true`。
   - multipart 图片编辑使用 `stream: "true"`。
   - 图片生成和编辑接口使用 `response_format: "b64_json"`。
   - 请求头设置 `Accept: text/event-stream`。
   - 超时时间使用 900 秒左右。

4. 解析 SSE：
   - 按空行切分 frame。
   - 读取 `data:` 行。
   - 忽略 `[DONE]`。
   - 解析 JSON。
   - 收到 partial 事件时跳过，等待最终图片结果，保持 stdout 只输出最终 JSON。
   - 从这些字段提取图片 base64：`b64_json`、`base64`、`image_base64`、`data[].b64_json`、`response.output[].result`、`item.result`。

5. 交付和保存图片：
   - base64 解码后写入 PNG/JPEG。
   - 默认使用清晰文件名，例如 `generated-image.png`、`edited-image.png`。
   - 不要覆盖已有项目资产，除非用户明确要求替换。
   - 在支持图片展示的客户端中，生成完成后优先把图片直接发送给用户，同时保留本地保存路径。

## gpt-image-2 尺寸

可使用 `auto` 或显式 `WIDTHxHEIGHT`。常用尺寸：

- `1024x1024`：方图草稿/默认
- `1536x1024`：横图
- `1024x1536`：竖图
- `2048x2048`：2K 方图
- `2048x1152`：2K 横图
- `3840x2160`：4K 横图
- `2160x3840`：4K 竖图
- `auto`：让模型自动选择

只有用户明确要求高分辨率时再用 4K，因为 4K 更慢，也更容易触发超时或额度限制。

## 安全要求

- 不要把真实 API Key 写进文件或文档。
- 示例中使用 `sk-your-site-key` 或从环境变量读取。
- 不要引导终端用户配置其他平台的 key；终端用户只应该使用你网站发放的 key。
- 如果网络受限，请请求网络权限，不要退回同步请求。
