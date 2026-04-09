# CyberScan Backend

FastAPI backend for malware-oriented analysis with:
- SHA256 hashing (`hashlib`)
- File type detection (`python-magic`)
- VirusTotal enrichment

## Structure

```text
backend/
├── main.py
├── .env
├── requirements.txt
├── services/
│   ├── analyzer.py
│   └── virustotal.py
├── utils/
│   ├── hashing.py
│   └── filetype.py
└── schemas/
    └── response.py
```

## Run

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Endpoints

- `GET /health`
- `POST /scan` (multipart/form-data field: `file`)

## Notes

- Accepts any file type.
- Max upload size is currently 100 MB.
- If hash is not in VirusTotal and file <= 32 MB, backend submits the file to VT.
- On Windows, if `python-magic` has installation issues, install `python-magic-bin` and keep the code unchanged.

