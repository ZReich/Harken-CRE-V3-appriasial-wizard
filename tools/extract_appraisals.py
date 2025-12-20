"""
Script to extract text from appraisal PDFs for analysis.
Tries direct text extraction first, falls back to OCR if needed.
"""

import os
import fitz  # PyMuPDF
import pdfplumber
from pathlib import Path

# Directory containing the appraisal PDFs
APPRAISAL_DIR = Path(r"C:\Users\monta\Documents\Harken v2\Harken-v2-release2025.01\Appraisal Documents\appraisal data set")
OUTPUT_DIR = Path(r"C:\Users\monta\Documents\Harken v2\Harken-v2-release2025.01\Appraisal Documents\extracted_text")

# Create output directory if it doesn't exist
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def extract_text_pymupdf(pdf_path):
    """Extract text using PyMuPDF (fast, works for most PDFs with embedded text)"""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page_num, page in enumerate(doc):
            page_text = page.get_text()
            if page_text.strip():
                text += f"\n\n{'='*80}\nPAGE {page_num + 1}\n{'='*80}\n\n"
                text += page_text
        doc.close()
        return text
    except Exception as e:
        print(f"PyMuPDF failed: {e}")
        return None

def extract_text_pdfplumber(pdf_path):
    """Extract text using pdfplumber (better for complex layouts)"""
    try:
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    text += f"\n\n{'='*80}\nPAGE {page_num + 1}\n{'='*80}\n\n"
                    text += page_text
        return text
    except Exception as e:
        print(f"pdfplumber failed: {e}")
        return None

def process_pdf(pdf_path):
    """Process a single PDF file"""
    print(f"\nProcessing: {pdf_path.name}")
    
    # Try PyMuPDF first
    text = extract_text_pymupdf(pdf_path)
    
    # Check if we got meaningful text
    if not text or len(text.strip()) < 500:
        print("  PyMuPDF extraction minimal, trying pdfplumber...")
        text = extract_text_pdfplumber(pdf_path)
    
    if text and len(text.strip()) > 500:
        # Save to output file
        output_path = OUTPUT_DIR / f"{pdf_path.stem}.txt"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(f"EXTRACTED FROM: {pdf_path.name}\n")
            f.write(f"{'='*80}\n\n")
            f.write(text)
        print(f"  [OK] Extracted {len(text):,} characters -> {output_path.name}")
        return output_path
    else:
        print(f"  [FAIL] Could not extract sufficient text from {pdf_path.name}")
        return None

def main():
    """Main function to process all PDFs"""
    print("=" * 80)
    print("APPRAISAL PDF TEXT EXTRACTION")
    print("=" * 80)
    
    # Get all PDF files
    pdf_files = list(APPRAISAL_DIR.glob("*.pdf"))
    print(f"\nFound {len(pdf_files)} PDF files to process")
    
    results = []
    for pdf_path in sorted(pdf_files):
        result = process_pdf(pdf_path)
        results.append({
            'file': pdf_path.name,
            'success': result is not None,
            'output': result
        })
    
    # Summary
    print("\n" + "=" * 80)
    print("EXTRACTION SUMMARY")
    print("=" * 80)
    successful = sum(1 for r in results if r['success'])
    print(f"Successfully extracted: {successful}/{len(results)} files")
    
    for r in results:
        status = "[OK]" if r['success'] else "[FAIL]"
        print(f"  {status} {r['file']}")
    
    print(f"\nOutput directory: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()

