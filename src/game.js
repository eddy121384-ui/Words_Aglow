(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const levels = Array.isArray(window.WORDS_AGLOW_LEVELS) ? window.WORDS_AGLOW_LEVELS : [];

  if (!canvas || !ctx || !levels.length) {
    throw new Error('Words Aglow level data failed to load.');
  }

  const ui = {
    left: document.getElementById('leftWindButton'),
    right: document.getElementById('rightWindButton'),
    launch: document.getElementById('launchButton'),
    reset: document.getElementById('resetButton'),
    maxWind: document.getElementById('maxWindInput'),
    maxWindLabel: document.getElementById('maxWindLabel'),
    windFill: document.getElementById('windMeterFill'),
    windText: document.getElementById('windMeterText'),
    current: document.getElementById('currentCharacter'),
    next: [
      document.getElementById('nextCharacter1'),
      document.getElementById('nextCharacter2'),
      document.getElementById('nextCharacter3'),
    ],
    clears: document.getElementById('clearCount'),
    shots: document.getElementById('shotCount'),
    status: document.getElementById('statusText'),
    levelSelect: document.getElementById('levelSelect'),
    levelTitle: document.getElementById('levelTitle'),
    levelIntent: document.getElementById('levelIntent'),
    levelSubtitle: document.getElementById('levelSubtitle'),
    idiomPool: document.getElementById('idiomPoolText'),
    designHint: document.getElementById('designHintText'),
  };

  const W = canvas.width;
  const H = canvas.height;
  const SIDE = 24;
  const TOP = 28;
  const LAUNCH_Y = 553;
  const LANTERN_W = 42;
  const LANTERN_H = 50;
  const CONTACT_DISTANCE = 48;

  let levelIndex = 0;
  let currentLevel = levels[levelIndex];
  let idiomLookup = new Map();
  let lanterns = [];
  let queue = [];
  let currentCharacter = '';
  let activeLantern = null;
  let launchX = W / 2;
  let leftHeld = false;
  let rightHeld = false;
  let windState = 0;
  let shots = 0;
  let clears = 0;
  let ended = false;
  let effects = [];
  let message = '';
  let messageUntil = 0;
  let nextId = 1;
  let frameId = 0;
  let previousTime = 0;

  function sortCharacters(text) {
    return Array.from(text).sort().join('');
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function physics() {
    return currentLevel.physics;
  }

  function rules() {
    return currentLevel.rules;
  }

  function visualSwaySeed(id) {
    return (id * 0.731) % (Math.PI * 2);
  }

  function addLantern(x, y, character, anchor = false) {
    const id = nextId++;
    lanterns.push({
      id,
      x,
      y,
      character,
      anchor,
      escaping: false,
      escapeVelocity: 0,
      alpha: 1,
      swaySeed: visualSwaySeed(id),
    });
  }

  function seedBoard() {
    lanterns = [];
    nextId = 1;
    currentLevel.layout.forEach((item) => {
      addLantern(item.x, item.y, item.character, Boolean(item.anchor));
    });
  }

  function buildIdiomLookup() {
    idiomLookup = new Map(
      currentLevel.idioms.map((idiom) => [sortCharacters(idiom), idiom]),
    );
  }

  function populateLevelSelect() {
    ui.levelSelect.replaceChildren();
    levels.forEach((level, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = `Level ${level.number} · ${level.name}`;
      ui.levelSelect.append(option);
    });
    ui.levelSelect.value = String(levelIndex);
  }

  function updateLevelMeta() {
    ui.levelSelect.value = String(levelIndex);
    ui.levelTitle.textContent = currentLevel.title;
    ui.levelIntent.textContent = currentLevel.intent;
    ui.levelSubtitle.textContent = currentLevel.intent;
    ui.idiomPool.textContent = currentLevel.idioms.join('、');
    ui.designHint.textContent = currentLevel.hint;
  }

  function advanceCharacter() {
    currentCharacter = queue.shift() || '';
    updateHud();
  }

  function resetGame() {
    cancelAnimationFrame(frameId);
    currentLevel = levels[levelIndex];
    buildIdiomLookup();
    seedBoard();
    queue = currentLevel.queue.slice();
    currentCharacter = '';
    activeLantern = null;
    launchX = currentLevel.launch?.defaultX ?? W / 2;
    leftHeld = false;
    rightHeld = false;
    windState = 0;
    shots = 0;
    clears = 0;
    ended = false;
    effects = [];
    message = '';
    messageUntil = 0;
    previousTime = 0;

    ui.maxWind.value = String(Math.round(physics().maxWind * 100));
    ui.maxWindLabel.textContent = `${ui.maxWind.value}%`;

    setWindHeld('left', false);
    setWindHeld('right', false);
    updateLevelMeta();
    advanceCharacter();
    setStatus(currentLevel.hint);
    updateWindHud();
    draw();
  }

  function switchLevel(nextIndex) {
    const parsed = Number(nextIndex);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed >= levels.length) return;
    levelIndex = parsed;
    resetGame();
  }

  function updateHud() {
    ui.current.textContent = currentCharacter || '—';
    ui.next.forEach((element, index) => {
      element.textContent = queue[index] || '';
    });
    ui.clears.textContent = `${clears} / ${rules().targetClears}`;
    ui.shots.textContent = `${shots} / ${rules().maxShots}`;
    ui.launch.disabled = Boolean(activeLantern) || ended || !currentCharacter;
  }

  function setStatus(text) {
    ui.status.textContent = text;
  }

  function updateWindHud() {
    const percent = Math.round(windState * 100);
    const magnitude = Math.min(1, Math.abs(windState));
    const width = 8 + magnitude * 42;
    const left = windState < 0 ? 50 - width : 50;

    ui.windFill.style.width = `${width}%`;
    ui.windFill.style.marginLeft = `${left}%`;
    ui.windText.textContent = percent === 0
      ? '風勢 0%'
      : percent < 0
        ? `← 左風 ${Math.abs(percent)}%`
        : `右風 ${percent}% →`;
  }

  function roundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, width, height, radius);
    } else {
      ctx.rect(x, y, width, height);
    }
  }

  function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, '#162238');
    gradient.addColorStop(0.55, '#263a5d');
    gradient.addColorStop(1, '#493e52');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    ctx.beginPath();
    ctx.arc(373, 92, 33, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,245,201,.9)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(385, 81, 33, 0, Math.PI * 2);
    ctx.fillStyle = '#17233b';
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,.55)';
    [[45,90],[181,60],[302,105],[411,173],[84,192],[229,119]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.beginPath();
    ctx.moveTo(0, 575);
    ctx.lineTo(55, 525);
    ctx.lineTo(108, 555);
    ctx.lineTo(166, 505);
    ctx.lineTo(231, 554);
    ctx.lineTo(294, 517);
    ctx.lineTo(356, 548);
    ctx.lineTo(418, 510);
    ctx.lineTo(W, 547);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = 'rgba(13,23,33,.80)';
    ctx.fill();

    const failY = rules().failY;
    ctx.save();
    ctx.setLineDash([7, 7]);
    ctx.strokeStyle = 'rgba(255,105,105,.42)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, failY);
    ctx.lineTo(W - 12, failY);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = 'rgba(255,195,195,.8)';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('失敗線', 14, failY - 8);

    ctx.fillStyle = 'rgba(255,255,255,.08)';
    roundedRect(SIDE, 586, W - SIDE * 2, 55, 15);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.58)';
    ctx.textAlign = 'center';
    ctx.fillText('點這裡選放燈位置', W / 2, 616);
  }

  function lanternColors(character) {
    const number = character.codePointAt(0) || 0;
    return [
      ['#ffe9a8', '#d78647'],
      ['#ffdabc', '#c86c4e'],
      ['#f9dfbf', '#b97952'],
      ['#ffe4cf', '#cc8068'],
    ][number % 4];
  }

  function drawLantern(lantern, active = false) {
    const [paper, edge] = lanternColors(lantern.character);
    const sway = Math.sin(performance.now() / 560 + lantern.swaySeed) * 2;
    const x = lantern.x + sway;
    const y = lantern.y;

    ctx.save();
    ctx.globalAlpha = lantern.alpha ?? 1;
    ctx.shadowColor = 'rgba(255,170,65,.45)';
    ctx.shadowBlur = active ? 18 : 10;

    const gradient = ctx.createLinearGradient(x, y - LANTERN_H / 2, x, y + LANTERN_H / 2);
    gradient.addColorStop(0, paper);
    gradient.addColorStop(0.72, '#ffd089');
    gradient.addColorStop(1, edge);
    roundedRect(x - LANTERN_W / 2, y - LANTERN_H / 2, LANTERN_W, LANTERN_H, 9);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(86,48,28,.55)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#2c211b';
    ctx.font = '700 21px system-ui, "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lantern.character, x, y - 1);

    ctx.beginPath();
    ctx.moveTo(x - 7, y + LANTERN_H / 2);
    ctx.lineTo(x, y + LANTERN_H / 2 + 9);
    ctx.lineTo(x + 7, y + LANTERN_H / 2);
    ctx.closePath();
    ctx.fillStyle = '#78412e';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y + LANTERN_H / 2 + 4, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe1a0';
    ctx.fill();
    ctx.restore();
  }

  function drawWindLines() {
    if (!activeLantern || Math.abs(windState) < 0.03) return;
    const direction = Math.sign(windState);
    const magnitude = Math.abs(windState);
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.45 * magnitude;
    ctx.strokeStyle = '#eaf4ff';
    ctx.lineWidth = 2;

    for (let i = 0; i < 4; i += 1) {
      const y = activeLantern.y - 35 + i * 23;
      ctx.beginPath();
      if (direction > 0) {
        ctx.moveTo(15, y);
        ctx.bezierCurveTo(70, y - 8, 125, y + 8, 180, y);
      } else {
        ctx.moveTo(W - 15, y);
        ctx.bezierCurveTo(W - 70, y - 8, W - 125, y + 8, W - 180, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawEffects() {
    for (const effect of effects) {
      ctx.save();
      ctx.globalAlpha = effect.alpha;
      ctx.fillStyle = effect.color;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawEndOverlay() {
    if (!ended) return;
    const won = clears >= rules().targetClears;
    ctx.fillStyle = 'rgba(7,14,27,.60)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = '800 30px system-ui, "Noto Sans TC", sans-serif';
    ctx.fillText(won ? `Level ${currentLevel.number} 過關！` : '本局結束', W / 2, 300);
    ctx.font = '16px system-ui, "Noto Sans TC", sans-serif';
    ctx.fillText(won ? currentLevel.name : '碰到失敗線、字用完，或超過放燈上限。', W / 2, 336);
  }

  function draw() {
    drawSky();
    lanterns.forEach((lantern) => drawLantern(lantern));
    if (activeLantern) drawLantern(activeLantern, true);
    drawWindLines();

    if (!activeLantern && !ended && currentCharacter) {
      ctx.beginPath();
      ctx.moveTo(launchX, 578);
      ctx.lineTo(launchX - 8, 590);
      ctx.lineTo(launchX + 8, 590);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,235,180,.9)';
      ctx.fill();
      drawLantern({
        x: launchX,
        y: 560,
        character: currentCharacter,
        swaySeed: 0,
        alpha: 0.75,
      }, true);
    }

    drawEffects();

    if (message && performance.now() < messageUntil) {
      ctx.textAlign = 'center';
      ctx.font = '800 28px system-ui, "Noto Sans TC", sans-serif';
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(20,20,20,.55)';
      ctx.strokeText(message, W / 2, 563);
      ctx.fillStyle = '#fff0bb';
      ctx.fillText(message, W / 2, 563);
    }

    drawEndOverlay();
  }

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * W / rect.width,
      y: (event.clientY - rect.top) * H / rect.height,
    };
  }

  function chooseLaunchPosition(event) {
    if (activeLantern || ended) return;
    const point = canvasPoint(event);
    if (point.y < 540) return;
    launchX = Math.max(54, Math.min(W - 54, point.x));
    draw();
  }

  function launchLantern() {
    if (activeLantern || ended || !currentCharacter) return;

    const id = nextId++;
    activeLantern = {
      id,
      x: launchX,
      y: LAUNCH_Y,
      character: currentCharacter,
      vx: 0,
      vy: -physics().riseSpeed,
      swaySeed: visualSwaySeed(id),
      contactTime: 0,
      alpha: 1,
    };

    shots += 1;
    advanceCharacter();
    setStatus('A / D 控風；越接近燈群，上升會越慢。提早反吹比最後一秒硬拉有效。');
    previousTime = performance.now();
    frameId = requestAnimationFrame(step);
  }

  function nearestLanternDistance() {
    if (!activeLantern) return Infinity;
    let nearest = Infinity;
    for (const lantern of lanterns) {
      if (lantern.escaping) continue;
      nearest = Math.min(nearest, distance(activeLantern, lantern));
    }
    return nearest;
  }

  function step(timestamp) {
    const dt = Math.min((timestamp - previousTime) / 16.6667, 1.7);
    previousTime = timestamp;

    updateEffects(dt);
    updateEscapingLanterns(dt);

    const config = physics();
    const targetWind = (rightHeld ? 1 : 0) - (leftHeld ? 1 : 0);
    const rampRate = targetWind === 0 ? config.windRampDown : config.windRampUp;
    windState += (targetWind - windState) * rampRate * dt;
    if (Math.abs(windState) < 0.008) windState = 0;
    updateWindHud();

    if (activeLantern) {
      const maxWind = Number(ui.maxWind.value) / 100;
      activeLantern.vx += windState * config.windAcceleration * maxWind * dt;
      activeLantern.vx *= Math.pow(config.horizontalDrag, dt);
      activeLantern.vx = Math.max(
        -config.maxHorizontalSpeed,
        Math.min(config.maxHorizontalSpeed, activeLantern.vx),
      );

      const nearest = nearestLanternDistance();
      let desiredRiseSpeed = -config.riseSpeed;
      if (nearest < config.nearSlowdownDistance) {
        desiredRiseSpeed = -config.nearRiseSpeed;
      } else if (nearest < config.midSlowdownDistance) {
        desiredRiseSpeed = -config.midRiseSpeed;
      }
      activeLantern.vy += (desiredRiseSpeed - activeLantern.vy) * config.riseResponse * dt;

      activeLantern.x += activeLantern.vx * dt;
      activeLantern.y += activeLantern.vy * dt;

      if (activeLantern.x < SIDE + 25) {
        activeLantern.x = SIDE + 25;
        activeLantern.vx = Math.abs(activeLantern.vx) * 0.35;
      }
      if (activeLantern.x > W - SIDE - 25) {
        activeLantern.x = W - SIDE - 25;
        activeLantern.vx = -Math.abs(activeLantern.vx) * 0.35;
      }

      let contacts = 0;
      for (const lantern of lanterns) {
        if (lantern.escaping) continue;
        let dx = activeLantern.x - lantern.x;
        let dy = activeLantern.y - lantern.y;
        let d = Math.hypot(dx, dy);
        if (d >= CONTACT_DISTANCE) continue;

        if (d < 0.01) {
          dx = 0.01;
          dy = 0;
          d = 0.01;
        }

        const nx = dx / d;
        const ny = dy / d;
        activeLantern.x = lantern.x + nx * CONTACT_DISTANCE;
        activeLantern.y = lantern.y + ny * CONTACT_DISTANCE;

        const normalVelocity = activeLantern.vx * nx + activeLantern.vy * ny;
        if (normalVelocity < 0) {
          activeLantern.vx -= normalVelocity * nx * 0.88;
          activeLantern.vy -= normalVelocity * ny * 0.88;
        }
        activeLantern.vx *= 0.955;
        activeLantern.vy *= 0.9;
        contacts += 1;
      }

      if (contacts) {
        activeLantern.contactTime += dt;
        if (activeLantern.contactTime > 22 && Math.hypot(activeLantern.vx, activeLantern.vy) < 1) {
          attachActiveLantern();
        }
      } else {
        activeLantern.contactTime = Math.max(0, activeLantern.contactTime - dt * 0.65);
      }

      if (activeLantern && activeLantern.y < TOP + 30) {
        attachActiveLantern(true);
      }
    }

    checkEndConditions();
    draw();

    if (!ended && (
      activeLantern
      || lanterns.some((lantern) => lantern.escaping)
      || effects.length
      || Math.abs(windState) > 0.01
    )) {
      frameId = requestAnimationFrame(step);
    }
  }

  function attachActiveLantern(anchor = false) {
    if (!activeLantern) return;
    const lantern = activeLantern;
    activeLantern = null;

    lanterns.push({
      id: lantern.id,
      x: lantern.x,
      y: lantern.y,
      character: lantern.character,
      anchor: anchor || lantern.y < 92,
      escaping: false,
      escapeVelocity: 0,
      alpha: 1,
      swaySeed: lantern.swaySeed,
    });

    const placed = lanterns.at(-1);
    const match = findMatchIncluding(placed);
    if (match) {
      burnMatch(match);
    } else {
      setStatus(`「${placed.character}」纏住了。下一盞是「${currentCharacter || '—'}」。`);
    }

    updateHud();
  }

  function adjacent(a, b) {
    return distance(a, b) <= 61;
  }

  function nearbyLanterns(start) {
    const result = [];
    const seen = new Set([start.id]);
    const searchQueue = [{ lantern: start, depth: 0 }];

    while (searchQueue.length) {
      const current = searchQueue.shift();
      result.push(current.lantern);
      if (current.depth >= 3) continue;

      for (const lantern of lanterns) {
        if (lantern.escaping || seen.has(lantern.id)) continue;
        if (!adjacent(current.lantern, lantern)) continue;
        seen.add(lantern.id);
        searchQueue.push({ lantern, depth: current.depth + 1 });
      }
    }
    return result;
  }

  function comboConnected(combo) {
    const seen = new Set([combo[0].id]);
    const searchQueue = [combo[0]];

    while (searchQueue.length) {
      const current = searchQueue.shift();
      for (const candidate of combo) {
        if (seen.has(candidate.id)) continue;
        if (!adjacent(current, candidate)) continue;
        seen.add(candidate.id);
        searchQueue.push(candidate);
      }
    }
    return seen.size === 4;
  }

  function findMatchIncluding(start) {
    const candidates = nearbyLanterns(start);
    const others = candidates.filter((lantern) => lantern.id !== start.id);

    for (let i = 0; i < others.length - 2; i += 1) {
      for (let j = i + 1; j < others.length - 1; j += 1) {
        for (let k = j + 1; k < others.length; k += 1) {
          const combo = [start, others[i], others[j], others[k]];
          if (!comboConnected(combo)) continue;
          const key = sortCharacters(combo.map((lantern) => lantern.character).join(''));
          const idiom = idiomLookup.get(key);
          if (idiom) return { idiom, lanterns: combo };
        }
      }
    }
    return null;
  }

  function burnMatch(match) {
    clears += 1;
    message = `🔥 ${match.idiom}`;
    messageUntil = performance.now() + 1500;
    setStatus(`完成「${match.idiom}」！失去連結的天燈會升空離場。`);

    const burnedIds = new Set(match.lanterns.map((lantern) => lantern.id));
    for (const lantern of match.lanterns) {
      for (let i = 0; i < 12; i += 1) {
        effects.push({
          x: lantern.x + (Math.random() - 0.5) * 22,
          y: lantern.y + (Math.random() - 0.5) * 25,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -0.5 - Math.random() * 1.2,
          radius: 1 + Math.random() * 2.5,
          alpha: 1,
          color: Math.random() > 0.4 ? '#ffb35c' : '#ffe2a1',
        });
      }
    }

    lanterns = lanterns.filter((lantern) => !burnedIds.has(lantern.id));
    releaseDisconnectedLanterns();
    updateHud();
  }

  function releaseDisconnectedLanterns() {
    const live = lanterns.filter((lantern) => !lantern.escaping);
    const anchors = live.filter((lantern) => lantern.anchor || lantern.y < 95);
    const seen = new Set(anchors.map((lantern) => lantern.id));
    const searchQueue = anchors.slice();

    while (searchQueue.length) {
      const current = searchQueue.shift();
      for (const candidate of live) {
        if (seen.has(candidate.id)) continue;
        if (!adjacent(current, candidate)) continue;
        seen.add(candidate.id);
        searchQueue.push(candidate);
      }
    }

    for (const lantern of live) {
      if (!seen.has(lantern.id)) {
        lantern.escaping = true;
        lantern.escapeVelocity = -1.0;
      }
    }
  }

  function updateEscapingLanterns(dt) {
    for (const lantern of lanterns) {
      if (!lantern.escaping) continue;
      lantern.y += lantern.escapeVelocity * dt;
      lantern.x += Math.sin(performance.now() / 430 + lantern.swaySeed) * 0.16 * dt;
      lantern.alpha -= 0.0035 * dt;
    }
    lanterns = lanterns.filter((lantern) => !lantern.escaping || lantern.alpha > 0);
  }

  function updateEffects(dt) {
    for (const effect of effects) {
      effect.x += effect.vx * dt;
      effect.y += effect.vy * dt;
      effect.alpha -= 0.025 * dt;
    }
    effects = effects.filter((effect) => effect.alpha > 0);
  }

  function checkEndConditions() {
    if (ended) return;
    if (clears >= rules().targetClears) {
      ended = true;
      activeLantern = null;
      updateHud();
      return;
    }
    if (shots >= rules().maxShots && !activeLantern) {
      ended = true;
      updateHud();
      return;
    }
    if (!currentCharacter && !activeLantern && clears < rules().targetClears) {
      ended = true;
      setStatus('本關字序已用完。');
      updateHud();
      return;
    }
    for (const lantern of lanterns) {
      if (!lantern.escaping && lantern.y + LANTERN_H / 2 >= rules().failY) {
        ended = true;
        activeLantern = null;
        setStatus('燈群碰到失敗線。');
        updateHud();
        return;
      }
    }
  }

  function setWindHeld(direction, value) {
    if (direction === 'left') {
      leftHeld = value;
      ui.left.classList.toggle('active', value);
    } else {
      rightHeld = value;
      ui.right.classList.toggle('active', value);
    }
  }

  function bindHoldButton(button, direction) {
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      setWindHeld(direction, true);
    });
    const release = (event) => {
      event?.preventDefault?.();
      setWindHeld(direction, false);
    };
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', (event) => {
      if (event.buttons === 0) release(event);
    });
  }

  function shouldIgnoreKeyboard(event) {
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
  }

  window.addEventListener('keydown', (event) => {
    if (shouldIgnoreKeyboard(event)) return;
    if (event.code === 'KeyA') {
      setWindHeld('left', true);
      event.preventDefault();
    } else if (event.code === 'KeyD') {
      setWindHeld('right', true);
      event.preventDefault();
    } else if (event.code === 'Space') {
      if (!event.repeat) launchLantern();
      event.preventDefault();
    }
  });

  window.addEventListener('keyup', (event) => {
    if (event.code === 'KeyA') setWindHeld('left', false);
    if (event.code === 'KeyD') setWindHeld('right', false);
  });

  window.addEventListener('blur', () => {
    setWindHeld('left', false);
    setWindHeld('right', false);
  });

  bindHoldButton(ui.left, 'left');
  bindHoldButton(ui.right, 'right');
  canvas.addEventListener('pointerdown', chooseLaunchPosition);
  ui.launch.addEventListener('click', launchLantern);
  ui.reset.addEventListener('click', resetGame);
  ui.levelSelect.addEventListener('change', (event) => switchLevel(event.target.value));
  ui.maxWind.addEventListener('input', () => {
    ui.maxWindLabel.textContent = `${ui.maxWind.value}%`;
  });

  populateLevelSelect();
  resetGame();
})();
