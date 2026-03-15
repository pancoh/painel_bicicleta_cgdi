#!/usr/bin/env python3

from __future__ import annotations

import json
import csv
import re
import unicodedata
import zipfile
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "BASE_SELO_SITE.xlsx"
MUNICIPALITIES_SOURCE = ROOT / "data" / "raw" / "municipios.csv"
TARGET_DIR = ROOT / "src" / "data" / "processed"
TARGET_DIR.mkdir(parents=True, exist_ok=True)

NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
UF_CENTROIDS = {
    "AC": (-70.5, -9.8), "AL": (-36.6, -9.6), "AM": (-63.0, -4.2), "AP": (-51.5, 1.2),
    "BA": (-41.5, -12.8), "CE": (-39.5, -5.2), "DF": (-47.9, -15.8), "ES": (-40.5, -19.5),
    "GO": (-49.3, -16.1), "MA": (-45.4, -5.0), "MG": (-44.0, -18.1), "MS": (-54.5, -20.8),
    "MT": (-56.0, -13.6), "PA": (-52.0, -3.8), "PB": (-36.7, -7.1), "PE": (-37.7, -8.4),
    "PI": (-42.8, -7.1), "PR": (-51.6, -24.6), "RJ": (-43.5, -22.5), "RN": (-36.7, -5.8),
    "RO": (-63.3, -10.9), "RR": (-61.3, 1.7), "RS": (-53.0, -30.2), "SC": (-50.5, -27.3),
    "SE": (-37.4, -10.7), "SP": (-48.2, -22.4), "TO": (-48.0, -10.2)
}

MUNICIPALITY_ALIASES = {
    ("alto paraiso", "GO"): "alto paraiso de goias",
    ("paranamirim", "PE"): "parnamirim"
}

STATUS_ALIASES = {
    "realizada": "Realizada",
    "em andamento": "Em andamento",
    "nao realizada": "Não realizada"
}

def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").replace("\xa0", " ")).strip()


def normalize_key(value: str) -> str:
    normalized = unicodedata.normalize("NFD", normalize_space(value))
    normalized = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    normalized = normalized.lower().replace("'", " ").replace("-", " ")
    return re.sub(r"\s+", " ", normalized).strip()


def normalize_category(value: str) -> str:
    cleaned = normalize_space(value)
    key = cleaned.lower()
    if key == "cultura da bicicleta":
        return "Cultura da bicicleta"
    return cleaned


def normalize_status(value: str) -> str:
    cleaned = normalize_space(value)
    key = cleaned.lower()
    key = (
        key.replace("ã", "a")
        .replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
        .replace("ç", "c")
    )
    return STATUS_ALIASES.get(key, cleaned or "Não informado")


def excel_serial_to_iso(serial: str) -> str | None:
    cleaned = normalize_space(serial)
    if not cleaned:
        return None
    try:
        number = float(cleaned)
    except ValueError:
        return cleaned
    origin = datetime(1899, 12, 30)
    date_value = origin + timedelta(days=number)
    return date_value.date().isoformat()


def parse_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    values = []
    for item in root:
        values.append("".join(node.text or "" for node in item.iter(f"{{{NS['a']}}}t")))
    return values


def parse_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    raw = cell.find("a:v", NS)
    if raw is None:
        inline = cell.find("a:is", NS)
        if inline is None:
            return ""
        return "".join(node.text or "" for node in inline.iter(f"{{{NS['a']}}}t"))
    value = raw.text or ""
    if cell_type == "s":
        return shared_strings[int(value)]
    return value


def read_rows() -> list[dict[str, str]]:
    with zipfile.ZipFile(SOURCE) as archive:
        shared_strings = parse_shared_strings(archive)
        root = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
        rows = root.find("a:sheetData", NS)
        headers: list[str] = []
        records: list[dict[str, str]] = []
        for index, row in enumerate(rows if rows is not None else []):
            values = [parse_value(cell, shared_strings) for cell in row.findall("a:c", NS)]
            if index == 0:
                headers = [normalize_space(value) for value in values]
                continue
            if not any(normalize_space(value) for value in values):
                continue
            record = {
                headers[position]: normalize_space(value) if position < len(values) else ""
                for position, value in enumerate(values)
            }
            records.append(record)
        return records


def load_municipality_coordinates() -> dict[tuple[str, str], dict[str, str | float]]:
    coordinates = {}
    with MUNICIPALITIES_SOURCE.open("r", encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            key = (normalize_key(row["name"]), row["uf_code"])
            coordinates[key] = {
                "municipio": row["name"],
                "lat": float(row["lat"]),
                "lon": float(row["lon"])
            }
    return coordinates


def status_tone(status: str) -> str:
    if status == "Realizada":
        return "realizada"
    if status == "Em andamento":
        return "andamento"
    if status == "Não realizada":
        return "nao"
    return "outro"


def serialize_counter(counter: Counter) -> list[dict[str, int | str]]:
    return [{"label": label, "value": value} for label, value in counter.most_common()]


def main() -> None:
    raw_rows = read_rows()
    municipality_coordinates = load_municipality_coordinates()
    initiatives = []
    matched_municipalities = set()
    unmatched_municipalities = set()
    for row in raw_rows:
        uf = normalize_space(row.get("UF", "")).upper()
        region = normalize_space(row.get("REGIÃO", "")).title().replace("-", " ")
        category = normalize_category(row.get("CATEGORIA", ""))
        status = normalize_status(row.get("ESTADO DA APLICAÇÃO", ""))
        city = normalize_space(row.get("MUNICÍPIO", ""))
        link = normalize_space(row.get("LINK DRIVE", ""))
        lookup_name = MUNICIPALITY_ALIASES.get((normalize_key(city), uf), normalize_key(city))
        municipality_coord = municipality_coordinates.get((lookup_name, uf))
        coord = municipality_coord or (
            {"lat": UF_CENTROIDS[uf][1], "lon": UF_CENTROIDS[uf][0], "municipio": None}
            if uf in UF_CENTROIDS else None
        )
        if municipality_coord:
            matched_municipalities.add((city, uf))
        elif city and uf:
            unmatched_municipalities.add((city, uf))
        initiatives.append({
            "id": normalize_space(row.get("ID", "")),
            "certificadoNoDrive": normalize_space(row.get("CERTIFICADO NO DIRVE?", "")),
            "proponente": normalize_space(row.get("PROPONENTE", "")),
            "iniciativa": normalize_space(row.get("INICIATIVA", "")),
            "estadoAplicacao": status,
            "estadoAplicacaoTone": status_tone(status),
            "descricao": normalize_space(row.get("DESCRIÇÃO", "")),
            "dataConcessao": excel_serial_to_iso(row.get("DATA DA CONCESSÃO DO SELO", "")),
            "categoria": category,
            "instituicao": normalize_space(row.get("INSTITUIÇÃO", "")),
            "municipio": city,
            "uf": uf,
            "regiao": region,
            "pais": normalize_space(row.get("PAÍS", "")),
            "linkDrive": link,
            "lat": coord["lat"] if coord else None,
            "lon": coord["lon"] if coord else None,
            "coordinateSource": "municipio" if municipality_coord else ("uf" if coord else None)
        })

    by_category = Counter(item["categoria"] for item in initiatives)
    by_region = Counter(item["regiao"] for item in initiatives)
    by_status = Counter(item["estadoAplicacao"] for item in initiatives)
    by_proponente = Counter(item["proponente"] for item in initiatives)

    by_uf_counter = Counter(item["uf"] for item in initiatives)
    by_uf_categories: dict[str, Counter] = defaultdict(Counter)
    by_uf_cities: dict[str, set[str]] = defaultdict(set)
    for item in initiatives:
        by_uf_categories[item["uf"]][item["categoria"]] += 1
        if item["municipio"]:
            by_uf_cities[item["uf"]].add(item["municipio"])

    by_uf = []
    for uf, total in by_uf_counter.most_common():
        lon, lat = UF_CENTROIDS.get(uf, (None, None))
        by_uf.append({
            "uf": uf,
            "total": total,
            "municipios": len(by_uf_cities[uf]),
            "lat": lat,
            "lon": lon,
            "categorias": serialize_counter(by_uf_categories[uf])
        })

    summary = {
        "updatedAt": datetime.now().date().isoformat(),
        "totals": {
            "iniciativas": len(initiatives),
            "municipios": len({item["municipio"] for item in initiatives if item["municipio"]}),
            "ufs": len({item["uf"] for item in initiatives if item["uf"]}),
            "regioes": len({item["regiao"] for item in initiatives if item["regiao"]})
        },
        "byCategory": serialize_counter(by_category),
        "byRegion": serialize_counter(by_region),
        "byStatus": serialize_counter(by_status),
        "byProponente": serialize_counter(by_proponente),
        "byUf": by_uf
        ,
        "geocoding": {
            "municipiosComCoordenadas": len(matched_municipalities),
            "municipiosSemCoordenadas": len(unmatched_municipalities),
            "faltantes": [
                {"municipio": municipio, "uf": uf}
                for municipio, uf in sorted(unmatched_municipalities)
            ]
        }
    }

    (TARGET_DIR / "iniciativas.json").write_text(
        json.dumps(initiatives, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    (TARGET_DIR / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )


if __name__ == "__main__":
    main()
