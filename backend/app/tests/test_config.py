from app.api.v1.config import runtime_config


def test_runtime_config_has_defaults():
    config = runtime_config()
    assert config.llm_provider
    assert config.vector_db_provider == "qdrant"
