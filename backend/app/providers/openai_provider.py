from app.core.config import Settings
from app.core.exceptions import NotConfiguredError
from app.providers.base_embedding import BaseEmbeddingProvider
from app.providers.base_llm import BaseLLMProvider, LLMResponse
import httpx
import time
from tracenest import logger

class OpenAIProvider(BaseLLMProvider, BaseEmbeddingProvider):
    def __init__(self, settings: Settings, provider_name: str = "openai"):
        self.settings = settings
        self.provider_name = provider_name
        self.api_key = ""
        self.base_url = ""
        self.chat_model = ""
        self.embedding_model = ""
        
        # Configure dynamically based on provider name
        if provider_name == "openai":
            self.api_key = settings.openai_api_key
            self.base_url = "https://api.openai.com/v1"
            self.chat_model = settings.openai_chat_model
            self.embedding_model = getattr(settings, "openai_embedding_model", "text-embedding-3-small")
        elif provider_name == "openrouter":
            self.api_key = settings.openrouter_api_key
            self.base_url = "https://openrouter.ai/api/v1"
            self.chat_model = settings.openrouter_chat_model
        elif provider_name == "deepseek":
            self.api_key = settings.deepseek_api_key
            self.base_url = "https://api.deepseek.com/v1"
            self.chat_model = settings.deepseek_chat_model
        elif provider_name == "groq":
            self.api_key = settings.groq_api_key
            self.base_url = "https://api.groq.com/openai/v1"
            self.chat_model = settings.groq_chat_model
        elif provider_name == "mistral":
            self.api_key = settings.mistral_api_key
            self.base_url = "https://api.mistral.ai/v1"
            self.chat_model = settings.mistral_chat_model
        elif provider_name == "nvidia":
            self.api_key = settings.nvidia_api_key
            self.base_url = "https://integrate.api.nvidia.com/v1"
            self.chat_model = settings.nvidia_chat_model
        elif provider_name == "huggingface":
            self.api_key = settings.huggingface_api_key
            self.base_url = "https://api-inference.huggingface.co/v1"
            self.chat_model = settings.huggingface_chat_model

        if not self.api_key:
            raise NotConfiguredError(f"API key is missing for provider: {self.provider_name}")

    async def generate(self, prompt: str, system_prompt: str | None = None, temperature: float = 0.2) -> LLMResponse:
        start_time = time.perf_counter()
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": self.chat_model,
            "messages": messages,
            "temperature": temperature
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # OpenRouter specific headers
        if self.provider_name == "openrouter":
            headers["HTTP-Referer"] = "http://localhost:8000"
            headers["X-Title"] = "PolicyBot"
            
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                logger.error(f"{self.provider_name} API Error {response.status_code}: {response.text}")
                raise Exception(f"{self.provider_name} API returned {response.status_code}: {response.text}")
                
            data = response.json()
            
            text = data["choices"][0]["message"]["content"]
            usage = data.get("usage", {})
            input_tokens = usage.get("prompt_tokens")
            output_tokens = usage.get("completion_tokens")
            
            latency_ms = int((time.perf_counter() - start_time) * 1000)
            
            return LLMResponse(
                text=text,
                model=self.chat_model,
                provider=self.provider_name,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                latency_ms=latency_ms,
                raw=data
            )

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        # Usually only OpenAI natively supports the /v1/embeddings endpoint robustly out of these,
        # but the adapter is generic enough to try it.
        # Fallback to chat_model config if embedding_model isn't specifically defined for the provider
        # but in config we defined openai_embedding_model
        
        embedding_model = self.settings.openai_embedding_model if self.provider_name == "openai" else self.chat_model
        
        payload = {
            "model": embedding_model,
            "input": texts
        }
        
        if self.provider_name == "openai" and "text-embedding-3" in embedding_model:
            if hasattr(self.settings, "qdrant_vector_size") and self.settings.qdrant_vector_size:
                payload["dimensions"] = self.settings.qdrant_vector_size
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        import asyncio
        async with httpx.AsyncClient(timeout=60.0) as client:
            for attempt in range(4):
                response = await client.post(
                    f"{self.base_url}/embeddings",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code == 429 and attempt < 3:
                    await asyncio.sleep(2 ** attempt)
                    continue
                elif response.status_code != 200:
                    logger.error(f"{self.provider_name} Embedding API Error {response.status_code}: {response.text}")
                    raise Exception(f"{self.provider_name} Embedding API returned {response.status_code}: {response.text}")
                    
                data = response.json()
                # The API returns a list of objects containing the embedding
                # e.g., data["data"][0]["embedding"]
                embeddings = []
                # Make sure we sort by index just in case the API returned them out of order
                sorted_data = sorted(data["data"], key=lambda x: x["index"])
                for item in sorted_data:
                    embeddings.append(item["embedding"])
                    
                return embeddings

    async def embed_query(self, query: str) -> list[float]:
        embeddings = await self.embed_texts([query])
        return embeddings[0]
