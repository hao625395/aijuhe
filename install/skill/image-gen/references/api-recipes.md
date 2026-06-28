# 站点 OpenAI 兼容接口流式生图示例

优先使用技能包内置脚本：

- Node.js：`scripts/node/image-gen.js`
- Python：`scripts/python/image_gen.py`

只有当当前环境无法执行这些脚本，或需要移植到其他语言时，才参考本文件里的接口结构和 SSE 解析方式。

## 统一脚本参数

两个脚本使用同一套参数：

- `--mode text|image|edit`：`text` 文生图，`image` 文+图生图，`edit` 图片编辑。
- `--api-key <key>`：站点 API Key；不传时读取 `SITE_API_KEY` 或 `OPENAI_API_KEY`。
- `--base-url <url>`：站点 API base URL；不传时读取 `SITE_IMAGE_BASE_URL` 或 `OPENAI_BASE_URL`，未配置时默认 `https://aijuhe.fun/v1`。
- `--prompt <text>`：提示词。
- `--image <path|url>`：`image` 和 `edit` 模式必填，支持本地图片或 URL。
- `--n <number>`：生成数量，默认 `1`。
- `--out <path|dir>`：保存文件或目录。
- `--size <size>`：图片尺寸，例如 `1024x1024`、`3840x2160`、`2160x3840`。
- `--model <model>`：`text/edit` 默认 `gpt-image-2`；`image` 默认 `gpt-5.4-mini`。
- `--image-model <model>`：仅 `image` 模式使用，默认 `gpt-image-2`。
- `--quality <quality>`：默认 `auto`。
- `--timeout <seconds>`：默认 `900`。

示例：

```bash
node scripts/node/image-gen.js --mode text --prompt "生成一张4K产品宣传图" --size 3840x2160 --out ./poster.png
node scripts/node/image-gen.js --mode image --prompt "参考图片生成科技风品牌图" --image ./logo.png --out ./brand.png
node scripts/node/image-gen.js --mode edit --prompt "把背景改成蓝色，主体不变" --image ./source.png --out ./edited.png
```

```bash
python scripts/python/image_gen.py --mode text --prompt "生成一张4K产品宣传图" --size 3840x2160 --out ./poster.png
python scripts/python/image_gen.py --mode image --prompt "参考图片生成科技风品牌图" --image ./logo.png --out ./brand.png
python scripts/python/image_gen.py --mode edit --prompt "把背景改成蓝色，主体不变" --image ./source.png --out ./edited.png
```

脚本成功时输出 JSON 到 stdout，失败时输出 JSON 到 stderr，便于智能体判断错误原因。

## Base URL 兼容规则

示例为了清晰使用带 `/v1` 的完整 URL。你的站点也可以让用户配置根地址。

- Base URL `https://aijuhe.fun` + 路径 `/v1/images/generations`
- Base URL `https://aijuhe.fun/v1` + 路径 `/images/generations`

`/responses` 和 `/images/edits` 也使用同样规则。避免拼出 `https://aijuhe.fun/v1/v1/...`。

使用 `/v1/responses` 做图生图时，顶层模型必须是站点支持的 OpenAI/Codex 兼容模型；图片工具模型仍然是 `gpt-image-2`。

## 通用 SSE 解析

图片数据可能出现在不同响应字段中，依次检查这些字段：

- `event.b64_json`
- `event.base64`
- `event.image_base64`
- `event.data[].b64_json`
- `event.response.output[].result`
- `event.item.result`

常见 partial / 进度事件包括：

- `image_generation.partial_image`
- `response.image_generation_call.partial_image`

常见完成事件包括：

- `image_generation.completed`
- `response.completed`
- `response.done`

## Node.js：文生图

```js
const { writeFile } = require("node:fs/promises");

const API_URL = "https://aijuhe.fun/v1/images/generations";
const API_KEY = process.env.SITE_API_KEY || process.env.OPENAI_API_KEY || "sk-your-site-key";

async function* readSse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split(/\r?\n\r?\n/);
    buffer = frames.pop() || "";
    for (const frame of frames) {
      const data = frame.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
      if (data && data !== "[DONE]") yield JSON.parse(data);
    }
  }
}

function imageFromEvent(event) {
  return event.b64_json || event.base64 || event.image_base64 || event.data?.[0]?.b64_json || event.item?.result || "";
}

async function main() {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ model: "gpt-image-2", prompt: "生成一张产品宣传图", n: 1, size: "1024x1024", stream: true, response_format: "b64_json" }),
  });
  if (!response.ok) throw new Error(await response.text());

  for await (const event of readSse(response)) {
    if (event.type === "image_generation.partial_image") continue;
    const image = imageFromEvent(event);
    if (image) {
      await writeFile("generated-image.png", Buffer.from(image, "base64"));
      return;
    }
  }
  throw new Error("No image data received.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
```

## Node.js：通过 Responses 图生图

```js
const { writeFile } = require("node:fs/promises");

const API_URL = "https://aijuhe.fun/v1/responses";
const API_KEY = process.env.SITE_API_KEY || process.env.OPENAI_API_KEY || "sk-your-site-key";

async function* readSse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split(/\r?\n\r?\n/);
    buffer = frames.pop() || "";
    for (const frame of frames) {
      const data = frame.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
      if (data && data !== "[DONE]") yield JSON.parse(data);
    }
  }
}

function imageFromEvent(event) {
  for (const key of ["b64_json", "base64", "image_base64"]) if (event[key]) return event[key];
  for (const item of event.data || []) {
    const image = imageFromEvent(item);
    if (image) return image;
  }
  for (const item of event.response?.output || []) if (item.result) return item.result;
  return event.item?.result || "";
}

async function main() {
  const body = {
    model: "gpt-5.4-mini",
    stream: true,
    input: [{
      role: "user",
      content: [
        { type: "input_text", text: "参考这张图，生成一张更精致的科技风品牌图。" },
        { type: "input_image", image_url: "https://aijuhe.fun/logo.png" },
      ],
    }],
    tools: [{ type: "image_generation", model: "gpt-image-2", size: "1024x1024", output_format: "png" }],
    tool_choice: { type: "image_generation" },
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await response.text());

  for await (const event of readSse(response)) {
    if (event.type === "image_generation.partial_image" || event.type === "response.image_generation_call.partial_image") continue;
    const image = imageFromEvent(event);
    if (image) {
      await writeFile("generated-image.png", Buffer.from(image, "base64"));
      return;
    }
  }
  throw new Error("No image data received.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
```

## Node.js：图片编辑

```js
const { readFile, writeFile } = require("node:fs/promises");

const API_URL = "https://aijuhe.fun/v1/images/edits";
const API_KEY = process.env.SITE_API_KEY || process.env.OPENAI_API_KEY || "sk-your-site-key";

async function* readSse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split(/\r?\n\r?\n/);
    buffer = frames.pop() || "";
    for (const frame of frames) {
      const data = frame.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
      if (data && data !== "[DONE]") yield JSON.parse(data);
    }
  }
}

async function main() {
  const form = new FormData();
  form.append("image", new Blob([await readFile("./source.png")], { type: "image/png" }), "source.png");
  form.append("prompt", "把图片整体颜色更改为蓝色。");
  form.append("model", "gpt-image-2");
  form.append("n", "1");
  form.append("quality", "auto");
  form.append("size", "1024x1024");
  form.append("stream", "true");
  form.append("response_format", "b64_json");

  const response = await fetch(API_URL, { method: "POST", headers: { Authorization: `Bearer ${API_KEY}`, Accept: "text/event-stream" }, body: form });
  if (!response.ok) throw new Error(await response.text());

  for await (const event of readSse(response)) {
    if (event.type === "image_generation.partial_image" || event.type === "response.image_generation_call.partial_image") continue;
    const image = event.b64_json || event.base64 || event.image_base64 || event.data?.[0]?.b64_json || event.item?.result || "";
    if (image) {
      await writeFile("edited-image.png", Buffer.from(image, "base64"));
      return;
    }
  }
  throw new Error("No image data received.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
```

## Python 说明

Python 使用同样的请求体。标准库实现可使用 `urllib.request.urlopen(..., timeout=900)`，逐块读取字节流，按空行切分 SSE frame，并用 `base64.b64decode(...)` 解码图片。
