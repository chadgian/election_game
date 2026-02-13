const KEY = 'election-command-state-v2';

export const loadGameState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveGameState = (state) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
};

export const clearGameState = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
};
