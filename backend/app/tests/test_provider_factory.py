import pytest

from app.core.config import Settings
from app.core.exceptions import NotConfiguredError
from app.providers.provider_factory import ProviderFactory


def test_provider_factory_requires_gemini_key():
    settings = Settings(gemini_api_key="")
    with pytest.raises(NotConfiguredError):
        ProviderFactory(settings).create_llm()
