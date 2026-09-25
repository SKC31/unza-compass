"""
AI service abstraction.

Wraps the LLM call behind a single function, `generate_answer()`, so the
provider can be swapped later without touching main.py. Currently uses
Google's Gemini API (free tier via https://aistudio.google.com/apikey).
If no API key is configured, or the call fails for any reason, the caller
falls back to a knowledge-based, non-AI answer (see build_fallback_answer)
— the app never crashes because the AI is down.
"""
import logging
from typing import List, Tuple

import google.generativeai as genai

from config import settings
from models import KnowledgeItem

logger = logging.getLogger("unza_compass.ai")

SYSTEM_PROMPT = """You are UNZA Compass, an AI assistant that helps University of Zambia (UNZA) \
students navigate university information. You are an independent student-built prototype, \
NOT an official UNZA service.

Rules you must always follow:
1. Base your answer primarily on the CONTEXT provided below. Do not invent official UNZA \
policies, deadlines, fees, requirements, or contact details that are not present in the context.
2. If the context does not contain enough information to answer confidently, say so clearly \
and suggest the student verify with the official UNZA source (registry, faculty office, etc.).
3. Explain things in clear, simple, friendly language suitable for a student.
4. Always remind the student to verify important academic or administrative information \
through official UNZA channels, especially for anything involving deadlines, fees, or requirements.
5. Keep answers concise and well-organized (use short paragraphs or bullet points where helpful).
"""


def _build_context_block(items: List[KnowledgeItem]) -> str:
    if not items:
        return "No relevant knowledge base entries were found for this question."

    blocks = []
    for item in items:
        blocks.append(
            f"Title: {item.title}\n"
            f"Category: {item.category}\n"
            f"Content: {item.content}\n"
            f"Source: {item.source or 'N/A'}"
        )
    return "\n\n---\n\n".join(blocks)


def build_fallback_answer(question: str, items: List[KnowledgeItem]) -> str:
    """Non-AI answer built directly from retrieved knowledge, used when the AI is unavailable."""
    if not items:
        return (
            "I couldn't find specific information about that in the UNZA Compass knowledge base "
            "yet, and the AI assistant is currently unavailable. Please try rephrasing your "
            "question, or check the official UNZA website / relevant office for accurate "
            "information."
        )

    lines = [
        "I couldn't reach the AI assistant right now, but here's what I found in the "
        "knowledge base that may help:",
        "",
    ]
    for item in items:
        lines.append(f"**{item.title}**")
        lines.append(item.content)
        lines.append("")

    lines.append(
        "⚠️ This is retrieved information, not an AI-generated explanation. Please verify "
        "important details through official UNZA channels."
    )
    return "\n".join(lines)


def generate_answer(question: str, context_items: List[KnowledgeItem]) -> Tuple[str, str]:
    """
    Returns (answer_text, mode) where mode is "AI" or "FALLBACK".
    Never raises — any failure degrades gracefully to a fallback answer.
    """
    if not settings.AI_API_KEY:
        return build_fallback_answer(question, context_items), "FALLBACK"

    try:
        genai.configure(api_key=settings.AI_API_KEY)
        context_block = _build_context_block(context_items)

        user_message = (
            f"CONTEXT:\n{context_block}\n\n"
            f"STUDENT QUESTION:\n{question}\n\n"
            "Answer the student's question using the context above."
        )

        model = genai.GenerativeModel(
            model_name=settings.AI_MODEL,
            system_instruction=SYSTEM_PROMPT,
        )

        response = model.generate_content(
            user_message,
            generation_config=genai.types.GenerationConfig(max_output_tokens=700),
        )

        try:
            answer_text = (response.text or "").strip()
        except ValueError:
            # response.text raises if Gemini returned no candidates (e.g. blocked
            # by safety filters) — treat that the same as an empty answer.
            answer_text = ""

        if not answer_text:
            return build_fallback_answer(question, context_items), "FALLBACK"

        return answer_text, "AI"

    except Exception:
        # Any AI failure (bad key, network issue, rate limit, safety block, etc.)
        # degrades gracefully rather than crashing the request.
        logger.exception("Gemini call failed; falling back to knowledge-based answer")
        return build_fallback_answer(question, context_items), "FALLBACK"
