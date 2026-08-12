import os
from datetime import datetime
try:
    from zoneinfo import ZoneInfo
except ImportError:
    pass

def get_current_time() -> datetime:
    tz_str = os.getenv("APP_TIMEZONE", "UTC")
    try:
        tz = ZoneInfo(tz_str)
    except Exception:
        # Fallback if zoneinfo fails
        import pytz
        try:
            tz = pytz.timezone(tz_str)
        except Exception:
            tz = pytz.UTC
    return datetime.now(tz)
