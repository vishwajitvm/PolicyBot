from app.core.config import Settings
from app.core.exceptions import NotConfiguredError
from app.providers.base_llm import BaseLLMProvider, LLMResponse


class AnthropicProvider(BaseLLMProvider):
    def __init__(self, settings: Settings):
        if not settings.anthropic_api_key:
            raise NotConfiguredError("ANTHROPIC_API_KEY is required for Anthropic provider")
        self.settings = settings

    async def generate(self, prompt: str, system_prompt: str | None = None, temperature: float = 0.2) -> LLMResponse:
        raise NotConfiguredError("Anthropic runtime adapter skeleton is present but not implemented yet")
