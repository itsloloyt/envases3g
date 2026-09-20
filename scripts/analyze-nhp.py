"""Read the supplied NHP workbooks and audit matches against the catalog.

This script only reports candidates. It never changes public prices.
"""
from difflib import SequenceMatcher
import csv
import json
import re
import sys
import unicodedata

import openpyxl


def normalize(value):
    value = unicodedata.normalize("NFKD", str(value)).encode("ascii", "ignore").decode().lower()
    value = re.sub(r"\b(cc|ml|frasco|botella|pet|r\s*20|r\s*24|r\s*28)\b", " ", value)
    return " ".join(re.findall(r"[a-z]+|\d+", value))


products = json.load(open("src/data/products.json", encoding="utf-8"))
summary = []
output_path = None
if "--output" in sys.argv:
    output_path = sys.argv[sys.argv.index("--output") + 1]
for path in (arg for arg in sys.argv[1:] if arg not in ("--changes", "--output", output_path)):
    book = openpyxl.load_workbook(path, read_only=True, data_only=True)
    rows = list(book.active.values)
    for row in rows[2:]:
        if len(row) < 3 or not row[0] or not row[1]:
            continue
        name = normalize(row[1])
        candidates = sorted(
            (
                (
                    SequenceMatcher(None, name, normalize(p["name"])).ratio(),
                    p["slug"],
                    p["name"],
                    p["price"],
                )
                for p in products
                if "con tapa" not in normalize(p["name"])
            ),
            reverse=True,
        )[:2]
        item = {"file": path.split("/")[-1], "code": str(row[0]), "name": row[1], "solo": row[2], "top": candidates, "accessories": {str(rows[0][i]).strip(): value for i, value in enumerate(row) if i >= 3 and value is not None and i < len(rows[0]) and rows[0][i]}}
        summary.append(item)
        if "--changes" not in sys.argv and output_path is None:
            print(json.dumps(item, ensure_ascii=False))
if output_path:
    with open(output_path, "w", encoding="utf-8-sig", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["archivo", "codigo", "nombre_planilla", "precio_solo_planilla", "slug_sugerido", "nombre_catalogo", "coincidencia", "precio_catalogo", "revisar", "precios_con_accesorios_json"])
        for item in summary:
            top = item["top"][0]
            review = "Sí" if top[0] < .95 or not isinstance(item["solo"], (int, float)) or item["solo"] == 0 or item["solo"] != top[3] else "No"
            writer.writerow([item["file"], item["code"], item["name"], item["solo"], top[1], top[2], round(top[0], 3), top[3], review, json.dumps(item["accessories"], ensure_ascii=False)])
    print(f"Wrote {len(summary)} rows to {output_path}")
if "--changes" in sys.argv:
    print("Rows:", len(summary))
    for item in summary:
        match = item["top"][0]
        if match[0] < .92 or (item["solo"] != 0 and item["solo"] != match[3]):
            print(f'{item["code"]:6} {item["name"]:33} {item["solo"]!s:5} -> {match[2]} ({match[3]}; {match[0]:.2f})')
