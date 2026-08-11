import asyncio
import time

from app.core.config import Settings
from app.core.exceptions import NotConfiguredError
from app.providers.base_embedding import BaseEmbeddingProvider
from app.providers.base_llm import BaseLLMProvider, LLMResponse


class GeminiProvider(BaseLLMProvider, BaseEmbeddingProvider):
    provider = "gemini"

    def __init__(self, settings: Settings):
        self.settings = settings
        if not settings.gemini_api_key:
            raise NotConfiguredError("GEMINI_API_KEY is required for Gemini provider")
        try:
            from google import genai
            from google.genai import types
        except ImportError as exc:
            raise NotConfiguredError("google-genai package is not installed") from exc
        
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.types = types

    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.2,
    ) -> LLMResponse:
        started = time.perf_counter()
        
        config = self.types.GenerateContentConfig(
            temperature=temperature,
            system_instruction=system_prompt,
        )
        
        response = await self.client.aio.models.generate_content(
            model=self.settings.gemini_chat_model,
            contents=prompt,
            config=config,
        )
        
        latency_ms = int((time.perf_counter() - started) * 1000)
        return LLMResponse(
            text=response.text or "",
            model=self.settings.gemini_chat_model,
            provider=self.provider,
            latency_ms=latency_ms,
            raw={},
        )

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        # Use batching natively supported by the Gemini SDK
        for attempt in range(4):
            try:
                response = await self.client.aio.models.embed_content(
                    model=self.settings.gemini_embedding_model,
                    contents=texts,
                    config=self.types.EmbedContentConfig(
                        task_type="RETRIEVAL_DOCUMENT",
                        output_dimensionality=self.settings.qdrant_vector_size if hasattr(self.settings, "qdrant_vector_size") else None
                    )
                )
                return [emb.values for emb in response.embeddings]
            except Exception as e:
                if "429" in str(e) and attempt < 3:
                    await asyncio.sleep(2 ** attempt)
                else:
                    raise e

    async def embed_query(self, query: str) -> list[float]:
        response = await self.client.aio.models.embed_content(
            model=self.settings.gemini_embedding_model,
            contents=query,
            config=self.types.EmbedContentConfig(
                task_type="RETRIEVAL_QUERY",
                output_dimensionality=self.settings.qdrant_vector_size if hasattr(self.settings, "qdrant_vector_size") else None
            )
        )
        return response.embeddings[0].values
