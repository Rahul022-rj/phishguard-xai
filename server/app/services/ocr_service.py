import io
import pypdf
from PIL import Image

# Gracefully handle pytesseract on environments without the system binary
try:
    import pytesseract
    HAS_TESSERACT = True
except Exception as e:
    HAS_TESSERACT = False
    print(f"[OCR Service Notice]: PyTesseract not available or tesseract binary missing: {e}")


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts text content from a PDF file using pypdf."""
    text = ""
    try:
        pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        for page in pdf_reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    except Exception as e:
        print(f"[OCR Service Error] PDF extraction failed: {str(e)}")
    return text.strip()


def extract_text_from_image(file_bytes: bytes) -> str:
    """Extracts text content from an image file using Pillow and PyTesseract."""
    if not HAS_TESSERACT:
        print("[OCR Service Warning]: Image OCR skipped because PyTesseract is unavailable.")
        return ""

    try:
        image = Image.open(io.BytesIO(file_bytes))
        extracted = pytesseract.image_to_string(image)
        return extracted.strip()
    except Exception as e:
        print(f"[OCR Service Error] Image OCR extraction failed: {str(e)}")
        return ""


def process_uploaded_file(file_storage) -> str:
    """
    Main entry point for processing uploaded offer letters or document screenshots.
    Determines file type and routes to PDF parser or Image OCR engine.
    """
    filename = file_storage.filename.lower()
    file_bytes = file_storage.read()

    if filename.endswith(".pdf"):
        extracted = extract_text_from_pdf(file_bytes)
        # Fallback to image OCR if PDF contains scanned image pages without text layer
        if not extracted and HAS_TESSERACT:
            extracted = extract_text_from_image(file_bytes)
        return extracted

    elif filename.endswith((".png", ".jpg", ".jpeg")):
        return extract_text_from_image(file_bytes)

    elif filename.endswith(".txt"):
        try:
            return file_bytes.decode("utf-8").strip()
        except Exception:
            return file_bytes.decode("latin-1", errors="ignore").strip()

    return ""