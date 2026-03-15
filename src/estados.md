---
title: Estados
---

```js
import {html} from "npm:htl";
import {countBy} from "./lib/dashboard.js";
import {formatNumber} from "./lib/formatters.js";

const iniciativas = await FileAttachment("./data/processed/iniciativas.json").json();
const porUf = countBy(iniciativas, "uf", 15);
const porStatus = countBy(iniciativas, "estadoAplicacao");
```

<div class="hero-shell">
  <h1 class="hero-title" style="font-size:2.3rem">Estados</h1>
  <p class="hero-subtitle">Distribuição por UF e situação de aplicação declarada na base consolidada.</p>
</div>

<div class="content-grid">
  <div class="ranking-shell">
    <div class="section-heading"><div><h2>Top UFs</h2><p>As quinze UFs com mais iniciativas.</p></div></div>
    <div class="ranking-list">
      ${porUf.map((item) => html`<div class="ranking-item"><div class="ranking-label"><strong>${item.label}</strong><span>${formatNumber(item.value)}</span></div><div class="ranking-track"><div class="ranking-fill" style=${`width:${(item.value / porUf[0].value) * 100}%`}></div></div></div>`)}
    </div>
  </div>
  <div class="ranking-shell">
    <div class="section-heading"><div><h2>Status declarados</h2><p>Distribuição dos registros segundo o estágio informado.</p></div></div>
    <div class="ranking-list">
      ${porStatus.map((item) => html`<div class="ranking-item"><div class="ranking-label"><strong>${item.label}</strong><span>${formatNumber(item.value)}</span></div><div class="ranking-track"><div class="ranking-fill" style=${`width:${(item.value / porStatus[0].value) * 100}%`}></div></div></div>`)}
    </div>
  </div>
</div>
