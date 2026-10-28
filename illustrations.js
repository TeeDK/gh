/* FoodFlow – tranh minh hoạ vẽ bằng SVG cho từng món.
   Mỗi món có một hình riêng, khớp đúng với tên món, không phụ thuộc Internet.
   Dùng: window.dishArt(id) -> data URI để gán vào <img src>. */
(function () {
  "use strict";

  // ---------- tiện ích vẽ ----------
  const rng = (seed) => { let a = seed * 9301 + 49297; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const C = (x, y, r, f, o = "") => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${o}/>`;
  const E = (x, y, rx, ry, f, rot = 0, o = "") => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" transform="rotate(${rot} ${x} ${y})" ${o}/>`;
  const R = (x, y, w, h, rx, f, rot = 0, o = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" transform="rotate(${rot} ${x + w / 2} ${y + h / 2})" ${o}/>`;
  const P = (d, f, o = "") => `<path d="${d}" fill="${f}" ${o}/>`;
  const L = (d, s, w, o = "") => `<path d="${d}" fill="none" stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${o}/>`;

  const leaf = (x, y, rot = 0, c = "#4c9a45", s = 1) => E(x, y, 11 * s, 5 * s, c, rot) + L(`M${x - 9 * s} ${y} L${x + 9 * s} ${y}`, "#ffffff55", 1, `transform="rotate(${rot} ${x} ${y})"`);
  const lemon = (x, y, r = 16) => C(x, y, r, "#f6d442") + C(x, y, r - 3, "#fff3a8") + [0, 60, 120].map(a => L(`M${x - r + 4} ${y} L${x + r - 4} ${y}`, "#f2c230", 1.6, `transform="rotate(${a} ${x} ${y})"`)).join("");
  const tomato = (x, y, r = 14) => C(x, y, r, "#e5392f") + C(x, y, r - 4, "#f4695a") + C(x - 3, y - 2, 1.6, "#ffd9a0") + C(x + 3, y + 3, 1.6, "#ffd9a0") + C(x + 4, y - 4, 1.6, "#ffd9a0");
  const cucumber = (x, y, r = 12) => C(x, y, r, "#3f8f3a") + C(x, y, r - 2.5, "#bfe39a") + C(x, y, r - 6, "#e4f4c8");
  const eggHalf = (x, y, rot = 0) => E(x, y, 17, 12, "#fffdf6", rot, 'stroke="#eee6cf" stroke-width="1"') + C(x, y, 7, "#ffb81f") + C(x - 2, y - 2, 2, "#ffe08a");
  const shrimp = (x, y, rot = 0, c = "#f08a5d") => `<g transform="rotate(${rot} ${x} ${y})">` + P(`M${x - 18} ${y + 4} C${x - 18} ${y - 14} ${x + 14} ${y - 16} ${x + 18} ${y + 2} C${x + 10} ${y - 2} ${x} ${y - 2} ${x - 8} ${y + 8} Z`, c) + L(`M${x - 10} ${y - 6} L${x - 8} ${y + 6}`, "#d9663a", 1.5) + L(`M${x} ${y - 9} L${x + 1} ${y + 1}`, "#d9663a", 1.5) + P(`M${x - 18} ${y + 4} L${x - 26} ${y - 2} L${x - 24} ${y + 10} Z`, "#f6a37a") + `</g>`;
  const chop = (x1, y1, x2, y2) => L(`M${x1} ${y1} L${x2} ${y2}`, "#b9794a", 4) + L(`M${x1 + 10} ${y1 + 12} L${x2 + 10} ${y2 + 12}`, "#a86c40", 4);
  const sesame = (rnd, cx, cy, r, n, col = "#fff6dc") => Array.from({ length: n }, () => { const a = rnd() * 6.28, d = Math.sqrt(rnd()) * r; return E(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2.2, 1.3, col, rnd() * 180); }).join("");
  const grains = (rnd, cx, cy, rx, ry, n, col = "#fff") => Array.from({ length: n }, () => { const a = rnd() * 6.28, d = Math.sqrt(rnd()); return E(cx + Math.cos(a) * d * rx, cy + Math.sin(a) * d * ry, 3.2, 1.4, col, rnd() * 180); }).join("");
  const dots = (rnd, cx, cy, r, n, cols, rr = [2.5, 4.5]) => Array.from({ length: n }, () => { const a = rnd() * 6.28, d = Math.sqrt(rnd()) * r; return C(cx + Math.cos(a) * d, cy + Math.sin(a) * d, rr[0] + rnd() * (rr[1] - rr[0]), cols[Math.floor(rnd() * cols.length)]); }).join("");

  const plate = (r = 112, fill = "#fff", cx = 200, cy = 150) =>
    E(cx + 4, cy + 10, r, r - 4, "#00000022") + C(cx, cy, r, fill) + C(cx, cy, r - 8, "none", 'stroke="#00000012" stroke-width="2"') + C(cx, cy, r - 22, "#00000007");
  const bowl = (r = 112, rim = "#fff", inner = "#f3ead8", cx = 200, cy = 150) =>
    E(cx + 4, cy + 10, r, r - 4, "#00000024") + C(cx, cy, r, rim) + C(cx, cy, r - 6, "#00000010") + C(cx, cy, r - 12, inner);
  const mound = (rnd, x, y, rx, ry, col = "#fffdf5") => E(x, y, rx, ry, col, 0, 'stroke="#e9e2cc" stroke-width="1.5"') + grains(rnd, x, y, rx - 6, ry - 4, 34, "#e8e1c9");
  const clipCircle = (cx, cy, r) => `<clipPath id="k"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>`;
  const strands = (rnd, cx, cy, r, n, col, w = 5, o = 0.95) => {
    let s = `<g clip-path="url(#k)" opacity="${o}">`;
    for (let i = 0; i < n; i++) {
      const y = cy - r + (i / n) * 2 * r + rnd() * 6, a = 8 + rnd() * 12, ph = rnd() * 20;
      s += L(`M${cx - r} ${y} q${r / 4} ${-a} ${r / 2} ${ph / 3} t${r / 2} 0 t${r / 2} ${-ph / 3} t${r / 2} 0`, col, w);
    }
    return s + `</g>`;
  };
  const beefSlice = (x, y, rot = 0, c = "#c8484b", i = "#e9868a") => E(x, y, 20, 10, c, rot, 'stroke="#a8353a" stroke-width="1"') + E(x, y, 11, 4.5, i, rot);
  const porkChop = (x, y, rot = 0) => `<g transform="rotate(${rot} ${x} ${y})">` + P(`M${x - 46} ${y} C${x - 46} ${y - 24} ${x + 30} ${y - 26} ${x + 46} ${y - 6} C${x + 52} ${y + 14} ${x + 14} ${y + 26} ${x - 22} ${y + 22} C${x - 40} ${y + 20} ${x - 46} ${y + 12} ${x - 46} ${y} Z`, "#a8551f", 'stroke="#7c3a12" stroke-width="2"') + [-26, -10, 8, 26].map(g => L(`M${x + g} ${y - 18} L${x + g + 10} ${y + 16}`, "#5e2a0c", 3, 'opacity=".55"')).join("") + E(x - 8, y - 8, 22, 5, "#d68a4b", -8, 'opacity=".55"') + E(x + 34, y - 2, 8, 6, "#f3e3c4") + `</g>`;
  const friedChicken = (x, y, rot = 0, s = 1) => `<g transform="rotate(${rot} ${x} ${y}) scale(${s})" style="transform-origin:${x}px ${y}px">` + P(`M${x - 40} ${y + 6} C${x - 44} ${y - 26} ${x + 8} ${y - 38} ${x + 28} ${y - 14} C${x + 44} ${y + 6} ${x + 22} ${y + 30} ${x - 6} ${y + 28} C${x - 28} ${y + 28} ${x - 38} ${y + 20} ${x - 40} ${y + 6} Z`, "#d9902f", 'stroke="#a8631a" stroke-width="2"') + dots(rng(7 + Math.round(x)), x - 4, y - 2, 28, 22, ["#f0b95a", "#b9701f", "#e8a845"], [1.6, 3.4]) + L(`M${x + 28} ${y - 14} L${x + 52} ${y - 28}`, "#f3e3c4", 7) + C(x + 54, y - 30, 6, "#f3e3c4") + C(x + 60, y - 26, 5, "#f3e3c4") + `</g>`;
  const glossyDots = (rnd, cx, cy, r, n) => dots(rnd, cx, cy, r, n, ["#ffffff55"], [1, 2.5]);

  // ---------- đồ uống: ly nhìn ngang ----------
  const glass = (liquid, opt = {}) => {
    const { top = "#fff8", layers = null, ice = true, straw = "#ef5b5b", rnd = rng(3), extra = "", extraBack = "", wide = false } = opt;
    const x1 = 142, x2 = 258, y1 = 70, y2 = 252, bx1 = 156, bx2 = 244;
    const body = `M${x1} ${y1} L${x2} ${y1} L${bx2} ${y2} Q${bx2 - 2} ${y2 + 10} ${bx2 - 14} ${y2 + 10} L${bx1 + 14} ${y2 + 10} Q${bx1 + 2} ${y2 + 10} ${bx1} ${y2} Z`;
    const liq = `M${x1 + 4} ${y1 + 20} L${x2 - 4} ${y1 + 20} L${bx2 - 3} ${y2 - 2} Q${bx2 - 5} ${y2 + 6} ${bx2 - 15} ${y2 + 6} L${bx1 + 15} ${y2 + 6} Q${bx1 + 5} ${y2 + 6} ${bx1 + 3} ${y2 - 2} Z`;
    let s = E(200, 266, 70, 9, "#00000022");
    s += `<clipPath id="k"><path d="${liq}"/></clipPath>`;
    s += extraBack;
    s += `<path d="${body}" fill="#ffffffa8" stroke="#ffffffee" stroke-width="3"/>`;
    s += `<g clip-path="url(#k)">` + (layers ? layers : R(130, 80, 150, 200, 0, liquid)) + `</g>`;
    if (ice) s += [[172, 100, 18, -12], [210, 112, 20, 14], [188, 150, 19, 8], [224, 168, 18, -10], [176, 200, 20, 16]].map(([x, y, w, r]) => R(x - w / 2, y - w / 2, w, w, 4, "#ffffff77", r, 'stroke="#ffffffcc" stroke-width="1.5"')).join("");
    s += extra;
    s += P(`M${x1 + 10} ${y1 + 8} L${x1 + 18} ${y1 + 8} L${bx1 + 14} ${y2 - 6} L${bx1 + 8} ${y2 - 6} Z`, "#ffffff77");
    s += E(200, y1 + 20, (x2 - x1) / 2 - 4, 5, "#ffffff66");
    s += `<path d="${body}" fill="none" stroke="#c9d6dc" stroke-width="2.5"/>`;
    return s;
  };
  const straw = (c = "#ef5b5b", x = 214, w = 7) => L(`M${x} 252 L${x + 34} 36`, c, w) + L(`M${x} 252 L${x + 34} 36`, "#ffffff55", 2);
  const bubbles = (rnd, n, y0 = 90, y1 = 240) => Array.from({ length: n }, () => C(160 + rnd() * 80, y0 + rnd() * (y1 - y0), 1.5 + rnd() * 3, "none", 'stroke="#ffffffcc" stroke-width="1.4"')).join("");
  const wrap = (inner, bg1, bg2) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/>${inner}</svg>`;

  // ---------- từng món ----------
  const dishes = {
    // 1 Cơm gà nướng mật ong
    1(r) { return [plate(), mound(r, 150, 160, 52, 44), porkChop(238, 130, -15).replace(/#a8551f/, "#c47a22").replace(/#7c3a12/, "#8a5410"), porkChop(246, 190, 8).replace(/#a8551f/, "#c47a22").replace(/#7c3a12/, "#8a5410"), cucumber(130, 100), cucumber(152, 92), tomato(112, 128), leaf(168, 104, 30)].join(""); },
    // 2 Cơm chay thanh đạm
    2(r) { return [plate(), mound(r, 148, 160, 50, 42), [0, 1, 2, 3].map(i => R(212 + (i % 2) * 28, 98 + Math.floor(i / 2) * 28, 24, 24, 4, "#f4e3b2", i * 7, 'stroke="#d8c184" stroke-width="1.5"')).join(""), [0, 1, 2].map(i => C(236 + i * 14, 186 + (i % 2) * 6, 13, "#2f8d3a") + C(232 + i * 14, 178 + (i % 2) * 6, 7, "#46a84e")).join(""), [0, 1, 2, 3].map(i => C(122 + i * 15, 106 - i * 2, 9, "#f08a2b") + C(122 + i * 15, 106 - i * 2, 3, "#f7b36a")).join(""), sesame(r, 148, 150, 38, 26)].join(""); },
    // 3 Pizza rau củ phô mai
    3(r) { let s = E(204, 160, 118, 112, "#00000022") + C(200, 150, 112, "#d9a35a") + C(200, 150, 100, "#f3c43f") + C(200, 150, 92, "#f8d65c");
      s += dots(r, 200, 150, 84, 26, ["#fbe58a", "#f2bf31"], [4, 9]);
      [[170, 112], [230, 118], [160, 175], [222, 190], [200, 150]].forEach(([x, y]) => { s += C(x, y, 15, "none", 'stroke="#2e9a3d" stroke-width="5"'); });
      [[196, 100], [150, 145], [248, 152], [190, 205]].forEach(([x, y]) => { s += E(x, y, 14, 11, "#e9d6b6") + R(x - 4, y, 8, 14, 3, "#e9d6b6"); });
      [[132, 118], [262, 120], [236, 214], [150, 200]].forEach(([x, y]) => { s += tomato(x, y, 11); });
      [[210, 130], [176, 150], [244, 180], [170, 90], [140, 165]].forEach(([x, y]) => { s += C(x, y, 5, "#2b2b2b") + C(x, y, 2, "#f8d65c"); });
      [-90, -30, 30, 90, 150, 210].forEach(a => { s += L("M200 150 L312 150", "#c58d3e", 2, `transform="rotate(${a} 200 150)" opacity=".7"`); });
      return s + leaf(200, 150, 0, "#3d9a3d", 1.2); },
    // 4 Bún bò Huế đặc biệt
    4(r) { return [bowl(112, "#f7f1e8", "#c9391c"), clipCircle(200, 150, 100), strands(r, 200, 150, 100, 7, "#f6e6c2", 8), E(200, 150, 100, 100, "#d24a1c", 0, 'opacity=".25"'), beefSlice(150, 118, -20, "#a8473d", "#d27a6e"), beefSlice(240, 112, 25, "#a8473d", "#d27a6e"), C(176, 190, 17, "#f2e6cf", 'stroke="#d9c9a4" stroke-width="2"'), C(222, 196, 16, "#f2e6cf", 'stroke="#d9c9a4" stroke-width="2"'), L("M168 190 L184 190", "#d9c9a4", 2), eggHalf(200, 150, 20), leaf(130, 160, -20), leaf(268, 154, 30), leaf(190, 100, 80), lemon(262, 210, 14), dots(r, 200, 150, 90, 24, ["#e8431a", "#8a1f0f"], [1.4, 2.6]), E(250, 90, 7, 7, "#c9d93a")].join(""); },
    // 5 Salad xanh sốt mè
    5(r) { let s = bowl(112, "#f7f3ea", "#e5efd0");
      for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28 + r(); s += E(200 + Math.cos(a) * 52, 150 + Math.sin(a) * 52, 28, 16, i % 2 ? "#5aa540" : "#7cc04e", a * 57); }
      for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; s += E(200 + Math.cos(a) * 28, 150 + Math.sin(a) * 28, 20, 12, "#90d05c", a * 57 + 40); }
      s += cucumber(150, 118) + cucumber(170, 100) + cucumber(252, 190) + tomato(240, 112, 13) + tomato(158, 196, 13) + tomato(206, 138, 12);
      s += [0, 1, 2].map(i => R(232 + i * 8, 150 + i * 4, 6, 40, 3, "#f08a2b", 20 + i * 15)).join("");
      s += L("M168 150 Q200 130 232 160", "#e9c88d", 7, 'opacity=".85"') + sesame(r, 200, 150, 70, 60);
      return s; },
    // 6 Mì Ý sốt cà chua
    6(r) { let s = plate(), p = "";
      for (let i = 0; i < 16; i++) { const a = r() * 6.28, d = r() * 52; p += L(`M${200 + Math.cos(a) * d - 30} ${150 + Math.sin(a) * d} q30 ${-18 + r() * 36} 60 ${r() * 10 - 5}`, "#f1d27c", 5); }
      s += E(200, 150, 68, 58, "#f1d27c") + p + E(200, 142, 52, 36, "#d8392a") + dots(r, 200, 142, 42, 22, ["#e8553f", "#b3271c"], [3, 6]);
      s += tomato(150, 106, 12) + tomato(252, 196, 12) + tomato(260, 112, 11) + leaf(196, 128, -30, "#2f8d3a", 1.5) + leaf(214, 140, 40, "#3d9d46", 1.5) + leaf(180, 150, 70, "#2f8d3a", 1.3);
      s += sesame(r, 200, 142, 36, 14, "#f6efd2");
      return s; },
    // 7 Đậu hũ sốt nấm
    7(r) { let s = plate(); s += E(200, 152, 84, 70, "#8a4a22") + E(200, 150, 78, 64, "#a45d2d");
      [[158, 122], [206, 112], [246, 146], [186, 160]].forEach(([x, y], i) => { s += R(x - 18, y - 16, 36, 32, 5, "#fbf0cc", i * 9 - 10, 'stroke="#e1cc92" stroke-width="2"') + R(x - 14, y - 14, 20, 8, 3, "#ffffff90", i * 9 - 10); });
      [[222, 190], [166, 190], [140, 150], [246, 108]].forEach(([x, y]) => { s += E(x, y, 17, 12, "#d7b48c", 0, 'stroke="#a98055" stroke-width="2"') + R(x - 5, y + 4, 10, 15, 4, "#e9d3b2"); });
      s += dots(r, 200, 150, 60, 20, ["#2f8d3a", "#5cb54a"], [2, 3.4]);
      return s; },
    // 8 Cơm tấm sườn nướng
    8(r) { return [plate(), mound(r, 140, 168, 54, 40, "#fffaf0"), porkChop(232, 124, -8), cucumber(120, 108), cucumber(144, 98), cucumber(168, 108), tomato(110, 130, 12), L("M100 200 q18 -8 36 0", "#f08a2b", 5), L("M104 214 q16 -6 32 0", "#f6a24d", 4), C(262, 206, 20, "#fff8e6", 'stroke="#e5d7b0" stroke-width="2"') + C(262, 206, 8, "#ffb81f"), E(206, 202, 24, 14, "#e8c36c", 0, 'stroke="#c99a3d" stroke-width="2"'), leaf(208, 76, 20)].join(""); },
    // 9 Gỏi cuốn rau củ
    9(r) { let s = plate();
      [[170, 112, -8], [176, 156, 4], [170, 200, 12]].forEach(([x, y, rot]) => {
        s += `<g transform="rotate(${rot} ${x} ${y})">` + R(x - 70, y - 18, 140, 36, 18, "#f6f3e4", 0, 'stroke="#dcd6bd" stroke-width="2"') + R(x - 62, y - 12, 124, 24, 12, "#e9f2d6", 0, 'opacity=".7"') + C(x - 40, y, 8, "#f08a2b", 'opacity=".85"') + C(x - 12, y - 3, 8, "#4c9a45", 'opacity=".85"') + C(x + 14, y + 3, 8, "#e86a7a", 'opacity=".75"') + C(x + 40, y - 2, 8, "#9bd05a", 'opacity=".85"') + L(`M${x - 60} ${y - 6} L${x + 60} ${y + 6}`, "#bfe39a", 3, 'opacity=".8"') + `</g>`;
      });
      s += C(290, 150, 34, "#fff", 'stroke="#d9d3bd" stroke-width="3"') + C(290, 150, 26, "#a45a22") + dots(r, 290, 150, 20, 14, ["#d9a05b", "#f3d3a0"], [1.5, 2.6]) + leaf(268, 188, 40) + leaf(306, 112, -30);
      return s; },
    // 10 Trà đào cam sả
    10(r) { return glass("#f4a43c", { layers: R(130, 80, 150, 200, 0, "#f6a63b") + R(130, 80, 150, 70, 0, "#fbc468", 0, 'opacity=".7"'), extra: [[184, 130, 0], [220, 180, 40], [180, 205, 80]].map(([x, y, a]) => P(`M${x - 18} ${y} A18 18 0 0 1 ${x + 18} ${y} Z`, "#ffc6a0", `transform="rotate(${a} ${x} ${y})" stroke="#f08a5d" stroke-width="2"`)).join("") + L("M232 245 L262 80", "#b7c968", 6) + L("M226 245 L246 90", "#cdd98a", 5) + straw("#fbbf24", 210) + bubbles(r, 7), extraBack: "" }) + E(258, 78, 20, 11, "#f2a24b", 25) + leaf(150, 76, -30, "#58a845", 1.2); },
    // 11 Bánh mì nấm nướng
    11(r) { let s = E(204, 165, 125, 95, "#00000020") + R(70, 70, 260, 170, 24, "#f0ddbd", 0, 'stroke="#d8c39c" stroke-width="2"');
      const sand = (x, y, rot) => `<g transform="rotate(${rot} ${x} ${y})">` + P(`M${x - 74} ${y + 46} L${x + 74} ${y + 46} L${x} ${y - 52} Z`, "#e4ab55", 'stroke="#a8691f" stroke-width="2.5"') + P(`M${x - 62} ${y + 38} L${x + 62} ${y + 38} L${x} ${y - 38} Z`, "#f0c071") + [-28, -8, 12, 32].map(g => L(`M${x + g - 10} ${y + 34} L${x + g + 4} ${y + 44}`, "#8a5518", 4, 'opacity=".5"')).join("") + `</g>`;
      s += sand(160, 132, -10);
      s += P("M230 218 L330 218 L280 98 Z", "#e4ab55", 'stroke="#a8691f" stroke-width="2.5"');
      s += P("M224 196 L336 196 L330 214 L230 214 Z", "#7fbf4a") + P("M230 214 L330 214 L322 228 L238 228 Z", "#6b3f22");
      [[256, 206], [284, 206], [310, 206]].forEach(([x, y]) => { s += E(x, y, 11, 6, "#c9a27a", 0, 'stroke="#8a6644" stroke-width="1.5"'); });
      s += P("M236 188 L324 188 L280 112 Z", "#f4cd86") + [-18, 0, 18].map(g => L(`M${280 + g} 190 L${280 + g / 2} 130`, "#a8691f", 3, 'opacity=".45"')).join("");
      s += leaf(140, 190, 20, "#58a845", 1.4) + tomato(100, 200, 12);
      return s; },
    // 12 Khoai tây chiên giòn
    12(r) { let s = E(204, 262, 90, 12, "#00000022");
      for (let i = 0; i < 22; i++) { const x = 140 + r() * 120, y = 70 + r() * 70, rot = -20 + r() * 40; s += R(x, y, 14, 90 + r() * 30, 3, i % 3 ? "#f6c846" : "#f0b52e", rot, 'stroke="#d99a1a" stroke-width="1.2"'); }
      s += P("M126 138 L274 138 L256 258 Q254 266 244 266 L156 266 Q146 266 144 258 Z", "#e4382f") + P("M126 138 L274 138 L270 160 L130 160 Z", "#ffffff33") + R(168, 184, 64, 40, 8, "#fff", 0, "opacity=\".95\"") + L("M182 204 q18 -14 36 0", "#e4382f", 5);
      s += C(318, 236, 24, "#fff", 'stroke="#ddd" stroke-width="2"') + C(318, 236, 18, "#c21f1f") + C(312, 230, 5, "#ffffff55");
      return s; },
    // 13 Cơm gà xối mỡ
    13(r) { return [plate(), mound(r, 138, 170, 50, 40), friedChicken(236, 120, -10, 1.15), friedChicken(248, 196, 12, 1), cucumber(110, 110), cucumber(134, 100), cucumber(158, 110), tomato(114, 138, 12), C(190, 218, 16, "#c21f1f") , leaf(188, 214, 30, "#3d9d46")].join(""); },
    // 14 Cơm chiên Dương Châu
    14(r) { let s = plate(); s += E(200, 152, 86, 70, "#f1cf6c") + dots(r, 200, 152, 78, 60, ["#f8dc86", "#e8bd4c", "#fff2b8"], [3, 6]);
      s += dots(r, 200, 152, 70, 14, ["#4c9a45"], [3, 4]) + dots(r, 200, 152, 70, 12, ["#f08a2b"], [3, 5]) + dots(r, 200, 152, 70, 10, ["#fff7d6"], [3, 6]);
      s += [[156, 130, 0], [236, 138, 90], [200, 192, 190], [226, 100, 40]].map(([x, y, a]) => shrimp(x, y, a)).join("");
      s += [[176, 168], [214, 166], [188, 110], [246, 176]].map(([x, y]) => C(x, y, 11, "#b8402e", 'stroke="#8a2a1c" stroke-width="2"') + C(x, y, 4, "#d8715a")).join("");
      s += leaf(262, 120, 30, "#3d9d46") + leaf(140, 180, -40, "#3d9d46");
      return s; },
    // 15 Cơm sườn bì chả
    15(r) { return [plate(), mound(r, 128, 170, 46, 36, "#fffaf0"), porkChop(228, 112, -6), R(176, 168, 70, 44, 8, "#d8a54c", -4, 'stroke="#9d6f1f" stroke-width="2"'), R(182, 174, 58, 16, 6, "#f7d97b", -4), dots(r, 211, 190, 26, 10, ["#8a4a1a"], [1.5, 2.5]), Array.from({ length: 14 }, (_, i) => L(`M${96 + i * 4} ${120 - (i % 3) * 3} L${100 + i * 4} ${150 - (i % 2) * 6}`, "#e8cf9c", 3)).join(""), cucumber(270, 190), cucumber(290, 168), L("M240 226 q20 -8 40 0", "#f08a2b", 5), tomato(292, 138, 11), leaf(120, 100, -20)].join(""); },
    // 16 Cơm bò lúc lắc
    16(r) { let s = plate(); s += mound(r, 140, 168, 48, 38);
      [[236, 124, 8], [258, 154, -10], [226, 168, 20], [250, 196, 0], [212, 138, 40], [200, 190, -20]].forEach(([x, y, a]) => { s += R(x - 15, y - 15, 30, 30, 6, "#6b2f1a", a, 'stroke="#4a1f10" stroke-width="2"') + R(x - 11, y - 11, 14, 8, 3, "#9b5238", a, 'opacity=".7"'); });
      [[210, 110], [270, 132], [232, 214]].forEach(([x, y]) => { s += R(x - 14, y - 10, 28, 20, 4, "#e8402f", 30) + R(x - 10, y - 6, 20, 8, 3, "#f8806a", 30, 'opacity=".6"'); });
      [[262, 108], [196, 214], [282, 178]].forEach(([x, y]) => { s += C(x, y, 11, "none", 'stroke="#f3e6d0" stroke-width="5"'); });
      s += leaf(110, 110, 20, "#58a845", 1.5) + leaf(130, 100, -30, "#6ab850", 1.5) + tomato(112, 130, 12) + cucumber(100, 100, 0.1);
      return s; },
    // 17 Cơm cá kho tộ
    17(r) { let s = E(204, 164, 120, 104, "#00000028") + C(190, 150, 94, "#3b2418") + C(190, 150, 84, "#6b3a1d") + C(190, 150, 74, "#4a2512");
      [[160, 128, -20], [214, 140, 18], [182, 176, -4]].forEach(([x, y, a]) => { s += `<g transform="rotate(${a} ${x} ${y})">` + P(`M${x - 34} ${y} C${x - 22} ${y - 20} ${x + 18} ${y - 20} ${x + 30} ${y} C${x + 18} ${y + 18} ${x - 22} ${y + 18} ${x - 34} ${y} Z`, "#8a5226", 'stroke="#c58a4a" stroke-width="2"') + P(`M${x + 28} ${y} L${x + 46} ${y - 12} L${x + 46} ${y + 12} Z`, "#7a461f") + C(x - 22, y - 2, 3.5, "#1d0f08") + L(`M${x - 10} ${y - 10} Q${x + 6} ${y} ${x - 10} ${y + 10}`, "#c58a4a", 2) + `</g>`; });
      s += dots(r, 190, 150, 66, 16, ["#e8402f", "#4c9a45"], [2, 4]) + glossyDots(r, 190, 150, 66, 14);
      s += C(318, 200, 42, "#00000020") + C(316, 196, 40, "#fff") + C(316, 196, 32, "#fffdf3") + grains(r, 316, 190, 24, 18, 18, "#e8e1c9") + chop(262, 252, 330, 230).replace(/stroke="#b9794a"/, 'stroke="#b9794a"');
      return s; },
    // 18 Cơm gà sốt teriyaki
    18(r) { let s = plate(); s += mound(r, 140, 168, 48, 40);
      for (let i = 0; i < 5; i++) { s += R(190 + i * 8, 90 + i * 22, 74, 28, 12, "#7b3a14", -12 + i * 4, 'stroke="#4d230b" stroke-width="2"') + R(198 + i * 8, 96 + i * 22, 44, 8, 4, "#c0743a", -12 + i * 4, 'opacity=".75"'); }
      s += sesame(r, 236, 150, 44, 40, "#fff6dc") + dots(r, 236, 150, 48, 10, ["#4c9a45"], [1.8, 2.8]);
      s += [0, 1, 2].map(i => C(122 + i * 16, 100 + (i % 2) * 8, 11, "#2f8d3a") + C(119 + i * 16, 94 + (i % 2) * 8, 6, "#46a84e")).join("") + R(100, 210, 8, 40, 4, "#f08a2b", 70) + L("M100 218 L124 210", "#f08a2b", 7);
      return s; },
    // 19 Phở bò tái
    19(r) { let s = bowl(112, "#f7f3ea", "#e0a95b") + clipCircle(200, 150, 100);
      s += E(200, 150, 98, 98, "#e9b96a") + strands(r, 200, 150, 100, 13, "#fff8e6", 9, 1);
      [[160, 120, -15], [214, 112, 12], [236, 156, 35], [176, 168, -30], [210, 196, 10]].forEach(([x, y, a]) => { s += beefSlice(x, y, a, "#d6566a", "#f2a0a8"); });
      s += dots(r, 200, 150, 84, 40, ["#4c9a45", "#7cc04e"], [1.8, 2.8]) + [[130, 140], [270, 140], [200, 214]].map(([x, y]) => E(x, y, 14, 5, "#fff", 0, 'opacity=".8"')).join("");
      s += leaf(150, 186, 30, "#3d9d46", 1.3) + leaf(260, 188, -20, "#58a845", 1.3);
      s += `<g>` + chop(250, 240, 330, 70) + `</g>` + lemon(88, 232, 13);
      return s; },
    // 20 Bún thịt nướng
    20(r) { let s = bowl(112, "#f7f3ea", "#f5eee0");
      s += clipCircle(200, 150, 98);
      s += `<g clip-path="url(#k)">` + E(150, 160, 62, 56, "#fffdf4", 0, 'stroke="#eee5cf" stroke-width="2"') + Array.from({ length: 16 }, () => L(`M${100 + r() * 100} ${110 + r() * 100} q${10 + r() * 20} -8 ${20 + r() * 30} ${r() * 12}`, "#efe6cf", 3)).join("") + `</g>`;
      for (let i = 0; i < 6; i++) { s += E(250 + (i % 2) * 10, 100 + i * 22, 28, 12, i % 2 ? "#a8551f" : "#8a4417", -10 + i * 6, 'stroke="#5e2a0c" stroke-width="1.5"') + E(250 + (i % 2) * 10, 98 + i * 22, 18, 4, "#d68a4b", -10 + i * 6, 'opacity=".6"'); }
      s += [0, 1, 2, 3, 4].map(i => E(150 + i * 20, 96 - (i % 2) * 6, 22, 12, i % 2 ? "#6ab850" : "#8ed25c", i * 20 - 40)).join("");
      s += L("M118 206 q20 -10 40 0", "#f08a2b", 6) + L("M122 220 q18 -8 36 0", "#f4f0dd", 5) + sesame(r, 210, 200, 20, 16, "#e7c68a") + leaf(190, 130, 30, "#3d9d46") + leaf(206, 118, -30, "#58a845") + C(200, 196, 10, "#e4382f");
      return s; },
    // 21 Mì xào bò rau cải
    21(r) { let s = plate();
      for (let i = 0; i < 22; i++) { const a = r() * 6.28, d = r() * 40; s += L(`M${200 + Math.cos(a) * d - 44} ${150 + Math.sin(a) * d * 1.1} q22 ${-24 + r() * 48} 44 ${r() * 16 - 8} t44 ${r() * 10 - 5}`, i % 3 ? "#c68c3d" : "#a8681f", 6); }
      s += E(200, 150, 92, 70, "#c68c3d", 0, 'opacity=".12"');
      [[160, 124, -20], [238, 120, 10], [210, 180, 30], [150, 180, 0]].forEach(([x, y, a]) => { s += beefSlice(x, y, a, "#6b2f1a", "#8f4a2a"); });
      [[180, 100, -30], [236, 154, 50], [168, 150, 10], [212, 118, 60], [250, 194, 20]].forEach(([x, y, a]) => { s += E(x, y, 20, 8, "#7cc04e", a, 'stroke="#3d8a3d" stroke-width="1.5"') + L(`M${x - 18} ${y} L${x + 18} ${y}`, "#e8f5c8", 3, `transform="rotate(${a} ${x} ${y})"`); });
      return s; },
    // 22 Hủ tiếu Nam Vang
    22(r) { let s = bowl(112, "#f7f3ea", "#eed8a3") + clipCircle(200, 150, 100);
      s += E(200, 150, 98, 98, "#f1dfae") + strands(r, 200, 150, 100, 12, "#fffdf0", 6, .9);
      s += [[150, 116, -20], [250, 120, 160], [180, 190, 10], [248, 184, -40]].map(([x, y, a]) => shrimp(x, y, a)).join("");
      s += eggHalf(210, 140, 10) + C(168, 150, 11, "#fffdf6", 'stroke="#eee6cf" stroke-width="1"') + C(168, 150, 5, "#ffb81f") + eggHalf(236, 200, -20);
      s += [[196, 100, 0], [150, 160, 30], [222, 172, 60]].map(([x, y, a]) => beefSlice(x, y, a, "#e8b8a0", "#f6d6c6")).join("");
      s += [0, 1, 2, 3, 4].map(i => R(110 + i * 14, 206 - i * 3, 5, 26, 2, "#3d9d46", 80 + i * 10)).join("") + dots(r, 200, 150, 80, 12, ["#8a4a1a"], [1.8, 3]);
      s += chop(250, 244, 330, 90);
      return s; },
    // 23 Gà rán giòn cay
    23(r) { let s = plate(); s += friedChicken(160, 120, -20, 1.2) + friedChicken(240, 140, 14, 1.2) + friedChicken(190, 200, -6, 1.1);
      s += dots(r, 200, 150, 100, 36, ["#d8281f", "#a81810"], [1.6, 3]) + L("M262 214 Q290 190 280 160", "#d8281f", 3, 'opacity=".5"');
      s += C(300, 222, 20, "#fff", 'stroke="#ddd" stroke-width="2"') + C(300, 222, 14, "#d8281f") + [0, 1, 2].map(i => E(104 + i * 12, 220 - i * 3, 14, 4, "#d8281f", -30 + i * 8)).join("");
      return s; },
    // 24 Xúc xích chiên
    24(r) { let s = plate(112, "#fff");
      [[200, 96, 0], [196, 142, 4], [204, 188, -4]].forEach(([x, y, a]) => { s += `<g transform="rotate(${a} ${x} ${y})">` + R(x - 84, y - 18, 168, 36, 18, "#b8482a", 0, 'stroke="#7c2a14" stroke-width="2.5"') + R(x - 72, y - 12, 140, 9, 5, "#e07a58", 0, 'opacity=".7"') + [-48, -16, 16, 48].map(g => L(`M${x + g - 8} ${y - 15} L${x + g + 8} ${y + 15}`, "#6b2410", 3, 'opacity=".55"')).join("") + `</g>`; });
      s += C(292, 214, 22, "#fff", 'stroke="#ddd" stroke-width="2"') + C(292, 214, 16, "#d8281f") + C(112, 214, 22, "#fff", 'stroke="#ddd" stroke-width="2"') + C(112, 214, 16, "#f0872a") + leaf(250, 232, 20);
      return s; },
    // 25 Bánh tráng trộn
    25(r) { let s = bowl(108, "#fdf3e1", "#f7e8c8");
      for (let i = 0; i < 30; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 78; s += R(200 + Math.cos(a) * d - 3, 150 + Math.sin(a) * d - 20, 7, 38 + r() * 14, 3.5, "#fff9ea", r() * 180, 'stroke="#e5d7b4" stroke-width="1"'); }
      for (let i = 0; i < 18; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 72; s += R(200 + Math.cos(a) * d - 2, 150 + Math.sin(a) * d - 14, 4, 28, 2, "#f6c640", r() * 180); }
      s += dots(r, 200, 150, 78, 18, ["#d8281f", "#b3170f"], [2.5, 5]) + dots(r, 200, 150, 80, 18, ["#e3c081"], [2.5, 4]) + dots(r, 200, 150, 76, 10, ["#8a3a22"], [3, 5]);
      s += [[160, 120], [240, 190], [232, 112]].map(([x, y]) => E(x, y, 11, 9, "#fffdf6", 0, 'stroke="#d9c9a4" stroke-width="1.5"') + C(x, y, 4, "#ffb81f")).join("");
      s += leaf(170, 190, 30, "#3d9d46") + leaf(210, 112, -20, "#58a845") + leaf(250, 150, 60, "#3d9d46");
      return s; },
    // đồ uống
    26(r) { return glass("#e8f1a0", { layers: R(130, 80, 150, 200, 0, "#e5f08f") + R(130, 80, 150, 60, 0, "#f6fbc0", 0, 'opacity=".7"'), extra: bubbles(r, 16) + straw("#2e9ad0") + lemon(256, 82, 24) + leaf(160, 70, -40, "#3d9d46", 1.2) + leaf(176, 62, 10, "#58a845", 1.2) }); },
    27(r) { return glass("#5a3fb0", { layers: R(130, 80, 150, 200, 0, "#4a35a8") + R(130, 80, 150, 60, 0, "#7a5fd0", 0, 'opacity=".55"'), extra: bubbles(r, 16) + dots(r, 200, 190, 36, 14, ["#2e2c7a", "#3a3a96"], [5, 8]) + straw("#f0f0f0") + [0, 1, 2].map(i => C(250 + i * 14, 78 - (i % 2) * 6, 8, "#3a3a96") + C(248 + i * 14, 75 - (i % 2) * 6, 2.5, "#ffffff77")).join("") + leaf(160, 70, -40, "#3d9d46", 1.2) }); },
    28(r) { return glass("#ef5b7a", { layers: R(130, 80, 150, 200, 0, "#ee5878") + R(130, 80, 150, 60, 0, "#f98ea6", 0, 'opacity=".6"'), extra: bubbles(r, 16) + straw("#fff") + [0, 1].map(i => P("M0 0 C-14 -4 -16 18 0 28 C16 18 14 -4 0 0 Z", "#e5282f", `transform="translate(${252 + i * 22} ${74 + i * 4}) scale(1)"`) + leaf(252 + i * 22, 58 + i * 4, 0, "#3d9d46", .8)).join("") + dots(r, 200, 170, 30, 14, ["#c81e3a"], [2, 3.6]) + leaf(160, 70, -40, "#3d9d46", 1.2) }); },
    29(r) { return glass("#5a3519", { layers: R(130, 80, 150, 200, 0, "#4a2a12") + R(130, 80, 150, 50, 0, "#7b4a22", 0, 'opacity=".8"') + R(130, 220, 150, 60, 0, "#fbf3df") + R(130, 210, 150, 14, 0, "#d6b98a", 0, 'opacity=".8"'), extra: straw("#2a8a5a", 212) + R(150, 40, 100, 14, 4, "#c8cfd4") + R(156, 28, 88, 14, 4, "#aab3b8") + P("M166 54 L234 54 L228 72 L172 72 Z", "#d9dfe3", 'stroke="#aab3b8" stroke-width="2"'), extraBack: "" }); },
    30(r) { return glass("#c89a6c", { layers: R(130, 80, 150, 200, 0, "#fbf3df") + R(130, 140, 150, 70, 0, "#d3a878", 0, 'opacity=".95"') + R(130, 120, 150, 30, 0, "#e9cfa4"), extra: straw("#a86d3a", 212) + `<text x="200" y="40" font-size="1"></text>` }); },
    31(r) { let s = E(204, 160, 130, 112, "#00000022") + C(200, 150, 122, "#fff") + C(200, 150, 104, "#f1ede4") + R(300, 128, 38, 24, 12, "#fff", 0, 'stroke="#e6e0d2" stroke-width="3"') + C(196, 150, 84, "#fff") + C(196, 150, 72, "#8a5a36") + C(196, 150, 66, "#c9986a");
      s += P("M196 128 C168 100 150 130 196 184 C242 130 224 100 196 128 Z", "#fff8e8") + P("M196 140 C182 124 172 140 196 168 C220 140 210 124 196 140 Z", "#c9986a", 'opacity=".9"') + L("M196 124 L196 176", "#8a5a36", 2.5, 'opacity=".7"') + C(196, 150, 72, "none", 'stroke="#ffffff55" stroke-width="3"');
      s += R(262, 90, 50, 8, 4, "#e8e0cf", -20) + dots(r, 196, 150, 60, 8, ["#6b3d1c"], [1, 2]);
      return s; },
    32(r) { return glass("#e5c9a0", { layers: R(130, 80, 150, 200, 0, "#ecd3ac") + [0, 1, 2, 3, 4].map(i => L(`M${150 + i * 22} ${90} q10 40 -6 80 t6 90`, "#8a5a36", 7, 'opacity=".75"')).join("") + R(130, 230, 150, 60, 0, "#3a2418", 0, 'opacity=".25"'), extra: dots(r, 200, 242, 40, 30, ["#1d1511"], [6, 8.5]) + C(176, 240, 4, "#ffffff55") + straw("#ec6f93", 214, 11) + `<path d="M142 90 L258 90" stroke="#ffffffaa" stroke-width="3"/>`, ice: false }); },
    33(r) { return glass("#a8cf7a", { layers: R(130, 80, 150, 200, 0, "#a5cd78") + R(130, 80, 150, 60, 0, "#cfe6a8", 0, 'opacity=".7"') + R(130, 240, 150, 50, 0, "#6b9a46", 0, 'opacity=".5"'), extra: straw("#f5f5f5") + [0, 1, 2].map(i => `<rect x="${164 + i * 28}" y="62" width="14" height="14" rx="3" fill="#7fb04a" opacity=".9"/>`).join("") + C(250, 74, 15, "#9bc065") + C(250, 74, 8, "#cde5a2") }); },
    34(r) { return glass("#c9a8e0", { layers: R(130, 80, 150, 200, 0, "#d3b5e6") + R(130, 80, 150, 60, 0, "#e9d6f5", 0, 'opacity=".7"') + R(130, 230, 150, 60, 0, "#a37fc4", 0, 'opacity=".45"'), extra: dots(r, 200, 240, 36, 20, ["#2a1a38"], [5, 7]) + straw("#f5f5f5", 214, 9) + E(256, 80, 22, 14, "#a47fc0", 20) + E(256, 80, 14, 8, "#d8bde8", 20) + `<path d="M256 72 Q262 80 256 88" stroke="#7a5594" stroke-width="2" fill="none"/>` }); },
    35(r) { return glass("#f2c24a", { layers: R(130, 80, 150, 200, 0, "#f3c24b") + R(130, 80, 150, 70, 0, "#f9dc85", 0, 'opacity=".7"'), extra: [[188, 120], [214, 176]].map(([x, y]) => lemon(x, y, 22)).join("") + bubbles(r, 8) + straw("#ffffff") + L("M262 60 L262 100", "#c8923a", 6) + E(262, 108, 12, 7, "#d9a13f") + `<path d="M255 100 Q262 124 269 100" fill="#f6b73c"/>` + leaf(160, 70, -40, "#3d9d46", 1.2) }); },
    36(r) { return glass("#fb9a1f", { layers: R(130, 80, 150, 200, 0, "#fb9a1f") + R(130, 80, 150, 70, 0, "#fdbd55", 0, 'opacity=".75"') + dots(r, 200, 170, 60, 26, ["#fdb340", "#e8870f"], [1.5, 3]), extra: straw("#f2f2f2") + `<g>` + C(300, 224, 34, "#ee8a14") + C(300, 224, 28, "#fdc04a") + [0, 60, 120].map(a => L("M274 224 L326 224", "#ee9b2a", 2, `transform="rotate(${a} 300 224)"`)).join("") + C(98, 232, 28, "#ee8a14") + C(98, 232, 22, "#fdc04a") + [30, 90, 150].map(a => L("M78 232 L118 232", "#ee9b2a", 2, `transform="rotate(${a} 98 232)"`)).join("") + `</g>` + leaf(256, 70, 20, "#3d9d46", 1.2), ice: false }); },
    // 37 Đậu hũ chiên sả ớt chay
    37(r) { let s = plate();
      [[150, 118, -8], [208, 106, 12], [250, 148, -14], [196, 164, 10], [148, 182, 20], [240, 204, -4]].forEach(([x, y, a], i) => { s += R(x - 22, y - 20, 44, 40, 8, "#e4a53a", a, 'stroke="#a8671a" stroke-width="2.5"') + R(x - 16, y - 16, 22, 10, 4, "#f4cd72", a, 'opacity=".75"') + dots(rng(i + 40), x, y, 15, 6, ["#b8701f"], [1.4, 2.4]); });
      s += [0, 1, 2, 3, 4, 5, 6].map(i => R(120 + i * 22, 218 + (i % 3) * 5, 4, 20, 2, "#c9d870", 60 + i * 20)).join("");
      s += [[116, 140], [236, 94], [180, 214], [270, 176], [166, 140]].map(([x, y], i) => E(x, y, 11, 4.5, "#d8281f", i * 40) + C(x + 4, y, 1.4, "#fff")).join("");
      s += dots(r, 200, 150, 90, 18, ["#3d9d46"], [1.6, 2.6]) + leaf(268, 120, 30, "#58a845") ;
      return s; },
    // 38 Bún riêu chay
    38(r) { let s = bowl(112, "#f7f3ea", "#e9532a") + clipCircle(200, 150, 100);
      s += E(200, 150, 98, 98, "#ee6a2f") + strands(r, 200, 150, 100, 7, "#fff7e2", 8, .95);
      s += [[150, 120], [236, 116], [186, 190], [250, 180], [200, 150]].map(([x, y], i) => R(x - 17, y - 16, 34, 32, 7, "#e9a43a", i * 12, 'stroke="#b8701f" stroke-width="2"') + R(x - 11, y - 12, 18, 8, 3, "#f6cf80", i * 12, 'opacity=".7"')).join("");
      s += dots(r, 200, 150, 80, 22, ["#f4cc6a", "#f8e19a"], [4, 7]);
      s += [[170, 150, 20], [222, 138, -30], [140, 170, 0]].map(([x, y, a]) => P(`M${x - 16} ${y} A16 16 0 0 1 ${x + 16} ${y} Z`, "#ee3b2a", `transform="rotate(${a} ${x} ${y})" stroke="#c5251a" stroke-width="2"`)).join("");
      s += leaf(120, 150, 20, "#3d9d46", 1.3) + leaf(270, 160, -20, "#58a845", 1.3) + leaf(190, 98, 80, "#3d9d46", 1.3) + lemon(260, 216, 13) + dots(r, 200, 150, 90, 14, ["#fff"], [1.2, 2]);
      return s; },
    // 39 Cơm chiên rau củ chay
    39(r) { let s = plate(); s += E(200, 152, 88, 72, "#d9a85a") + dots(r, 200, 152, 82, 70, ["#e8bf72", "#c99a46", "#f3d794"], [3, 6]);
      s += dots(r, 200, 152, 74, 16, ["#f6c32a"], [3, 4.2]) + dots(r, 200, 152, 74, 14, ["#f08a2b"], [3.2, 5]) + dots(r, 200, 152, 74, 12, ["#4c9a45"], [2.6, 3.6]);
      s += [[156, 128], [238, 134], [196, 192], [226, 108]].map(([x, y], i) => E(x, y, 15, 11, "#d7b48c", i * 30, 'stroke="#a98055" stroke-width="2"') + R(x - 4, y + 4, 8, 12, 3, "#e9d3b2", i * 30)).join("");
      s += dots(r, 200, 150, 70, 10, ["#fffbe8"], [2, 3]) + leaf(268, 190, 30, "#3d9d46") + leaf(132, 190, -30, "#3d9d46");
      return s; }
  };

  // Màu nền riêng cho từng nhóm để hình dễ nhìn
  const bg = (id) => {
    if (id >= 26 && id <= 36) return ["#e8f4f8", "#f6efe3"];
    if (id === 31 || id === 29 || id === 30) return ["#f3e6d3", "#fbf4ea"];
    if ([2, 5, 7, 9, 11, 37, 38, 39].includes(id)) return ["#e4f2d8", "#f7f6e4"];
    if ([4, 19, 20, 21, 22].includes(id)) return ["#f6e6cf", "#fbf3e6"];
    return ["#f9ead2", "#f4ece0"];
  };

  const cache = {};
  window.dishArt = function (id) {
    if (cache[id]) return cache[id];
    const draw = dishes[id];
    if (!draw) return "";
    const [a, b] = bg(id);
    const svg = wrap(draw(rng(id)), a, b);
    return (cache[id] = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
  };
  window.dishArtSVG = function (id) { const [a, b] = bg(id); return wrap(dishes[id](rng(id)), a, b); };
})();
