let currentStoreId = null;
let currentFileName = null;

let allModels = []; // Store all models for search functionality

// Fetch and populate models on page load
async function loadModels() {
    const modelDropdown = document.getElementById('modelDropdown');
    const refreshBtn = document.getElementById('refreshModelsBtn');
    
    // Show loading state
    modelDropdown.innerHTML = '<div class="dropdown-item loading">Loading models...</div>';
    if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 4V9H4.58152M4.58152 9C5.67336 7.40882 7.21344 6.33041 9 6.08238M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.3266 16.5912 16.7866 17.6696 15 17.9176M19.4185 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    
    try {
        const response = await fetch('/models');
        const data = await response.json();
        
        if (response.ok && data.data) {
            // Store all models
            allModels = data.data.sort((a, b) => a.name.localeCompare(b.name));
            
            // Display first 10 models initially
            displayModels(allModels.slice(0, 10));
            
            // Set default to a free model if available
            const freeModel = allModels.find(model => model.id === 'openai/gpt-oss-20b:free');
            if (freeModel) {
                selectModel(freeModel);
            }
        } else {
            console.error('Failed to load models:', data.error || data.detail);
            modelDropdown.innerHTML = '<div class="dropdown-item error">Failed to load models</div>';
        }
    } catch (error) {
        console.error('Error loading models:', error);
        modelDropdown.innerHTML = '<div class="dropdown-item error">Error loading models</div>';
    } finally {
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 4V9H4.58152M4.58152 9C5.67336 7.40882 7.21344 6.33041 9 6.08238M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.3266 16.5912 16.7866 17.6696 15 17.9176M19.4185 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }
    }
}

// Display models in dropdown
function displayModels(models) {
    const modelDropdown = document.getElementById('modelDropdown');
    const modelSearch = document.getElementById('modelSearch');
    
    if (models.length === 0) {
        modelDropdown.innerHTML = '<div class="dropdown-item no-results">No models found</div>';
        return;
    }
    
    modelDropdown.innerHTML = models.map(model => 
        `<div class="dropdown-item" data-model-id="${model.id}" data-model-name="${model.name}">
            <div class="model-name">${model.name}</div>
            <div class="model-id">${model.id}</div>
        </div>`
    ).join('');
    
    // Add click handlers
    document.querySelectorAll('.dropdown-item:not(.loading):not(.error):not(.no-results)').forEach(item => {
        item.addEventListener('click', () => {
            const modelId = item.dataset.modelId;
            const model = allModels.find(m => m.id === modelId);
            if (model) {
                selectModel(model);
                hideDropdown();
            }
        });
    });
}

// Select a model
function selectModel(model) {
    const modelSearch = document.getElementById('modelSearch');
    const modelSelect = document.getElementById('modelSelect');
    
    modelSearch.value = `${model.name} (${model.id})`;
    modelSelect.value = model.id;
}

// Search functionality
function setupSearch() {
    const modelSearch = document.getElementById('modelSearch');
    const modelDropdown = document.getElementById('modelDropdown');
    
    let searchTimeout;
    
    modelSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.toLowerCase().trim();
        
        searchTimeout = setTimeout(() => {
            if (query === '') {
                // Show first 10 models when search is empty
                displayModels(allModels.slice(0, 10));
            } else {
                // Filter models based on search query
                const filteredModels = allModels.filter(model => 
                    model.name.toLowerCase().includes(query) || 
                    model.id.toLowerCase().includes(query)
                );
                displayModels(filteredModels.slice(0, 10)); // Limit to 10 results
            }
            showDropdown();
        }, 300);
    });
    
    // Show dropdown on focus
    modelSearch.addEventListener('focus', () => {
        if (allModels.length > 0) {
            showDropdown();
        }
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!modelSearch.contains(e.target) && !modelDropdown.contains(e.target)) {
            hideDropdown();
        }
    });
}

function showDropdown() {
    const modelDropdown = document.getElementById('modelDropdown');
    modelDropdown.style.display = 'block';
}

function hideDropdown() {
    const modelDropdown = document.getElementById('modelDropdown');
    modelDropdown.style.display = 'none';
}

// Refresh models button handler
function setupRefreshButton() {
    const refreshBtn = document.getElementById('refreshModelsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadModels);
    }
}

// Load models when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadModels();
    setupRefreshButton();
    setupSearch();
});

// Drag and drop functionality
const uploadArea = document.getElementById("uploadArea");

uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
});

// File select handler
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    handleFile(file);
  }
}

// Handle file upload
async function handleFile(file) {
  // Validate file type
  const allowedTypes = ["application/pdf", "text/plain", "text/markdown"];
  const allowedExtensions = [".pdf", ".txt", ".md"];
  const fileExtension = "." + file.name.split(".").pop().toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    alert("Please upload a PDF, TXT, or MD file.");
    return;
  }

  // Show loading overlay
  showLoading("Uploading and processing document...");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Upload failed");
    }

    // Store the document info
    currentStoreId = data.store_id;
    currentFileName = data.filename;

    // Switch to chat interface
    showChatInterface();

  } catch (error) {
    alert("Error uploading file: " + error.message);
    console.error("Upload error:", error);
  } finally {
    hideLoading();
  }
}

// Send message to chat
async function sendMessage() {
  const input = document.getElementById("chatInput");
  const question = input.value.trim();

  if (!question || !currentStoreId) {
    return;
  }

  // Get selected model
  const selectedModel = document.getElementById("modelSelect").value;
  if (!selectedModel) {
    alert("Please select an AI model");
    return;
  }

  // Disable input while processing
  const sendButton = document.getElementById("sendButton");
  sendButton.disabled = true;
  input.disabled = true;

  // Add user message to chat
  addMessage(question, "user");
  input.value = "";

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question,
        store_id: currentStoreId,
        model: selectedModel,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Chat failed");
    }

    // Add assistant response to chat
    addMessage(data.answer, "assistant");

  } catch (error) {
    addMessage("Sorry, I encountered an error: " + error.message, "assistant");
    console.error("Chat error:", error);
  } finally {
    sendButton.disabled = false;
    input.disabled = false;
    input.focus();
  }
}

// Format markdown-like text to HTML
function formatText(text) {
  // Convert markdown-style formatting to HTML
  let formatted = text;

  // Remove excessive blank lines (more than 2 consecutive newlines)
  formatted = formatted.replace(/\n{3,}/g, "\n\n");

  // Parse and convert Markdown tables
  formatted = parseMarkdownTable(formatted);

  // Headers (## Header)
  formatted = formatted.replace(/^### (.+)$/gm, "<h4>$1</h4>");
  formatted = formatted.replace(/^## (.+)$/gm, "<h3>$1</h3>");
  formatted = formatted.replace(/^# (.+)$/gm, "<h2>$1</h2>");

  // Bold (**text**)
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Numbered lists (1. item)
  formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");

  // Bullet lists (- item or * item)
  formatted = formatted.replace(/^[\-\*]\s+(.+)$/gm, "<li>$1</li>");

  // Wrap consecutive list items in <ul> or <ol>
  formatted = formatted.replace(
    /(<li>.*<\/li>\s*)+/g,
    (match) => `<ul>${match}</ul>`,
  );

  // Line breaks - be more conservative
  // Replace double newlines with paragraph breaks
  formatted = formatted.replace(/\n\n+/g, "</p><p>");
  // Replace single newlines with <br> only if not already in a tag
  formatted = formatted.replace(/([^>])\n([^<])/g, "$1<br>$2");

  // Wrap in paragraphs
  formatted = "<p>" + formatted + "</p>";

  // Clean up empty paragraphs
  formatted = formatted.replace(/<p><\/p>/g, "");
  formatted = formatted.replace(/<p>\s*<\/p>/g, "");

  return formatted;
}

// Parse Markdown Table into HTML
function parseMarkdownTable(text) {
  const lines = text.split('\n');
  let result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    
    // Check if this line starts a table (contains | at start and end)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines = [];
      
      // Collect all consecutive table lines
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      
      // Convert table lines to HTML
      if (tableLines.length >= 2) {
        const htmlTable = convertTableToHTML(tableLines);
        result.push(htmlTable);
      } else {
        // Not a valid table, keep original lines
        result.push(...tableLines);
      }
    } else {
      result.push(line);
      i++;
    }
  }
  
  return result.join('\n');
}

// Convert Markdown table lines to HTML table
function convertTableToHTML(tableLines) {
  const rows = [];
  let isFirstRow = true;
  
  for (let i = 0; i < tableLines.length; i++) {
    const line = tableLines[i].trim();
    
    // Skip separator rows (contains only |, -, :, and spaces)
    if (/^\|[\s\-:|]+\|$/.test(line)) {
      continue;
    }
    
    // Parse table cells
    const cells = line
      .substring(1, line.length - 1) // Remove leading and trailing |
      .split('|')
      .map(cell => cell.trim());
    
    // Determine if this is a header row (first row before separator)
    const isHeader = isFirstRow && i + 1 < tableLines.length && /^\|[\s\-:|]+\|$/.test(tableLines[i + 1].trim());
    
    if (isHeader) {
      const headerCells = cells.map(cell => `<th>${cell}</th>`).join('');
      rows.push(`<thead><tr>${headerCells}</tr></thead>`);
      isFirstRow = false;
    } else if (!isFirstRow || i === tableLines.length - 1) {
      // Body rows
      const bodyCells = cells.map(cell => `<td>${cell}</td>`).join('');
      
      // Start tbody if this is the first body row
      if (rows.length > 0 && !rows[rows.length - 1].includes('tbody')) {
        rows.push('<tbody>');
      } else if (rows.length === 0) {
        rows.push('<tbody>');
      }
      
      rows.push(`<tr>${bodyCells}</tr>`);
    }
  }
  
  // Close tbody if it was opened
  if (rows.length > 0 && rows[rows.length - 1].includes('<tr>')) {
    rows.push('</tbody>');
  }
  
  return `<table class="markdown-table">${rows.join('')}</table>`;
}

// Add message to chat
function addMessage(text, sender) {
  const chatMessages = document.getElementById("chatMessages");

  // Remove welcome message if it exists
  const welcomeMessage = chatMessages.querySelector(".welcome-message");
  if (welcomeMessage) {
    welcomeMessage.remove();
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";

  if (sender === "assistant") {
    // Format assistant messages with HTML
    contentDiv.innerHTML = formatText(text);
  } else {
    // User messages stay as plain text
    contentDiv.textContent = text;
  }

  messageDiv.appendChild(contentDiv);
  chatMessages.appendChild(messageDiv);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle Enter key in chat input
function handleKeyPress(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

// Show chat interface
function showChatInterface() {
  document.getElementById("uploadSection").style.display = "none";
  document.getElementById("chatSection").style.display = "flex";
  document.getElementById("documentName").textContent = currentFileName;

  // Focus on chat input
  setTimeout(() => {
    document.getElementById("chatInput").focus();
  }, 100);
}

// Reset app to upload state
async function resetApp() {
  if (
    confirm(
      "Are you sure you want to close this document? The chat history will be lost.",
    )
  ) {
    // Delete the store
    if (currentStoreId) {
      try {
        await fetch(`/store/${currentStoreId}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error deleting store:", error);
      }
    }

    // Reset state
    currentStoreId = null;
    currentFileName = null;

    // Clear chat messages
    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML = `
            <div class="welcome-message">
                <h2>Ask me anything about your document!</h2>
                <p>I'll search through the document to find relevant information and answer your questions.</p>
            </div>
        `;

    // Clear input
    document.getElementById("chatInput").value = "";

    // Show upload section
    document.getElementById("chatSection").style.display = "none";
    document.getElementById("uploadSection").style.display = "block";

    // Reset file input
    document.getElementById("fileInput").value = "";
  }
}

// Loading overlay functions
function showLoading(text = "Loading...") {
  document.getElementById("loadingText").textContent = text;
  document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loadingOverlay").style.display = "none";
}

// Auto-resize textarea
const chatInput = document.getElementById("chatInput");
if (chatInput) {
  chatInput.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 120) + "px";
  });
}
