from app.providers.base_llm import BaseLLMProvider, LLMResponse
from tracenest import logger
import time


class FallbackLLMProvider(BaseLLMProvider):
    def __init__(self, providers: list[BaseLLMProvider]):
        if not providers:
            raise ValueError("FallbackLLMProvider requires at least one provider.")
        self.providers = providers

    async def generate(self, prompt: str, system_prompt: str | None = None, temperature: float = 0.2) -> LLMResponse:
        errors = []
        for i, provider in enumerate(self.providers):
            provider_name = getattr(provider, "provider_name", type(provider).__name__)
            try:
                # If we are falling back (i > 0), log that we are trying the next one.
                if i > 0:
                    logger.info(f"Fallback mechanism active: Trying {provider_name}...")
                
                response = await provider.generate(prompt=prompt, system_prompt=system_prompt, temperature=temperature)
                
                if i > 0:
                    logger.info(f"Fallback to {provider_name} succeeded.")
                    
                return response
            except Exception as e:
                error_msg = str(e)
                logger.warning(f"Provider {provider_name} failed: {error_msg}")
                errors.append(f"{provider_name}: {error_msg}")
                
        # If we exhausted all providers, raise a comprehensive error.
        full_error = " | ".join(errors)
        logger.error(f"All fallback LLM providers failed. Errors: {full_error}")
        raise Exception(f"All LLM providers failed: {full_error}")

from app.providers.base_embedding import BaseEmbeddingProvider

class FallbackEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, providers: list[BaseEmbeddingProvider]):
        if not providers:
            raise ValueError("FallbackEmbeddingProvider requires at least one provider.")
        self.providers = providers

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        errors = []
        for i, provider in enumerate(self.providers):
            provider_name = getattr(provider, "provider_name", type(provider).__name__)
            try:
                if i > 0:
                    logger.info(f"Embedding Fallback mechanism active: Trying {provider_name}...")
                
                response = await provider.embed_texts(texts=texts)
                
                if i > 0:
                    logger.info(f"Embedding Fallback to {provider_name} succeeded.")
                    
                return response
            except Exception as e:
                error_msg = str(e)
                logger.warning(f"Embedding Provider {provider_name} failed: {error_msg}")
                errors.append(f"{provider_name}: {error_msg}")
                
        full_error = " | ".join(errors)
        logger.error(f"All fallback Embedding providers failed. Errors: {full_error}")
        raise Exception(f"All Embedding providers failed: {full_error}")

    async def embed_query(self, query: str) -> list[float]:
        embeddings = await self.embed_texts([query])
        return embeddings[0]
