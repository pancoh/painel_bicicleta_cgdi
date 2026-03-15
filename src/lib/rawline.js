const rawline400 = import.meta.resolve("../fonts/rawline/rawline-400.ttf");
const rawline600 = import.meta.resolve("../fonts/rawline/rawline-600.ttf");
const rawline700 = import.meta.resolve("../fonts/rawline/rawline-700.ttf");

if (!document.getElementById("rawline-font-face")) {
  const style = document.createElement("style");
  style.id = "rawline-font-face";
  style.textContent = `
    @font-face {
      font-family: "Rawline";
      src: url("${rawline400}") format("truetype");
      font-weight: 400;
      font-style: normal;
      font-display: block;
    }

    @font-face {
      font-family: "Rawline";
      src: url("${rawline600}") format("truetype");
      font-weight: 600;
      font-style: normal;
      font-display: block;
    }

    @font-face {
      font-family: "Rawline";
      src: url("${rawline700}") format("truetype");
      font-weight: 700;
      font-style: normal;
      font-display: block;
    }
  `;

  document.head.append(style);
}
