from __future__ import annotations

import hashlib


def sha256_bytes(content: bytes) -> str:
    h = hashlib.sha256()
    h.update(content)
    return h.hexdigest()

