"""
Simple keyword-based retrieval over the knowledge base.

This module is intentionally simple (no embeddings/vector DB) for the MVP,
but its interface (`retrieve(query, db, top_k)` -> List[KnowledgeItem]) is
designed so it can be swapped for an embeddings-based implementation later
without changing any calling code in main.py or ai.py.
"""
import re
from typing import List

from sqlalchemy.orm import Session

from models import KnowledgeItem

STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "do", "does", "did",
    "how", "what", "when", "where", "why", "who", "which", "i", "to",
    "for", "of", "in", "on", "at", "can", "could", "should", "would",
    "my", "me", "it", "this", "that", "and", "or", "with", "about",
}


def normalize(text: str) -> List[str]:
    """Lowercase, strip punctuation, split into words, drop stopwords."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    words = [w for w in text.split() if w and w not in STOPWORDS]
    return words


def score_item(query_words: List[str], item: KnowledgeItem) -> float:
    """
    Simple relevance score:
    - +3 for each query word found in the title
    - +2 for each query word found in keywords
    - +1 for each query word found in content
    """
    if not query_words:
        return 0.0

    title_words = set(normalize(item.title))
    keyword_words = set()
    for kw in item.keyword_list():
        keyword_words.update(normalize(kw))
    content_words = set(normalize(item.content))

    score = 0.0
    for w in query_words:
        if w in title_words:
            score += 3
        if w in keyword_words:
            score += 2
        if w in content_words:
            score += 1

    return score


def retrieve(query: str, db: Session, top_k: int = 3) -> List[KnowledgeItem]:
    """Return the top_k most relevant knowledge items for the given query."""
    query_words = normalize(query)
    if not query_words:
        return []

    all_items = db.query(KnowledgeItem).all()
    scored = [(score_item(query_words, item), item) for item in all_items]
    scored = [(s, item) for s, item in scored if s > 0]
    scored.sort(key=lambda pair: pair[0], reverse=True)

    return [item for _, item in scored[:top_k]]
