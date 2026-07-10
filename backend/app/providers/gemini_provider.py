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
            import google.generativeai as genai
        except ImportError as exc:
            raise NotConfiguredError("google-generativeai package is not installed") from exc
        genai.configure(api_key=settings.gemini_api_key)
        self._genai = genai

    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.2,
    ) -> LLMResponse:
        started = time.perf_counter()
        model = self._genai.GenerativeModel(
            self.settings.gemini_chat_model,
            system_instruction=system_prompt,
            generation_config={"temperature": temperature},
        )
        response = await asyncio.to_thread(model.generate_content, prompt)
        latency_ms = int((time.perf_counter() - started) * 1000)
        return LLMResponse(
            text=getattr(response, "text", "") or "",
            model=self.settings.gemini_chat_model,
            provider=self.provider,
            latency_ms=latency_ms,
            raw={"finish_reason": str(getattr(response, "prompt_feedback", ""))},
        )

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        # Use batching natively supported by the Gemini SDK
        for attempt in range(5):
            try:
                result = await asyncio.to_thread(
                    self._genai.embed_content,
                    model=self.settings.gemini_embedding_model,
                    content=texts,
                    task_type="retrieval_document",
                )
                # The result["embedding"] is a list of embeddings when content is a list
                return result["embedding"]
            except Exception as e:
                if "429" in str(e) and attempt < 4:
                    await asyncio.sleep(30)
                else:
                    raise e

    async def embed_query(self, query: str) -> list[float]:
        result = await asyncio.to_thread(
            self._genai.embed_content,
            model=self.settings.gemini_embedding_model,
            content=query,
            task_type="retrieval_query",
        )
        return result["embedding"]
