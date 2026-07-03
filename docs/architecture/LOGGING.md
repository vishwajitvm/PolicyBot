# Logging Architecture

## Overview
PolicyBot uses `tracenest` as the primary logging solution across the entire backend. It replaces standard Python logging for better performance, immediate log visibility, and a unified API.

## Configuration
Logging is globally configured in `app/core/logging.py`, which is imported in `main.py` at startup. 
To guarantee immediate log visibility without buffering delays, `tracenest` is configured with:

```python
from tracenest.core import config as tn_config
tn_config.WRITE_BUFFER_SIZE = 1
```

## Usage
To log messages in any module or API route, import the `tracenest` logger directly. Do not use the standard `logging` module.

### Examples:
```python
# DO NOT DO THIS
import logging
logger = logging.getLogger(__name__)

# DO THIS INSTEAD
from tracenest import logger

logger.info("This is an info message")
logger.error(f"This is an error with variables: {var}")
```

## Supported Severity Levels
The `tracenest` logger supports standard severity levels:
- `logger.debug(...)`
- `logger.info(...)`
- `logger.warning(...)`
- `logger.error(...)`
- `logger.critical(...)`

## Backward Compatibility
Standard library `logging` output from third-party libraries is intercepted via `TraceNestHandler` in `app/core/logging.py` and forwarded directly into the `tracenest` stream. You do not need to configure third-party libraries to use `tracenest`.
