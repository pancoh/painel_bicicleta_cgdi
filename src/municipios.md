---
title: Municípios
---

```js
import {html} from "npm:htl";
import {csvBlob, formatNumber, slug} from "./lib/formatters.js";

const iniciativas = await FileAttachment("./data/processed/iniciativas.json").json();
const sorted = [...iniciativas].sort((a, b) => a.municipio.localeCompare(b.municipio, "pt-BR") || a.iniciativa.localeCompare(b.iniciativa, "pt-BR"));
const rows = sorted.slice(0, 100);

const exportButton = html`<button class="button button-primary">Exportar base completa</button>`;
exportButton.onclick = () => {
  const url = URL.createObjectURL(csvBlob(sorted));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `municipios-${slug("selo-bicicleta-brasil")}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
};
```

<div class="hero-shell">
  <h1 class="hero-title" style="font-size:2.3rem">Base consolidada</h1>
  <p class="hero-subtitle">Tabela de consulta com amostra ampliada. A exportação abaixo baixa toda a base processada do painel.</p>
</div>

<div class="table-shell">
  <div class="table-toolbar">
    <div class="table-meta">${formatNumber(sorted.length)} linhas na base processada</div>
    ${exportButton}
  </div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Município</th>
          <th>UF</th>
          <th>Instituição</th>
          <th>Iniciativa</th>
          <th>Categoria</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((item) => html`<tr><td>${item.municipio}</td><td>${item.uf}</td><td>${item.instituicao}</td><td>${item.iniciativa}</td><td>${item.categoria}</td><td>${item.estadoAplicacao}</td></tr>`)}
      </tbody>
    </table>
  </div>
</div>
