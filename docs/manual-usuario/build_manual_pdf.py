from __future__ import annotations

import html
import re
from pathlib import Path

from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

BASE_DIR = Path(__file__).resolve().parent
MD_PATH = BASE_DIR / "MANUAL_USUARIO_CRM_INMOBILIARIO.md"
PDF_PATH = BASE_DIR / "MANUAL_USUARIO_CRM_INMOBILIARIO.pdf"

ACCENT = colors.HexColor("#A7E8D1")
INK = colors.HexColor("#101820")
MUTED = colors.HexColor("#5B6472")
BLUE = colors.HexColor("#2167A7")
LIGHT = colors.HexColor("#F4F6F8")


def register_fonts() -> tuple[str, str, str]:
    fonts_dir = Path("C:/Windows/Fonts")
    regular = fonts_dir / "arial.ttf"
    bold = fonts_dir / "arialbd.ttf"
    italic = fonts_dir / "ariali.ttf"
    if regular.exists() and bold.exists():
        pdfmetrics.registerFont(TTFont("ManualSans", str(regular)))
        pdfmetrics.registerFont(TTFont("ManualSans-Bold", str(bold)))
        if italic.exists():
            pdfmetrics.registerFont(TTFont("ManualSans-Italic", str(italic)))
        return "ManualSans", "ManualSans-Bold", "ManualSans-Italic"
    return "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"


FONT, FONT_BOLD, FONT_ITALIC = register_fonts()


def clean(text: str) -> str:
    text = text.replace("**", "")
    text = text.replace("`", "")
    return html.escape(text.strip())


def inline_markup(text: str) -> str:
    text = html.escape(text.strip())
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`([^`]+)`", r"<font face='%s'>\1</font>" % FONT_BOLD, text)
    return text


def make_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            "CoverTitle",
            fontName=FONT_BOLD,
            fontSize=34,
            leading=39,
            textColor=colors.white,
            alignment=TA_CENTER,
            spaceAfter=14,
        )
    )
    styles.add(
        ParagraphStyle(
            "CoverSub",
            fontName=FONT,
            fontSize=15,
            leading=22,
            textColor=colors.HexColor("#DCE8E4"),
            alignment=TA_CENTER,
        )
    )
    styles.add(
        ParagraphStyle(
            "H1Manual",
            fontName=FONT_BOLD,
            fontSize=20,
            leading=25,
            textColor=INK,
            spaceBefore=18,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            "H2Manual",
            fontName=FONT_BOLD,
            fontSize=14,
            leading=18,
            textColor=BLUE,
            spaceBefore=12,
            spaceAfter=7,
        )
    )
    styles.add(
        ParagraphStyle(
            "H3Manual",
            fontName=FONT_BOLD,
            fontSize=11.5,
            leading=15,
            textColor=INK,
            spaceBefore=9,
            spaceAfter=5,
        )
    )
    styles.add(
        ParagraphStyle(
            "BodyManual",
            fontName=FONT,
            fontSize=9.3,
            leading=13.2,
            textColor=INK,
            alignment=TA_LEFT,
            spaceAfter=5,
        )
    )
    styles.add(
        ParagraphStyle(
            "SmallManual",
            fontName=FONT,
            fontSize=8,
            leading=11,
            textColor=MUTED,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            "BulletManual",
            fontName=FONT,
            fontSize=9.1,
            leading=12.8,
            leftIndent=14,
            firstLineIndent=-8,
            textColor=INK,
            spaceAfter=3,
        )
    )
    styles.add(
        ParagraphStyle(
            "NoteManual",
            fontName=FONT,
            fontSize=9,
            leading=12.8,
            borderWidth=0,
            borderPadding=8,
            backColor=colors.HexColor("#ECFBF6"),
            textColor=INK,
            spaceBefore=5,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            "CodeManual",
            fontName=FONT,
            fontSize=8.4,
            leading=11,
            backColor=colors.HexColor("#F2F4F7"),
            borderPadding=7,
            textColor=colors.HexColor("#26313D"),
            spaceAfter=7,
        )
    )
    styles.add(
        ParagraphStyle(
            "Caption",
            fontName=FONT_ITALIC,
            fontSize=8,
            leading=10,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceAfter=9,
        )
    )
    return styles


STYLES = make_styles()


def header_footer(canvas, doc):
    canvas.saveState()
    width, height = A4
    page = canvas.getPageNumber()
    if page == 1:
        canvas.restoreState()
        return
    canvas.setFillColor(INK)
    canvas.rect(0, height - 0.72 * cm, width, 0.72 * cm, fill=1, stroke=0)
    canvas.setFillColor(ACCENT)
    canvas.rect(0, height - 0.72 * cm, 4.2 * cm, 0.72 * cm, fill=1, stroke=0)
    canvas.setFont(FONT_BOLD, 8)
    canvas.setFillColor(colors.white)
    canvas.drawString(1.2 * cm, height - 0.46 * cm, "Manual de Usuario - Sistema Inmobiliario")
    canvas.setFillColor(MUTED)
    canvas.setFont(FONT, 8)
    canvas.drawString(1.2 * cm, 0.72 * cm, "CRM Inmobiliaria / Inmobiliaria Prime")
    canvas.drawRightString(width - 1.2 * cm, 0.72 * cm, f"Pagina {page}")
    canvas.restoreState()


def cover() -> list:
    title_table = Table(
        [
            [Paragraph("MANUAL DE USUARIO", STYLES["CoverTitle"])],
            [Paragraph("Sistema Inmobiliario", STYLES["CoverTitle"])],
            [Paragraph("Sitio Web Público + CRM Inmobiliario", STYLES["CoverSub"])],
        ],
        colWidths=[17 * cm],
        rowHeights=[1.7 * cm, 1.7 * cm, 1.25 * cm],
    )
    title_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), INK),
                ("BOX", (0, 0), (-1, -1), 0, INK),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    meta = Table(
        [
            ["Producto", "CRM Inmobiliaria / Inmobiliaria Prime"],
            ["Version", "1.0"],
            ["Fecha", "24 de agosto de 2026"],
            ["Audiencia", "Administradores, agentes, asistentes y usuarios operativos"],
        ],
        colWidths=[4 * cm, 12 * cm],
    )
    meta.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), FONT),
                ("FONTNAME", (0, 0), (0, -1), FONT_BOLD),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BACKGROUND", (0, 0), (0, -1), LIGHT),
                ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#D9DEE5")),
                ("PADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return [Spacer(1, 5.2 * cm), title_table, Spacer(1, 1.2 * cm), meta, PageBreak()]


def table_from_lines(lines: list[str]) -> Table:
    rows = []
    for line in lines:
        cells = [clean(cell) for cell in line.strip().strip("|").split("|")]
        if cells and not all(re.fullmatch(r"[-: ]+", c) for c in cells):
            rows.append([Paragraph(c, STYLES["SmallManual"]) for c in cells])
    table = Table(rows, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), FONT),
                ("BACKGROUND", (0, 0), (-1, 0), INK),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#D9DEE5")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def image_flowable(md_line: str):
    match = re.match(r"!\[(.*?)\]\((.*?)\)", md_line.strip())
    if not match:
        return None
    caption, raw_path = match.groups()
    img_path = (BASE_DIR / raw_path).resolve()
    if not img_path.exists() or img_path.suffix.lower() == ".svg":
        return Paragraph(f"<i>{html.escape(caption)}</i>", STYLES["Caption"])
    with PILImage.open(img_path) as im:
        width_px, height_px = im.size
    max_width = 17 * cm
    max_height = 11 * cm
    ratio = min(max_width / width_px, max_height / height_px)
    img = Image(str(img_path), width=width_px * ratio, height=height_px * ratio)
    return [img, Paragraph(caption, STYLES["Caption"])]


def parse_markdown() -> list:
    lines = MD_PATH.read_text(encoding="utf-8").splitlines()
    story = cover()
    in_code = False
    code_lines: list[str] = []
    table_lines: list[str] = []

    def flush_table():
        nonlocal table_lines
        if table_lines:
            story.append(table_from_lines(table_lines))
            story.append(Spacer(1, 6))
            table_lines = []

    for raw in lines:
        line = raw.rstrip()
        if line.startswith("```"):
            if in_code:
                story.append(Paragraph("<br/>".join(html.escape(x) for x in code_lines), STYLES["CodeManual"]))
                code_lines = []
                in_code = False
            else:
                flush_table()
                in_code = True
            continue
        if in_code:
            code_lines.append(line)
            continue
        if line.startswith("|") and line.endswith("|"):
            table_lines.append(line)
            continue
        flush_table()
        if not line.strip():
            story.append(Spacer(1, 4))
            continue
        if line.strip() == "---":
            story.append(Spacer(1, 8))
            continue
        if line.startswith("# "):
            text = clean(line[2:])
            if "Capitulo" in text or "Parte " in text:
                story.append(PageBreak())
            story.append(Paragraph(text, STYLES["H1Manual"]))
        elif line.startswith("## "):
            story.append(Paragraph(clean(line[3:]), STYLES["H2Manual"]))
        elif line.startswith("### "):
            story.append(Paragraph(clean(line[4:]), STYLES["H3Manual"]))
        elif line.startswith("!["):
            flow = image_flowable(line)
            if isinstance(flow, list):
                story.extend(flow)
            elif flow is not None:
                story.append(flow)
        elif line.startswith(">"):
            story.append(Paragraph(inline_markup(line.lstrip("> ").strip()), STYLES["NoteManual"]))
        elif line.lstrip().startswith("- "):
            story.append(Paragraph("• " + inline_markup(line.lstrip()[2:]), STYLES["BulletManual"]))
        elif re.match(r"\d+\. ", line.lstrip()):
            story.append(Paragraph(inline_markup(line), STYLES["BulletManual"]))
        else:
            story.append(Paragraph(inline_markup(line), STYLES["BodyManual"]))
    return story


def main():
    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=A4,
        rightMargin=1.4 * cm,
        leftMargin=1.4 * cm,
        topMargin=1.25 * cm,
        bottomMargin=1.4 * cm,
        title="Manual de Usuario - Sistema Inmobiliario",
        author="CRM Inmobiliaria",
    )
    doc.build(parse_markdown(), onFirstPage=header_footer, onLaterPages=header_footer)
    print(PDF_PATH)


if __name__ == "__main__":
    main()
