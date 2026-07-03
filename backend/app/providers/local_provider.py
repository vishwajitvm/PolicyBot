from app.core.config import Settings
from app.core.exceptions import NotConfiguredError
from app.providers.base_embedding import BaseEmbeddingProvider
from app.providers.base_llm import BaseLLMProvider, LLMResponse

import httpx
from tracenest import logger




class LocalProvider(BaseLLMProvider, BaseEmbeddingProvider):
    def __init__(self, settings: Settings):
        self.settings = settings
        self._client = None
        self._timeout = httpx.Timeout(10.0, read=30.0)  # 10s connect, 30s read

    async def _get_client(self):
        if self._client is None:
            self._client = httpx.AsyncClient(base_url=self.settings.ollama_base_url, timeout=self._timeout)
        return self._client

    async def generate(self, prompt: str, system_prompt: str | None = None, temperature: float = 0.2) -> LLMResponse:
        try:
            client = await self._get_client()
            payload = {
                "model": self.settings.ollama_chat_model,
                "prompt": prompt,
                "system": system_prompt or "",
                "stream": False,
                "options": {
                    "temperature": temperature,
                },
            }
            response = await client.post("/api/generate", json=payload)
            response.raise_for_status()
            result = response.json()
            return LLMResponse(
                text=result.get("response", ""),
                model=self.settings.ollama_chat_model,
            )
        except httpx.HTTPStatusError as exc:
            logger.error(f"Ollama generation HTTP error: {exc.response.status_code} - {exc.response.text}")
            raise NotConfiguredError(f"Ollama generation failed: {exc.response.status_code}") from exc
        except httpx.RequestError as exc:
            logger.exception("Ollama generation request failed")
            raise NotConfiguredError(f"Ollama generation failed: {str(exc)}") from exc
        except Exception as exc:
            logger.exception("Failed to generate text with Ollama")
            raise NotConfiguredError(f"Ollama generation failed: {exc}") from exc

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        try:
            client = await self._get_client()
            embeddings = []
            for text in texts:
                payload = {
                    "model": self.settings.ollama_embedding_model,
                    "prompt": text,
                }
                response = await client.post("/api/embeddings", json=payload)
                response.raise_for_status()
                result = response.json()
                embeddings.append(result["embedding"])
            return embeddings
        except httpx.HTTPStatusError as exc:
            logger.error(f"Ollama embedding HTTP error: {exc.response.status_code} - {exc.response.text}")
            raise NotConfiguredError(f"Ollama embedding failed: {exc.response.status_code}") from exc
        except httpx.RequestError as exc:
            logger.exception("Ollama embedding request failed")
            raise NotConfiguredError(f"Ollama embedding failed: {str(exc)}") from exc
        except Exception as exc:
            logger.exception("Failed to embed texts with Ollama")
            raise NotConfiguredError(f"Ollama embedding failed: {exc}") from exc

    async def embed_query(self, query: str) -> list[float]:
        embeddings = await self.embed_texts([query])
        return embeddings[0]