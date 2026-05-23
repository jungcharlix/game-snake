// snake-game.jsx — Snake with levels, coins, shop & skins.
// Components and engine exported to window for use by main HTML.

const DIRS = {
  up:    { x: 0, y: -1 },
  down:  { x: 0, y: 1 },
  left:  { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

const THEMES = {
  cream: {
    name: 'Cream',
    appBg: '#EFE9DC',
    boardBg: '#F5F1E8',
    boardLine: 'rgba(26,26,26,0.05)',
    boardBorder: '#1A1A1A',
    ink: '#1A1A1A',
    mute: 'rgba(26,26,26,0.55)',
    snake: '#2E7D4F',
    snakeDark: '#1F5A38',
    snakeEye: '#F5F1E8',
    food: '#D8593B',
    foodGlow: 'rgba(216,89,59,0.25)',
    badge: '#1A1A1A',
    badgeText: '#F5F1E8',
    button: '#1A1A1A',
    buttonText: '#F5F1E8',
    chipBg: 'rgba(26,26,26,0.06)',
    coin: '#E5A52B',
    coinDark: '#8C5E10',
  },
  midnight: {
    name: 'Midnight',
    appBg: '#0B0F14',
    boardBg: '#0F1620',
    boardLine: 'rgba(255,255,255,0.04)',
    boardBorder: '#1F2A38',
    ink: '#EAF2FF',
    mute: 'rgba(234,242,255,0.55)',
    snake: '#5CF2B0',
    snakeDark: '#2BB987',
    snakeEye: '#0B0F14',
    food: '#FF5FA8',
    foodGlow: 'rgba(255,95,168,0.35)',
    badge: '#5CF2B0',
    badgeText: '#0B0F14',
    button: '#1A2532',
    buttonText: '#EAF2FF',
    chipBg: 'rgba(255,255,255,0.06)',
    coin: '#FFD24A',
    coinDark: '#9A6E00',
  },
  paper: {
    name: 'Paper',
    appBg: '#FBFAF6',
    boardBg: '#FFFFFF',
    boardLine: 'rgba(26,26,26,0.08)',
    boardBorder: '#1A1A1A',
    ink: '#1A1A1A',
    mute: 'rgba(26,26,26,0.55)',
    snake: '#1A1A1A',
    snakeDark: '#000',
    snakeEye: '#FFFFFF',
    food: '#C8362A',
    foodGlow: 'rgba(200,54,42,0.18)',
    badge: '#C8362A',
    badgeText: '#FFFFFF',
    button: '#1A1A1A',
    buttonText: '#FFFFFF',
    chipBg: 'rgba(26,26,26,0.05)',
    coin: '#D4A017',
    coinDark: '#5C3D00',
  },
};

const GRID_PRESETS = {
  small:  { cols: 12, rows: 14, label: '12×14' },
  medium: { cols: 15, rows: 18, label: '15×18' },
  large:  { cols: 18, rows: 22, label: '18×22' },
};

const DIFFICULTY_PRESETS = {
  easy:    { startMs: 280, perLevel: 3,  minMs: 180, label: '簡單',   sub: 'EASY' },
  normal:  { startMs: 170, perLevel: 6,  minMs: 90,  label: '一般',   sub: 'NORMAL' },
  hard:    { startMs: 130, perLevel: 8,  minMs: 60,  label: '困難',   sub: 'HARD' },
  extreme: { startMs: 95,  perLevel: 10, minMs: 40,  label: '超困難', sub: 'EXTREME' },
};

// ─────────────────────────────────────────────────────────────
// Skins ("包裝") — overlay snake colors on top of theme
// ─────────────────────────────────────────────────────────────
const SKINS = {
  classic:  { name: '經典',     sub: 'CLASSIC',   price: 0,    snake: null,        snakeDark: null,      tag: '預設' },
  shadow:   { name: '暗影',     sub: 'SHADOW',    price: 50,   snake: '#5A5A5A', snakeDark: '#1A1A1A', tag: '沉穩' },
  mint:     { name: '薄荷',     sub: 'MINT',      price: 90,   snake: '#6EE7B7', snakeDark: '#0E9F6E', tag: '清新' },
  cherry:   { name: '櫻花',     sub: 'CHERRY',    price: 150,  snake: '#FFB1C8', snakeDark: '#C0436C', tag: '浪漫' },
  ocean:    { name: '海洋',     sub: 'OCEAN',     price: 240,  snake: '#3DB1F2', snakeDark: '#0E5C8C', tag: '涼感' },
  lavender: { name: '薰衣草',   sub: 'LAVENDER',  price: 320,  snake: '#B69CF0', snakeDark: '#6B47D6', tag: '優雅' },
  berry:    { name: '莓果',     sub: 'BERRY',     price: 420,  snake: '#E879C8', snakeDark: '#86198F', tag: '甜美' },
  peach:    { name: '蜜桃',     sub: 'PEACH',     price: 540,  snake: '#FFB18B', snakeDark: '#C04E2A', tag: '溫暖' },
  ember:    { name: '烈焰',     sub: 'EMBER',     price: 660,  snake: '#FF8A4C', snakeDark: '#9B2C0F', tag: '熱血' },
  moss:     { name: '苔蘚',     sub: 'MOSS',      price: 800,  snake: '#8DA756', snakeDark: '#3D5723', tag: '質感' },
  ice:      { name: '寒冰',     sub: 'ICE',       price: 980,  snake: '#BEEFFF', snakeDark: '#4A9FCB', tag: '冰晶' },
  ruby:     { name: '寶石',     sub: 'RUBY',      price: 1200, snake: '#FF5275', snakeDark: '#8B0F2A', tag: '高貴' },
  aurora:   { name: '極光',     sub: 'AURORA',    price: 1500, snake: '#7CFAE5', snakeDark: '#4F46E5', tag: '稀有' },
  neon:     { name: '霓虹',     sub: 'NEON',      price: 2000, snake: '#FF36F0', snakeDark: '#00E5FF', tag: '街頭' },
  golden:   { name: '黃金',     sub: 'GOLDEN',    price: 2800, snake: '#FACC15', snakeDark: '#A16207', tag: '尊爵' },
  cosmic:   { name: '星河',     sub: 'COSMIC',    price: 3500, snake: '#A78BFA', snakeDark: '#312E81', tag: '宇宙' },
  rainbow:  { name: '彩虹',     sub: 'RAINBOW',   price: 5000, snake: '#FF3DAA', snakeDark: '#3DCBFF', tag: '傳說' },
};

const FOOD_PER_LEVEL = 5;

// Get effective colors (skin override theme)
function resolveColors(theme, skinKey) {
  const skin = SKINS[skinKey] || SKINS.classic;
  return {
    ...theme,
    snake: skin.snake || theme.snake,
    snakeDark: skin.snakeDark || theme.snakeDark,
  };
}

// ─────────────────────────────────────────────────────────────
// Game engine hook
// ─────────────────────────────────────────────────────────────
function useSnakeGame({ cols, rows, difficulty, accelMode, onCoinEat, onLevelUp, onBonusStart, onBonusEnd }) {
  const [snake, setSnake] = React.useState(() => initialSnake(cols, rows));
  const [dir, setDir] = React.useState('right');
  const [food, setFood] = React.useState(() => ({ x: Math.floor(cols * 0.75), y: Math.floor(rows / 2) }));
  const [coin, setCoin] = React.useState(null);     // {x, y, life}
  const [star, setStar] = React.useState(null);     // {x, y, life}
  const [score, setScore] = React.useState(0);
  const [status, setStatus] = React.useState('idle');
  const [combo, setCombo] = React.useState(0);
  const [tickN, setTickN] = React.useState(0);
  const [lastEatTick, setLastEatTick] = React.useState(0);
  const [level, setLevel] = React.useState(1);
  const [foodInLevel, setFoodInLevel] = React.useState(0);
  const [coinsEarned, setCoinsEarned] = React.useState(0);
  const [foodEaten, setFoodEaten] = React.useState(0);
  const [levelFlash, setLevelFlash] = React.useState(0);
  const [foodSinceStar, setFoodSinceStar] = React.useState(0);

  // ── Bonus mode state ──
  const [mode, setMode] = React.useState('normal'); // 'normal' | 'bonus'
  const [bonusCoins, setBonusCoins] = React.useState([]); // [{x, y, id}]
  const [bonusEndAt, setBonusEndAt] = React.useState(0);
  const [bonusCollected, setBonusCollected] = React.useState(0);
  const [bonusFlash, setBonusFlash] = React.useState(0);
  const [nowTs, setNowTs] = React.useState(Date.now());

  const dirRef = React.useRef(dir);
  const queuedDirRef = React.useRef(null);
  const bonusIdRef = React.useRef(0);
  React.useEffect(() => { dirRef.current = dir; }, [dir]);

  function initialSnake(c, r) {
    const cy = Math.floor(r / 2);
    const cx = Math.floor(c / 4);
    return [{ x: cx + 2, y: cy }, { x: cx + 1, y: cy }, { x: cx, y: cy }];
  }

  function placeAvoiding(c, r, occupiedKeys) {
    let attempts = 0;
    while (attempts < 500) {
      const x = Math.floor(Math.random() * c);
      const y = Math.floor(Math.random() * r);
      if (!occupiedKeys.has(x + ',' + y)) return { x, y };
      attempts++;
    }
    return { x: 0, y: 0 };
  }

  function reset() {
    const s = initialSnake(cols, rows);
    setSnake(s);
    setDir('right');
    dirRef.current = 'right';
    queuedDirRef.current = null;
    const occ = new Set(s.map(p => p.x + ',' + p.y));
    setFood(placeAvoiding(cols, rows, occ));
    setCoin(null);
    setStar(null);
    setScore(0);
    setCombo(0);
    setTickN(0);
    setLastEatTick(0);
    setLevel(1);
    setFoodInLevel(0);
    setCoinsEarned(0);
    setFoodEaten(0);
    setFoodSinceStar(0);
    setMode('normal');
    setBonusCoins([]);
    setBonusEndAt(0);
    setBonusCollected(0);
    setStatus('ready');
  }

  // Ready → playing after a short grace period so the player doesn't die
  // the instant the game starts.
  React.useEffect(() => {
    if (status !== 'ready') return;
    const t = setTimeout(() => setStatus('playing'), 1200);
    return () => clearTimeout(t);
  }, [status]);

  function start()  { if (status === 'idle' || status === 'over') reset(); else if (status === 'paused' || status === 'ready') setStatus('playing'); }
  function pause()  { if (status === 'playing') setStatus('paused'); }
  function resume() { if (status === 'paused')  setStatus('playing'); }

  function changeDir(next) {
    if (!DIRS[next]) return;
    const cur = dirRef.current;
    if (next === OPPOSITE[cur]) return;
    if (next === cur) return;
    queuedDirRef.current = next;
  }

  // Speed: bonus mode keeps a brisk pace; normal speed accelerates each level
  // toward the difficulty's floor. In 'fixed' mode the per-level acceleration
  // is ignored so speed stays at startMs forever.
  const perLevel = accelMode === 'fixed' ? 0 : difficulty.perLevel;
  const speed = mode === 'bonus'
    ? Math.max(80, difficulty.startMs - 40)
    : Math.max(difficulty.minMs, difficulty.startMs - (level - 1) * perLevel);

  React.useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(() => {
      setNowTs(Date.now());

      // End bonus mode if expired
      if (mode === 'bonus' && Date.now() >= bonusEndAt) {
        setSnake(prev => {
          const occ = new Set(prev.map(p => p.x + ',' + p.y));
          setFood(placeAvoiding(cols, rows, occ));
          setMode('normal');
          setBonusCoins([]);
          setBonusEndAt(0);
          if (onBonusEnd) onBonusEnd(bonusCollected);
          return prev;
        });
        setTickN(t => t + 1);
        return;
      }

      setSnake(prev => {
        const q = queuedDirRef.current;
        let activeDir = dirRef.current;
        if (q && q !== OPPOSITE[activeDir]) {
          activeDir = q;
          dirRef.current = q;
          queuedDirRef.current = null;
          setDir(q);
        }
        const d = DIRS[activeDir];
        const head = prev[0];
        let nx = head.x + d.x;
        let ny = head.y + d.y;

        // ── BONUS MODE TICK ──
        if (mode === 'bonus') {
          nx = (nx + cols) % cols;
          ny = (ny + rows) % rows;
          const newHead = { x: nx, y: ny };

          // Eat bonus coin(s) at this position
          const hitIdx = bonusCoins.findIndex(c => c.x === nx && c.y === ny);
          if (hitIdx !== -1) {
            const hit = bonusCoins[hitIdx];
            setCoinsEarned(c => c + 5);
            setBonusCollected(c => c + 1);
            if (onCoinEat) onCoinEat(5, { x: hit.x, y: hit.y });
            setBonusCoins(curr => {
              const moved = [newHead, ...prev.slice(0, -1)];
              const occ = new Set(moved.map(p => p.x + ',' + p.y));
              curr.forEach((c, i) => { if (i !== hitIdx) occ.add(c.x + ',' + c.y); });
              const p = placeAvoiding(cols, rows, occ);
              return curr.map((c, i) => i === hitIdx ? { x: p.x, y: p.y, id: ++bonusIdRef.current } : c);
            });
          }
          return [newHead, ...prev.slice(0, -1)];
        }

        // ── NORMAL MODE TICK ──
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) {
          setStatus('over');
          return prev;
        }
        for (let i = 0; i < prev.length - 1; i++) {
          if (prev[i].x === nx && prev[i].y === ny) {
            setStatus('over');
            return prev;
          }
        }
        const newHead = { x: nx, y: ny };

        // Coin pickup
        if (coin && nx === coin.x && ny === coin.y) {
          setCoinsEarned(c => c + 5);
          if (onCoinEat) onCoinEat(5, { x: coin.x, y: coin.y });
          setCoin(null);
        }

        // Star pickup — trigger BONUS ROUND
        if (star && nx === star.x && ny === star.y) {
          const moved = [newHead, ...prev.slice(0, -1)];
          const occ = new Set(moved.map(p => p.x + ',' + p.y));
          const coins = [];
          const numCoins = Math.min(28, Math.max(14, Math.floor((cols * rows) / 14)));
          for (let i = 0; i < numCoins; i++) {
            const p = placeAvoiding(cols, rows, occ);
            coins.push({ x: p.x, y: p.y, id: ++bonusIdRef.current });
            occ.add(p.x + ',' + p.y);
          }
          setBonusCoins(coins);
          setBonusEndAt(Date.now() + 10000);
          setBonusCollected(0);
          setMode('bonus');
          setBonusFlash(f => f + 1);
          setStar(null);
          setCoin(null);
          setFoodSinceStar(0);
          if (onBonusStart) onBonusStart();
          return moved;
        }

        let next;
        if (nx === food.x && ny === food.y) {
          next = [newHead, ...prev];
          setScore(s => s + 10 + Math.min(combo, 9));
          setCombo(c => c + 1);
          setLastEatTick(tickN);
          setFoodEaten(f => f + 1);

          const newFoodInLevel = foodInLevel + 1;
          if (newFoodInLevel >= FOOD_PER_LEVEL) {
            setLevel(l => {
              const newLevel = l + 1;
              setLevelFlash(f => f + 1);
              if (onLevelUp) onLevelUp(newLevel);
              return newLevel;
            });
            setFoodInLevel(0);
          } else {
            setFoodInLevel(newFoodInLevel);
          }

          // Place new food
          const occ = new Set(next.map(p => p.x + ',' + p.y));
          if (coin) occ.add(coin.x + ',' + coin.y);
          if (star) occ.add(star.x + ',' + star.y);
          setFood(placeAvoiding(cols, rows, occ));

          // Coin spawn (35%)
          if (!coin && Math.random() < 0.35) {
            const occ2 = new Set(next.map(p => p.x + ',' + p.y));
            if (star) occ2.add(star.x + ',' + star.y);
            const fp = placeAvoiding(cols, rows, occ2);
            setCoin({ x: fp.x, y: fp.y, life: 80 });
          }

          // Star spawn — after 5+ food without star and currently no star, ~35% chance
          setFoodSinceStar(fs => {
            const newFs = fs + 1;
            if (!star && newFs >= 5 && Math.random() < 0.35) {
              const occ3 = new Set(next.map(p => p.x + ',' + p.y));
              if (coin) occ3.add(coin.x + ',' + coin.y);
              const p = placeAvoiding(cols, rows, occ3);
              setStar({ x: p.x, y: p.y, life: 120 });
              return 0;
            }
            return newFs;
          });
        } else {
          next = [newHead, ...prev.slice(0, -1)];
          if (tickN - lastEatTick > Math.max(20, 60 - combo * 4)) setCombo(0);
        }

        return next;
      });

      // Decay coin/star life only in normal mode
      if (mode === 'normal') {
        setCoin(c => c && c.life > 1 ? { ...c, life: c.life - 1 } : null);
        setStar(s => s && s.life > 1 ? { ...s, life: s.life - 1 } : null);
      }

      setTickN(t => t + 1);
    }, speed);
    return () => clearInterval(id);
  }, [status, speed, cols, rows, food.x, food.y, coin, star, combo, tickN, lastEatTick,
      foodInLevel, mode, bonusEndAt, bonusCoins, bonusCollected, difficulty, accelMode]);

  const bonusTimeLeft = mode === 'bonus' ? Math.max(0, (bonusEndAt - nowTs) / 1000) : 0;

  return {
    snake, dir, food, coin, star, score, status, combo, level, foodInLevel,
    coinsEarned, foodEaten, speed, levelFlash, bonusFlash,
    mode, bonusCoins, bonusTimeLeft, bonusCollected,
    start, pause, resume, changeDir, reset,
  };
}

// ─────────────────────────────────────────────────────────────
// Board
// ─────────────────────────────────────────────────────────────
function Board({
  theme, cols, rows, snake, food, coin, star, status, dir, size, onSwipe,
  levelFlashKey, bonusFlashKey, mode, bonusCoins, bonusTimeLeft, floatTexts,
}) {
  const cell = size / cols;
  const boardW = cell * cols;
  const boardH = cell * rows;
  const inBonus = mode === 'bonus';

  // Detect wrap-around per segment: when a segment moves >1 cell between ticks,
  // it teleported (walls wrapping during bonus). Skip CSS transition for that
  // frame so the snake doesn't visually slide across the whole board.
  const prevPositionsRef = React.useRef([]);
  const noTransitions = snake.map((seg, i) => {
    const prev = prevPositionsRef.current[i];
    return Boolean(prev && (Math.abs(seg.x - prev.x) > 1 || Math.abs(seg.y - prev.y) > 1));
  });
  React.useEffect(() => {
    prevPositionsRef.current = snake.map(s => ({ x: s.x, y: s.y }));
  });

  const touchRef = React.useRef(null);
  function onTouchStart(e) {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e) {
    if (!touchRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (Math.max(ax, ay) < 14) return;
    if (ax > ay) onSwipe(dx > 0 ? 'right' : 'left');
    else onSwipe(dy > 0 ? 'down' : 'up');
    touchRef.current = null;
  }
  const mouseRef = React.useRef(null);
  function onMouseDown(e) { mouseRef.current = { x: e.clientX, y: e.clientY }; }
  function onMouseUp(e) {
    if (!mouseRef.current) return;
    const dx = e.clientX - mouseRef.current.x;
    const dy = e.clientY - mouseRef.current.y;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (Math.max(ax, ay) >= 14) {
      if (ax > ay) onSwipe(dx > 0 ? 'right' : 'left');
      else onSwipe(dy > 0 ? 'down' : 'up');
    }
    mouseRef.current = null;
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      style={{
        width: boardW, height: boardH,
        background: inBonus
          ? `radial-gradient(circle at 50% 50%, ${theme.coin}22, ${theme.boardBg})`
          : theme.boardBg,
        border: `2px solid ${inBonus ? theme.coin : theme.boardBorder}`,
        borderRadius: 18,
        position: 'relative', overflow: 'hidden',
        touchAction: 'none', userSelect: 'none',
        boxShadow: inBonus
          ? `0 0 0 4px ${theme.coin}33, 0 0 32px ${theme.coin}66, 0 12px 28px rgba(0,0,0,0.18)`
          : (theme.name === 'Midnight'
            ? 'inset 0 0 0 1px rgba(255,255,255,0.04), 0 12px 32px rgba(0,0,0,0.35)'
            : '0 12px 28px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.4) inset'),
        transition: 'border-color 220ms ease, box-shadow 220ms ease',
      }}
    >
      {/* Grid */}
      <svg width={boardW} height={boardH} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: cols - 1 }, (_, i) => (
          <line key={'v' + i} x1={(i + 1) * cell} y1={0} x2={(i + 1) * cell} y2={boardH} stroke={theme.boardLine} strokeWidth="1" />
        ))}
        {Array.from({ length: rows - 1 }, (_, i) => (
          <line key={'h' + i} x1={0} y1={(i + 1) * cell} x2={boardW} y2={(i + 1) * cell} stroke={theme.boardLine} strokeWidth="1" />
        ))}
      </svg>

      {/* Food — hidden during bonus */}
      {!inBonus && <FoodCell theme={theme} cell={cell} x={food.x} y={food.y} />}

      {/* Coin (single, normal mode) */}
      {!inBonus && coin && <CoinCell theme={theme} cell={cell} x={coin.x} y={coin.y} life={coin.life} />}

      {/* Star — normal mode only */}
      {!inBonus && star && <StarCell theme={theme} cell={cell} x={star.x} y={star.y} life={star.life} />}

      {/* Bonus coins — many */}
      {inBonus && bonusCoins.map(c => (
        <CoinCell key={c.id} theme={theme} cell={cell} x={c.x} y={c.y} life={80} bonus />
      ))}

      {/* Snake */}
      {snake.map((seg, i) => (
        <SnakeSeg key={i} theme={theme} cell={cell} x={seg.x} y={seg.y}
          isHead={i === 0} dir={dir} idx={i} len={snake.length}
          noTransition={noTransitions[i]} />
      ))}

      {/* Float texts (e.g. +5) */}
      {floatTexts.map(ft => (
        <FloatText key={ft.id} cell={cell} x={ft.x} y={ft.y} label={ft.label} color={ft.color} />
      ))}

      {/* Bonus countdown timer (top-right of board) */}
      {inBonus && <BonusCountdown theme={theme} timeLeft={bonusTimeLeft} />}

      {/* Bonus banner — opening fanfare */}
      {inBonus && <BonusBanner key={bonusFlashKey} theme={theme} />}

      {status === 'paused' && (
        <Overlay theme={theme} label="已暫停" sub="按 ▶ 繼續" />
      )}

      {status === 'ready' && (
        <Overlay theme={theme} label="準備…" sub="畫面即將開始" />
      )}

      {/* Level up flash overlay */}
      <LevelFlash key={levelFlashKey} theme={theme} />
    </div>
  );
}

function SnakeSeg({ theme, cell, x, y, isHead, dir, idx, len, noTransition }) {
  const pad = Math.max(1, Math.floor(cell * 0.08));
  const size = cell - pad * 2;
  const r = Math.max(3, Math.floor(cell * 0.22));
  const t = len > 1 ? idx / (len - 1) : 0;
  const lerp = (a, b, k) => Math.round(a + (b - a) * k);
  const hexToRgb = (h) => {
    const n = h.replace('#', '');
    return n.length === 3
      ? n.split('').map(c => parseInt(c + c, 16))
      : [parseInt(n.slice(0,2),16), parseInt(n.slice(2,4),16), parseInt(n.slice(4,6),16)];
  };
  const a = hexToRgb(theme.snakeDark);
  const b = hexToRgb(theme.snake);
  const col = `rgb(${lerp(a[0],b[0],t)}, ${lerp(a[1],b[1],t)}, ${lerp(a[2],b[2],t)})`;

  return (
    <div style={{
      position: 'absolute',
      left: x * cell + pad, top: y * cell + pad,
      width: size, height: size,
      background: col,
      borderRadius: isHead ? r + 2 : r,
      transition: noTransition ? 'none' : 'left 80ms linear, top 80ms linear',
      boxShadow: isHead ? `0 0 0 1px ${theme.snakeDark} inset` : 'none',
    }}>
      {isHead && <SnakeEyes theme={theme} cell={cell} dir={dir} />}
    </div>
  );
}

function SnakeEyes({ theme, cell, dir }) {
  const eyeSize = Math.max(2, Math.floor(cell * 0.13));
  const r = Math.max(2, Math.floor(cell * 0.05));
  const cfg = {
    right: [{ top: '25%', left: '60%' }, { top: '60%', left: '60%' }],
    left:  [{ top: '25%', left: '20%' }, { top: '60%', left: '20%' }],
    up:    [{ top: '20%', left: '22%' }, { top: '20%', left: '60%' }],
    down:  [{ top: '60%', left: '22%' }, { top: '60%', left: '60%' }],
  }[dir] || [];
  return (
    <>
      {cfg.map((pos, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: eyeSize, height: eyeSize,
          background: theme.snakeEye, borderRadius: r,
          ...pos,
        }} />
      ))}
    </>
  );
}

function FoodCell({ theme, cell, x, y }) {
  const pad = Math.max(1, Math.floor(cell * 0.15));
  const size = cell - pad * 2;
  return (
    <div style={{
      position: 'absolute', left: x * cell + pad, top: y * cell + pad,
      width: size, height: size,
      background: theme.food, borderRadius: '50%',
      boxShadow: `0 0 0 ${Math.max(3, cell * 0.18)}px ${theme.foodGlow}`,
      animation: 'foodPulse 1.2s ease-in-out infinite',
    }} />
  );
}

function CoinCell({ theme, cell, x, y, life, bonus }) {
  const pad = Math.max(1, Math.floor(cell * 0.12));
  const size = cell - pad * 2;
  const opacity = (bonus || life >= 15) ? 1 : (life / 15);
  return (
    <div style={{
      position: 'absolute', left: x * cell + pad, top: y * cell + pad,
      width: size, height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle at 35% 30%, ${theme.coin} 0%, ${theme.coin} 55%, ${theme.coinDark} 100%)`,
      boxShadow: `0 0 0 ${Math.max(2, cell * 0.10)}px rgba(229,165,43,0.18), inset 0 0 0 1px ${theme.coinDark}`,
      animation: 'coinSpin 1.4s ease-in-out infinite',
      opacity,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"JetBrains Mono", monospace',
      fontWeight: 800,
      fontSize: Math.max(8, cell * 0.42),
      color: theme.coinDark,
    }}>$</div>
  );
}

function StarCell({ theme, cell, x, y, life }) {
  const pad = Math.max(1, Math.floor(cell * 0.06));
  const size = cell - pad * 2;
  const opacity = life < 20 ? Math.max(0.3, life / 20) : 1;
  return (
    <div style={{
      position: 'absolute', left: x * cell + pad, top: y * cell + pad,
      width: size, height: size,
      opacity,
      animation: 'starPulse 1.1s ease-in-out infinite',
      filter: `drop-shadow(0 0 ${Math.max(2, cell * 0.18)}px ${theme.coin})`,
      pointerEvents: 'none',
    }}>
      <svg width={size} height={size} viewBox="0 0 24 24">
        <path d="M12 2 L14.5 8.8 L21.8 9.1 L16.1 13.6 L18.2 20.9 L12 16.6 L5.8 20.9 L7.9 13.6 L2.2 9.1 L9.5 8.8 Z"
              fill={theme.coin} stroke={theme.coinDark} strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function BonusCountdown({ theme, timeLeft }) {
  const display = timeLeft.toFixed(1);
  const isUrgent = timeLeft < 3;
  return (
    <div style={{
      position: 'absolute', top: 8, right: 8,
      background: theme.coin, color: theme.coinDark,
      padding: '4px 10px', borderRadius: 999,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 13, fontWeight: 800,
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: 0.5,
      boxShadow: `0 4px 12px ${theme.coin}55, inset 0 0 0 1px ${theme.coinDark}`,
      animation: isUrgent ? 'urgentPulse 0.4s ease-in-out infinite' : 'none',
      pointerEvents: 'none',
    }}>{display}s</div>
  );
}

function BonusBanner({ theme }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'bonusBanner 1.4s ease-out forwards',
      opacity: 0,
    }}>
      <div style={{
        fontFamily: '"Space Grotesk", system-ui',
        fontSize: 26, fontWeight: 800, letterSpacing: 2,
        color: theme.coinDark,
        background: theme.coin,
        padding: '12px 20px', borderRadius: 999,
        boxShadow: `0 12px 32px ${theme.coin}99`,
        textAlign: 'center', lineHeight: 1.1,
      }}>
        BONUS!
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10, letterSpacing: 2, fontWeight: 700,
          marginTop: 2, opacity: 0.85,
        }}>金幣狂歡 · 10s</div>
      </div>
    </div>
  );
}

function FloatText({ cell, x, y, label, color }) {
  return (
    <div style={{
      position: 'absolute',
      left: x * cell, top: y * cell,
      width: cell, height: cell,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
      fontFamily: '"JetBrains Mono", monospace',
      fontWeight: 700, fontSize: Math.max(10, cell * 0.6),
      color, textShadow: '0 1px 2px rgba(0,0,0,0.35)',
      animation: 'floatUp 0.9s ease-out forwards',
    }}>{label}</div>
  );
}

function LevelFlash({ theme }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'levelFlash 0.9s ease-out forwards',
      background: theme.foodGlow,
      opacity: 0,
    }}>
      <div style={{
        fontFamily: '"Space Grotesk", system-ui',
        fontSize: 28, fontWeight: 800, letterSpacing: 2,
        color: theme.ink,
        background: theme.boardBg,
        padding: '10px 22px', borderRadius: 999,
        border: `2px solid ${theme.boardBorder}`,
        boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
      }}>LEVEL UP</div>
    </div>
  );
}

function Overlay({ theme, label, sub }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: theme.name === 'Midnight' ? 'rgba(11,15,20,0.7)' : 'rgba(245,241,232,0.85)',
      backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>
      <div style={{
        fontSize: 22, fontWeight: 700, letterSpacing: 1,
        color: theme.ink, fontFamily: '"Space Grotesk", system-ui, sans-serif',
      }}>{label}</div>
      {sub && <div style={{ fontSize: 13, color: theme.mute, fontFamily: '"JetBrains Mono", monospace' }}>{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HUD
// ─────────────────────────────────────────────────────────────
function HUD({ theme, score, level, foodInLevel, wallet, status, onPause, onResume }) {
  return (
    <div style={{ padding: '2px 4px 8px 4px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <Chip theme={theme} label="SCORE" value={String(score).padStart(4, '0')} primary />
        <Chip theme={theme} label="LV" value={String(level).padStart(2, '0')} accent />
        <Chip theme={theme} label="$" value={String(wallet).padStart(3, '0')} coin />
        <button
          onClick={status === 'playing' ? onPause : onResume}
          disabled={status !== 'playing' && status !== 'paused'}
          style={{
            width: 32, height: 32, borderRadius: 10,
            border: `1.5px solid ${theme.ink}`,
            background: 'transparent', color: theme.ink, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: (status === 'playing' || status === 'paused') ? 1 : 0.3,
            marginTop: 4,
          }}
        >
          {status === 'playing'
            ? <div style={{ display: 'flex', gap: 3 }}><div style={{ width: 3, height: 12, background: theme.ink }} /><div style={{ width: 3, height: 12, background: theme.ink }} /></div>
            : <div style={{ width: 0, height: 0, borderLeft: `9px solid ${theme.ink}`, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', marginLeft: 2 }} />}
        </button>
      </div>

      {/* Level progress bar */}
      <div style={{
        marginTop: 8,
        height: 6, borderRadius: 999,
        background: theme.chipBg,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${(foodInLevel / FOOD_PER_LEVEL) * 100}%`,
          background: `linear-gradient(90deg, ${theme.snake}, ${theme.snake})`,
          borderRadius: 999,
          transition: 'width 240ms ease-out',
        }} />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 3,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 1.2,
        color: theme.mute,
      }}>
        <span>LEVEL {level} → {level + 1}</span>
        <span>{foodInLevel}/{FOOD_PER_LEVEL}</span>
      </div>
    </div>
  );
}

function Chip({ theme, label, value, primary, accent, coin }) {
  let bg = theme.chipBg, color = theme.ink;
  if (primary) { bg = theme.badge; color = theme.badgeText; }
  if (accent)  { bg = 'transparent'; color = theme.ink; }
  if (coin)    { bg = theme.coin; color = theme.coinDark; }
  return (
    <div style={{
      background: bg, color,
      borderRadius: 10,
      padding: '4px 10px',
      display: 'flex', flexDirection: 'column',
      lineHeight: 1.05,
      border: accent ? `1.5px solid ${theme.ink}` : 'none',
      flex: primary ? '1 1 auto' : '0 0 auto',
    }}>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 8, letterSpacing: 1.4, fontWeight: 700,
        opacity: 0.7,
      }}>{label}</div>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// D-pad
// ─────────────────────────────────────────────────────────────
function DPad({ theme, onDir }) {
  const Btn = ({ d, children, style }) => (
    <button onPointerDown={(e) => { e.preventDefault(); onDir(d); }}
      style={{
        width: 46, height: 46, border: 'none',
        background: theme.button, color: theme.buttonText, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, WebkitTapHighlightColor: 'transparent',
        ...style,
      }}>{children}</button>
  );
  const Arrow = ({ d }) => {
    const rot = { up: 0, right: 90, down: 180, left: 270 }[d];
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" style={{ transform: `rotate(${rot}deg)` }}>
        <path d="M10 4L16 13H4z" fill="currentColor" />
      </svg>
    );
  };
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 46px)',
      gridTemplateRows: 'repeat(3, 46px)',
      gap: 2, background: theme.button, padding: 2,
      borderRadius: 18, width: 'fit-content',
    }}>
      <div />
      <Btn d="up" style={{ borderTopRightRadius: 16 }}><Arrow d="up" /></Btn>
      <div />
      <Btn d="left" style={{ borderTopLeftRadius: 16 }}><Arrow d="left" /></Btn>
      <div style={{ background: theme.button, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: theme.buttonText, opacity: 0.4 }} />
      </div>
      <Btn d="right" style={{ borderBottomRightRadius: 16 }}><Arrow d="right" /></Btn>
      <div />
      <Btn d="down" style={{ borderBottomLeftRadius: 16 }}><Arrow d="down" /></Btn>
      <div />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Start screen
// ─────────────────────────────────────────────────────────────
function StartScreen({
  theme, high, wallet, equippedSkin, onStart, onShop,
  gridLabel, difficultyKey, accelMode, onSetDifficulty, onSetAccelMode,
  profile, onProfile,
}) {
  const skin = SKINS[equippedSkin] || SKINS.classic;
  return (
    <div style={{
      flex: 1, padding: '14px 22px 22px',
      display: 'flex', flexDirection: 'column', color: theme.ink,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 14, gap: 8,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10, letterSpacing: 2, fontWeight: 600,
            color: theme.mute, marginBottom: 4,
          }}>NO.001 — CLASSIC</div>
          <div style={{
            fontFamily: '"Space Grotesk", system-ui',
            fontSize: 32, fontWeight: 700, lineHeight: 1, letterSpacing: -1,
          }}>貪食蛇</div>
          <div style={{
            fontFamily: '"Space Grotesk", system-ui',
            fontSize: 12, fontWeight: 500, color: theme.mute, marginTop: 3,
          }}>Snake · 經典街機重製</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {profile && onProfile && (
            <ProfileChip profile={profile} theme={theme} onClick={onProfile} />
          )}
          <button onClick={onShop} style={{
            background: theme.coin, color: theme.coinDark,
            border: 'none', borderRadius: 14, padding: '6px 12px',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 4px 12px rgba(229,165,43,0.25)',
          }}>
            <span style={{ fontSize: 14 }}>$</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{wallet}</span>
          </button>
        </div>
      </div>

      <PreviewStrip theme={theme} />

      <div style={{ marginTop: 12 }}>
        <SectionLabel theme={theme} text="DIFFICULTY · 難度" />
        <SegRow
          theme={theme}
          value={difficultyKey}
          onChange={onSetDifficulty}
          options={[
            { value: 'easy',    label: '簡單' },
            { value: 'normal',  label: '一般' },
            { value: 'hard',    label: '困難' },
            { value: 'extreme', label: '超困難' },
          ]}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <SectionLabel theme={theme} text="MODE · 模式" />
        <SegRow
          theme={theme}
          value={accelMode}
          onChange={onSetAccelMode}
          options={[
            { value: 'progressive', label: '漸進加速' },
            { value: 'fixed',       label: '固定速度' },
          ]}
        />
        <div style={{
          marginTop: 6,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 9, letterSpacing: 1, color: theme.mute, lineHeight: 1.5,
        }}>
          {accelMode === 'fixed'
            ? '固定 · 速度始終保持起始水準'
            : '漸進 · 每升一級加快直到上限'}
        </div>
      </div>

      <div style={{
        marginTop: 12, padding: '10px 12px',
        background: theme.chipBg, borderRadius: 12,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 1.5, color: theme.mute }}>HIGH SCORE</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {String(high).padStart(4, '0')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 1.5, color: theme.mute }}>EQUIPPED</div>
          <div style={{ fontSize: 12, fontFamily: '"Space Grotesk", system-ui', fontWeight: 600 }}>{skin.name}</div>
          <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: theme.mute, letterSpacing: 1 }}>{gridLabel}</div>
        </div>
      </div>

      <button onClick={onShop} style={{
        marginTop: 8, padding: '10px 14px',
        background: 'transparent', color: theme.ink,
        border: `1.5px dashed ${theme.mute}`,
        borderRadius: 12,
        fontFamily: '"Space Grotesk", system-ui', fontSize: 12, fontWeight: 600,
        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>商店 · 蛇皮膚包裝</span>
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: theme.mute }}>→</span>
      </button>

      <div style={{ flex: 1, minHeight: 8 }} />

      <button onClick={onStart} style={{
        width: '100%', padding: '15px 0',
        background: theme.ink, color: theme.appBg,
        border: 'none', borderRadius: 16,
        fontFamily: '"Space Grotesk", system-ui',
        fontSize: 16, fontWeight: 600, letterSpacing: 0.5,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        開始遊戲
        <svg width="14" height="14" viewBox="0 0 16 16"><path d="M3 2L13 8L3 14z" fill="currentColor" /></svg>
      </button>

      <div style={{
        marginTop: 8, textAlign: 'center',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 9, letterSpacing: 1.5, color: theme.mute,
      }}>滑動 · D-PAD · 方向鍵 · 吃 ★ 進入金幣狂歡</div>
    </div>
  );
}

function SectionLabel({ theme, text }) {
  return (
    <div style={{
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 9, letterSpacing: 1.8, fontWeight: 700,
      color: theme.mute, marginBottom: 6,
    }}>{text}</div>
  );
}

function SegRow({ theme, value, options, onChange }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${options.length}, 1fr)`,
      gap: 4,
      padding: 3,
      background: theme.chipBg,
      borderRadius: 12,
    }}>
      {options.map(o => {
        const active = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)}
            style={{
              background: active ? theme.ink : 'transparent',
              color: active ? theme.appBg : theme.ink,
              border: 'none', borderRadius: 9,
              padding: '8px 0',
              fontFamily: '"Space Grotesk", system-ui',
              fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 160ms ease, color 160ms ease',
              WebkitTapHighlightColor: 'transparent',
            }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function PreviewStrip({ theme }) {
  const cells = [
    { x: 0, t: 'tail' }, { x: 1, t: 'body' }, { x: 2, t: 'body' },
    { x: 3, t: 'body' }, { x: 4, t: 'body' }, { x: 5, t: 'head' },
  ];
  return (
    <div style={{
      background: theme.boardBg,
      border: `2px solid ${theme.boardBorder}`,
      borderRadius: 14, padding: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {cells.map((c, i) => {
          const t = i / (cells.length - 1);
          const lerp = (a, b, k) => Math.round(a + (b - a) * k);
          const hexToRgb = (h) => { const n = h.replace('#', ''); return [parseInt(n.slice(0,2),16), parseInt(n.slice(2,4),16), parseInt(n.slice(4,6),16)]; };
          const a = hexToRgb(theme.snakeDark);
          const b = hexToRgb(theme.snake);
          const col = `rgb(${lerp(a[0],b[0],t)}, ${lerp(a[1],b[1],t)}, ${lerp(a[2],b[2],t)})`;
          return (
            <div key={i} style={{
              width: 20, height: 20, background: col,
              borderRadius: c.t === 'head' ? 8 : 6, position: 'relative',
            }}>
              {c.t === 'head' && (
                <>
                  <div style={{ position: 'absolute', width: 3, height: 3, background: theme.snakeEye, borderRadius: 1, top: 5, right: 4 }} />
                  <div style={{ position: 'absolute', width: 3, height: 3, background: theme.snakeEye, borderRadius: 1, bottom: 5, right: 4 }} />
                </>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${theme.coin} 0%, ${theme.coinDark} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 800,
          color: theme.coinDark,
        }}>$</div>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: theme.food, boxShadow: `0 0 0 5px ${theme.foodGlow}`,
        }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shop screen
// ─────────────────────────────────────────────────────────────
function ShopScreen({ theme, baseTheme, wallet, ownedSkins, equippedSkin, onBuy, onEquip, onBack }) {
  return (
    <div style={{
      flex: 1, padding: '14px 18px 22px',
      display: 'flex', flexDirection: 'column', color: theme.ink,
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', color: theme.ink,
          fontFamily: '"Space Grotesk", system-ui', fontSize: 14, fontWeight: 500,
          cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 2L4 7l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          返回
        </button>
        <div style={{
          background: theme.coin, color: theme.coinDark,
          borderRadius: 12, padding: '6px 12px',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 14, fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 15 }}>$</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{wallet}</span>
        </div>
      </div>

      <div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10, letterSpacing: 2, fontWeight: 600,
          color: theme.mute, marginBottom: 2,
        }}>SHOP · 商店</div>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <div style={{
            fontFamily: '"Space Grotesk", system-ui',
            fontSize: 26, fontWeight: 700, lineHeight: 1, letterSpacing: -0.5,
          }}>蛇皮膚包裝</div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11, color: theme.mute, fontVariantNumeric: 'tabular-nums',
          }}>{ownedSkins.size} / {Object.keys(SKINS).length}</div>
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        paddingBottom: 8,
      }}>
        {Object.entries(SKINS).map(([key, skin]) => {
          const owned = ownedSkins.has(key);
          const equipped = equippedSkin === key;
          const canBuy = !owned && wallet >= skin.price;
          return (
            <SkinCard
              key={key} skinKey={key} skin={skin} theme={theme} baseTheme={baseTheme}
              owned={owned} equipped={equipped} canBuy={canBuy}
              onClick={() => {
                if (equipped) return;
                if (owned) onEquip(key);
                else if (canBuy) onBuy(key);
              }}
            />
          );
        })}
      </div>

      <div style={{
        marginTop: 4, padding: '8px 12px',
        background: theme.chipBg, borderRadius: 10,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10, color: theme.mute, lineHeight: 1.5,
      }}>
        $ +5 · 升級 +10 · 吃 ★ 進入 10 秒金幣狂歡
      </div>
    </div>
  );
}

function SkinCard({ skinKey, skin, theme, baseTheme, owned, equipped, canBuy, onClick }) {
  // For preview: classic (snake===null) shows the base theme's default snake
  // colors, not the currently-equipped skin's. Otherwise the classic card
  // would mirror whatever skin you have on.
  const snakeColor = skin.snake || baseTheme.snake;
  const snakeDark = skin.snakeDark || baseTheme.snakeDark;
  return (
    <button onClick={onClick} disabled={equipped || (!owned && !canBuy)}
      style={{
        background: theme.boardBg,
        border: equipped ? `2px solid ${theme.ink}` : `1.5px solid ${theme.boardBorder}`,
        borderRadius: 14, padding: 12,
        cursor: (equipped || (!owned && !canBuy)) ? 'default' : 'pointer',
        display: 'flex', flexDirection: 'column', gap: 6,
        textAlign: 'left', position: 'relative',
        opacity: (!owned && !canBuy) ? 0.6 : 1,
        WebkitTapHighlightColor: 'transparent',
        transition: 'transform 120ms ease',
      }}>
      {/* Preview */}
      <div style={{
        height: 36, display: 'flex', alignItems: 'center', gap: 3,
        marginBottom: 2,
      }}>
        {[0, 1, 2, 3].map(i => {
          const t = i / 3;
          const lerp = (a, b, k) => Math.round(a + (b - a) * k);
          const hexToRgb = (h) => { const n = h.replace('#', ''); return [parseInt(n.slice(0,2),16), parseInt(n.slice(2,4),16), parseInt(n.slice(4,6),16)]; };
          const a = hexToRgb(snakeDark), b = hexToRgb(snakeColor);
          const col = `rgb(${lerp(a[0],b[0],t)}, ${lerp(a[1],b[1],t)}, ${lerp(a[2],b[2],t)})`;
          return <div key={i} style={{
            width: 22, height: 22, background: col,
            borderRadius: i === 3 ? 9 : 6, position: 'relative',
          }}>
            {i === 3 && (
              <>
                <div style={{ position: 'absolute', width: 3, height: 3, background: theme.snakeEye, borderRadius: 1, top: 6, right: 4 }} />
                <div style={{ position: 'absolute', width: 3, height: 3, background: theme.snakeEye, borderRadius: 1, bottom: 6, right: 4 }} />
              </>
            )}
          </div>;
        })}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <div style={{
          fontFamily: '"Space Grotesk", system-ui',
          fontSize: 14, fontWeight: 700, color: theme.ink,
        }}>{skin.name}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 8, letterSpacing: 1.2, color: theme.mute,
        }}>{skin.sub}</div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 2,
      }}>
        {equipped ? (
          <div style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700,
            color: theme.ink, letterSpacing: 1,
            padding: '3px 8px', background: theme.chipBg, borderRadius: 999,
          }}>使用中</div>
        ) : owned ? (
          <div style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700,
            color: snakeDark, letterSpacing: 1,
          }}>點擊切換 →</div>
        ) : (
          <div style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 700,
            color: canBuy ? theme.ink : theme.mute,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{
              width: 12, height: 12, borderRadius: '50%',
              background: theme.coin,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, color: theme.coinDark,
            }}>$</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{skin.price}</span>
          </div>
        )}
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 8,
          letterSpacing: 1, color: theme.mute,
        }}>{skin.tag}</div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Game Over screen
// ─────────────────────────────────────────────────────────────
function GameOver({ theme, score, high, isNewHigh, coinsEarned, level, onAgain, onHome }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: theme.appBg,
      padding: '34px 22px 24px',
      display: 'flex', flexDirection: 'column',
      color: theme.ink, zIndex: 5,
      animation: 'fadeUp 0.4s ease-out',
      boxSizing: 'border-box',
    }}>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10, letterSpacing: 2, fontWeight: 600,
        color: theme.mute, marginBottom: 4,
      }}>END · 結束</div>
      <div style={{
        fontFamily: '"Space Grotesk", system-ui',
        fontSize: 36, fontWeight: 700, lineHeight: 1, letterSpacing: -1.5,
      }}>Game Over.</div>

      <div style={{
        marginTop: 22, padding: '20px 18px',
        background: theme.chipBg,
        borderRadius: 18,
        border: isNewHigh ? `2px solid ${theme.food}` : 'none',
        position: 'relative',
      }}>
        {isNewHigh && (
          <div style={{
            position: 'absolute', top: -10, right: 14,
            background: theme.food, color: '#fff',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9, fontWeight: 700, letterSpacing: 1,
            padding: '4px 9px', borderRadius: 999,
          }}>NEW RECORD</div>
        )}
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 1.5, color: theme.mute }}>FINAL SCORE</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 46, fontWeight: 700, lineHeight: 1,
          fontVariantNumeric: 'tabular-nums', marginTop: 4,
        }}>{String(score).padStart(4, '0')}</div>

        <div style={{
          marginTop: 14, display: 'flex', justifyContent: 'space-between',
          paddingTop: 12, borderTop: `1px dashed ${theme.mute}`,
        }}>
          <Stat label="LV REACHED" value={String(level).padStart(2, '0')} color={theme.ink} theme={theme} />
          <Stat label="BEST" value={String(high).padStart(4, '0')} color={theme.ink} theme={theme} />
          <Stat label="GAINED" value={`+${coinsEarned}`} color={theme.coinDark} theme={theme} icon="$" iconBg={theme.coin} />
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onHome} style={{
          flex: 1, padding: '14px 0',
          background: 'transparent', color: theme.ink,
          border: `1.5px solid ${theme.ink}`, borderRadius: 16,
          fontFamily: '"Space Grotesk", system-ui',
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>主畫面</button>
        <button onClick={onAgain} style={{
          flex: 2, padding: '14px 0',
          background: theme.ink, color: theme.appBg,
          border: 'none', borderRadius: 16,
          fontFamily: '"Space Grotesk", system-ui',
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>再來一次 ↻</button>
      </div>
    </div>
  );
}

function Stat({ label, value, color, theme, icon, iconBg }) {
  return (
    <div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 1.5, color: theme.mute }}>{label}</div>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 18, fontWeight: 700, color,
        fontVariantNumeric: 'tabular-nums',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {icon && <span style={{
          width: 14, height: 14, borderRadius: '50%',
          background: iconBg, color, fontSize: 10, fontWeight: 800,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</span>}
        {value}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// App shell
// ─────────────────────────────────────────────────────────────
function SnakeApp({ baseTheme, gridKey, difficultyKey, accelMode, onSetDifficulty, onSetAccelMode }) {
  const grid = GRID_PRESETS[gridKey] || GRID_PRESETS.medium;
  const difficulty = DIFFICULTY_PRESETS[difficultyKey] || DIFFICULTY_PRESETS.normal;

  const profilesApi = useProfiles();
  const activeProfile = profilesApi.active;

  const [screen, setScreen] = React.useState('home');
  const high = activeProfile.high;
  const wallet = activeProfile.wallet;
  const ownedSkins = React.useMemo(
    () => new Set(activeProfile.ownedSkins || ['classic']),
    [activeProfile.ownedSkins]
  );
  const equippedSkin = activeProfile.equippedSkin || 'classic';
  const [isNewHigh, setIsNewHigh] = React.useState(false);
  const [floatTexts, setFloatTexts] = React.useState([]);
  const floatIdRef = React.useRef(0);

  const theme = resolveColors(baseTheme, equippedSkin);

  // Helpers that mutate the active profile.
  function setHigh(v) { profilesApi.updateActive({ high: v }); }
  function setWallet(v) {
    profilesApi.updateActive(p => ({ ...p, wallet: typeof v === 'function' ? v(p.wallet) : v }));
  }
  function setOwnedSkins(updater) {
    profilesApi.updateActive(p => {
      const curr = new Set(p.ownedSkins || ['classic']);
      const next = typeof updater === 'function' ? updater(curr) : new Set(updater);
      return { ...p, ownedSkins: [...next] };
    });
  }
  function setEquippedSkin(key) { profilesApi.updateActive({ equippedSkin: key }); }

  function pushFloat(x, y, label, color) {
    const id = ++floatIdRef.current;
    setFloatTexts(arr => [...arr, { id, x, y, label, color }]);
    setTimeout(() => setFloatTexts(arr => arr.filter(f => f.id !== id)), 900);
  }

  const game = useSnakeGame({
    cols: grid.cols, rows: grid.rows, difficulty, accelMode,
    onCoinEat: (amt, pos) => {
      setWallet(w => w + amt);
      pushFloat(pos.x, pos.y, `+${amt}`, theme.coinDark);
    },
    onLevelUp: (newLevel) => {
      setWallet(w => w + 10);
    },
    onBonusStart: () => {
      // No-op for now; the Board renders the banner via bonusFlash key
    },
    onBonusEnd: (collected) => {
      // Center-board float showing total earned this bonus
      pushFloat(Math.floor(grid.cols / 2), Math.floor(grid.rows / 2),
        `+${collected * 5}`, theme.coinDark);
    },
  });

  React.useEffect(() => {
    if (game.status === 'over') {
      if (game.score > high) {
        setHigh(game.score);
        setIsNewHigh(true);
      } else {
        setIsNewHigh(false);
      }
    }
  }, [game.status]);

  React.useEffect(() => {
    function onKey(e) {
      // Don't hijack keys while the user is typing in an input/textarea
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', a: 'left', s: 'down', d: 'right' };
      if (map[e.key]) { e.preventDefault(); game.changeDir(map[e.key]); }
      if (e.key === ' ') {
        e.preventDefault();
        if (game.status === 'playing') game.pause();
        else if (game.status === 'paused') game.resume();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game]);

  React.useEffect(() => {
    game.reset();
    game.pause();
    setScreen('home');
    // eslint-disable-next-line
  }, [gridKey, difficultyKey, accelMode, profilesApi.activeId]);

  const BOARD_SIZE = 320;

  function handleStart() { game.start(); setScreen('play'); }
  function handleHome() { setScreen('home'); game.reset(); game.pause(); }
  function handleShop() { setScreen('shop'); }
  function handleBuy(key) {
    const skin = SKINS[key];
    if (!skin || ownedSkins.has(key)) return;
    if (wallet < skin.price) return;
    setWallet(w => w - skin.price);
    setOwnedSkins(s => { const n = new Set(s); n.add(key); return n; });
    setEquippedSkin(key);
  }
  function handleEquip(key) {
    if (!ownedSkins.has(key)) return;
    setEquippedSkin(key);
  }

  if (screen === 'home') {
    return <StartScreen theme={theme} high={high} wallet={wallet}
      equippedSkin={equippedSkin}
      profile={activeProfile}
      onProfile={() => setScreen('profile')}
      onStart={handleStart} onShop={handleShop}
      gridLabel={grid.label}
      difficultyKey={difficultyKey} accelMode={accelMode}
      onSetDifficulty={onSetDifficulty}
      onSetAccelMode={onSetAccelMode} />;
  }

  if (screen === 'profile') {
    return <ProfileScreen theme={theme} profilesApi={profilesApi}
      onBack={() => setScreen('home')} />;
  }

  if (screen === 'shop') {
    return <ShopScreen theme={theme} baseTheme={baseTheme} wallet={wallet}
      ownedSkins={ownedSkins} equippedSkin={equippedSkin}
      onBuy={handleBuy} onEquip={handleEquip} onBack={() => setScreen('home')} />;
  }

  return (
    <div style={{
      flex: 1, padding: '8px 14px 16px',
      display: 'flex', flexDirection: 'column',
      background: theme.appBg, color: theme.ink,
      position: 'relative',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '2px 2px 6px',
      }}>
        <button onClick={handleHome} style={{
          background: 'transparent', border: 'none', color: theme.ink,
          fontFamily: '"Space Grotesk", system-ui', fontSize: 13, fontWeight: 500,
          cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="13" height="13" viewBox="0 0 14 14"><path d="M9 2L4 7l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          返回
        </button>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10, letterSpacing: 1.5, color: theme.mute,
        }}>{grid.cols}×{grid.rows} · {difficulty.label}{accelMode === 'fixed' ? ' · 固定' : ''}</div>
      </div>

      <HUD theme={theme}
        score={game.score} level={game.level} foodInLevel={game.foodInLevel}
        wallet={wallet}
        status={game.status} onPause={game.pause} onResume={game.resume} />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
        <Board theme={theme} cols={grid.cols} rows={grid.rows}
          snake={game.snake} food={game.food} coin={game.coin} star={game.star}
          status={game.status} dir={game.dir}
          size={BOARD_SIZE} onSwipe={game.changeDir}
          levelFlashKey={game.levelFlash}
          bonusFlashKey={game.bonusFlash}
          mode={game.mode}
          bonusCoins={game.bonusCoins}
          bonusTimeLeft={game.bonusTimeLeft}
          floatTexts={floatTexts} />
      </div>

      <div style={{ flex: 1, minHeight: 4 }} />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <DPad theme={theme} onDir={game.changeDir} />
      </div>

      {game.status === 'over' && (
        <GameOver theme={theme}
          score={game.score} high={high} isNewHigh={isNewHigh}
          coinsEarned={game.coinsEarned + (game.level - 1) * 10}
          level={game.level}
          onAgain={() => { game.reset(); }} onHome={handleHome} />
      )}
    </div>
  );
}

Object.assign(window, { SnakeApp, THEMES, GRID_PRESETS, DIFFICULTY_PRESETS, SKINS });
