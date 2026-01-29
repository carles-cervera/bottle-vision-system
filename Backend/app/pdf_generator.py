from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.utils import ImageReader
from datetime import datetime
from io import BytesIO


def generate_error_pdf(
    bottle_id: str,
    tap_result: dict,
    level_result: dict,
    tap_image_bytes: bytes,
    level_image_bytes: bytes,
):
    """
    tap_result   = {"label": "tap_present", "confidence": 0.97}
    level_result = {"label": "ok", "confidence": 0.91}
    image_bytes  = bytes (jpg / png)
    """

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # ==========================================================
    # HEADER
    # ==========================================================
    has_error = (
        tap_result["label"] != "tap_present"
        or level_result["label"] != "ok"
    )

    header_color = colors.red if has_error else colors.green

    c.setFillColor(header_color)
    c.rect(0, height - 80, width, 80, fill=1, stroke=0)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(2 * cm, height - 50, "INFORME DE CONTROL DE QUALITAT")

    c.setFont("Helvetica", 11)
    c.drawString(2 * cm, height - 70, f"Ampolla ID: {bottle_id}")
    c.drawRightString(
        width - 2 * cm,
        height - 70,
        datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
    )

    y = height - 120

    # ==========================================================
    # FUNCTIONS
    # ==========================================================
    def draw_result_block(title, result, x, y):
        ok = result["label"] in ("ok", "tap_present")
        bg = colors.lightgreen if ok else colors.salmon

        c.setFillColor(bg)
        c.rect(x, y - 80, 240, 80, fill=1, stroke=0)

        c.setFillColor(colors.black)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(x + 10, y - 25, title)

        c.setFont("Helvetica-Bold", 20)
        c.drawString(x + 10, y - 55, "OK" if ok else "ERROR")

        c.setFont("Helvetica", 11)
        c.drawString(
            x + 10,
            y - 70,
            f"Etiqueta: {result['label']}",
        )
        c.drawString(
            x + 120,
            y - 55,
            f"Confiança: {result['confidence']:.3f}",
        )

    def draw_image_from_bytes(image_bytes, x, y, w, h):
        if not image_bytes:
            c.setFont("Helvetica", 10)
            c.drawString(x, y + h / 2, "Imatge no disponible")
            return

        image = ImageReader(BytesIO(image_bytes))
        c.drawImage(
            image,
            x,
            y,
            w,
            h,
            preserveAspectRatio=True,
            anchor="c",
            mask="auto",
        )

    def draw_image_border(ok, x, y, w, h):
        c.setStrokeColor(colors.green if ok else colors.red)
        c.setLineWidth(3)
        c.rect(x - 2, y - 2, w + 4, h + 4, fill=0)

    # ==========================================================
    # RESULT BLOCKS
    # ==========================================================
    draw_result_block("TAP", tap_result, 2 * cm, y)
    draw_result_block("NIVELL", level_result, width / 2 + 1 * cm, y)

    # ==========================================================
    # REASONS
    # ==========================================================
    y -= 110
    c.setFont("Helvetica-Bold", 14)
    c.drawString(2 * cm, y, "Motiu del rebuig:")

    c.setFont("Helvetica", 12)
    reasons = []
    if tap_result["label"] != "tap_present":
        reasons.append("• Absència o defecte en el tap")
    if level_result["label"] != "ok":
        reasons.append("• Nivell incorrecte de líquid")

    if not reasons:
        c.drawString(2 * cm, y - 25, "— Cap error detectat")
    else:
        for i, r in enumerate(reasons):
            c.drawString(2 * cm, y - 25 - i * 18, r)

    # ==========================================================
    # IMAGES SECTION
    # ==========================================================
    y -= 120
    c.setFont("Helvetica-Bold", 14)
    c.drawString(2 * cm, y, "Imatges de la inspecció")

    img_width = 7 * cm
    img_height = 9 * cm
    img_y = y - 220

        # Subtitles Y
    subtitle_y = y - 25

    # Image Y (separado claramente)
    img_y = subtitle_y - img_height - 10

    # TAP IMAGE
    c.setFont("Helvetica-Bold", 12)
    c.drawString(2 * cm, y - 25, "Tap")
    draw_image_from_bytes(
        tap_image_bytes,
        2 * cm,
        img_y,
        img_width,
        img_height,
    )
    draw_image_border(
        tap_result["label"] == "tap_present",
        2 * cm,
        img_y,
        img_width,
        img_height,
    )

    # LEVEL IMAGE
    c.drawString(width / 2 + 1 * cm, y - 25, "Nivell")
    draw_image_from_bytes(
        level_image_bytes,
        width / 2 + 1 * cm,
        img_y,
        img_width,
        img_height,
    )
    draw_image_border(
        level_result["label"] == "ok",
        width / 2 + 1 * cm,
        img_y,
        img_width,
        img_height,
    )

    # ==========================================================
    # FINALIZE
    # ==========================================================
    c.showPage()
    c.save()

    buffer.seek(0)
    return buffer
