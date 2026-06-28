#!/usr/bin/env python3
import argparse
import base64
import json
import mimetypes
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path


class UserError(Exception):
    def __init__(self, code, message, detail=None):
        super().__init__(message)
        self.code = code
        self.detail = detail or {}


class JsonArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        raise UserError("invalid_argument", message, {"usage": self.format_usage()})


def parse_positive_int(value, key):
    try:
        parsed = int(value)
    except (TypeError, ValueError) as error:
        raise UserError("invalid_argument", f"--{key} 必须是正整数", {"key": key, "value": value}) from error
    if parsed < 1:
        raise UserError("invalid_argument", f"--{key} 必须是正整数", {"key": key, "value": value})
    return parsed


def default_api_key():
    return os.environ.get("SITE_API_KEY") or os.environ.get("OPENAI_API_KEY") or ""


def default_base_url():
    return os.environ.get("SITE_IMAGE_BASE_URL") or os.environ.get("OPENAI_BASE_URL") or "https://aijuhe.fun/v1"


def parse_args():
    parser = JsonArgumentParser(description="站点 OpenAI 兼容接口流式生图统一脚本")
    parser.add_argument("--mode", default="text", help="text=文生图，image=文+图生图，edit=图片编辑")
    parser.add_argument("--api-key", default=default_api_key(), help="默认读取 SITE_API_KEY 或 OPENAI_API_KEY")
    parser.add_argument("--base-url", default=default_base_url(), help="默认读取 SITE_IMAGE_BASE_URL/OPENAI_BASE_URL，未配置时使用 https://aijuhe.fun/v1")
    parser.add_argument("--prompt", default="", help="提示词")
    parser.add_argument("--image", default="", help="image/edit 模式必填，支持本地图片或 http(s) URL")
    parser.add_argument("--n", default="1", help="生成数量")
    parser.add_argument("--out", default="", help="保存文件或目录")
    parser.add_argument("--size", default="1024x1024", help="图片尺寸，例如 1024x1024、3840x2160")
    parser.add_argument("--model", default="", help="text/edit 默认 gpt-image-2；image 模式默认 gpt-5.4-mini")
    parser.add_argument("--image-model", default="gpt-image-2", help="image 模式图片工具模型")
    parser.add_argument("--quality", default="auto", help="默认 auto")
    parser.add_argument("--output-format", default="png", help="image 模式图片输出格式")
    parser.add_argument("--timeout", default="900", help="超时秒数")
    args = parser.parse_args()

    if args.mode not in ("text", "image", "edit"):
        raise UserError("invalid_mode", "--mode 只能是 text、image 或 edit", {"mode": args.mode})
    if not args.api_key:
        raise UserError("missing_argument", "缺少站点 API Key：请传入 --api-key 或设置 SITE_API_KEY/OPENAI_API_KEY", {"key": "api-key"})
    if not args.base_url:
        raise UserError("missing_argument", "缺少站点 API base URL：请传入 --base-url 或设置 SITE_IMAGE_BASE_URL/OPENAI_BASE_URL", {"key": "base-url"})
    if not args.prompt:
        raise UserError("missing_argument", "缺少必填参数 --prompt", {"key": "prompt"})
    args.n = parse_positive_int(args.n, "n")
    args.timeout = parse_positive_int(args.timeout, "timeout")
    if args.mode in ("image", "edit") and not args.image:
        raise UserError("missing_argument", f"{args.mode} 模式必须传入 --image", {"key": "image", "mode": args.mode})
    return args


def validate_base_url(base_url):
    parsed = urllib.parse.urlparse(base_url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise UserError("invalid_argument", "--base-url 必须是合法 URL，例如 https://aijuhe.fun/v1", {"baseUrl": base_url})
    return base_url.rstrip("/")


def build_api_url(base_url, path_with_v1):
    base = validate_base_url(base_url)
    api_path = path_with_v1 if path_with_v1.startswith("/") else f"/{path_with_v1}"
    if base.endswith("/v1") and api_path.startswith("/v1/"):
        return f"{base}{api_path[3:]}"
    return f"{base}{api_path}"


def guess_content_type(file_path):
    return mimetypes.guess_type(file_path)[0] or "image/png"


def is_url(value):
    return value.startswith("http://") or value.startswith("https://")


def fetch_image_url(url, timeout):
    request = urllib.request.Request(url, method="GET", headers={"User-Agent": "site-image-gen/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            status = getattr(response, "status", 200)
            if status < 200 or status >= 300:
                raise UserError("image_url_http_error", "图片链接返回非成功状态码", {"image": url, "status": status})
            content_type = response.headers.get("content-type", "image/png").split(";")[0]
            if not content_type.startswith("image/"):
                raise UserError("image_url_not_image", "图片链接返回的内容不是图片", {"image": url, "contentType": content_type})
            return response.read(), content_type, Path(urllib.parse.urlparse(url).path).name or "source.png"
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise UserError("image_url_http_error", "图片链接返回非成功状态码", {"image": url, "status": error.code, "body": body}) from error
    except urllib.error.URLError as error:
        raise UserError("image_url_fetch_failed", "图片链接无法打开", {"image": url, "reason": str(error.reason)}) from error


def read_local_image(file_path):
    path = Path(file_path)
    if not path.is_file():
        raise UserError("image_path_not_found", "本地图片路径不存在或不是文件", {"image": file_path})
    try:
        return path.read_bytes(), guess_content_type(str(path)), path.name
    except OSError as error:
        raise UserError("image_path_unreadable", "本地图片不可读取", {"image": file_path, "reason": str(error)}) from error


def image_to_input_url(image, timeout):
    if image.startswith("data:"):
        return image
    if is_url(image):
        data, content_type, _ = fetch_image_url(image, timeout)
    else:
        data, content_type, _ = read_local_image(image)
    return f"data:{content_type};base64,{base64.b64encode(data).decode('ascii')}"


def image_to_multipart_file(image, timeout):
    if is_url(image):
        return fetch_image_url(image, timeout)
    return read_local_image(image)


def json_request(url, api_key, body, timeout):
    payload = json.dumps(body).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=payload,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
        },
    )
    return open_request(request, timeout, url)


def multipart_request(url, api_key, fields, files, timeout):
    boundary = f"----siteimagegen{uuid.uuid4().hex}"
    body = bytearray()
    for name, value in fields.items():
        body.extend(f"--{boundary}\r\n".encode())
        body.extend(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode())
        body.extend(str(value).encode())
        body.extend(b"\r\n")
    for name, file_info in files.items():
        data, content_type, filename = file_info
        body.extend(f"--{boundary}\r\n".encode())
        body.extend(f'Content-Disposition: form-data; name="{name}"; filename="{filename}"\r\n'.encode())
        body.extend(f"Content-Type: {content_type}\r\n\r\n".encode())
        body.extend(data)
        body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode())

    request = urllib.request.Request(
        url,
        data=bytes(body),
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Accept": "text/event-stream",
        },
    )
    return open_request(request, timeout, url)


def open_request(request, timeout, url):
    try:
        return urllib.request.urlopen(request, timeout=timeout)
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise UserError("api_http_error", "站点生图接口返回非成功状态码", {"url": url, "status": error.code, "body": body}) from error
    except urllib.error.URLError as error:
        reason = str(error.reason)
        if "timed out" in reason.lower():
            raise UserError("request_timeout", "接口请求超时", {"url": url, "timeout": timeout}) from error
        raise UserError("network_error", "接口请求网络失败", {"url": url, "reason": reason}) from error


def iter_sse_json(response):
    buffer = ""
    while True:
        chunk = response.read(4096)
        if not chunk:
            break
        buffer += chunk.decode("utf-8", errors="replace").replace("\r\n", "\n")
        frames = buffer.split("\n\n")
        buffer = frames.pop()
        for frame in frames:
            data = "\n".join(line[5:].lstrip() for line in frame.splitlines() if line.startswith("data:")).strip()
            if not data or data == "[DONE]":
                continue
            try:
                yield json.loads(data)
            except json.JSONDecodeError as error:
                raise UserError("sse_json_parse_error", "SSE data 不是合法 JSON", {"data": data, "reason": str(error)}) from error


def is_partial_event(event):
    return event.get("type") in ("image_generation.partial_image", "response.image_generation_call.partial_image")


def raise_if_error_event(event):
    if event.get("type") not in ("error", "response.failed"):
        return
    message = ((event.get("response") or {}).get("error") or {}).get("message") or (event.get("error") or {}).get("message") or ""
    raise UserError("api_stream_error", "站点生图接口在流式事件中返回错误", {"type": event.get("type"), "message": message, "event": event})


def collect_images(event, images=None):
    if images is None:
        images = []
    if not isinstance(event, dict):
        return images
    for key in ("b64_json", "base64", "image_base64"):
        value = event.get(key)
        if isinstance(value, str) and value:
            images.append(value)
    for item in event.get("data") or []:
        collect_images(item, images)
    for item in ((event.get("response") or {}).get("output") or []):
        if isinstance(item, dict) and isinstance(item.get("result"), str) and item["result"]:
            images.append(item["result"])
        collect_images(item, images)
    item = event.get("item") or {}
    if isinstance(item, dict) and isinstance(item.get("result"), str) and item["result"]:
        images.append(item["result"])
    return images


def output_path_for(out, index, total, default_name):
    target = Path(out or default_name)
    is_directory = str(out or "").endswith(("/", "\\")) or target.suffix == ""
    if is_directory:
        name = default_name if total == 1 else f"{Path(default_name).stem}-{index + 1}{Path(default_name).suffix}"
        return target / name
    if total == 1:
        return target
    return target.with_name(f"{target.stem}-{index + 1}{target.suffix}")


def save_images(images, out, default_name):
    paths = []
    for index, image in enumerate(images):
        file_path = output_path_for(out, index, len(images), default_name).resolve()
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_bytes(base64.b64decode(image))
        paths.append(str(file_path))
    return paths


def build_request(args):
    if args.mode == "text":
        url = build_api_url(args.base_url, "/v1/images/generations")
        body = {
            "model": args.model or "gpt-image-2",
            "prompt": args.prompt,
            "n": args.n,
            "size": args.size,
            "quality": args.quality,
            "stream": True,
            "response_format": "b64_json",
        }
        return url, "generated-image.png", lambda: json_request(url, args.api_key, body, args.timeout)

    if args.mode == "image":
        url = build_api_url(args.base_url, "/v1/responses")
        body = {
            "model": args.model or "gpt-5.4-mini",
            "stream": True,
            "input": [{
                "role": "user",
                "content": [
                    {"type": "input_text", "text": args.prompt},
                    {"type": "input_image", "image_url": image_to_input_url(args.image, args.timeout)},
                ],
            }],
            "tools": [{
                "type": "image_generation",
                "model": args.image_model,
                "size": args.size,
                "quality": args.quality,
                "output_format": args.output_format,
            }],
            "tool_choice": {"type": "image_generation"},
        }
        return url, "generated-image.png", lambda: json_request(url, args.api_key, body, args.timeout)

    url = build_api_url(args.base_url, "/v1/images/edits")
    fields = {
        "prompt": args.prompt,
        "model": args.model or "gpt-image-2",
        "n": str(args.n),
        "quality": args.quality,
        "size": args.size,
        "stream": "true",
        "response_format": "b64_json",
    }
    files = {"image": image_to_multipart_file(args.image, args.timeout)}
    return url, "edited-image.png", lambda: multipart_request(url, args.api_key, fields, files, args.timeout)


def main():
    args = parse_args()
    url, default_name, request_factory = build_request(args)
    with request_factory() as response:
        for event in iter_sse_json(response):
            raise_if_error_event(event)
            if is_partial_event(event):
                continue
            images = collect_images(event)
            if images:
                paths = save_images(images[:args.n], args.out or default_name, default_name)
                print(json.dumps({"ok": True, "mode": args.mode, "paths": paths}, ensure_ascii=False, indent=2))
                return
    raise UserError("no_image_result", "流结束前没有收到图片结果数据", {"mode": args.mode, "url": url})


if __name__ == "__main__":
    try:
        main()
    except UserError as error:
        print(json.dumps({"ok": False, "code": error.code, "message": str(error), "detail": error.detail}, ensure_ascii=False, indent=2), file=sys.stderr)
        raise SystemExit(1)
    except Exception as error:
        print(json.dumps({"ok": False, "code": "unexpected_error", "message": str(error), "detail": {}}, ensure_ascii=False, indent=2), file=sys.stderr)
        raise SystemExit(1)
