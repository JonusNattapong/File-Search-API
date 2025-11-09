# 🤖 OpenRouter Document Chat

Chat with your documents using OpenRouter and FastAPI

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.121+-green.svg)](https://fastapi.tiangolo.com/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-Model-orange.svg)](https://openrouter.ai/)

## 📸 Screenshots

### Upload Interface
![Upload Interface](static/example1.png)

### Chat Interface
![Chat Interface](static/example2.png)

## ✨ Features

- 📄 **Multi-format Support** - Upload PDF, TXT, or MD files
- 💬 **Bilingual Chat** - Works with both Thai and English
- 🔍 **Context-Powered** - Accurate answers using document content injection
- 🎨 **Beautiful UI** - Modern, responsive design with gradient backgrounds
- 📊 **Smart Formatting** - Automatic table and markdown rendering
- 🚀 **Fast & Lightweight** - Built with FastAPI for high performance

## 🛠️ Tech Stack

- **Backend:** FastAPI + Uvicorn
- **AI Model:** OpenRouter (GPT-OSS-20B Free)
- **Document Processing:** Text extraction from PDFs, TXT, MD
- **Frontend:** Vanilla JavaScript (No frameworks!)
- **Styling:** Custom CSS3 with responsive design

## 📋 Prerequisites

- Python 3.11 or higher
- OpenRouter API Key ([Get one here](https://openrouter.ai/keys))

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/openrouter-document-chat.git
   cd openrouter-document-chat
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenRouter API key
   ```

5. **Run the application**
   ```bash
   python run.py
   ```

6. **Open your browser**
   ```
   http://localhost:8000
   ```

## How to Use

1. **Upload a Document**:
   - Drag and drop a file onto the upload area, or
   - Click "Or Browse Files" to select a file from your computer
   - Supported formats: PDF, TXT, MD

2. **Chat with Your Document**:
   - Once uploaded, you'll be taken to the chat interface
   - Type your question in the input field
   - Press Enter or click the send button
   - The AI will analyze your document and provide relevant answers

3. **Start Over**:
   - Click the × button next to the document name to close and upload a new document

## 🔧 Technical Details

### Backend
- **Framework**: FastAPI with async/await support
- **Server**: Uvicorn ASGI server
- **File Handling**: python-multipart for async file operations
- **Environment**: python-dotenv for configuration

### AI & Processing
- **Model**: OpenRouter GPT-OSS-20B Free (configurable)
- **Document Processing**: Text extraction using pypdf for PDFs
- **Context Injection**: Document content included in prompts
- **Response Generation**: Chat completions API

### Frontend
- **Vanilla JavaScript** - No frameworks, pure JS
- **Modern CSS3** - Gradient backgrounds, animations
- **Responsive Design** - Works on desktop and mobile
- **Markdown Rendering** - Smart formatting for tables and structured data

### Features Implementation
- **Drag & Drop**: Native HTML5 drag-drop API
- **File Upload**: FormData with async fetch
- **Chat Interface**: Real-time message streaming
- **Table Formatting**: Markdown to HTML conversion
- **Bilingual Support**: Automatic Thai/English detection

## API Endpoints

- `GET /` - Main application interface
- `POST /upload` - Upload a document and extract content
- `POST /chat` - Send a message and get AI response
- `GET /stores` - List all uploaded documents
- `DELETE /store/{store_id}` - Delete a document store

## Project Structure

```
openrouter-document-chat/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI backend
│   ├── config.py            # Application configuration
│   ├── models.py            # Pydantic models
│   └── services/
│       ├── __init__.py
│       ├── ai_service.py    # OpenRouter integration
│       └── file_service.py  # File handling operations
├── static/
│   ├── index.html          # Main UI
│   ├── styles.css          # Styling
│   └── script.js           # Frontend logic
├── uploads/                # Uploaded files directory
├── .env                    # Environment variables
├── .env.example            # Environment variables template
├── requirements.txt        # Python dependencies
├── run.py                  # Application entry point
└── README.md               # This file
```

## Notes

- Files are automatically renamed to ASCII-safe names to avoid encoding issues
- Document content is extracted and stored in memory for chat sessions
- Chat history is maintained per session but not persisted
- The application runs on port 8000 by default
- Document content is truncated if too long to fit model context limits

## 📜 License

This project is licensed under a **MIT License with Organizational Use Restriction**.

### Usage Terms:

✅ **Allowed:**
- Personal use
- Educational use
- Non-commercial projects
- Modification and distribution for personal use

⚠️ **Requires Permission:**
- Use within any organization, company, or commercial entity
- Commercial projects or products
- Enterprise deployments

### How to Request Organizational Use Permission:

If you want to use this software in an organization or for commercial purposes, please:
1. Open an issue on [GitHub](https://github.com/JonusNattapong/File-Search-API/issues)
2. Contact the repository owner
3. Describe your intended use case

---

### ข้อกำหนดการใช้งาน (Thai):

✅ **อนุญาต:**
- ใช้งานส่วนบุคคล
- ใช้เพื่อการศึกษา
- โปรเจกต์ที่ไม่แสวงหากำไร
- ดัดแปลงและแจกจ่ายเพื่อการใช้งานส่วนตัว

⚠️ **ต้องขออนุญาต:**
- การใช้งานภายในองค์กร บริษัท หรือหน่วยงานทางการค้า
- โปรเจกต์เชิงพาณิชย์
- การติดตั้งใช้งานในองค์กร

**หากต้องการขออนุญาตใช้งานในองค์กร:**
กรุณาติดต่อผ่าน [GitHub Issues](https://github.com/JonusNattapong/File-Search-API/issues) หรือเจ้าของโปรเจกต์โดยตรง

See [LICENSE](LICENSE) file for full terms.