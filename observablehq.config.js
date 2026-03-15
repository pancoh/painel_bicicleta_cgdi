export default {
  title: "Painel Selo Bicicleta Brasil 2025",
  root: "src",
  output: "dist",
  base: "/painel_bicicleta_cgdi/",
  theme: "air",
  sidebar: false,
  toc: false,
  pager: false,
  search: true,
  globalStylesheets: [],
  pages: [
    { name: "Brasil", path: "/" },
    { name: "Regiões", path: "/regioes" },
    { name: "Estados", path: "/estados" },
    { name: "Municípios", path: "/municipios" },
  ],
  head: `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Serif:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/theme.css">
  `,
  header: `
    <div class="site-shell">
      <div class="site-topbar">
        <div class="brand-lockup">
          <a class="brand-home" href="/" aria-label="Página inicial do Selo Bicicleta Brasil">
            <div class="brand-mark">SB</div>
            <div class="brand-text">
              <span class="brand-kicker">Ministério das Cidades</span>
              <span class="brand-title">Selo Bicicleta Brasil</span>
            </div>
          </a>
        </div>
        <nav class="site-nav" aria-label="Navegação principal">
          <a href="/">Brasil</a>
          <a href="/regioes">Regiões</a>
          <a href="/estados">Estados</a>
          <a href="/municipios">Municípios</a>
        </nav>
      </div>
    </div>
  `,
  footer: `
    <div class="site-shell footer-shell">
      <hr class="page-note-divider" style="margin-top:0">
      <div class="footer-content">
        <div class="footer-info">
          <p>Painel institucional em Observable Framework com atualização estática a partir da base Excel do projeto.</p>
          <p>Fonte: Secretaria Nacional de Mobilidade Urbana</p>
        </div>
      </div>
    </div>
  `
};
