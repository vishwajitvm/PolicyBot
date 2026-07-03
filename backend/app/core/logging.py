import logging
from tracenest import logger as tn_logger
from tracenest.core import config as tn_config

class TraceNestHandler(logging.Handler):
    def emit(self, record: logging.LogRecord) -> None:
        try:
            msg = self.format(record)
            if record.name.startswith("tracenest"):
                return
            if record.levelno >= logging.CRITICAL:
                tn_logger.critical(msg)
            elif record.levelno >= logging.ERROR:
                tn_logger.error(msg)
            elif record.levelno >= logging.WARNING:
                tn_logger.warning(msg)
            elif record.levelno >= logging.INFO:
                tn_logger.info(msg)
            else:
                tn_logger.debug(msg)
        except Exception:
            self.handleError(record)

def configure_logging(level: str, log_file_path: str = "logs/policybot.jsonl", max_bytes: int = 10 * 1024 * 1024) -> None:
    # Fix the delay in log visibility by reducing buffer size
    tn_config.WRITE_BUFFER_SIZE = 1 
    
    root = logging.getLogger()
    root.setLevel(getattr(logging, level.upper(), logging.INFO))
    formatter = logging.Formatter("%(name)s: %(message)s")
    
    console = logging.StreamHandler()
    console.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
    
    tn_handler = TraceNestHandler()
    tn_handler.setFormatter(formatter)
    
    root.handlers.clear()
    root.addHandler(console)
    root.addHandler(tn_handler)
