import os
from typing import Dict, Optional

from pypdf import PdfReader

from app.config import settings


def extract_text_from_file(file_path: str) -> str:
    """Extract text content from a file based on its extension."""
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()

    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in [".txt", ".md"]:
        return extract_text_from_text_file(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file."""
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"Error extracting text from PDF: {str(e)}")


def extract_text_from_text_file(file_path: str) -> str:
    """Extract text from a TXT or MD file."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        raise ValueError(f"Error reading text file: {str(e)}")


def save_file_and_extract_content(
    file: bytes, filename: str, store_id: str
) -> Dict[str, str]:
    """Save the uploaded file and extract its content."""
    # Validate extension
    _, ext = os.path.splitext(filename)
    if ext.lower() not in settings.allowed_extensions:
        raise ValueError(f"Unsupported file type: {ext}")

    # Create safe filename
    safe_filename = f"{store_id}{ext}"
    file_path = os.path.join(settings.upload_dir, safe_filename)

    # Ensure upload directory exists
    os.makedirs(settings.upload_dir, exist_ok=True)

    # Save file
    with open(file_path, "wb") as f:
        f.write(file)

    # Extract content
    content = extract_text_from_file(file_path)

    return {
        "store_id": store_id,
        "filename": filename,
        "file_path": file_path,
        "content": content,
    }


def delete_file(file_path: str) -> None:
    """Delete a file if it exists."""
    if os.path.exists(file_path):
        os.remove(file_path)
