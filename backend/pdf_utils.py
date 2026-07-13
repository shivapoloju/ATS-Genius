"""
PDF text extraction utilities.
"""

from io import BytesIO

from pypdf import PdfReader


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract plain text from a PDF file.
    """

    pdf_reader = PdfReader(BytesIO(file_bytes))

    extracted_pages = []

    for page in pdf_reader.pages:
        page_text = page.extract_text() or ""
        extracted_pages.append(page_text)

    return "\n".join(extracted_pages).strip()