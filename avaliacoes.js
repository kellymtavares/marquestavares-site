/* Avaliações do Google na página inicial.
   Cole abaixo o link do App da Web do Apps Script de avaliações (veja COMO-LIGAR-AS-AVALIACOES.md). */
(function () {
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbyuGHlkEhWQNceOnFdYMdzUjgEElYprYoTFsyikuq_Kw7Bq2FCivx4N6zSkeo9tNGAm/exec";
  const area = document.getElementById("avaliacoes-lista");
  const resumo = document.getElementById("avaliacoes-resumo");
  if (!area || ENDPOINT.startsWith("COLE")) return;

  const estrelas = n => {
    const s = document.createElement("span");
    s.className = "estrelas";
    s.setAttribute("aria-label", `${n} de 5 estrelas`);
    s.textContent = "★★★★★".slice(0, Math.round(n)) + "☆☆☆☆☆".slice(0, 5 - Math.round(n));
    return s;
  };

  fetch(ENDPOINT)
    .then(r => r.json())
    .then(d => {
      if (d.erro || !d.avaliacoes || !d.avaliacoes.length) return;

      if (d.nota) {
        resumo.innerHTML = "";
        const nota = document.createElement("strong");
        nota.textContent = d.nota.toFixed(1).replace(".", ",");
        const info = document.createElement("span");
        info.textContent = `${d.total} avaliações no Google`;
        resumo.append(nota, estrelas(d.nota), info);
        resumo.hidden = false;
      }

      d.avaliacoes
        .filter(a => a.texto)
        .forEach(a => {
          const li = document.createElement("li");
          const topo = document.createElement("div");
          topo.className = "autor";
          const ini = document.createElement("span");
          ini.className = "inicial";
          ini.textContent = a.nome.trim().charAt(0).toUpperCase();
          if (a.foto) {
            const img = document.createElement("img");
            img.src = a.foto; img.alt = ""; img.width = 40; img.height = 40; img.loading = "lazy";
            img.referrerPolicy = "no-referrer";
            img.onerror = () => img.replaceWith(ini);
            topo.append(img);
          } else topo.append(ini);
          const quem = document.createElement("div");
          const nome = document.createElement("strong");
          nome.textContent = a.nome;
          const quando = document.createElement("small");
          quando.textContent = a.quando;
          quem.append(nome, quando);
          topo.append(quem);

          const texto = document.createElement("p");
          texto.textContent = a.texto;

          const fonte = document.createElement("a");
          fonte.href = a.link || d.link;
          fonte.target = "_blank"; fonte.rel = "noopener";
          fonte.className = "fonte";
          fonte.textContent = "Publicada no Google";

          li.append(topo, estrelas(a.estrelas), texto, fonte);
          area.append(li);
        });
      area.hidden = !area.children.length;
      if (area.scrollWidth > area.clientWidth + 4) {
        const nav = document.createElement("div");
        nav.className = "avaliacoes-setas";
        [["←", -1, "Avaliações anteriores"], ["→", 1, "Próximas avaliações"]].forEach(([t, dir, rot]) => {
          const b = document.createElement("button");
          b.type = "button"; b.textContent = t; b.setAttribute("aria-label", rot);
          b.addEventListener("click", () => area.scrollBy({ left: dir * area.clientWidth * 0.9, behavior: "smooth" }));
          nav.append(b);
        });
        area.after(nav);
      }
    })
    .catch(() => {});
})();
