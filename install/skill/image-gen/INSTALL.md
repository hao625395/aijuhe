# 安装站点生图技能包

这个技能包是面向你的网站用户的生图 skill。它会让 Codex、Claude Code、OpenClaw、Hermes 等客户端请求你的站点 OpenAI 兼容 `/v1` 接口，并由你的站点统一完成鉴权、分组、计费和日志。

## 推荐发给 AI 的安装提示词

可以直接把下面这句话发给 Codex、Claude Code、OpenClaw、Hermes 或其他支持技能/规则扩展的 AI 客户端：

```text
请安装或读取这个完整技能包：https://aijuhe.fun/install/skill/image-gen 。如果你的客户端不能自动拉取整个目录，请先读取 https://aijuhe.fun/install/skill/image-gen/SKILL.md ，再按其中的资源导航读取 scripts/node/image-gen.js、scripts/python/image_gen.py、references/api-recipes.md 和 agents/openai.yaml，并把这些文件保存到你当前客户端的技能/规则目录中。
```

也可以使用短路径：

```text
请安装或读取这个完整技能包：https://aijuhe.fun/skill/image-gen 。如果你的客户端不能自动拉取整个目录，请先读取 https://aijuhe.fun/skill/image-gen/SKILL.md ，再按其中的资源导航读取 scripts/node/image-gen.js、scripts/python/image_gen.py、references/api-recipes.md 和 agents/openai.yaml，并把这些文件保存到你当前客户端的技能/规则目录中。
```

## 安装方式

推荐安装完整目录，而不是只复制 `SKILL.md`。完整目录包含：

- `SKILL.md`
- `INSTALL.md`
- `package.json`
- `agents/openai.yaml`
- `scripts/node/image-gen.js`
- `scripts/python/image_gen.py`
- `references/api-recipes.md`

Codex 常见安装位置：

```text
~/.codex/skills/site-image-gen
```

也可以放到当前项目的技能目录：

```text
.agents/skills/site-image-gen
```

## 给用户的配置说明

用户需要配置的是你网站发放的 API Key 和你网站的 API base URL：

```bash
export OPENAI_API_KEY="sk-your-site-key"
export SITE_IMAGE_BASE_URL="https://aijuhe.fun/v1"
```

Windows PowerShell：

```powershell
$env:OPENAI_API_KEY="sk-your-site-key"
$env:SITE_IMAGE_BASE_URL="https://aijuhe.fun/v1"
```

也可以在每次调用脚本时显式传入：

```bash
node scripts/node/image-gen.js --base-url "https://aijuhe.fun/v1" --api-key "sk-your-site-key" --mode text --prompt "生成一张产品海报" --out ./poster.png
```

## 需要替换的站点信息

发布给用户前，建议把文档里的占位域名统一替换为你的真实站点：

```text
https://aijuhe.fun/v1
```

如果你的站点对外 API 域名是根地址而不是 `/v1`，例如：

```text
https://aijuhe.fun
```

也可以直接配置这个根地址。脚本会自动拼接 `/v1/images/generations`、`/v1/responses` 和 `/v1/images/edits`，并避免拼出 `/v1/v1/...`。

## 用途

这个 skill 用于通过你的站点构建：

- 文生图：`/v1/images/generations`
- 图生图：`/v1/responses` + `image_generation` tool
- 图片编辑：`/v1/images/edits`

所有请求都启用 `stream`。默认图片模型是 `gpt-image-2`，图生图 Responses 顶层模型默认是 `gpt-5.4-mini`，可按你的站点模型映射调整。

## 快速测试

Node.js：

```bash
node scripts/node/image-gen.js --mode text --prompt "生成一张简洁科技风图标" --size 1024x1024 --out ./generated-image.png
```

Python：

```bash
python scripts/python/image_gen.py --mode text --prompt "生成一张简洁科技风图标" --size 1024x1024 --out ./generated-image.png
```

如果没有设置 `SITE_IMAGE_BASE_URL`，脚本默认使用 `https://aijuhe.fun/v1`。如果你以后更换 API 域名，可以通过 `SITE_IMAGE_BASE_URL` 或 `--base-url` 覆盖。
