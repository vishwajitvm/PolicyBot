from app.providers.base_llm import BaseLLMProvider, LLMResponse
from app.providers.base_embedding import BaseEmbeddingProvider
from app.observability.metrics_service import metrics_service
from tracenest import logger
import time
import asyncio

class FallbackLLMProvider(BaseLLMProvider):
    def __init__(self, providers: list[BaseLLMProvider]):
        if not providers:
            raise ValueError("FallbackLLMProvider requires at least one provider.")
        self.providers = providers

    async def generate(self, prompt: str, system_prompt: str | None = None, temperature: float = 0.2) -> LLMResponse:
        errors = []
        for i, provider in enumerate(self.providers):
            provider_name = getattr(provider, "provider_name", type(provider).__name__)
            model_name = getattr(provider, "chat_model", "unknown")
            start_time = time.perf_counter()
            try:
                if i > 0:
                    logger.info(f"Fallback mechanism active: Trying {provider_name}...")
                
                response = await provider.generate(prompt=prompt, system_prompt=system_prompt, temperature=temperature)
                
                latency_ms = int((time.perf_counter() - start_time) * 1000)
                asyncio.create_task(
                    metrics_service.log_usage(
                        provider=provider_name, 
                        model=model_name, 
                        input_tokens=response.input_tokens, 
                        output_tokens=response.output_tokens, 
                        latency_ms=latency_ms, 
                        success=True
                    )
                )
                
                if i > 0:
                    logger.info(f"Fallback to {provider_name} succeeded.")
                    
                return response
            except Exception as e:
                latency_ms = int((time.perf_counter() - start_time) * 1000)
                asyncio.create_task(
                    metrics_service.log_usage(
                        provider=provider_name, 
                        model=model_name, 
                        input_tokens=0, 
                        output_tokens=0, 
                        latency_ms=latency_ms, 
                        success=False
                    )
                )
                error_msg = str(e)
                logger.warning(f"Provider {provider_name} failed: {error_msg}")
                errors.append(f"{provider_name}: {error_msg}")
                
        full_error = " | ".join(errors)
        logger.error(f"All fallback LLM providers failed. Errors: {full_error}")
        raise Exception(f"All LLM providers failed: {full_error}")


class FallbackEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, providers: list[BaseEmbeddingProvider]):
        if not providers:
            raise ValueError("FallbackEmbeddingProvider requires at least one provider.")
        self.providers = providers

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        errors = []
        for i, provider in enumerate(self.providers):
            provider_name = getattr(provider, "provider_name", type(provider).__name__)
            # Not all embedding providers expose an embedding_model attribute cleanly, fallback to unknown
            model_name = getattr(provider, "embedding_model", getattr(provider, "chat_model", "unknown"))
            start_time = time.perf_counter()
            try:
                if i > 0:
                    logger.info(f"Embedding Fallback mechanism active: Trying {provider_name}...")
                
                response = await provider.embed_texts(texts=texts)
                
                latency_ms = int((time.perf_counter() - start_time) * 1000)
                # Approximate tokens based on chunk size or character count (1 token ~= 4 chars)
                approx_tokens = sum(len(t) for t in texts) // 4
                
                asyncio.create_task(
                    metrics_service.log_usage(
                        provider=provider_name, 
                        model=model_name, 
                        input_tokens=approx_tokens, 
                        output_tokens=0, 
                        latency_ms=latency_ms, 
                        success=True,
                        endpoint_type="embedding"
                    )
                )
                
                if i > 0:
                    logger.info(f"Embedding Fallback to {provider_name} succeeded.")
                    
                return response
            except Exception as e:
                latency_ms = int((time.perf_counter() - start_time) * 1000)
                asyncio.create_task(
                    metrics_service.log_usage(
                        provider=provider_name, 
                        model=model_name, 
                        input_tokens=0, 
                        output_tokens=0, 
                        latency_ms=latency_ms, 
                        success=False,
                        endpoint_type="embedding"
                    )
                )
                error_msg = str(e)
                logger.warning(f"Embedding Provider {provider_name} failed: {error_msg}")
                errors.append(f"{provider_name}: {error_msg}")
                
        full_error = " | ".join(errors)
        logger.error(f"All fallback Embedding providers failed. Errors: {full_error}")
        raise Exception(f"All Embedding providers failed: {full_error}")

    async def embed_query(self, query: str) -> list[float]:
        embeddings = await self.embed_texts([query])
        return embeddings[0]
