// 偉人スキン（歴史イベントのガチャでゲット）
// スキンをつけると、キャラの絵そのものが偉人のイラストにかわる。どれもオリジナルの絵。
// Skins.render(id) で、キャラと同じ大きさ（200×200）の SVG を返す。
(function () {
  const INK = '#3a2a5e';
  const SK = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"`;
  const SK2 = `stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"`;
  const SKIN = '#ffe1c8';
  const BLACK = '#2e2436';

  // ---- 共通のパーツ ----
  const cloth = (fill, wide) => `<path d="M${wide ? 14 : 26} 204 C${wide ? 18 : 30} 168 ${wide ? 56 : 62} 154 100 154 C${wide ? 144 : 138} 154 ${wide ? 182 : 170} 168 ${wide ? 186 : 174} 204Z" fill="${fill}" ${SK}/>`;
  const head = (skin) => `<circle cx="46" cy="116" r="11" fill="${skin || SKIN}" ${SK}/><circle cx="154" cy="116" r="11" fill="${skin || SKIN}" ${SK}/><circle cx="100" cy="110" r="54" fill="${skin || SKIN}" ${SK}/>`;
  const cheeks = '<ellipse cx="70" cy="128" rx="9" ry="5.5" fill="#ff7fa0" opacity=".4"/><ellipse cx="130" cy="128" rx="9" ry="5.5" fill="#ff7fa0" opacity=".4"/>';
  const EYES = {
    dot: `<circle cx="80" cy="112" r="6.5" fill="${INK}"/><circle cx="120" cy="112" r="6.5" fill="${INK}"/><circle cx="82" cy="110" r="2.2" fill="#fff"/><circle cx="122" cy="110" r="2.2" fill="#fff"/>`,
    smile: `<path d="M72 114 Q80 105 88 114 M112 114 Q120 105 128 114" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`,
    sharp: `<ellipse cx="80" cy="113" rx="7" ry="5" fill="${INK}" transform="rotate(10 80 113)"/><ellipse cx="120" cy="113" rx="7" ry="5" fill="${INK}" transform="rotate(-10 120 113)"/><circle cx="82" cy="111" r="1.8" fill="#fff"/><circle cx="122" cy="111" r="1.8" fill="#fff"/>`,
  };
  const BROWS = {
    soft: `<path d="M70 98 Q80 93 90 98 M110 98 Q120 93 130 98" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`,
    stern: `<path d="M68 94 L91 101 M132 94 L109 101" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
    gray: `<path d="M68 96 Q80 90 92 97 M108 97 Q120 90 132 96" fill="none" stroke="#8f8fa0" stroke-width="6" stroke-linecap="round"/>`,
  };
  const MOUTH = {
    smile: `<path d="M88 136 Q100 147 112 136" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
    line: `<path d="M90 140 L110 140" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
    open: `<path d="M86 134 L114 134 Q112 152 100 152 Q88 152 86 134Z" fill="#8a2346" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
  };
  const nose = `<path d="M97 124 Q100 128 103 124" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>`;
  const face = (o) => (o.cheeks === false ? '' : cheeks) + BROWS[o.brows || 'soft'] + EYES[o.eyes || 'dot'] + nose + MOUTH[o.mouth || 'smile'];
  // ちょんまげ（そった頭のてっぺん＋よこの髪＋まげ）
  const chonmage = (hair) => `<path d="M48 120 C40 90 50 70 68 62 C64 80 62 98 64 118Z" fill="${hair}" ${SK}/><path d="M152 120 C160 90 150 70 132 62 C136 80 138 98 136 118Z" fill="${hair}" ${SK}/><ellipse cx="100" cy="68" rx="32" ry="12" fill="#6a8fb5" opacity=".18"/><path d="M93 60 L93 38 Q100 30 107 38 L107 60Z" fill="${hair}" ${SK}/><path d="M91 50 L109 50" stroke="#fff" stroke-width="3" opacity=".6"/>`;
  // スーパーレアのうしろの光
  const glow = '<circle cx="100" cy="100" r="100" fill="url(#skglow)"/><g fill="#fff6c9" opacity=".9"><path d="M30 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"/><path d="M168 54 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"/><path d="M160 150 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"/></g>';
  const glowDef = '<defs><radialGradient id="skglow"><stop offset="0" stop-color="#fff3b0"/><stop offset=".7" stop-color="#ffd65c"/><stop offset="1" stop-color="#f5b82e"/></radialGradient></defs>';
  // 平安時代の長いかみ（うしろ）と前がみ
  const heianBack = `<path d="M28 204 C16 122 34 50 100 46 C166 50 184 122 172 204Z" fill="${BLACK}" ${SK}/>`;
  const heianFront = `<path d="M46 110 C44 64 70 48 100 48 C130 48 156 64 154 110 C146 84 122 70 100 66 C78 70 54 84 46 110Z" fill="${BLACK}" ${SK}/>`;

  const SKINS = [
    // ---- ふつう ----
    { id: 'himiko', name: '卑弥呼', rarity: 'n',
      svg: () => `<path d="M36 200 C24 120 40 52 100 48 C160 52 176 120 164 200Z" fill="${BLACK}" ${SK}/>` + cloth('#fffaf0') +
        `<path d="M82 156 L100 180 L118 156" fill="none" stroke="#e0503f" stroke-width="6" stroke-linejoin="round"/>` + head() + face({}) +
        `<path d="M46 104 C44 62 70 48 100 48 C130 48 156 62 154 104 L150 86 L50 86Z" fill="${BLACK}" ${SK}/>` +
        `<path d="M50 80 Q100 64 150 80" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M50 80 Q100 64 150 80" fill="none" stroke="#ffc93c" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="70" r="6" fill="#ff4f4f" ${SK2}/>` +
        `<path d="M70 164 Q100 184 130 164" fill="none" stroke="${INK}" stroke-width="2"/><g fill="#2ec4a6" ${SK2}><path d="M78 168 a6 6 0 1 1 6 6 q-4 4 -8 2z"/><path d="M96 176 a6 6 0 1 1 6 6 q-4 4 -8 2z"/><path d="M114 168 a6 6 0 1 1 6 6 q-4 4 -8 2z"/></g>` },
    { id: 'shotoku', name: '聖徳太子', rarity: 'n',
      svg: () => cloth('#e9a64a') + `<path d="M74 158 Q100 176 126 158" fill="none" stroke="${INK}" stroke-width="3"/>` + head() + face({ mouth: 'line' }) +
        `<path d="M86 131 Q93 126 100 130 Q107 126 114 131" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M96 152 Q100 160 104 152" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M48 118 C44 96 52 80 64 74 L64 112Z M152 118 C156 96 148 80 136 74 L136 112Z" fill="${BLACK}" ${SK}/>` +
        `<path d="M100 42 C104 24 118 16 130 22" fill="none" stroke="${BLACK}" stroke-width="8" stroke-linecap="round"/><path d="M64 76 C64 52 80 40 100 40 C120 40 136 52 136 76Z" fill="${BLACK}" ${SK}/><rect x="60" y="70" width="80" height="12" rx="5" fill="${BLACK}" ${SK}/>` +
        `<rect x="140" y="138" width="13" height="58" rx="5" fill="#e8c98a" ${SK} transform="rotate(12 146 166)"/>` },
    { id: 'murasaki', name: '紫式部', rarity: 'n',
      svg: () => heianBack + cloth('#8c6bff') + `<path d="M58 204 L100 156 L142 204Z" fill="#ff8fbc" ${SK}/><path d="M72 204 L100 168 L128 204Z" fill="#fff" ${SK}/><path d="M84 204 L100 180 L116 204Z" fill="#8c6bff" ${SK}/>` +
        head() + face({ eyes: 'smile' }) + heianFront +
        `<path d="M148 176 L170 132" stroke="#9a6334" stroke-width="6" stroke-linecap="round"/><path d="M170 132 L175 122" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>` },
    { id: 'seisho', name: '清少納言', rarity: 'n',
      svg: () => heianBack + cloth('#e0503f') + `<path d="M58 204 L100 156 L142 204Z" fill="#ff8a3d" ${SK}/><path d="M72 204 L100 168 L128 204Z" fill="#ffd23f" ${SK}/><path d="M84 204 L100 180 L116 204Z" fill="#e0503f" ${SK}/>` +
        head() + face({ mouth: 'open' }) + heianFront +
        `<path d="M134 186 L160 140 Q184 156 180 188 Z" fill="#ffd23f" ${SK}/><path d="M134 186 L166 148 M134 186 L174 160 M134 186 L178 174" stroke="#e8a90c" stroke-width="2.5"/><circle cx="134" cy="186" r="4" fill="${INK}"/>` },
    { id: 'ino', name: '伊能忠敬', rarity: 'n',
      svg: () => cloth('#9a6334') + `<path d="M84 156 L100 178 L116 156" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>` + head() + face({ brows: 'gray', eyes: 'smile' }) +
        `<path d="M62 132 Q66 138 64 144 M138 132 Q134 138 136 144" fill="none" stroke="${INK}" stroke-width="2" opacity=".4"/>` + chonmage('#a3a3b2') +
        `<g transform="rotate(-12 150 172)"><rect x="128" y="156" width="46" height="32" rx="3" fill="#fff6dd" ${SK}/><path d="M134 178 q6 -10 12 -4 t12 -6 t10 2" fill="none" stroke="#4d9dff" stroke-width="2.5"/><path d="M136 166 l6 0 M150 166 l8 0" stroke="#c9b68a" stroke-width="2"/></g>` },
    // ---- レア ----
    { id: 'yoritomo', name: '源頼朝', rarity: 'r',
      svg: () => cloth('#3b3473', true) + `<path d="M80 154 L100 178 L120 154" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>` + head() + face({ brows: 'stern', eyes: 'sharp', mouth: 'line' }) +
        `<path d="M84 132 Q92 127 100 131 Q108 127 116 132" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><path d="M95 150 Q100 162 105 150" fill="${INK}"/>` +
        `<path d="M50 116 C46 94 54 80 66 74 L66 112Z M150 116 C154 94 146 80 134 74 L134 112Z" fill="${BLACK}" ${SK}/>` +
        `<path d="M68 76 C62 44 72 12 100 6 C124 2 132 30 132 76Z" fill="${BLACK}" ${SK}/><path d="M66 70 Q100 62 134 70 L134 80 Q100 72 66 80Z" fill="${BLACK}" ${SK}/>` },
    { id: 'yoshimitsu', name: '足利義満', rarity: 'r',
      svg: () => cloth('#5b5770') + `<path d="M52 176 L156 204 L132 204 L44 188Z" fill="#ffc93c" ${SK}/>` + head() + face({ eyes: 'smile' }) +
        `<ellipse cx="100" cy="70" rx="34" ry="13" fill="#6a8fb5" opacity=".18"/><path d="M74 66 Q86 58 100 58" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/>` +
        `<g fill="#9a6334" ${SK2}><circle cx="140" cy="160" r="5"/><circle cx="148" cy="170" r="5"/><circle cx="152" cy="182" r="5"/><circle cx="150" cy="194" r="5"/></g>` },
    { id: 'perry', name: 'ペリー', rarity: 'r',
      svg: () => cloth('#1f2a5c', true) + `<path d="M84 154 L100 172 L116 154Z" fill="#fff" ${SK}/><path d="M96 162 L104 162 L106 176 L94 176Z" fill="${BLACK}"/>` +
        `<rect x="20" y="166" width="40" height="12" rx="5" fill="#ffc93c" ${SK} transform="rotate(-18 40 172)"/><rect x="140" y="166" width="40" height="12" rx="5" fill="#ffc93c" ${SK} transform="rotate(18 160 172)"/><g fill="#ffc93c" ${SK2}><circle cx="100" cy="186" r="4"/><circle cx="100" cy="198" r="4"/></g>` +
        head('#ffe9d8') + face({ brows: 'gray', eyes: 'sharp', mouth: 'line', cheeks: false }) +
        `<path d="M46 98 C40 126 50 150 70 152 C66 134 64 118 64 100Z" fill="#e9e9ef" ${SK}/><path d="M154 98 C160 126 150 150 130 152 C134 134 136 118 136 100Z" fill="#e9e9ef" ${SK}/>` +
        `<path d="M52 90 C54 66 72 56 84 58 C78 66 76 74 76 82 C70 82 60 86 52 90Z M148 90 C146 66 128 56 116 58 C122 66 124 74 124 82 C130 82 140 86 148 90Z" fill="#e9e9ef" ${SK}/>` },
    { id: 'fukuzawa', name: '福沢諭吉', rarity: 'r',
      svg: () => cloth('#2e2436') + `<path d="M80 154 L100 182 L120 154" fill="#8f8fa0" ${SK}/><path d="M86 154 L100 174 L114 154" fill="none" stroke="#fff" stroke-width="4"/>` + head() + face({}) +
        `<path d="M46 108 C42 66 66 50 100 50 C134 50 158 66 154 108 C150 92 140 80 124 76 C108 80 80 82 60 74 C52 84 48 96 46 108Z" fill="${BLACK}" ${SK}/>` +
        `<rect x="132" y="160" width="34" height="40" rx="3" fill="#4d9dff" ${SK} transform="rotate(-8 149 180)"/><path d="M140 170 L160 168 M140 178 L160 176" stroke="#fff" stroke-width="2.5" transform="rotate(-8 149 180)"/>` },
    // ---- スーパーレア ----
    { id: 'nobunaga', name: '織田信長', rarity: 'sr',
      svg: () => glowDef + glow + `<path d="M10 204 C14 160 52 146 100 146 C148 146 186 160 190 204Z" fill="#e0503f" ${SK}/><path d="M10 204 C14 160 52 146 100 146 C148 146 186 160 190 204" fill="none" stroke="#ffc93c" stroke-width="5"/>` +
        cloth(BLACK) + `<path d="M82 154 L100 176 L118 154" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>` +
        head() + face({ brows: 'stern', eyes: 'sharp', mouth: 'line', cheeks: false }) +
        `<path d="M80 133 Q90 126 100 131 Q110 126 120 133 Q126 128 128 122 M80 133 Q74 128 72 122" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>` + chonmage(BLACK) },
    { id: 'hideyoshi', name: '豊臣秀吉', rarity: 'sr',
      svg: () => glowDef + glow + cloth('#ffc93c', true) + `<g fill="none" stroke="#e8a90c" stroke-width="3"><circle cx="58" cy="186" r="7"/><circle cx="142" cy="186" r="7"/></g><path d="M80 154 L100 178 L120 154" fill="none" stroke="#e0503f" stroke-width="6" stroke-linejoin="round"/>` +
        head() + face({ eyes: 'smile', mouth: 'open' }) +
        `<path d="M84 127 Q92 123 100 126 Q108 123 116 127" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><path d="M96 156 L100 166 L104 156" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>` +
        `<path d="M132 58 L178 44 L180 58 L134 70Z M68 58 L22 44 L20 58 L66 70Z" fill="${BLACK}" ${SK}/><path d="M64 78 C64 48 80 36 100 36 C120 36 136 48 136 78Z" fill="${BLACK}" ${SK}/><rect x="60" y="70" width="80" height="12" rx="5" fill="${BLACK}" ${SK}/>` },
    { id: 'ieyasu', name: '徳川家康', rarity: 'sr',
      svg: () => glowDef + glow + cloth('#3f7d4f', true) + `<path d="M80 154 L100 178 L120 154" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>` +
        `<circle cx="100" cy="190" r="12" fill="#fff" ${SK2}/><g fill="#3f7d4f"><path d="M100 190 C94 186 94 179 100 178 C106 179 106 186 100 190Z"/><path d="M100 190 C96 196 89 196 89 191 C90 186 96 186 100 190Z"/><path d="M100 190 C104 196 111 196 111 191 C110 186 104 186 100 190Z"/></g>` +
        `<circle cx="46" cy="116" r="11" fill="${SKIN}" ${SK}/><circle cx="154" cy="116" r="11" fill="${SKIN}" ${SK}/><ellipse cx="100" cy="112" rx="58" ry="54" fill="${SKIN}" ${SK}/>` + face({ eyes: 'smile' }) +
        `<path d="M92 152 Q100 160 108 152" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` + chonmage(BLACK) },
  ];

  const RARITY = {
    n: { label: 'ふつう', weight: 60 },
    r: { label: 'レア', weight: 30 },
    sr: { label: 'スーパーレア', weight: 10 },
  };

  function get(id) { return SKINS.find((x) => x.id === id) || null; }

  function render(id, title) {
    const x = get(id);
    if (!x) return '';
    const label = title ? ' role="img" aria-label="' + String(title).replace(/[&<>"]/g, '') + '"' : ' aria-hidden="true"';
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"${label}><rect width="200" height="200" fill="#fff6dd"/>${x.svg()}</svg>`;
  }

  // ガチャを1回引く（minRarity が 'r' ならレア以上だけ）
  function draw(minRarity) {
    const keys = minRarity === 'r' ? ['r', 'sr'] : ['n', 'r', 'sr'];
    const total = keys.reduce((s, k) => s + RARITY[k].weight, 0);
    let x = Math.random() * total;
    let rarity = keys[keys.length - 1];
    for (const k of keys) {
      if (x < RARITY[k].weight) { rarity = k; break; }
      x -= RARITY[k].weight;
    }
    const pool = SKINS.filter((s) => s.rarity === rarity);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function owned(map) {
    const o = map || {};
    return SKINS.filter((s) => o[s.id]);
  }

  window.Skins = { SKINS, RARITY, get, render, draw, owned };
})();
