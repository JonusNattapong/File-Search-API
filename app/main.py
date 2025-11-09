import os
import uuid

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.models import (
    ChatRequest,
    ChatResponse,
    DeleteResponse,
    StoresResponse,
    UploadResponse,
)
from app.services.ai_service import ai_service
from app.config import settings
from app.services.file_service import delete_file, save_file_and_extract_content

app = FastAPI(title="Chat With Your Document")

# Store file contents in memory (in production, use a database)
file_stores = {}


@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()


@app.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload a document and extract its content"""
    try:
        # Read file content
        content = await file.read()

        # Generate a unique store ID
        store_id = str(uuid.uuid4())

        # Save file and extract content
        file_info = save_file_and_extract_content(
            file=content, filename=file.filename, store_id=store_id
        )

        # Store the file info
        file_stores[store_id] = file_info

        return UploadResponse(
            success=True,
            store_id=store_id,
            filename=file.filename,
            message="File uploaded and processed successfully",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with the uploaded document"""
    try:
        if request.store_id not in file_stores:
            raise HTTPException(
                status_code=404,
                detail="Document not found. Please upload a document first.",
            )

        store_info = file_stores[request.store_id]

        # Generate response using OpenRouter with document content
        answer = ai_service.generate_response(request.question, store_info["content"], request.model)

        return ChatResponse(
            success=True, answer=answer, filename=store_info["filename"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stores", response_model=StoresResponse)
async def get_stores():
    """Get list of all uploaded documents"""
    return StoresResponse(
        stores=[
            {"store_id": store_id, "filename": info["filename"]}
            for store_id, info in file_stores.items()
        ]
    )


@app.delete("/store/{store_id}", response_model=DeleteResponse)
async def delete_store(store_id: str):
    """Delete a document store"""
    if store_id in file_stores:
        # Remove the uploaded file
        file_path = file_stores[store_id]["file_path"]
        delete_file(file_path)

        del file_stores[store_id]
        return DeleteResponse(success=True, message="Store deleted successfully")

    raise HTTPException(status_code=404, detail="Store not found")


@app.get("/models")
async def get_models():
    """Get available models from OpenRouter"""
    try:
        import requests
        api_key = settings.openrouter_api_key
        if not api_key:
            print("ERROR: API key not configured")
            raise HTTPException(status_code=500, detail="API key not configured")
        
        print(f"Using API key: {api_key[:10]}...")
        headers = {"Authorization": f"Bearer {api_key}"}
        url = "https://openrouter.ai/api/v1/models/user"
        print(f"Making request to: {url}")
        
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Response status: {response.status_code}")
        
        response.raise_for_status()
        data = response.json()
        print(f"Received {len(data.get('data', []))} models")
        
        return data
    except requests.exceptions.Timeout:
        print("ERROR: Request timeout")
        raise HTTPException(status_code=500, detail="Request timeout")
    except requests.exceptions.RequestException as e:
        print(f"ERROR: API request failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"API request failed: {str(e)}")
    except Exception as e:
        print(f"ERROR: Internal error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
