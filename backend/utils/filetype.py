from __future__ import annotations

import mimetypes
from dataclasses import dataclass

try:
    import magic  # type: ignore
except Exception:  # pragma: no cover - optional dependency at runtime
    magic = None


@dataclass
class FileTypeDetails:
    mime_type: str
    description: str


def _detect_by_signature(content: bytes) -> FileTypeDetails | None:
    if content.startswith(b"%PDF"):
        return FileTypeDetails("application/pdf", "PDF document")
    if content.startswith(b"PK\x03\x04"):
        return FileTypeDetails("application/zip", "ZIP-compatible archive container")
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return FileTypeDetails("image/png", "PNG image")
    if content.startswith(b"\xff\xd8\xff"):
        return FileTypeDetails("image/jpeg", "JPEG image")
    if content.startswith(b"GIF87a") or content.startswith(b"GIF89a"):
        return FileTypeDetails("image/gif", "GIF image")
    if content.startswith(b"MZ"):
        return FileTypeDetails("application/x-dosexec", "PE executable (Windows binary)")
    return None


def detect_file_type(content: bytes, filename: str) -> FileTypeDetails:
    if magic is not None:
        try:
            mime_type = magic.from_buffer(content, mime=True) or "application/octet-stream"
            description = magic.from_buffer(content, mime=False) or "Unknown binary/text format"
            return FileTypeDetails(mime_type=mime_type, description=description)
        except Exception:
            # Continue to graceful fallbacks when python-magic runtime fails.
            pass

    signature_guess = _detect_by_signature(content)
    if signature_guess is not None:
        return signature_guess

    guessed_mime, _ = mimetypes.guess_type(filename)
    if guessed_mime:
        return FileTypeDetails(
            mime_type=guessed_mime,
            description="Detected by filename extension.",
        )

    return FileTypeDetails(
        mime_type="application/octet-stream",
        description="Unknown format (no stable signature found).",
    )