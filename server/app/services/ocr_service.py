import io
from pypdf import PdfReader
from PIL import Image
import pytesseract

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts raw text content from uploaded PDF document bytes."""
    try:
        pdf_file = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_file)
        extracted_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text.append(text)
        return "\n".join(extracted_text).strip()
    except Exception as e:
        print(f"[OCR Service Error - PDF]: {str(e)}")
        return ""

def extract_text_from_image(file_bytes: bytes) -> str:
    """Extracts raw text content from uploaded image (PNG/JPG) using Tesseract OCR."""
    try:
        image = Image.open(io.BytesIO(file_bytes))
        image = image.convert("L")  # Convert image to grayscale for improved OCR recognition
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        print(f"[OCR Service Error - Image]: {str(e)}")
        return ""

def process_uploaded_file(file_storage) -> str:
    """Unified file handler router for PDF, Images, and TXT files."""
    filename = file_storage.filename.lower()
    file_bytes = file_storage.read()

    if filename.endswith(".pdf"):
        extracted = extract_text_from_pdf(file_bytes)
        # Fallback to OCR if PDF contains scanned image pages without text layer
        if not extracted or len(extracted.strip()) < 10:
            print("[OCR Service]: Native PDF text empty, attempting image OCR fallback...")
            extracted = extract_text_from_image(file_bytes)
        return extracted

    elif filename.endswith((".png", ".jpg", ".jpeg")):
        return extract_text_from_image(file_bytes)

    elif filename.endswith(".txt"):
        return file_bytes.decode("utf-8", errors="ignore").strip()

    return ""