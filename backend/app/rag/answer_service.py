from app.providers.base_llm import BaseLLMProvider, LLMResponse


class AnswerService:
    def __init__(self, llm: BaseLLMProvider):
        self.llm = llm

    async def answer(self, prompt: str) -> LLMResponse:
        return await self.llm.generate(
            prompt,
            system_prompt="You are PolicyBot Intelligence. Provide concise, cited answers and do not expose hidden reasoning.",
            temperature=0.2,
        )
