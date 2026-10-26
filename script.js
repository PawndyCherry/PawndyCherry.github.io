// NACA 0020 drawn from the 4-digit thickness equation, with a chord dimension line.
(function drawAirfoil() {
  const svg = document.getElementById("airfoil");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const c = 400, x0 = 60, y0 = 120, t = 0.20;

  const yt = (x) =>
    5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4);

  // cosine spacing for a smooth leading edge
  const pts = [];
  const n = 120;
  for (let i = 0; i <= n; i++) {
    const x = (1 - Math.cos((Math.PI * i) / n)) / 2;
    pts.push([x, yt(x)]);
  }
  const upper = pts.map(([x, y]) => [x0 + x * c, y0 - y * c]);
  const lower = pts.slice().reverse().map(([x, y]) => [x0 + x * c, y0 + y * c]);
  const d = "M" + lower.concat(upper).map((p) => p[0].toFixed(2) + "," + p[1].toFixed(2)).join(" L") + " Z";

  const el = (tag, attrs, parent = svg) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  };

  // freestream lines
  const flow = el("g", { class: "fade" });
  [-62, -38, 38, 62].forEach((dy) => {
    el("path", {
      class: "flow",
      d: `M10,${y0 + dy} C${x0 + 80},${y0 + dy * 0.9} ${x0 + 260},${y0 + dy * 0.75} 510,${y0 + dy * 0.82}`,
    }, flow);
  });

  el("line", { class: "chord fade", x1: x0 - 20, y1: y0, x2: x0 + c + 20, y2: y0 });

  const profile = el("path", { class: "profile", d });
  const len = profile.getTotalLength ? profile.getTotalLength() : 1000;
  profile.style.setProperty("--len", len);

  // chord dimension
  const g = el("g", { class: "fade" });
  const yd = y0 + 0.1 * c + 34;
  el("line", { class: "ext", x1: x0, y1: y0 + 6, x2: x0, y2: yd + 6 }, g);
  el("line", { class: "ext", x1: x0 + c, y1: y0 + 4, x2: x0 + c, y2: yd + 6 }, g);
  el("path", { class: "dim", d: `M${x0},${yd} L${x0 + c},${yd}` }, g);
  el("path", { class: "dim", d: `M${x0 + 8},${yd - 3} L${x0},${yd} L${x0 + 8},${yd + 3}` }, g);
  el("path", { class: "dim", d: `M${x0 + c - 8},${yd - 3} L${x0 + c},${yd} L${x0 + c - 8},${yd + 3}` }, g);
  const label = el("text", { x: x0 + c / 2, y: yd + 16, "text-anchor": "middle" }, g);
  label.textContent = "c = 1.000";

  // thickness dimension at max thickness (x = 0.3c)
  const xt = x0 + 0.3 * c;
  const h = yt(0.3) * c;
  el("path", { class: "dim", d: `M${xt},${y0 - h} L${xt},${y0 + h}` }, g);
  const tl = el("text", { x: xt + 8, y: y0 - h - 8 }, g);
  tl.textContent = "t/c = 0.20";

  const al = el("text", { x: 14, y: y0 - 72 }, g);
  al.textContent = "V∞ →";
})();

// Reveal sections on scroll
(function reveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((i) => i.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((i) => io.observe(i));
})();

// Highlight the current section in the nav
(function activeNav() {
  const links = [...document.querySelectorAll(".nav a")];
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((a) => a.classList.remove("active"));
        const a = map.get(e.target.id);
        if (a) a.classList.add("active");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  map.forEach((_, id) => {
    const s = document.getElementById(id);
    if (s) io.observe(s);
  });
})();
