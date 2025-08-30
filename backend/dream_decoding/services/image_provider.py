import os
import requests
import contextlib
import base64
from io import BytesIO
from typing import Optional


class ImageProvider:
    """Abstract image provider interface."""

    def generate_image(self, prompt: str) -> str:
        raise NotImplementedError


class OpenAIImageProvider(ImageProvider):
    """OpenAI Images (DALL·E) provider.

    Requires OPENAI_API_KEY in environment.
    """

    def __init__(self, api_key: Optional[str] = None, size: str = "1024x1024"):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.size = size

    def generate_image(self, prompt: str) -> str:
        if not self.api_key:
            raise RuntimeError("OPENAI_API_KEY not configured")

        # Using OpenAI images endpoint v1
        url = "https://api.openai.com/v1/images/generations"
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        payload = {"model": "gpt-image-1", "prompt": prompt, "size": self.size}
        resp = requests.post(url, json=payload, headers=headers, timeout=120)
        resp.raise_for_status()
        data = resp.json()
        # Expecting data["data"][0]["url"]
        items = data.get("data") or []
        if not items:
            raise RuntimeError("No image returned from OpenAI")
        return items[0].get("url")


class ReplicateImageProvider(ImageProvider):
    """Replicate Stable Diffusion provider.

    Requires REPLICATE_API_TOKEN in environment.
    """

    def __init__(self, api_token: Optional[str] = None, model: str = "stability-ai/sdxl"):
        self.api_token = api_token or os.getenv("REPLICATE_API_TOKEN")
        self.model = model

    def generate_image(self, prompt: str) -> str:
        if not self.api_token:
            raise RuntimeError("REPLICATE_API_TOKEN not configured")

        # Minimal Replicate call pattern
        url = "https://api.replicate.com/v1/predictions"
        headers = {"Authorization": f"Token {self.api_token}", "Content-Type": "application/json"}
        payload = {
            "version": self.model,
            "input": {"prompt": prompt}
        }
        resp = requests.post(url, json=payload, headers=headers, timeout=120)
        resp.raise_for_status()
        data = resp.json()
        # Poll result URL
        get_url = data.get("urls", {}).get("get")
        if not get_url:
            raise RuntimeError("Replicate response missing result URL")

        # Simple polling loop
        for _ in range(60):
            r = requests.get(get_url, headers=headers, timeout=30)
            r.raise_for_status()
            j = r.json()
            if j.get("status") == "succeeded":
                out = j.get("output")
                if isinstance(out, list) and out:
                    return out[0]
                if isinstance(out, str):
                    return out
                raise RuntimeError("Replicate succeeded but no output URL")
            if j.get("status") in {"failed", "canceled"}:
                raise RuntimeError(f"Replicate failed: {j.get('status')}")
        raise RuntimeError("Replicate timeout waiting for image")


class PlaceholderProvider(ImageProvider):
    """Fallback provider that returns a decorative placeholder image URL."""

    def generate_image(self, prompt: str) -> str:
        # Render a PNG placeholder to avoid SVG extensions
        try:
            from PIL import Image, ImageDraw  # type: ignore
            img = Image.new('RGB', (1024, 1024), color=(255, 247, 239))
            draw = ImageDraw.Draw(img)
            # Frame
            draw.rectangle([(20, 20), (1004, 1004)], outline=(210, 105, 30), width=8)
            # Title
            draw.text((60, 60), 'Dream Image Placeholder', fill=(139, 69, 19))
            # Prompt hint
            snippet = (prompt[:260] + '...') if len(prompt) > 260 else prompt
            draw.text((60, 120), snippet, fill=(120, 70, 30))
            buf = BytesIO()
            img.save(buf, format='PNG')
            buf.seek(0)
            b64 = base64.b64encode(buf.read()).decode('ascii')
            return f"data:image/png;base64,{b64}"
        except Exception:
            # Fallback to minimal 1x1 PNG
            tiny = base64.b64encode(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0bIDAT\x08\x99c\xf8\xff\xff?\x00\x05\xfe\x02\xfeA\x1d\x8f\xa7\x00\x00\x00\x00IEND\xaeB`\x82").decode('ascii')
            return f"data:image/png;base64,{tiny}"


def get_image_provider() -> ImageProvider:
    provider = "diffusers"
    if provider == "openai":
        return OpenAIImageProvider()
    if provider == "replicate":
        return ReplicateImageProvider()
    if provider in {"diffusers", "local"}:
        try:
            return LocalDiffusersProvider()
        except Exception:
            # Fallback safely if diffusers/torch are not available
            return PlaceholderProvider()
    return PlaceholderProvider()


# Local diffusers-based provider (open-source, no cloud key required)
class LocalDiffusersProvider(ImageProvider):
    def __init__(self, model_id: Optional[str] = None):
        # Use a valid open-source model id by default; allow override via env/arg
        self.model_id = "stabilityai/sd-turbo"
        # Lazy init to avoid import cost when not used
        self._pipe = None

    def _ensure_pipeline(self):
        if self._pipe is not None:
            return
        import torch  # type: ignore
        from diffusers import AutoPipelineForText2Image  # type: ignore
        device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if device == "cuda" else torch.float32
        pipe = AutoPipelineForText2Image.from_pretrained(self.model_id, torch_dtype=dtype)
        if device == "cuda":
            pipe = pipe.to(device)
        self._pipe = (pipe, device)

    def generate_image(self, prompt: str) -> str:
        # Returns a data URL of a PNG image
        self._ensure_pipeline()
        pipe, device = self._pipe
        import torch  # type: ignore
        with torch.autocast(device) if device == "cuda" else contextlib.nullcontext():
            image = pipe(
                prompt=prompt,
                num_inference_steps=4 if device == "cuda" else 12,
                guidance_scale=1.5,
                height=512,
                width=512
            ).images[0]
        buf = BytesIO()
        image.save(buf, format="PNG")
        buf.seek(0)
        b64 = base64.b64encode(buf.read()).decode("ascii")
        return f"data:image/png;base64,{b64}"


