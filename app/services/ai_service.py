import os
from typing import Dict

from openai import OpenAI

from app.config import settings


class AIService:
    def __init__(self):
        self.client = OpenAI(
            api_key=settings.openrouter_api_key,
            base_url="https://openrouter.ai/api/v1",
        )

    def generate_response(self, question: str, document_content: str, model: str = "openai/gpt-oss-20b:free") -> str:
        """Generate a response using OpenRouter with document context."""

        # Truncate content if too long (adjust based on model limits)
        max_content_length = 10000  # Adjust as needed
        if len(document_content) > max_content_length:
            document_content = document_content[:max_content_length] + "..."

        prompt = f"""You are a helpful assistant that answers questions based on the provided document.

DOCUMENT CONTENT:
{document_content}

TASK:
Answer the following question using ONLY information from the document above. The user may ask in Thai or English - respond in the same language they use.

QUESTION:
{question}

INSTRUCTIONS:
1. Search the document thoroughly for relevant information
2. Provide accurate, complete answers based only on the document content
3. If the document contains tables, charts, or structured data:
   - Present numerical data in clear, organized tables
   - Use markdown table format: | Column 1 | Column 2 |
4. Structure your response with:
   - Clear headings using ## for main topics and ### for subtopics
   - Bullet points (-) for lists
   - **Bold** for important terms or values
5. If there are multiple recipes, formulas, or steps:
   - Separate each one clearly with headings
   - Number steps when showing procedures
6. If the question asks for specific data from tables:
   - Present it in table format for easy reading
   - Include column headers and organize rows logically
7. Response language:
   - If the question is in Thai, respond in Thai
   - If the question is in English, respond in English
   - Maintain professional, clear language

IMPORTANT:
- Only use information from the document
- If information is not in the document, say so clearly
- Cite specific sections when relevant
- Format tables properly for readability
"""

        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000,  # Adjust as needed
                temperature=0.1,  # Low temperature for factual responses
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            raise ValueError(f"Error generating response: {str(e)}")


# Global instance
ai_service = AIService()
