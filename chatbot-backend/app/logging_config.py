import sys
from loguru import logger
from app.config import settings


def setup_logging():
    logger.remove()  # Remove default handler

    if settings.is_production:
        # JSON output — each line is a parseable JSON object for Railway
        logger.add(sys.stdout, serialize=True, level="INFO")
    else:
        # Colored human-readable output for dev
        logger.add(
            sys.stdout,
            colorize=True,
            format="<green>{time:HH:mm:ss}</green> <level>{level: <8}</level> <cyan>[{name}]</cyan> {message}",
            level="DEBUG",
        )
