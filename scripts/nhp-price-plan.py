"""Prepare an audited SQL price update from the supplied NHP matrices.

Only exact product-name matches with every variant mapped are eligible. The
script writes SQL for review; it never connects to the production database.
"""
import json
import re
import sys
from pathlib import Path

import openpyxl

def norm(value):
    import unicodedata
    value = unicodedata.normalize("NFKD", str(value)).encode("ascii", "ignore").decode().lower()
    return " ".join(re.findall(r"[a-z]+|\d+", value))


def route(size, name):
    name = norm(name)
    if "solo" in name:
        return 2
    if size == 20:
        if "gota" in name:
            return 5 if any(word in name for word in ("oro", "plata", "plta", "enfund")) else 4
        if "crema" in name or "cremera" in name:
            return 3 if "premium" in name else None
        if "spray" in name:
            return 7 if any(word in name for word in ("oro", "plata", "plta", "olata", "premium", "enfund")) else 6
        if "flip" in name:
            return 8
        if "ciega" in name:
            return 9
        if "difusor" in name and "plast" in name:
            return 10
    if size == 24:
        if "spray" in name:
            return 4 if any(word in name for word in ("oro", "plata", "plta", "premium", "enfund")) else 3
        if "crema" in name or "cremera" in name:
            if "premium" in name:
                return 7
            return 6 if any(word in name for word in ("oro", "plata", "enfund")) else 5
        if "gatillo" in name:
            return 8
        if "ciega" in name:
            return 14 if "alumin" in name else 9
        if "difusor" in name:
            return 10 if "alumin" in name else 11 if "plast" in name else None
        if "disk" in name:
            return 12
        if "flip" in name:
            return 13
    if size == 28:
        if "spray" in name:
            return 3
        if "crema" in name or "cremera" in name:
            return 4
        if "gatillo" in name:
            return 6 if "mini" in name else 5
        if "ciega" in name:
            return 13 if "alumin" in name else 8 if "negra" in name or "negro" in name else 7
        if "disk" in name:
            return 9
        if "flip" in name:
            return 10 if "hongo" in name else 11
        if "difusor" in name and "alumin" in name:
            return 12
    return None


catalog = json.loads(Path("src/data/products.json").read_text(encoding="utf-8"))
by_name = {}
for product in catalog:
    name = norm(product["name"])
    name = re.sub(r"\b(cc|ml)\b", "", name).replace("frasco ", "").replace("botella ", "")
    if "con tapa" not in name:
        by_name.setdefault(" ".join(name.split()), []).append(product)

plan = []
skipped = []
for path in sys.argv[1:]:
    sheet = openpyxl.load_workbook(path, read_only=True, data_only=True).active
    size = int(re.search(r"(20|24|28)", Path(path).name).group(1))
    for row in list(sheet.values)[2:]:
        if not row[0] or not row[1]:
            continue
        name = norm(row[1])
        name = re.sub(r"\b(cc|ml|r 20|r 24|r 28)\b", "", name)
        matches = by_name.get(" ".join(name.split()), [])
        if len(matches) != 1 or not isinstance(row[2], (int, float)) or row[2] <= 0:
            skipped.append((row[0], row[1], "nombre o precio base ambiguo"))
            continue
        product = matches[0]
        variants = []
        unknown = []
        for variant in product["variants"]:
            column = route(size, variant["name"])
            if column is None or column >= len(row) or not isinstance(row[column], (int, float)) or row[column] <= 0:
                unknown.append(variant["name"])
            else:
                variants.append({"id": variant["id"], "name": variant["name"], "old": variant["price"], "new": row[column]})
        if unknown:
            skipped.append((row[0], row[1], "; ".join(unknown)))
            continue
        if product["price"] != row[2] or any(v["old"] != v["new"] for v in variants):
            plan.append({"code": str(row[0]), "slug": product["slug"], "old": product["price"], "new": row[2], "variants": variants})

Path("reports/nhp-price-plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=2), encoding="utf-8")
Path("reports/nhp-skipped.json").write_text(json.dumps(skipped, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Complete changed products: {len(plan)}; skipped/ambiguous products: {len(skipped)}")
for item in plan:
    changed = sum(v["old"] != v["new"] for v in item["variants"])
    print(f'{item["code"]} {item["slug"]}: {item["old"]} -> {item["new"]}, {changed} variant changes')
