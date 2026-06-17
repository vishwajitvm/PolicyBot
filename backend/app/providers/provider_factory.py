from app.core.config import Settings
from app.core.exceptions import NotConfiguredError
from app.providers.anthropic_provider import AnthropicProvider
from app.providers.base_embedding import BaseEmbeddingProvider
from app.providers.base_llm import BaseLLMProvider
from app.providers.gemini_provider import GeminiProvider
from app.providers.local_provider import LocalProvider
from app.providers.openai_provider import OpenAIProvider


class ProviderFactory:
    def __init__(self, settings: Settings):
        self.settings = settings

    def create_llm(self) -> BaseLLMProvider:
        provider = self.settings.llm_provider.lower()
        if provider == "gemini":
            return GeminiProvider(self.settings)
        if provider == "openai":
            return OpenAIProvider(self.settings)
        if provider == "anthropic":
            return AnthropicProvider(self.settings)
        if provider in {"local", "ollama"}:
            return LocalProvider(self.settings)
        raise NotConfiguredError(f"Unsupported LLM provider: {provider}")

    def create_embedding(self) -> BaseEmbeddingProvider:
        provider = self.settings.embedding_provider.lower()
        if provider == "gemini":
            return GeminiProvider(self.settings)
        if provider == "openai":
            return OpenAIProvider(self.settings)
        if provider in {"local", "ollama"}:
            return LocalProvider(self.settings)
        raise NotConfiguredError(f"Unsupported embedding provider: {provider}")
