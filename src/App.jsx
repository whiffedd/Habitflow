import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'flowhy-mobile-v1';
const THEMES = [
  { name: 'Meadow', color: '#62a887' },
  { name: 'Lavender', color: '#9581ce' },
  { name: 'Rose', color: '#df8298' },
  { name: 'Sky', color: '#659bc8' },
  { name: 'Sunshine', color: '#d3a34f' },
  { name: 'Berry', color: '#c76f9f' },
];
const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const starterHabits = [
  { id: 'walk', name: 'Get outside', icon: '🌿', color: '#e5f1e8', days: [] },
  { id: 'read', name: 'Read a little', icon: '📖', color: '#f0eafa', days: [] },
  { id: 'water', name: 'Drink water', icon: '💧', color: '#e5f2f7', days: [] },
];

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.habits)) return saved;
  } catch (error) {
    console.warn('Could not load saved Flowhy data:', error);
  }
  return { habits: starterHabits, theme: THEMES[0].color, dark: false };
}

function getStreak(habit) {
  const completed = new Set(habit.days || []);
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!completed.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (completed.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function getWellnessScore(habits, today) {
  if (!habits.length) return 0;
  let completed = 0;
  const opportunities = habits.length * 7;
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const key = dateKey(date);
    habits.forEach((habit) => {
      if ((habit.days || []).includes(key)) completed += 1;
    });
  }
  // Recent days count a little more, so today's effort can lift the flower quickly.
  const todayDone = habits.filter((habit) => (habit.days || []).includes(today)).length;
  const base = (completed / opportunities) * 100;
  const todayBoost = habits.length ? (todayDone / habits.length) * 12 : 0;
  return Math.min(100, Math.round(base * 0.88 + todayBoost));
}

function getFlowerMood(score) {
  if (score >= 75) return { title: 'In full bloom', note: 'You’ve been showing up for yourself. Keep tending your garden.' };
  if (score >= 45) return { title: 'Growing steadily', note: 'Your small steps are taking root. Keep going at your own pace.' };
  if (score >= 20) return { title: 'Finding its rhythm', note: 'A little care goes a long way. Choose one gentle step for today.' };
  return { title: 'Resting between blooms', note: 'No pressure—your garden is always ready for a fresh start.' };
}

function BloomFlower({ score }) {
  const bloom = Math.max(0.55, Math.min(1, 0.55 + score / 220));
  const droop = score < 20;
  const petals = Array.from({ length: 8 }, (_, index) => index * 45);
  return (
    <div className={`flower-scene ${droop ? 'flower-resting' : ''}`} style={{ '--bloom': bloom }} role="img" aria-label={`Flower illustration showing ${score}% wellness`}>
      <div className="flower-glow" />
      <svg className="flower-art" viewBox="0 0 220 250" aria-hidden="true">
        <defs>
          <linearGradient id="petalGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff0c8" />
            <stop offset="0.52" stopColor="var(--accent)" />
            <stop offset="1" stopColor="#c8a9e8" />
          </linearGradient>
          <linearGradient id="stemGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9bcb91" />
            <stop offset="1" stopColor="#4e9671" />
          </linearGradient>
        </defs>
        <path d="M110 126 C110 161 108 191 111 226" fill="none" stroke="url(#stemGradient)" strokeWidth="9" strokeLinecap="round" />
        <path d="M108 184 C82 161 68 174 76 189 C85 201 100 195 108 184Z" fill="#8ebc83" />
        <path d="M111 202 C137 179 153 193 145 207 C138 219 120 213 111 202Z" fill="#6ca878" />
        <g className="petals">
          {petals.map((angle) => (
            <ellipse key={angle} cx="110" cy="75" rx="19" ry="43" fill="url(#petalGradient)" stroke="#fff8e6" strokeOpacity=".38" strokeWidth="1.5" transform={`rotate(${angle} 110 110)`} />
          ))}
        </g>
        <circle cx="110" cy="110" r="23" fill="#e9b85e" />
        <circle cx="103" cy="104" r="3" fill="#fff4c9" opacity=".8" />
        <circle cx="116" cy="114" r="2.5" fill="#c68c45" opacity=".65" />
        <circle cx="108" cy="119" r="2" fill="#fff4c9" opacity=".75" />
      </svg>
      <span className="flower-sparkle sparkle-one">✦</span>
      <span className="flower-sparkle sparkle-two">✧</span>
    </div>
  );
}

function App() {
  const initial = useMemo(loadData, []);
  const [habits, setHabits] = useState(initial.habits.map((habit) => ({ ...habit, days: habit.days || [] })));
  const [theme, setTheme] = useState(initial.theme || THEMES[0].color);
  const [dark, setDark] = useState(Boolean(initial.dark));
  const [showSettings, setShowSettings] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const today = todayKey();
  const doneCount = habits.filter((habit) => habit.days.includes(today)).length;
  const wellnessScore = getWellnessScore(habits, today);
  const flowerMood = getFlowerMood(wellnessScore);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ habits, theme, dark }));
  }, [habits, theme, dark]);

  useEffect(() => {
    const handleInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', handleInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleInstall);
  }, []);

  const toggleHabit = (id) => {
    setHabits((current) => current.map((habit) => {
      if (habit.id !== id) return habit;
      const days = habit.days.includes(today)
        ? habit.days.filter((day) => day !== today)
        : [...habit.days, today];
      return { ...habit, days };
    }));
  };

  const addHabit = (event) => {
    event.preventDefault();
    const name = newHabit.trim();
    if (!name) return;
    setHabits((current) => [...current, {
      id: globalThis.crypto?.randomUUID?.() || String(Date.now()),
      name,
      icon: '🌱',
      color: '#edf2df',
      days: [],
    }]);
    setNewHabit('');
    setShowAdd(false);
  };

  const deleteHabit = (id) => setHabits((current) => current.filter((habit) => habit.id !== id));

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  return (
    <main className={dark ? 'app dark' : 'app'} style={{ '--accent': theme }}>
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Flowhy home">
          <span className="brand-mark" aria-hidden="true">f</span><span>flowhy</span>
        </a>
        <div className="header-actions">
          {installPrompt && <button className="install-button" onClick={installApp}>Install app</button>}
          <button className="settings-button" aria-label="Open appearance settings" onClick={() => setShowSettings(true)}>⚙️</button>
        </div>
      </header>

      <section className="welcome" id="home">
        <div className="welcome-copy">
          <p className="overline">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1>Grow at<br /><span>your pace.</span></h1>
          <p className="subtitle">Wellness is built one gentle step at a time.</p>
        </div>
        <div className="score-orbit" style={{ '--progress': `${wellnessScore}%` }} aria-label={`${wellnessScore}% wellness score`}>
          <div className="ring-center"><strong>{wellnessScore}<small>%</small></strong><span>wellness</span></div>
        </div>
      </section>

      <section className="garden-card" aria-labelledby="garden-title">
        <div className="garden-heading">
          <div><p className="overline">YOUR WELLNESS GARDEN</p><h2 id="garden-title">{flowerMood.title}</h2></div>
          <span className="garden-score">{wellnessScore}<small>/100</small></span>
        </div>
        <BloomFlower score={wellnessScore} />
        <p className="garden-note">{flowerMood.note}</p>
        <div className="score-track" aria-label={`Seven-day habit completion score: ${wellnessScore}%`}><span style={{ width: `${wellnessScore}%` }} /></div>
        <div className="score-caption"><span>Seven-day consistency</span><span>{wellnessScore}%</span></div>
      </section>

      <section className="today-section">
        <div className="section-heading">
          <div><p className="overline">GENTLE DAILY CARE</p><h2>Today</h2></div>
          <span className="count-pill">{doneCount} of {habits.length} nurtured</span>
        </div>
        <div className="habit-list">
          {habits.length === 0 && <div className="empty-card">Your garden is ready. Add a small, meaningful habit to begin.</div>}
          {habits.map((habit) => {
            const done = habit.days.includes(today);
            return (
              <article className={`habit-card ${done ? 'is-done' : ''}`} key={habit.id}>
                <div className="habit-icon" style={{ background: habit.color }}>{habit.icon}</div>
                <div className="habit-info"><h3>{habit.name}</h3><p>🌱 {getStreak(habit)} day {getStreak(habit) === 1 ? 'streak' : 'streak'}</p></div>
                <button className={`check-button ${done ? 'checked' : ''}`} onClick={() => toggleHabit(habit.id)} aria-label={`${done ? 'Undo' : 'Complete'} ${habit.name}`} aria-pressed={done}>
                  {done ? '✓' : ''}
                </button>
                <button className="delete-button" onClick={() => deleteHabit(habit.id)} aria-label={`Delete ${habit.name}`}>×</button>
              </article>
            );
          })}
        </div>
        {showAdd ? (
          <form className="add-form" onSubmit={addHabit}>
            <input autoFocus value={newHabit} onChange={(event) => setNewHabit(event.target.value)} placeholder="e.g. Take a mindful pause" maxLength={60} aria-label="New habit name" />
            <button type="submit" className="add-submit">Add</button>
            <button type="button" className="cancel-button" onClick={() => { setShowAdd(false); setNewHabit(''); }}>Cancel</button>
          </form>
        ) : (
          <button className="add-habit-button" onClick={() => setShowAdd(true)}><span>＋</span> Plant a new habit</button>
        )}
      </section>

      <footer className="footer-note">Every kind of growth has its season 🌼</footer>

      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <section className="settings-sheet" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title"><div><p className="overline">MAKE IT YOURS</p><h2 id="settings-title">Appearance</h2></div><button className="close-button" onClick={() => setShowSettings(false)} aria-label="Close settings">×</button></div>
            <p className="setting-label">Choose your garden color</p>
            <div className="theme-grid">
              {THEMES.map((item) => (
                <button key={item.name} className={`theme-option ${theme === item.color ? 'selected' : ''}`} onClick={() => setTheme(item.color)} aria-label={`${item.name} theme`} aria-pressed={theme === item.color}>
                  <span className="swatch" style={{ background: item.color }} />{item.name}
                </button>
              ))}
            </div>
            <label className="custom-color-row">Pick a custom color <input type="color" value={theme} onChange={(event) => setTheme(event.target.value)} aria-label="Choose a custom accent color" /></label>
            <button className="dark-mode-row" onClick={() => setDark((value) => !value)}><span><strong>Evening garden</strong><small>Use a softer dark appearance</small></span><span className={`toggle ${dark ? 'on' : ''}`}><i /></span></button>
            <button className="done-button" onClick={() => setShowSettings(false)}>Done</button>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
