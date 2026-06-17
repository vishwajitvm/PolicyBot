from app.core.config import Settings
from app.core.exceptions import NotConfiguredError
from app.providers.base_embedding import BaseEmbeddingProvider
from app.providers.base_llm import BaseLLMProvider, LLMResponse


class OpenAIProvider(BaseLLMProvider, BaseEmbeddingProvider):
    def __init__(self, settings: Settings):
        if not settings.openai_api_key:
            raise NotConfiguredError("OPENAI_API_KEY is required for OpenAI provider")
        self.settings = settings

    async def generate(self, prompt: str, system_prompt: str | None = None, temperature: float = 0.2) -> LLMResponse:
        raise NotConfiguredError("OpenAI runtime adapter skeleton is present but not implemented yet")

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        raise NotConfiguredError("OpenAI embedding adapter skeleton is present but not implemented yet")

    async def embed_query(self, query: str) -> list[float]:
        raise NotConfiguredError("OpenAI embedding adapter skeleton is present but not implemented yet")
