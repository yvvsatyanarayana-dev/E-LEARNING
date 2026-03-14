from typing import Dict, Any

# In-memory store for active live meetings.
# Keyed by the `target_group` string (e.g., "BCA", "MCA", "All")
# Value is a dictionary containing meeting details (e.g., room_code, join_url, faculty_name).
ACTIVE_MEETINGS: Dict[str, Dict[str, Any]] = {}
