---

```js
import {html} from "npm:htl";
import {categoryChart, countBy, filterData, paginatedExplorer, REGION_COLORS, summarize, ufMap} from "./lib/dashboard.js";
import {csvBlob, formatDate, formatNumber, slug} from "./lib/formatters.js";

const iniciativas = await FileAttachment("./data/processed/iniciativas.json").json();
const summary = await FileAttachment("./data/processed/summary.json").json();
const brazilStates = await FileAttachment("./data/raw/br_states.json").json();

const allUfs = ["Todas", ...Array.from(new Set(iniciativas.map((d) => d.uf))).sort()];
const regions = ["Todas", ...new Set(iniciativas.map((d) => d.regiao))];
const categorias = ["Todas", ...Array.from(new Set(iniciativas.map((d) => d.categoria))).sort((a, b) => a.localeCompare(b, "pt-BR"))];
const proponentes = ["Todos", ...Array.from(new Set(iniciativas.map((d) => d.proponente))).sort()];
const anos = ["Todos", ...Array.from(new Set(iniciativas.map((d) => d.anoConcessao).filter(Boolean))).sort()];
const premiadaOpcoes = ["Todas", "Sim", "Não"];

const ufsByRegion = new Map();
for (const d of iniciativas) {
  if (!ufsByRegion.has(d.regiao)) ufsByRegion.set(d.regiao, new Set());
  ufsByRegion.get(d.regiao).add(d.uf);
}

const regionInput = Inputs.select(regions, {value: "Todas"});
const categoriaInput = Inputs.select(categorias, {value: "Todas"});
const proponenteInput = Inputs.select(proponentes, {value: "Todos"});
const anoInput = Inputs.select(anos, {value: "Todos"});
const premiadaInput = Inputs.select(premiadaOpcoes, {value: "Todas"});
const buscaInput = Inputs.text({placeholder: "Iniciativa, instituição ou município"});

// UF: Inputs.select nativo, filtra opções via hidden/disabled ao trocar região
const ufInput = Inputs.select(allUfs, {value: "Todas"});
function syncUfOptions(regionValue) {
  const allowed = regionValue === "Todas" ? null : ufsByRegion.get(regionValue);
  const sel = ufInput.querySelector("select");
  if (!sel) return;
  Array.from(sel.options).forEach((opt, i) => {
    if (i === 0) return; // "Todas" sempre visível
    const ufName = allUfs[i];
    const hide = allowed && !allowed.has(ufName);
    opt.hidden = hide;
    opt.disabled = hide;
  });
  // se a UF selecionada não pertence à região, reseta
  const currentIdx = sel.selectedIndex;
  if (currentIdx > 0 && sel.options[currentIdx].hidden) {
    ufInput.value = "Todas";
    ufInput.dispatchEvent(new Event("input", {bubbles: true}));
  }
}

const region = Generators.input(regionInput);
const uf = Generators.input(ufInput);
const categoria = Generators.input(categoriaInput);
const proponente = Generators.input(proponenteInput);
const ano = Generators.input(anoInput);
const premiada = Generators.input(premiadaInput);
const busca = Generators.input(buscaInput);

regionInput.addEventListener("input", () => {
  syncUfOptions(regionInput.value);
});
```

<div class="hero-shell">
  <div class="hero-grid">
    <div class="hero-copy">
      <h1 class="hero-title">INICIATIVAS BICICLETA BRASIL</h1>
      <p class="hero-subtitle">Conheça as iniciativas reconhecidas pelo Selo e Prêmio Bicicleta Brasil, selecione os filtros e obtenha visão territorial por UF, quantidades e outras informações das instituições e iniciativas.</p>
    </div>
    <p class="hero-updated">Atualizado em ${formatDate(summary.updatedAt)}</p>
  </div>
</div>

```js
const searchTerm = busca?.trim?.() ?? "";
const filtered = filterData(iniciativas, {
  region,
  uf,
  categoria,
  proponente,
  ano,
  premiada,
  search: typeof searchTerm === "string" ? searchTerm : ""
});
const totals = summarize(filtered);
```

<div class="card card-compact">
  <div class="section-heading">
    <div>
      <h2>Filtros</h2>
      <p>Selecione os filtros, veja os resultados no painel.</p>
    </div>
    ${html`<button class="button button-secondary" onclick=${() => {
      regionInput.value = "Todas";
      regionInput.dispatchEvent(new Event("input", {bubbles: true}));
      ufInput.value = "Todas";
      ufInput.dispatchEvent(new Event("input", {bubbles: true}));
      categoriaInput.value = "Todas";
      categoriaInput.dispatchEvent(new Event("input", {bubbles: true}));
      proponenteInput.value = "Todos";
      proponenteInput.dispatchEvent(new Event("input", {bubbles: true}));
      anoInput.value = "Todos";
      anoInput.dispatchEvent(new Event("input", {bubbles: true}));
      premiadaInput.value = "Todas";
      premiadaInput.dispatchEvent(new Event("input", {bubbles: true}));
      buscaInput.value = "";
      buscaInput.dispatchEvent(new Event("input", {bubbles: true}));
    }}>Limpar filtros</button>`}
  </div>
  <div class="control-shell">
    <label class="control"><span>Região</span>${regionInput}</label>
    <label class="control"><span>UF</span>${ufInput}</label>
    <label class="control"><span>Categoria</span>${categoriaInput}</label>
    <label class="control"><span>Proponente</span>${proponenteInput}</label>
    <label class="control"><span>Ano</span>${anoInput}</label>
    <label class="control"><span>Iniciativa premiada</span>${premiadaInput}</label>
    <label class="control"><span>Busca</span>${buscaInput}</label>
  </div>
</div>

<div class="panel-layout">
  <div class="map-shell map-shell-wide">
    <div class="section-heading">
      <div>
        <h2>Distribuição geográfica por município</h2>
        <p>Passe o cursor nos círculos e veja o nome dos municípios e quantidades de iniciativas.</p>
      </div>
    </div>
    ${resize((w) => ufMap(filtered, brazilStates, {width: w, height: Math.round(w * 0.65)}))}
  </div>
  <div class="panel-side">
    <div class="metric-grid metric-grid-2col">
      ${[
        ["Iniciativas reconhecidas", totals.iniciativas],
        ["Iniciativas premiadas", totals.premiadas],
        ["Municípios com registros", totals.municipios],
        ["Unidades da federação", totals.ufs]
      ].map(([label, value]) => html`<div class="metric-card"><div class="metric-value">${formatNumber(value)}</div><div class="metric-label">${label}</div></div>`)}
    </div>
    <div class="ranking-shell">
      <div class="section-heading">
        <div>
          <h2>Distribuição de iniciativas por região</h2>
          <p>Distribuição do recorte atual.</p>
        </div>
      </div>
      <div class="ranking-list">
        ${countBy(filtered, "regiao", 5).map((item) => html`<div class="ranking-item"><div class="ranking-label"><strong>${item.label}</strong><span>${formatNumber(item.value)}</span></div><div class="ranking-track"><div class="ranking-fill" style=${`width:${(item.value / (filtered.length || 1)) * 100}%; background:${REGION_COLORS[item.label] || "#5a7ced"}`}></div></div></div>`)}
      </div>
    </div>
  </div>
</div>

<div class="chart-shell chart-shell-wide">
  <div class="section-heading">
    <div>
      <h2>Quantidade de iniciativas por categoria</h2>
      <p>Distribuição do recorte filtrado pelas categorias do selo.</p>
    </div>
  </div>
  ${categoryChart(filtered)}
</div>

```js
const exportButton = html`<button class="button button-primary">Exportar CSV</button>`;
exportButton.onclick = () => {
  const rows = filtered.map((item) => ({
    id: item.id,
    proponente: item.proponente,
    iniciativa: item.iniciativa,
    categoria: item.categoria,
    estado_aplicacao: item.estadoAplicacao,
    instituicao: item.instituicao,
    municipio: item.municipio,
    uf: item.uf,
    regiao: item.regiao,
    link_drive: item.linkDrive
  }));
  const url = URL.createObjectURL(csvBlob(rows));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `selo-bicicleta-brasil-${slug(region || "brasil")}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
};
```

<div class="table-shell">
  <div class="table-toolbar">
    <div>
      <div class="section-heading" style="margin-bottom:0.2rem">
        <div>
          <h2>Explorador de iniciativas</h2>
          <p>Visualize e exporte os registros correspondentes aos filtros selecionados.</p>
        </div>
      </div>
      <div class="table-meta">${formatNumber(filtered.length)} resultados no recorte atual</div>
    </div>
    ${exportButton}
  </div>
  ${paginatedExplorer(filtered, {pageSize: 12})}
</div>
