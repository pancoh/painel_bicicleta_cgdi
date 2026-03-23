import * as Plot from "npm:@observablehq/plot";
import {html} from "npm:htl";

export const REGION_COLORS = {
  "Norte": "#78b8b1",
  "Nordeste": "#e5b37a",
  "Centro Oeste": "#b79ad9",
  "Sudeste": "#89a8e8",
  "Sul": "#8fc8a3"
};

export function filterData(data, filters) {
  const search = String(filters.search ?? "").trim().toLowerCase();
  return data.filter((item) => {
    if (filters.region && filters.region !== "Todas" && item.regiao !== filters.region) return false;
    if (filters.uf && filters.uf !== "Todas" && item.uf !== filters.uf) return false;
    if (filters.categoria && filters.categoria !== "Todas" && item.categoria !== filters.categoria) return false;
    if (filters.proponente && filters.proponente !== "Todos" && item.proponente !== filters.proponente) return false;
    if (filters.ano && filters.ano !== "Todos" && item.anoConcessao !== filters.ano) return false;
    if (filters.premiada && filters.premiada !== "Todas" && item.premiada !== filters.premiada) return false;
    if (!search) return true;
    const haystack = [
      item.iniciativa,
      item.instituicao,
      item.municipio,
      item.uf,
      item.categoria
    ].join(" ").toLowerCase();
    return haystack.includes(search);
  });
}

export function summarize(data) {
  const count = (key) => Array.from(new Set(data.map((item) => item[key]).filter(Boolean))).length;
  return {
    iniciativas: data.length,
    premiadas: data.filter((d) => d.premiada === "Sim").length,
    municipios: count("municipio"),
    ufs: count("uf"),
    regioes: count("regiao")
  };
}

export function countBy(data, key, limit = Infinity) {
  const counts = new Map();
  for (const item of data) {
    const value = item[key] || "Não informado";
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts, ([label, value]) => ({label, value}))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "pt-BR"))
    .slice(0, limit);
}

export function mapData(data) {
  const grouped = new Map();
  for (const item of data) {
    if (!item.uf || !item.municipio || item.lat == null || item.lon == null) continue;
    const key = `${item.municipio}__${item.uf}`;
    const current = grouped.get(key) ?? {
      key,
      uf: item.uf,
      municipio: item.municipio,
      regiao: item.regiao,
      lat: item.lat,
      lon: item.lon,
      total: 0,
      categorias: new Map()
    };
    current.total += 1;
    current.categorias.set(item.categoria, (current.categorias.get(item.categoria) ?? 0) + 1);
    grouped.set(key, current);
  }
  return Array.from(grouped.values()).map((item) => ({
    ...item,
    categoriasResumo: Array.from(item.categorias, ([categoria, quantidade]) => `${categoria}: ${quantidade}`).join("\n")
  }));
}

export function categoryChart(data) {
  const cats = countBy(data, "categoria");
  const regions = Object.keys(REGION_COLORS);
  const maxVal = cats[0]?.value ?? 1;

  if (cats.length === 0) {
    return html`<p class="muted" style="padding:1rem 0">Nenhum dado para exibir.</p>`;
  }

  const legend = html`
    <div class="barchart-legend">
      ${regions.map((r) => html`
        <span class="barchart-legend-item">
          <span class="barchart-swatch" style=${"background:" + REGION_COLORS[r]}></span>
          ${r}
        </span>
      `)}
    </div>
  `;

  const tipDataMap = new WeakMap();

  const rows = cats.map(({label, value}) => {
    const segs = regions
      .map((r) => ({r, v: data.filter((d) => d.categoria === label && d.regiao === r).length}))
      .filter((s) => s.v > 0);
    const row = document.createElement("div");
    row.className = "barchart-row";
    row.innerHTML = `<div class="barchart-row-label">${label}</div>`;
    const track = document.createElement("div");
    track.className = "barchart-track";
    for (const s of segs) {
      const seg = document.createElement("div");
      seg.className = "barchart-seg";
      seg.style.cssText = `width:${(s.v / maxVal * 100).toFixed(2)}%;background:${REGION_COLORS[s.r]}`;
      track.appendChild(seg);
    }
    row.appendChild(track);
    const count = document.createElement("div");
    count.className = "barchart-count";
    count.textContent = value;
    row.appendChild(count);
    tipDataMap.set(row, {label, value, segs});
    return row;
  });

  const tip = document.createElement("div");
  tip.className = "barchart-tip";
  const chart = html`<div class="barchart">${legend}${rows}${tip}</div>`;

  chart.addEventListener("mouseover", (e) => {
    const row = e.target.closest(".barchart-row");
    if (!row) { tip.style.display = "none"; return; }
    const d = tipDataMap.get(row);
    if (!d) { tip.style.display = "none"; return; }
    tip.innerHTML = `<strong>${d.label}</strong><br>${d.value} iniciativas`;
    for (const s of d.segs) {
      const line = document.createElement("div");
      line.className = "barchart-tip-row";
      line.innerHTML = `<span class="barchart-swatch" style="background:${REGION_COLORS[s.r]}"></span>${s.r}: ${s.v}`;
      tip.appendChild(line);
    }
    tip.style.display = "block";
  });

  chart.addEventListener("mousemove", (e) => {
    const rect = chart.getBoundingClientRect();
    tip.style.left = (e.clientX - rect.left + 12) + "px";
    tip.style.top = (e.clientY - rect.top - 10) + "px";
  });

  chart.addEventListener("mouseleave", () => { tip.style.display = "none"; });

  return chart;
}

export function ufMap(data, brazilStates, {height = 420, width = 640} = {}) {
  const values = mapData(data);
  const totals = values.map((d) => d.total);
  const minTotal = Math.min(...totals, 1);
  const maxTotal = Math.max(...totals, 1);
  const activeUfs = new Set(values.map((d) => d.uf));
  const zoomStates = {
    type: "FeatureCollection",
    features: brazilStates.features.filter((feature) => activeUfs.has(feature.id))
  };
  const projectionDomain = zoomStates.features.length > 0 ? zoomStates : brazilStates;
  const radius = (total) => {
    if (maxTotal === minTotal) return 7;
    const logMin = Math.log1p(minTotal);
    const logMax = Math.log1p(maxTotal);
    const t = (Math.log1p(total) - logMin) / (logMax - logMin);
    return 10 + t * 30;
  };
  return Plot.plot({
    height,
    width,
    margin: 12,
    style: {background: "transparent", fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif", fontSize: "13px"},
    projection: {
      type: "mercator",
      domain: projectionDomain,
      inset: 10
    },
    x: {axis: null},
    y: {axis: null},
    r: {range: [Math.max(2, width * 0.006), Math.max(12, width * 0.05)], type: "log"},
    marks: [
      Plot.geo(brazilStates, {
        fill: "#f1f3f5",
        stroke: "#c7cfd8",
        strokeWidth: 0.8
      }),
      Plot.dot(values, {
        x: "lon",
        y: "lat",
        r: "total",
        fill: (d) => REGION_COLORS[d.regiao] ?? "#214dd8",
        fillOpacity: 0.7,
        stroke: "#ffffff",
        strokeWidth: 1,
        tip: true,
        title: (d) => `${d.municipio} – ${d.uf}\n${d.total} iniciativa(s)`
      }),
      Plot.dot(values.filter((d) => d.total >= 3), {
        x: "lon",
        y: "lat",
        r: 1.8,
        fill: "#ffffff"
      }),
      Plot.frame({stroke: "#d3d8df", rx: 18})
    ]
  });
}

export function paginatedExplorer(rows, {pageSize = 12} = {}) {
  let page = 1;
  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  const list = html`<div class="explorer-list"></div>`;
  const topPrevButton = html`<button class="button button-secondary" type="button">Anterior</button>`;
  const topNextButton = html`<button class="button button-secondary" type="button">Próxima</button>`;
  const bottomPrevButton = html`<button class="button button-secondary" type="button">Anterior</button>`;
  const bottomNextButton = html`<button class="button button-secondary" type="button">Próxima</button>`;
  const topStatus = html`<div class="table-meta"></div>`;
  const bottomStatus = html`<div class="table-meta"></div>`;
  const shell = html`
    <div class="explorer-list-shell">
      <div class="explorer-pagination explorer-pagination-top">
        ${topPrevButton}
        ${topStatus}
        ${topNextButton}
      </div>
      ${list}
      <div class="explorer-pagination">
        ${bottomPrevButton}
        ${bottomStatus}
        ${bottomNextButton}
      </div>
    </div>
  `;

  function renderRow(item) {
    const isPremiada = item.premiada === "Sim";
    return html`
      <article class=${`explorer-row${isPremiada ? " explorer-row--premiada" : ""}`}>
        ${isPremiada ? html`<span class="premiada-ribbon">★ Premiada${item.anoConcessao ? ` — ${item.anoConcessao}` : ""}</span>` : ""}
        <div class="explorer-topline">
          <div class="explorer-meta-left">
            <span class="chip">${item.proponente}</span>
            <span class="chip">${item.uf}</span>
            <span class="chip">${item.categoria}</span>
          </div>
          <div class="explorer-meta-right">
            <span class="chip">${item.anoConcessao || "—"}</span>
          </div>
        </div>
        <h3 class="explorer-title">${item.iniciativa}</h3>
        <p class="explorer-institution">${item.instituicao}</p>
      </article>
    `;
  }

  function render() {
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, totalRows);
    const slice = rows.slice(start, end);
    list.replaceChildren(...slice.map(renderRow));
    const label = totalRows ? `${start + 1}-${end} de ${totalRows}` : "0 de 0";
    topStatus.textContent = label;
    bottomStatus.textContent = label;
    const disablePrev = page <= 1;
    const disableNext = page >= totalPages;
    topPrevButton.disabled = disablePrev;
    bottomPrevButton.disabled = disablePrev;
    topNextButton.disabled = disableNext;
    bottomNextButton.disabled = disableNext;
  }

  const onPrev = () => {
    if (page > 1) {
      page -= 1;
      render();
    }
  };

  const onNext = () => {
    if (page < totalPages) {
      page += 1;
      render();
    }
  };

  topPrevButton.onclick = onPrev;
  bottomPrevButton.onclick = onPrev;
  topNextButton.onclick = onNext;
  bottomNextButton.onclick = onNext;
   render();
  return shell;
}
