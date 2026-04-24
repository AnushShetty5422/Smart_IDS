from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LogEntry(BaseModel):
    id: Optional[str] = None
    username: str
    ip_address: str
    timestamp: datetime
    query_count: int
    query_type: str
    failed_logins: int
    download_size_mb: float
    location: str
    privilege_change: bool
    target_table: str = "public_data"
