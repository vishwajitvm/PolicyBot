# Model Provider Switching

**Gemini-first design with easy switching to other models**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Goal

Start with Gemini API now, but do not lock the product to Gemini. Build a provider abstraction so you can switch to OpenAI, Anthropic, Ollama, local models, or future providers.

## 2. Provider types

There are two separate provider interfaces:

- LLM provider for answer generation.
- Embedding provider for vector generation.

Do not mix them. You may use Gemini for both at first, but later you may use Gemini for generation and another embedding provider.

## 3. LLM provider interface

```python
class LLMProvider(Protocol):
    async def generate(
        self,
        messages: list[dict],
        temperature: float = 0.2,
        response_schema: dict | None = None,
    ) -> dict:
        ...
```

## 4. Embedding provider interface

```python
class EmbeddingProvider(Protocol):
    async def embed_query(self, text: str) -> list[float]:
        ...

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        ...
```

## 5. Provider factory

```python
def get_llm_provider(settings: Settings) -> LLMProvider:
    if settings.LLM_PROVIDER == "gemini":
        return GeminiLLMProvider(settings)
    if settings.LLM_PROVIDER == "openai":
        return OpenAILLMProvider(settings)
    if settings.LLM_PROVIDER == "ollama":
        return OllamaLLMProvider(settings)
    raise ValueError("Unsupported LLM provider")
```

## 6. Environment switching

Gemini:

```env
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.5-flash
EMBEDDING_PROVIDER=gemini
EMBEDDING_MODEL=gemini-embedding-001
```

Ollama local:

```env
LLM_PROVIDER=ollama
LLM_MODEL=llama3.1
OLLAMA_BASE_URL=http://ollama:11434
```

OpenAI future:

```env
LLM_PROVIDER=openai
LLM_MODEL=gpt-4.1-mini
OPENAI_API_KEY=your_key
```

## 7. Important rule for embeddings

Changing generation model does not require re-indexing.

Changing embedding model or vector dimension requires full re-indexing because stored vectors are tied to the embedding model.

## 8. Model routing strategy

For advanced mode, use model routing:

| Task | Model type |
|---|---|
| Query rewrite | Fast/cheap model |
| Answer generation | Strong general model |
| Citation verification | Structured-output capable model |
| Summarization | Fast model |
| Evaluation judge | Stronger model or deterministic scoring |

## 9. Configurable model registry

```yaml
models:
  default_chat:
    provider: gemini
    model: gemini-2.5-flash
  query_rewrite:
    provider: gemini
    model: gemini-2.5-flash
  citation_verifier:
    provider: gemini
    model: gemini-2.5-flash
  embedding:
    provider: gemini
    model: gemini-embedding-001
    dimension: 768
```

## 10. Provider migration checklist

Before switching provider:

- [ ] Update env/config.
- [ ] Run smoke test.
- [ ] Run evaluation dataset.
- [ ] Compare answer quality.
- [ ] Compare latency.
- [ ] Compare cost.
- [ ] Re-index if embedding provider changed.

## 11. Automatic Fallback Architecture (New)

The system now supports an automatic multi-provider fallback mechanism to guarantee extremely high availability and mitigate provider-specific rate limits. 

When a generation or embedding request is initiated, the system loops through a predefined sequence of fallback providers configured via `.env` (e.g. `gemini -> nvidia -> groq -> openai -> ollama -> huggingface -> mistral -> deepseek`).

If the primary provider throws an HTTP error, timeouts, or rate limits, the `FallbackLLMProvider` automatically logs the failure to the MongoDB usage metrics store, swallows the exception, and attempts the exact same prompt on the next provider in the chain.

A comprehensive UI Dashboard and Model Manager exist on the frontend to visualize tokens consumed by model, average latency, and fallback error rates to help tune the priority sequence.
