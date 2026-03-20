export default {
  title: "Painel de Iniciativas Bicicleta Brasil",
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
    <link rel="icon" href="/logos/favicon.png" type="image/png">
    <link rel="apple-touch-icon" href="/logos/favicon.png">
    <link rel="stylesheet" href="/theme.css">
  `,
  header: `
    <div class="site-shell">
      <div class="site-topbar">
        <div class="brand-lockup">
          <a class="brand-home" href="/" aria-label="Página inicial do Selo Bicicleta Brasil">
            <img class="brand-logo" src="/logos/Logo_Programa_Bicicleta Brasil.png" alt="Logo Programa Bicicleta Brasil">
            <!-- <div class="brand-text">
              <span class="brand-kicker">Ministério das Cidades</span>
              <span class="brand-title">Selo Bicicleta Brasil</span>
            </div> -->
          </a>
        </div>
      </div>
    </div>
  `,
  footer: `
    <div class="site-shell footer-shell">
      <hr class="page-note-divider" style="margin-top:0">
      <div class="footer-content">
        <div class="footer-info">
          <p>Este painel, elaborado e mantido pela Secretaria Nacional de Mobilidade Urbana, reúne as iniciativas que integram a Rede do Programa Bicicleta Brasil e receberam o Selo de reconhecimento do Programa. As informações apresentadas são de inteira responsabilidade dos autores das iniciativas. A base consolidada das iniciativas está disponível para consulta e download <a href="/municipios">aqui</a>.</p>

        </div>
        <img class="footer-logo" src="/logos/logo_mcid.png" alt="Logo do Ministério das Cidades">
      </div>
    </div>
  `
};
