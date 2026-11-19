// キャラクターづくりの画面（パーツ・アクセサリー）
(function () {
  const $ = (id) => document.getElementById(id);
  let current = null;   // パーツ
  let equipped = null;  // { head, face }
  let onDone = null;

  // options: { canCancel, start(はじめのパーツ), onDone({avatar, equipped} または null) }
  function open(options) {
    const o = options || {};
    onDone = o.onDone || null;
    current = Avatar.normalize(o.start || Avatar.load() || Avatar.random());
    equipped = Object.assign({ head: '', face: '' }, Profile.equipped());
    $('btn-avatar-back').hidden = !o.canCancel;
    showTab('parts');
    buildParts();
    buildAcc();
    update();
  }

  function showTab(name) {
    $('tab-parts').classList.toggle('active', name === 'parts');
    $('tab-acc').classList.toggle('active', name === 'acc');
    $('maker-parts').hidden = name !== 'parts';
    $('maker-acc').hidden = name !== 'acc';
  }

  function makeRow(label, key, onStep) {
    const row = document.createElement('div');
    row.className = 'part-row';
    row.dataset.key = key;
    row.innerHTML =
      '<span class="part-label"></span>' +
      '<button class="part-arrow" data-dir="-1" aria-label="まえ">◀</button>' +
      '<span class="part-value"><span class="part-swatch"></span><span class="part-name"></span><small class="part-num"></small></span>' +
      '<button class="part-arrow" data-dir="1" aria-label="つぎ">▶</button>';
    row.querySelector('.part-label').textContent = label;
    row.querySelectorAll('.part-arrow').forEach((b) => {
      b.addEventListener('click', () => onStep(Number(b.dataset.dir)));
    });
    return row;
  }

  function buildParts() {
    const wrap = $('maker-parts');
    wrap.innerHTML = '';
    Avatar.PARTS.forEach((p) => {
      wrap.appendChild(makeRow(p.label, p.key, (dir) => {
        const n = p.options.length;
        current[p.key] = (current[p.key] + dir + n) % n;
        Sound.play('tap');
        update(true);
      }));
    });
  }

  // つけられるもの：「なし」＋ゲットしたアクセサリー
  function choices(slot) {
    return [''].concat(Avatar.ownedAccessories(Profile.totalPoints()).filter((x) => x.slot === slot).map((x) => x.id));
  }

  function buildAcc() {
    const rows = $('acc-rows');
    rows.innerHTML = '';
    [['head', '頭'], ['face', '顔']].forEach(([slot, label]) => {
      rows.appendChild(makeRow(label, slot, (dir) => {
        const list = choices(slot);
        const i = Math.max(0, list.indexOf(equipped[slot]));
        equipped[slot] = list[(i + dir + list.length) % list.length];
        Sound.play('tap');
        update(true);
      }));
    });

    // 全部のアクセサリー（まだのものは「？」）
    const total = Profile.totalPoints();
    const grid = $('acc-grid');
    grid.innerHTML = '';
    Avatar.ACCESSORIES.forEach((x) => {
      const owned = total >= x.points;
      const b = document.createElement('button');
      b.className = 'acc-card' + (owned ? ' owned' : ' locked');
      b.disabled = !owned;
      b.innerHTML = '<span class="acc-icon"></span><span class="acc-name"></span>';
      b.querySelector('.acc-icon').innerHTML = owned ? Avatar.renderAccessoryIcon(x.id) : '<span class="acc-q">？</span>';
      b.querySelector('.acc-name').textContent = owned ? x.name : x.points.toLocaleString() + '点';
      if (owned) {
        b.addEventListener('click', () => {
          // もう一度おすと外す
          equipped[x.slot] = equipped[x.slot] === x.id ? '' : x.id;
          Sound.play('tap');
          update(true);
        });
      }
      b.dataset.id = x.id;
      grid.appendChild(b);
    });

    const next = Avatar.nextAccessory(total);
    const prev = Avatar.ACCESSORIES.filter((x) => x.points <= total).pop();
    const from = prev ? prev.points : 0;
    if (next) {
      $('acc-progress-text').innerHTML = '';
      $('acc-progress-text').append('ためた点 ', strong(total.toLocaleString()), '点 ／ つぎの「' + next.name + '」まで あと ', strong((next.points - total).toLocaleString()), '点');
      $('acc-progress-bar').style.width = Math.min(100, ((total - from) / (next.points - from)) * 100) + '%';
    } else {
      $('acc-progress-text').textContent = 'ためた点 ' + total.toLocaleString() + '点 ／ ぜんぶ ゲットしたよ！すごい！';
      $('acc-progress-bar').style.width = '100%';
    }
  }

  function strong(t) {
    const b = document.createElement('b');
    b.textContent = t;
    return b;
  }

  function update(changed) {
    const preview = $('maker-avatar');
    preview.innerHTML = Avatar.render(current, { equipped, title: 'じぶんのキャラ' });
    preview.classList.remove('boing');
    void preview.offsetWidth;
    if (changed) preview.classList.add('boing');

    Avatar.PARTS.forEach((p) => {
      const row = $('maker-parts').querySelector('[data-key="' + p.key + '"]');
      const opt = p.options[current[p.key]];
      row.querySelector('.part-name').textContent = opt.name;
      row.querySelector('.part-num').textContent = (current[p.key] + 1) + '/' + p.options.length;
      const sw = row.querySelector('.part-swatch');
      sw.hidden = !p.isColor;
      if (p.isColor) sw.style.background = opt.color;
    });

    ['head', 'face'].forEach((slot) => {
      const row = $('acc-rows').querySelector('[data-key="' + slot + '"]');
      const list = choices(slot);
      const a = Avatar.getAccessory(equipped[slot]);
      row.querySelector('.part-name').textContent = a ? a.name : 'なし';
      row.querySelector('.part-num').textContent = list.length > 1 ? (Math.max(0, list.indexOf(equipped[slot])) + 1) + '/' + list.length : '';
      row.querySelector('.part-swatch').hidden = true;
      row.querySelectorAll('.part-arrow').forEach((b) => { b.disabled = list.length <= 1; });
    });
    $('acc-grid').querySelectorAll('.acc-card').forEach((c) => {
      c.classList.toggle('wearing', equipped.head === c.dataset.id || equipped.face === c.dataset.id);
    });
  }

  function setup() {
    $('tab-parts').addEventListener('click', () => { Sound.play('tap'); showTab('parts'); });
    $('tab-acc').addEventListener('click', () => { Sound.play('tap'); showTab('acc'); });
    $('btn-random').addEventListener('click', () => {
      current = Avatar.normalize(Avatar.random());
      Sound.play('sparkle');
      update(true);
    });
    $('btn-avatar-ok').addEventListener('click', () => {
      Sound.play('correct');
      Effects.confetti(50);
      if (onDone) onDone({ avatar: Avatar.normalize(current), equipped: Object.assign({}, equipped) });
    });
    $('btn-avatar-back').addEventListener('click', () => {
      Sound.play('tap');
      if (onDone) onDone(null);
    });
  }

  window.Maker = { setup, open };
})();
