import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'habitflow-mobile-v1';
const THEMES = [
  { name: 'Ocean', color: '#3978f6' },
  { name: 'Lavender', color: '#8b5cf6' },
  { name: 'Coral', color: '#f06464' },
  { name: 'Forest', color: '#19866a' },
  { name: 'Sunshine', color: '#d58a13' },
  { name: 'Berry', color: '#d9468f' },
];
const todayKey = () => new Date().toLocaleDateString('en-CA');
const starterHabits = [
  { id: 'walk', name: 'Go for a walk', icon: '🚶', color: '#e8f2ff', days: [] },
  { id: 'read', name: 'Read a little', icon: '📚', color: '#f1eaff', days: [] },
  { id: 'water', name: 'Drink water', icon: '💧', color: '#e6f8f6', days: [] },
];

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.habits)) return saved;
  } catch (error) {
    console.warn('Could not load saved Habitflow data:', error);
  }
  return { habits: starterHabits, theme: THEMES[0].color, dark: false };
}

function getStreak(habit) {
  const completed = new Set(habit.days || []);
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!completed.has(cursor.toLocaleDateString('en-CA'))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (completed.has(cursor.toLocaleDateString('en-CA'))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function App() {
  const initial = useMemo(loadData, []);
  const [habits, setHabits] = useState(initial.habits);
  const [theme, setTheme] = useState(initial.theme || THEMES[0].color);
  const [dark, setDark] = useState(Boolean(initial.dark));
  const [showSettings, setShowSettings] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const today = todayKey();
  const doneCount = habits.filter((habit) => habit.days.includes(today)).length;

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
      id: crypto.randomUUID?.() || String(Date.now()),
      name,
      icon: '✨',
      color: '#fff2df',
      days: [],
    }]);
    setNewHabit('');
    setShowAdd(false);
  };

  const deleteHabit = (id) => {
    setHabits((current) => current.filter((habit) => habit.id !== id));
  };

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  return (
    <main className={dark ? 'app dark' : 'app'} style={{ '--accent': theme }}>
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Habitflow home">
          <span className="brand-mark">h</span><span>habitflow</span>
        </a>
        <div className="header-actions">
          {installPrompt && <button className="install-button" onClick={installApp}>Install app</button>}
          <button className="settings-button" aria-label="Open appearance settings" onClick={() => setShowSettings(true)}>⚙️</button>
        </div>
      </header>

      <section className="welcome" id="home">
        <div className="welcome-copy">
          <p className="overline">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1>Small steps,<br /><span>big change.</span></h1>
          <p className="subtitle">Build a rhythm that feels like you.</p>
        </div>
        <div className="progress-ring" style={{ '--progress': habits.length ? `${(doneCount / habits.length) * 100}%` : '0%' }}>
          <div className="ring-center"><strong>{doneCount}<small>/{habits.length}</small></strong><span>today</span></div>
        </div>
      </section>

      <section className="today-section">
        <div className="section-heading">
          <div><p className="overline">YOUR ROUTINE</p><h2>Today</h2></div>
          <span className="count-pill">{doneCount} of {habits.length} done</span>
        </div>

        <div className="habit-list">
          {habits.length === 0 && <div className="empty-card">Your next good habit starts here. Add one below!</div>}
          {habits.map((habit) => {
            const done = habit.days.includes(today);
            return (
              <article className={`habit-card ${done ? 'is-done' : ''}`} key={habit.id}>
                <div className="habit-icon" style={{ background: habit.color }}>{habit.icon}</div>
                <div className="habit-info"><h3>{habit.name}</h3><p>🔥 {getStreak(habit)} day streak</p></div>
                <button className={`check-button ${done ? 'checked' : ''}`} onClick={() => toggleHabit(habit.id)} aria-label={`${done ? 'Undo' : 'Complete'} ${habit.name}`}>
                  {done ? '✓' : ''}
                </button>
                <button className="delete-button" onClick={() => deleteHabit(habit.id)} aria-label={`Delete ${habit.name}`}>×</button>
              </article>
            );
          })}
        </div>

        {showAdd ? (
          <form className="add-form" onSubmit={addHabit}>
            <input autoFocus value={newHabit} onChange={(event) => setNewHabit(event.target.value)} placeholder="e.g. Stretch for 5 minutes" maxLength={60} aria-label="New habit name" />
            <button type="submit" className="add-submit">Add</button>
            <button type="button" className="cancel-button" onClick={() => { setShowAdd(false); setNewHabit(''); }}>Cancel</button>
          </form>
        ) : (
          <button className="add-habit-button" onClick={() => setShowAdd(true)}><span>＋</span> Add a habit</button>
        )}
      </section>

      <footer className="footer-note">A little progress is still progress 🌱</footer>

      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <section className="settings-sheet" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title"><div><p className="overline">MAKE IT YOURS</p><h2 id="settings-title">Appearance</h2></div><button className="close-button" onClick={() => setShowSettings(false)} aria-label="Close settings">×</button></div>
            <p className="setting-label">Choose your color</p>
            <div className="theme-grid">
              {THEMES.map((item) => (
                <button key={item.name} className={`theme-option ${theme === item.color ? 'selected' : ''}`} onClick={() => setTheme(item.color)} aria-label={`${item.name} theme`} aria-pressed={theme === item.color}>
                  <span className="swatch" style={{ background: item.color }} />{item.name}
                </button>
              ))}
            </div>
            <label className="custom-color-row">Custom color <input type="color" value={theme} onChange={(event) => setTheme(event.target.value)} aria-label="Choose a custom accent color" /></label>
            <button className="dark-mode-row" onClick={() => setDark((value) => !value)}><span><strong>Dark appearance</strong><small>Easy on the eyes at night</small></span><span className={`toggle ${dark ? 'on' : ''}`}><i /></span></button>
            <button className="done-button" onClick={() => setShowSettings(false)}>Done</button>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
