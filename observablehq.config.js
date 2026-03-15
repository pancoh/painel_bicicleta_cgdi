export default {
  title: "Painel Selo Bicicleta Brasil 2025",
  root: "src",
  output: "dist",
  theme: "air",
  sidebar: false,
  toc: false,
  pager: false,
  search: true,
  globalStylesheets: ["./theme.css"],
  pages: [
    { name: "Brasil", path: "/" }
  ],
  head: `
    <style>
      @font-face { font-family: "Rawline"; src: url("./fonts/rawline/rawline-400.ttf") format("truetype"); font-weight: 400; font-style: normal; font-display: block; }
      @font-face { font-family: "Rawline"; src: url("./fonts/rawline/rawline-600.ttf") format("truetype"); font-weight: 600; font-style: normal; font-display: block; }
      @font-face { font-family: "Rawline"; src: url("./fonts/rawline/rawline-700.ttf") format("truetype"); font-weight: 700; font-style: normal; font-display: block; }
    </style>
    <link rel="preload" href="./fonts/rawline/rawline-400.ttf" as="font" type="font/ttf" crossorigin>
    <link rel="preload" href="./fonts/rawline/rawline-600.ttf" as="font" type="font/ttf" crossorigin>
    <link rel="preload" href="./fonts/rawline/rawline-700.ttf" as="font" type="font/ttf" crossorigin>
  `,
  header: `
    <div class="site-shell">
      <div class="site-topbar">
        <a class="brand-home" href="/" aria-label="Página inicial do painel">
          <div class="brand-mark">SB</div>
          <div class="brand-text">
            <span class="brand-kicker">MINISTÉRIO DAS CIDADES</span>
            <span class="brand-title">Selo Bicicleta Brasil</span>
          </div>
        </a>
      </div>
    </div>
  `,
  footer: `
    <div class="site-shell footer-shell">
      <hr class="page-note-divider">
      <p>Painel institucional em Observable Framework com atualização estática a partir da base Excel do projeto.</p>
      <p>Fonte: base "BASE_SELO_SITE.xlsx". Elaboração: CGDI.</p>
    </div>
  `
};
