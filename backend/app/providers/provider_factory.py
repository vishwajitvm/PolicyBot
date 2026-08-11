from tracenest import logger
from app.core.config import Settings
from app.core.exceptions import NotConfiguredError
from app.providers.anthropic_provider import AnthropicProvider
from app.providers.base_embedding import BaseEmbeddingProvider
from app.providers.base_llm import BaseLLMProvider
from app.providers.gemini_provider import GeminiProvider
from app.providers.local_provider import LocalProvider
from app.providers.openai_provider import OpenAIProvider
from app.providers.fallback_provider import FallbackLLMProvider, FallbackEmbeddingProvider

class ProviderFactory:
    def __init__(self, settings: Settings):
        self.settings = settings

    def _create_single_llm(self, provider: str) -> BaseLLMProvider:
        provider = provider.lower().strip()
        if provider == "gemini":
            return GeminiProvider(self.settings)
        if provider == "openai":
            return OpenAIProvider(self.settings, provider_name="openai")
        if provider == "anthropic":
            return AnthropicProvider(self.settings)
        if provider in {"local", "ollama"}:
            return LocalProvider(self.settings)
        if provider in ["openrouter", "deepseek", "groq", "mistral", "nvidia", "huggingface"]:
            return OpenAIProvider(self.settings, provider_name=provider)
        raise NotConfiguredError(f"Unsupported LLM provider: {provider}")

    def create_llm(self) -> BaseLLMProvider:
        fallback_str = getattr(self.settings, "llm_fallback_providers", "")
        if fallback_str:
            provider_names = [p.strip() for p in fallback_str.split(",") if p.strip()]
            if provider_names:
                instances = []
                for name in provider_names:
                    try:
                        instances.append(self._create_single_llm(name))
                    except Exception as e:
                        logger.warning(f"Skipping fallback provider {name} due to error: {e}")
                
                if instances:
                    if len(instances) == 1:
                        return instances[0]
                    return FallbackLLMProvider(instances)

        # Default single provider logic
        provider = self.settings.llm_provider.lower()
        return self._create_single_llm(provider)

    def _create_single_embedding(self, provider: str) -> BaseEmbeddingProvider:
        provider = provider.lower().strip()
        if provider == "gemini":
            return GeminiProvider(self.settings)
        if provider == "openai":
            return OpenAIProvider(self.settings, provider_name="openai")
        if provider in {"local", "ollama"}:
            return LocalProvider(self.settings)
        raise NotConfiguredError(f"Unsupported embedding provider: {provider}")

    def create_embedding(self) -> BaseEmbeddingProvider:
        fallback_str = getattr(self.settings, "embedding_fallback_providers", "")
        if fallback_str:
            provider_names = [p.strip() for p in fallback_str.split(",") if p.strip()]
            if provider_names:
                instances = []
                for name in provider_names:
                    try:
                        instances.append(self._create_single_embedding(name))
                    except Exception as e:
                        logger.warning(f"Skipping fallback embedding provider {name} due to error: {e}")
                
                if instances:
                    if len(instances) == 1:
                        return instances[0]
                    return FallbackEmbeddingProvider(instances)

        provider = self.settings.embedding_provider.lower()
        return self._create_single_embedding(provider)
