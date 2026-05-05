"""Convert PROJECT_DOCUMENTATION.md to PDF."""
import markdown
from xhtml2pdf import pisa

INPUT_MD = r"C:\Users\Hajrarahan007\Desktop\ecospend-frontend\PROJECT_DOCUMENTATION.md"
OUTPUT_PDF = r"C:\Users\Hajrarahan007\Desktop\ecospend-frontend\PROJECT_DOCUMENTATION.pdf"

CSS = """
@page {
  size: A4;
  margin: 2cm 1.8cm;
  @frame footer {
    -pdf-frame-content: footerContent;
    bottom: 0.8cm;
    margin-left: 1.8cm;
    margin-right: 1.8cm;
    height: 0.8cm;
  }
}
body {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 10pt;
  color: #333;
  line-height: 1.5;
}
h1 {
  color: #d4808e;
  font-size: 22pt;
  border-bottom: 2px solid #f4b8c1;
  padding-bottom: 6px;
  margin-top: 18pt;
}
h2 {
  color: #c0707f;
  font-size: 16pt;
  border-bottom: 1px solid #f4b8c1;
  padding-bottom: 4px;
  margin-top: 16pt;
}
h3 {
  color: #b35d6c;
  font-size: 13pt;
  margin-top: 12pt;
}
h4 {
  color: #333;
  font-size: 11pt;
  margin-top: 10pt;
}
p { margin: 6pt 0; }
ul, ol { margin: 6pt 0 6pt 18pt; }
li { margin: 2pt 0; }
code {
  background-color: #fdf2f5;
  color: #c0707f;
  padding: 1pt 3pt;
  border-radius: 2pt;
  font-family: Courier, monospace;
  font-size: 9pt;
}
pre {
  background-color: #fdf2f5;
  border: 1px solid #f4b8c1;
  padding: 8pt;
  border-radius: 4pt;
  font-family: Courier, monospace;
  font-size: 8.5pt;
  margin: 6pt 0;
}
pre code {
  background: transparent;
  color: #333;
  padding: 0;
}
table {
  border-collapse: collapse;
  width: 100%;
  margin: 8pt 0;
}
th {
  background-color: #f4b8c1;
  color: #fff;
  padding: 5pt;
  text-align: left;
  font-size: 10pt;
}
td {
  border: 1px solid #f0d0d8;
  padding: 5pt;
  font-size: 9.5pt;
}
tr:nth-child(even) td {
  background-color: #fef5f7;
}
blockquote {
  border-left: 3px solid #f4b8c1;
  padding-left: 10pt;
  color: #777;
  font-style: italic;
  margin: 8pt 0;
}
hr {
  border: none;
  border-top: 1px solid #f4b8c1;
  margin: 12pt 0;
}
a {
  color: #c0707f;
  text-decoration: none;
}
strong { color: #333; }
"""

FOOTER = """<div id="footerContent" style="text-align: center; font-size: 8pt; color: #999;">
  EcoSpend Project Documentation - Page <pdf:pagenumber/> of <pdf:pagecount/>
</div>"""


def convert():
    with open(INPUT_MD, "r", encoding="utf-8") as f:
        md_content = f.read()

    html_body = markdown.markdown(
        md_content,
        extensions=["tables", "fenced_code", "toc"],
    )

    full_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>{CSS}</style>
</head>
<body>
{FOOTER}
{html_body}
</body>
</html>"""

    with open(OUTPUT_PDF, "wb") as out_pdf:
        result = pisa.CreatePDF(full_html, dest=out_pdf, encoding="utf-8")

    if result.err:
        print(f"Error: {result.err}")
        return False
    print(f"PDF created successfully: {OUTPUT_PDF}")
    return True


if __name__ == "__main__":
    convert()
