import sys
import json
from loguru import logger
from app.config import settings


def _railway_sink(message):
    """Emit logs in Railway's expected structured format: {"level": "info", "message": "..."}"""
    record = message.record
    log_entry = {
        "level": record["level"].name.lower(),
        "message": record["message"],
        "logger": record["name"],
    }
    if record["exception"]:
        log_entry["exception"] = str(record["exception"])
    print(json.dumps(log_entry), flush=True)


def setup_logging():
    logger.remove()  # Remove default handler

    if settings.is_production:
        logger.add(_railway_sink, level="INFO")
    else:
        # Colored human-readable output for dev
        logger.add(
            sys.stdout,
            colorize=True,
            format="<green>{time:HH:mm:ss}</green> <level>{level: <8}</level> <cyan>[{name}]</cyan> {message}",
            level="DEBUG",
        )
