---
title: Regiões
---

```js
import {html} from "npm:htl";
import {countBy} from "./lib/dashboard.js";
import {formatNumber} from "./lib/formatters.js";

const iniciativas = await FileAttachment("./data/processed/iniciativas.json").json();
const porRegiao = countBy(iniciativas, "regiao");
const porCategoria = countBy(iniciativas, "categoria");
```

<div class="hero-shell">
  <h1 class="hero-title" style="font-size:2.3rem">Recorte regional</h1>
  <p class="hero-subtitle">Panorama consolidado por região para apoiar leitura institucional e priorização de ações.</p>
</div>

<div class="content-grid">
  <div class="ranking-shell">
    <div class="section-heading"><div><h2>Ranking por região</h2><p>Total de iniciativas por macrorregião.</p></div></div>
    <div class="ranking-list">
      ${porRegiao.map((item) => html`<div class="ranking-item"><div class="ranking-label"><strong>${item.label}</strong><span>${formatNumber(item.value)} iniciativas</span></div><div class="ranking-track"><div class="ranking-fill" style=${`width:${(item.value / porRegiao[0].value) * 100}%`}></div></div></div>`)}
    </div>
  </div>
  <div class="ranking-shell">
    <div class="section-heading"><div><h2>Categorias mais frequentes</h2><p>Leitura agregada nacional da base.</p></div></div>
    <div class="ranking-list">
      ${porCategoria.slice(0, 6).map((item) => html`<div class="ranking-item"><div class="ranking-label"><strong>${item.label}</strong><span>${formatNumber(item.value)}</span></div><div class="ranking-track"><div class="ranking-fill" style=${`width:${(item.value / porCategoria[0].value) * 100}%`}></div></div></div>`)}
    </div>
  </div>
</div>
