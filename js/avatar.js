// キャラクターの絵（SVG）
// どの画面でも Avatar.render(キャラのデータ) で同じ絵が描ける。
// キャラのデータは「それぞれのパーツが何番目か」だけの小さな形：
//   { face, skin, eyes, brows, nose, mouth, hair, hairColor }
(function () {
  const INK = '#3a2a5e';
  const STORAGE_KEY = 'hayaoshi.avatar';

  // ---------- パーツの一覧（名前は画面に出る） ----------
  const FACES = [
    { name: 'まる', svg: (f) => `<circle cx="100" cy="112" r="60" ${f}/>` },
    { name: 'たまご', svg: (f) => `<ellipse cx="100" cy="114" rx="54" ry="64" ${f}/>` },
    { name: 'しかく', svg: (f) => `<rect x="44" y="52" width="112" height="120" rx="36" ${f}/>` },
    { name: 'おにぎり', svg: (f) => `<path d="M100 50 C134 50 160 100 162 140 C164 170 140 178 100 178 C60 178 36 170 38 140 C40 100 66 50 100 50Z" ${f}/>` },
    { name: 'おもち', svg: (f) => `<ellipse cx="100" cy="118" rx="64" ry="56" ${f}/>` },
    { name: 'ほっそり', svg: (f) => `<path d="M100 50 C136 50 154 78 154 110 C154 150 128 180 100 180 C72 180 46 150 46 110 C46 78 64 50 100 50Z" ${f}/>` },
  ];

  const SKINS = [
    { name: 'はだ1', color: '#ffe3cf' },
    { name: 'はだ2', color: '#ffd1ad' },
    { name: 'はだ3', color: '#f2bd8c' },
    { name: 'はだ4', color: '#dca274' },
    { name: 'はだ5', color: '#b97e50' },
    { name: 'はだ6', color: '#8a5a3c' },
    { name: 'みずいろ', color: '#bfe8ff' },
    { name: 'わかば', color: '#cdf1b3' },
  ];

  // 目は左右で描く。side は 左=-1 / 右=1
  const EYES = [
    { name: 'まる', svg: (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="${INK}"/><circle cx="${x + 3}" cy="${y - 3}" r="3" fill="#fff"/>` },
    { name: 'キラキラ', svg: (x, y) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="13" fill="${INK}"/><circle cx="${x + 4}" cy="${y - 5}" r="4.5" fill="#fff"/><circle cx="${x - 4}" cy="${y + 5}" r="2" fill="#fff"/>` },
    { name: 'にこにこ', svg: (x, y) => `<path d="M${x - 10} ${y + 3} Q${x} ${y - 10} ${x + 10} ${y + 3}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>` },
    { name: 'ねむねむ', svg: (x, y) => `<path d="M${x - 10} ${y - 2} Q${x} ${y + 9} ${x + 10} ${y - 2}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>` },
    { name: 'きりっ', svg: (x, y, side) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="7" transform="rotate(${-side * 14} ${x} ${y})" fill="${INK}"/><circle cx="${x + 3}" cy="${y - 2}" r="2.5" fill="#fff"/>` },
    { name: 'てん', svg: (x, y) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${INK}"/>` },
    { name: 'ぱっちり', svg: (x, y, side) => `<circle cx="${x}" cy="${y}" r="10" fill="${INK}"/><circle cx="${x + 3}" cy="${y - 4}" r="3.5" fill="#fff"/><path d="M${x + side * 8} ${y - 7} l${side * 7} -5 M${x + side * 10} ${y - 1} l${side * 8} -1" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` },
    { name: 'ウインク', svg: (x, y, side) => side < 0
      ? `<circle cx="${x}" cy="${y}" r="9" fill="${INK}"/><circle cx="${x + 3}" cy="${y - 3}" r="3" fill="#fff"/>`
      : `<path d="M${x + 8} ${y - 7} L${x - 7} ${y} L${x + 8} ${y + 7}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` },
  ];

  // まゆ。inner は顔の真ん中がわ
  const BROWS = [
    { name: 'ふつう', svg: (x, y) => `<path d="M${x - 11} ${y + 2} Q${x} ${y - 5} ${x + 11} ${y + 2}" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` },
    { name: 'まっすぐ', svg: (x, y) => `<path d="M${x - 11} ${y} L${x + 11} ${y}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` },
    { name: 'こまり', svg: (x, y, side) => `<path d="M${x - side * 11} ${y - 5} L${x + side * 11} ${y + 3}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` },
    { name: 'きりっ', svg: (x, y, side) => `<path d="M${x - side * 11} ${y + 4} L${x + side * 11} ${y - 4}" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>` },
    { name: 'ふとまゆ', svg: (x, y) => `<path d="M${x - 11} ${y + 2} Q${x} ${y - 5} ${x + 11} ${y + 2}" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>` },
    { name: 'まろ', svg: (x, y) => `<ellipse cx="${x}" cy="${y - 2}" rx="6" ry="4" fill="${INK}"/>` },
    { name: 'なし', svg: () => '' },
  ];

  const NOSES = [
    { name: 'てん', svg: () => `<ellipse cx="100" cy="130" rx="3.5" ry="3" fill="${INK}" opacity=".55"/>` },
    { name: 'ちょこん', svg: () => `<path d="M95 130 Q100 135 105 130" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".7"/>` },
    { name: 'くの字', svg: () => `<path d="M101 119 L95 132 L103 133" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>` },
    { name: 'まるっ', svg: () => `<circle cx="100" cy="129" r="7" fill="#000" opacity=".1"/><circle cx="102" cy="127" r="2" fill="#fff" opacity=".7"/>` },
    { name: 'さんかく', svg: () => `<path d="M100 121 L93 133 L107 133Z" fill="#000" opacity=".12" stroke-linejoin="round"/>` },
    { name: 'なし', svg: () => '' },
  ];

  const MOUTH_RED = '#8a2346';
  const TONGUE = '#ff7d96';
  const MOUTHS = [
    { name: 'にっこり', svg: () => `<path d="M86 145 Q100 159 114 145" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>` },
    { name: '大わらい', svg: () => `<path d="M83 142 L117 142 Q115 167 100 167 Q85 167 83 142Z" fill="${MOUTH_RED}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M91 160 Q100 151 109 160 Q105 166 100 166 Q95 166 91 160Z" fill="${TONGUE}"/>` },
    { name: 'にかっ', svg: () => `<path d="M83 142 L117 142 Q115 163 100 163 Q85 163 83 142Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M86 151 L114 151" stroke="${INK}" stroke-width="1.6" opacity=".5"/>` },
    { name: 'ねこぐち', svg: () => `<path d="M87 146 Q93.5 154 100 146 Q106.5 154 113 146" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` },
    { name: 'ぺろっ', svg: () => `<path d="M96 151 Q96 164 104 162 Q109 159 107 150Z" fill="${TONGUE}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M86 146 Q100 157 114 146" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>` },
    { name: 'ちょこっ', svg: () => `<path d="M95 148 Q100 153 105 148" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` },
    { name: 'びっくり', svg: () => `<ellipse cx="100" cy="151" rx="6.5" ry="8.5" fill="${MOUTH_RED}" stroke="${INK}" stroke-width="3"/>` },
    { name: 'むむっ', svg: () => `<path d="M88 151 Q100 143 112 151" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>` },
  ];

  const HAIR_COLORS = [
    { name: 'くろ', color: '#2e2436' },
    { name: 'こげちゃ', color: '#5b3a24' },
    { name: 'ちゃいろ', color: '#9a6334' },
    { name: 'きんいろ', color: '#f3c552' },
    { name: 'あか', color: '#e0503f' },
    { name: 'ピンク', color: '#ff8fbc' },
    { name: 'あお', color: '#4f7fe0' },
    { name: 'みどり', color: '#4bb56d' },
  ];

  // かみがた：back は顔のうしろ、front は顔の上（前がみ）
  const BANGS_SIDE = 'M44 102 C42 58 70 40 100 40 C130 40 158 58 156 102 C150 82 136 68 118 64 C100 76 72 82 48 98Z';
  const HAIRS = [
    { name: 'ショート',
      back: '<ellipse cx="100" cy="90" rx="64" ry="56"/>',
      front: 'M44 100 C44 58 70 40 100 40 C130 40 156 58 156 100 C147 85 132 75 118 72 C110 82 92 86 77 80 C67 87 55 93 44 100Z' },
    { name: 'ぼうず',
      back: '',
      front: 'M42 102 C42 58 70 44 100 44 C130 44 158 58 158 102 C150 80 128 66 100 66 C72 66 50 80 42 102Z', noShine: true },
    { name: 'ツンツン',
      back: '<ellipse cx="100" cy="92" rx="60" ry="50"/>',
      front: 'M42 102 L34 68 L56 72 L52 42 L76 56 L84 26 L100 48 L116 26 L124 56 L148 42 L144 72 L166 68 L158 102 C146 86 126 76 100 76 C74 76 54 86 42 102Z' },
    { name: 'おかっぱ',
      back: '<path d="M32 152 C26 70 56 34 100 34 C144 34 174 70 168 152Z"/>',
      front: 'M40 104 C38 54 66 36 100 36 C134 36 162 54 160 104 L152 104 L150 84 L50 84 L48 104Z' },
    { name: 'ロング',
      back: '<path d="M30 192 C20 90 50 34 100 34 C150 34 180 90 170 192Z"/>',
      front: 'M40 112 C36 56 66 36 100 36 C136 36 164 56 160 112 C153 88 141 75 125 69 C110 81 80 85 60 79 C50 89 44 99 40 112Z' },
    { name: 'ポニーテール',
      back: '<ellipse cx="100" cy="90" rx="62" ry="54"/><path d="M146 66 C192 62 202 130 180 166 C174 134 166 106 142 92Z"/>',
      front: BANGS_SIDE,
      extra: '<circle cx="150" cy="72" r="8" fill="#ff5c8a" stroke="' + INK + '" stroke-width="3"/>' },
    { name: 'おだんご',
      back: '<circle cx="100" cy="30" r="24"/><ellipse cx="100" cy="90" rx="62" ry="54"/>',
      front: BANGS_SIDE },
    { name: 'ツインテール',
      back: '<ellipse cx="100" cy="90" rx="62" ry="54"/><path d="M148 78 C186 80 196 140 174 174 C170 142 162 118 144 104Z"/><path d="M52 78 C14 80 4 140 26 174 C30 142 38 118 56 104Z"/>',
      front: 'M42 104 C40 56 68 38 100 38 C132 38 160 56 158 104 C150 80 132 66 103 64 L100 72 L97 64 C68 66 50 80 42 104Z',
      extra: '<circle cx="150" cy="82" r="7" fill="#ffd23f" stroke="' + INK + '" stroke-width="3"/><circle cx="50" cy="82" r="7" fill="#ffd23f" stroke="' + INK + '" stroke-width="3"/>' },
  ];

  // ---------- アクセサリー（練習モードの累計点数でゲット） ----------
  // slot: 'head'（頭）か 'face'（顔）。points: ゲットできる累計点数
  const SK = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"`;
  const ACCESSORIES = [
    { id: 'hachimaki', icon: '30 50 160 70', name: 'はちまき', slot: 'head', points: 500,
      svg: () => `<path d="M40 84 Q100 58 160 84 L161 99 Q100 73 39 99Z" fill="#fff" ${SK}/><circle cx="100" cy="79" r="7" fill="#ff4f4f"/><path d="M158 86 L184 74 L180 93Z M158 94 L182 106 L167 113Z" fill="#fff" ${SK}/>` },
    { id: 'megane', icon: '38 94 124 44', name: 'メガネ', slot: 'face', points: 1500,
      svg: () => `<g fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"><circle cx="78" cy="117" r="16" fill="#fff" fill-opacity=".3"/><circle cx="122" cy="117" r="16" fill="#fff" fill-opacity=".3"/><path d="M94 114 Q100 109 106 114 M62 113 L44 108 M138 113 L156 108"/></g>` },
    { id: 'ribbon', icon: '94 18 88 60', name: 'リボン', slot: 'head', points: 3000,
      svg: () => `<g fill="#ff5c8d" ${SK} transform="translate(138 55) scale(1.35) translate(-138 -55)"><path d="M136 50 C114 28 104 66 132 60Z"/><path d="M140 50 C162 28 172 66 144 60Z"/><circle cx="138" cy="55" r="7"/></g>` },
    { id: 'cap', icon: '30 16 165 86', name: '野球ぼう', slot: 'head', points: 5000,
      svg: () => `<path d="M40 88 C38 42 68 26 100 26 C132 26 162 42 160 88 C130 78 70 78 40 88Z" fill="#4d9dff" ${SK}/><path d="M100 30 L100 80" stroke="#2f74d8" stroke-width="3"/><path d="M96 84 C130 72 166 74 188 90 C160 97 126 97 96 92Z" fill="#2f74d8" ${SK}/><circle cx="100" cy="27" r="6" fill="#2f74d8" ${SK}/>` },
    { id: 'sunglasses', icon: '38 96 124 40', name: 'サングラス', slot: 'face', points: 7500,
      svg: () => `<g ${SK}><rect x="57" y="104" width="39" height="26" rx="10" fill="${INK}"/><rect x="104" y="104" width="39" height="26" rx="10" fill="${INK}"/><path d="M96 112 L104 112 M57 110 L43 105 M143 110 L157 105" fill="none" stroke-linecap="round"/></g><path d="M65 111 L77 111 M112 111 L124 111" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>` },
    { id: 'headphones', icon: '16 30 168 116', name: 'ヘッドホン', slot: 'head', points: 10000,
      svg: () => `<path d="M38 116 C32 32 168 32 162 116" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M38 116 C32 32 168 32 162 116" fill="none" stroke="#8c6bff" stroke-width="7" stroke-linecap="round"/><rect x="22" y="98" width="27" height="42" rx="11" fill="#ff6b57" ${SK}/><rect x="151" y="98" width="27" height="42" rx="11" fill="#ff6b57" ${SK}/>` },
    { id: 'nekomimi', icon: '40 10 120 70', name: 'ねこみみ', slot: 'head', points: 13000,
      svg: (c) => `<path d="M48 74 L54 18 L92 46Z" fill="${c.hairC}" ${SK}/><path d="M152 74 L146 18 L108 46Z" fill="${c.hairC}" ${SK}/><path d="M58 60 L61 32 L82 47Z" fill="#ffb3c8"/><path d="M142 60 L139 32 L118 47Z" fill="#ffb3c8"/>` },
    { id: 'hige', icon: '56 120 88 30', name: 'ひげ', slot: 'face', points: 16000,
      svg: () => `<path d="M100 137 C92 127 74 127 63 142 C76 136 88 142 100 140 C112 142 124 136 137 142 C126 127 108 127 100 137Z" fill="#4a3426" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>` },
    { id: 'silkhat', icon: '36 -8 128 72', name: 'シルクハット', slot: 'head', points: 20000,
      svg: () => `<g transform="rotate(-8 100 44)" ${SK}><path d="M70 48 L74 4 L126 4 L130 48Z" fill="#3b3473"/><rect x="71" y="34" width="58" height="10" fill="#ff4f4f"/><ellipse cx="100" cy="50" rx="56" ry="10" fill="#3b3473"/></g>` },
    { id: 'heart', icon: '44 118 112 36', name: 'ハートのほっぺ', slot: 'face', points: 25000,
      svg: () => `<path d="M68 136 C60 125 50 136 68 149 C86 136 76 125 68 136Z" fill="#ff5c8d" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M132 136 C124 125 114 136 132 149 C150 136 140 125 132 136Z" fill="#ff5c8d" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>` },
    { id: 'halo', icon: '50 2 100 40', name: '天使のわっか', slot: 'head', points: 30000,
      svg: () => `<ellipse cx="100" cy="22" rx="40" ry="11" fill="none" stroke="${INK}" stroke-width="12"/><ellipse cx="100" cy="22" rx="40" ry="11" fill="none" stroke="#ffe27a" stroke-width="6"/>` },
    { id: 'crown', icon: '46 -2 108 62', name: '王冠', slot: 'head', points: 40000,
      svg: () => `<path d="M62 54 L56 14 L80 34 L100 6 L120 34 L144 14 L138 54Z" fill="#ffc93c" ${SK}/><rect x="62" y="44" width="76" height="10" fill="#e8a90c" ${SK}/><g stroke="${INK}" stroke-width="2.5"><circle cx="100" cy="30" r="5" fill="#ff4f4f"/><circle cx="56" cy="14" r="5" fill="#4d9dff"/><circle cx="144" cy="14" r="5" fill="#4d9dff"/><circle cx="100" cy="6" r="5" fill="#2ec4a6"/></g>` },
  ];

  function getAccessory(id) { return ACCESSORIES.find((x) => x.id === id) || null; }

  // 累計点数で、もうゲットしているアクセサリー
  function ownedAccessories(totalPoints) {
    return ACCESSORIES.filter((x) => (totalPoints || 0) >= x.points);
  }
  // つぎにゲットできるアクセサリー（ぜんぶゲットしたら null）
  function nextAccessory(totalPoints) {
    return ACCESSORIES.find((x) => (totalPoints || 0) < x.points) || null;
  }

  // アクセサリー1つだけの小さな絵（コレクション表示用）
  function renderAccessoryIcon(id) {
    const x = getAccessory(id);
    if (!x) return '';
    const box = x.icon || '10 0 180 120';
    return `<svg viewBox="${box}" aria-hidden="true">${x.svg({ hairC: HAIR_COLORS[1].color })}</svg>`;
  }

  // 画面に出すパーツの順番（キャラづくりの画面はこの順に並ぶ）
  const PARTS = [
    { key: 'face', label: '顔の形', options: FACES },
    { key: 'skin', label: 'はだの色', options: SKINS, isColor: true },
    { key: 'eyes', label: '目', options: EYES },
    { key: 'brows', label: 'まゆ', options: BROWS },
    { key: 'nose', label: 'はな', options: NOSES },
    { key: 'mouth', label: '口', options: MOUTHS },
    { key: 'hair', label: 'かみがた', options: HAIRS },
    { key: 'hairColor', label: 'かみの色', options: HAIR_COLORS, isColor: true },
  ];

  const DEFAULT = { face: 0, skin: 1, eyes: 0, brows: 0, nose: 0, mouth: 0, hair: 0, hairColor: 1 };

  // 足りない・おかしい値があっても、こわれずに描けるように直す
  function normalize(a) {
    const out = {};
    PARTS.forEach((p) => {
      const v = a && Number.isInteger(a[p.key]) ? a[p.key] : DEFAULT[p.key];
      out[p.key] = ((v % p.options.length) + p.options.length) % p.options.length;
    });
    return out;
  }

  // 色を少しこくする（かげ用）
  function darken(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (c) => Math.max(0, Math.round(c * (1 - amt)));
    const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // キャラの SVG を文字列で返す
  // opts.title: 読み上げ用の名前
  // opts.equipped（または avatar.equipped）: { head: 'アクセサリーid', face: 'アクセサリーid' }
  function render(avatar, opts) {
    const a = normalize(avatar);
    const o = opts || {};
    const skin = SKINS[a.skin].color;
    const hairC = HAIR_COLORS[a.hairColor].color;
    const hair = HAIRS[a.hair];
    const face = FACES[a.face];
    const stroke = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"`;
    const faceAttr = `fill="${skin}" ${stroke}`;

    let s = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"${o.title ? ' role="img" aria-label="' + escapeAttr(o.title) + '"' : ' aria-hidden="true"'}>`;
    // うしろがみ
    if (hair.back) s += `<g fill="${darken(hairC, 0.12)}" ${stroke}>${hair.back}</g>`;
    // 耳
    s += `<circle cx="42" cy="122" r="12" fill="${skin}" ${stroke}/><circle cx="158" cy="122" r="12" fill="${skin}" ${stroke}/>`;
    // 顔
    s += face.svg(faceAttr);
    // ほっぺ
    s += '<ellipse cx="68" cy="138" rx="10" ry="6.5" fill="#ff7fa0" opacity=".45"/><ellipse cx="132" cy="138" rx="10" ry="6.5" fill="#ff7fa0" opacity=".45"/>';
    // まゆ・目・はな・口
    s += BROWS[a.brows].svg(78, 98, -1) + BROWS[a.brows].svg(122, 98, 1);
    s += EYES[a.eyes].svg(78, 117, -1) + EYES[a.eyes].svg(122, 117, 1);
    s += NOSES[a.nose].svg();
    s += MOUTHS[a.mouth].svg();
    // 前がみ
    s += `<path d="${hair.front}" fill="${hairC}" ${stroke}/>`;
    if (!hair.noShine) s += '<path d="M70 54 Q86 45 106 47" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="6" stroke-linecap="round"/>';
    if (hair.extra) s += hair.extra;
    // アクセサリー（顔 → 頭 の順に重ねる）
    const eq = o.equipped || (avatar && avatar.equipped) || {};
    const ctx = { hairC };
    ['face', 'head'].forEach((slot) => {
      const x = getAccessory(eq[slot]);
      if (x && x.slot === slot) s += x.svg(ctx);
    });
    s += '</svg>';
    return s;
  }

  function escapeAttr(t) {
    return String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function random() {
    const a = {};
    PARTS.forEach((p) => { a[p.key] = Math.floor(Math.random() * p.options.length); });
    return a;
  }

  // ---------- この iPad に保存 ----------
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? normalize(JSON.parse(raw)) : null;
    } catch (e) { return null; }
  }
  function save(a) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(a))); } catch (e) { /* 保存できなくても続ける */ }
  }
  // いまのプレイヤーのキャラ（つけているアクセサリーこみ）
  function renderCurrent(opts) {
    const eq = window.Profile && window.Profile.equipped ? window.Profile.equipped() : {};
    return render(load() || DEFAULT, Object.assign({ equipped: eq }, opts || {}));
  }

  window.Avatar = {
    PARTS, DEFAULT, ACCESSORIES, normalize, render, random, load, save, renderCurrent,
    getAccessory, ownedAccessories, nextAccessory, renderAccessoryIcon,
  };
})();
