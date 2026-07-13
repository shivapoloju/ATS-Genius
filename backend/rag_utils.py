"""
Lightweight RAG utilities.

Performs:
- Resume chunking
- TF-IDF vectorization
- Cosine similarity search
- Keyword similarity scoring

without requiring an external vector database.
"""

import re
from typing import List, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def chunk_text(
    text: str,
    min_length: int = 40,
) -> List[str]:
    """
    Split resume text into meaningful chunks.
    """

    raw_chunks = re.split(
        r"\n\s*\n|\n(?=[A-Z][A-Za-z ]{2,30}:?\n)",
        text,
    )

    resume_chunks = []

    for chunk in raw_chunks:
        cleaned_chunk = " ".join(chunk.split())

        if len(cleaned_chunk) >= min_length:
            resume_chunks.append(cleaned_chunk)

    if not resume_chunks:
        return [" ".join(text.split())]

    return resume_chunks


def retrieve_relevant_chunks(
    resume_text: str,
    job_description: str,
    top_k: int = 5,
) -> Tuple[List[str], int]:
    """
    Retrieve the most relevant resume sections using TF-IDF
    cosine similarity and compute an overall keyword match score.
    """

    resume_chunks = chunk_text(resume_text)

    corpus = resume_chunks + [job_description]

    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=5000,
    )

    tfidf_matrix = vectorizer.fit_transform(corpus)

    job_description_vector = tfidf_matrix[-1]
    resume_vectors = tfidf_matrix[:-1]

    similarity_scores = cosine_similarity(
        resume_vectors,
        job_description_vector,
    ).flatten()

    ranked_indices = similarity_scores.argsort()[::-1][:top_k]

    relevant_chunks = [
        resume_chunks[index]
        for index in ranked_indices
        if similarity_scores[index] > 0
    ]

    full_vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=5000,
    )

    full_matrix = full_vectorizer.fit_transform(
        [
            resume_text,
            job_description,
        ]
    )

    overall_similarity = cosine_similarity(
        full_matrix[0],
        full_matrix[1],
    ).flatten()[0]

    keyword_match_score = int(
        round(
            min(overall_similarity, 1.0) * 100
        )
    )

    return relevant_chunks, keyword_match_score