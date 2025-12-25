from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import fitz  # PyMuPDF


def main() -> None:
    pdf_path = Path("Appraisal Documents") / "Evaluation - 131 S Higgins Avenue, Missoula, MT - Final -.pdf"
    if not pdf_path.exists():
        raise SystemExit(f"PDF not found: {pdf_path}")

    out_dir = Path("prototypes") / "_pdf_thumbs_131_s_higgins"
    out_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(str(pdf_path))
    print(f"pages: {doc.page_count}")

    candidates: list[dict[str, Any]] = []
    for i in range(doc.page_count):
        page = doc.load_page(i)
        img_list = page.get_images(full=True)
        if not img_list:
            continue

        total_px = 0
        max_px = 0
        for img in img_list:
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            px = pix.width * pix.height
            total_px += px
            max_px = max(max_px, px)

        candidates.append(
            {
                "page": i + 1,
                "image_count": len(img_list),
                "max_image_px": max_px,
                "total_image_px": total_px,
            }
        )

    candidates.sort(key=lambda d: (d["max_image_px"], d["total_image_px"], d["image_count"]), reverse=True)

    top_n = 30
    render = candidates[:top_n]
    print("Top image-heavy pages:")
    for c in render:
        print(
            f"- page {c['page']:>3} | imgs {c['image_count']:>2} | max_px {c['max_image_px']:>10} | total_px {c['total_image_px']:>10}"
        )

    # Render thumbnails (low-res) for quick visual classification
    zoom = 0.6
    mat = fitz.Matrix(zoom, zoom)
    for c in render:
        p = int(c["page"])
        page = doc.load_page(p - 1)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        out = out_dir / f"page_{p:03d}.png"
        pix.save(str(out))
        c["thumb_path"] = str(out).replace("\\", "/")

    summary_path = out_dir / "candidates.json"
    summary_path.write_text(json.dumps({"pdf": str(pdf_path), "pages": doc.page_count, "candidates": render}, indent=2))
    print(f"wrote thumbnails: {len(render)} -> {out_dir}")
    print(f"wrote summary: {summary_path}")


if __name__ == "__main__":
    main()





