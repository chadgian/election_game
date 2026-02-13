import { useEffect, useState } from 'react';

const VISIBILITY_KEY = 'election-analyst-visible';

export default function AnalystBubble({ tip }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(VISIBILITY_KEY);
    if (saved === 'hidden') setVisible(false);
  }, []);

  const hide = () => {
    setVisible(false);
    if (typeof window !== 'undefined') window.localStorage.setItem(VISIBILITY_KEY, 'hidden');
  };

  const show = () => {
    setVisible(true);
    if (typeof window !== 'undefined') window.localStorage.setItem(VISIBILITY_KEY, 'visible');
  };

  if (!visible) {
    return (
      <button className="analystToggle" onClick={show} type="button">
        🧠 Show Analyst
      </button>
    );
  }

  return (
    <div className="analystBubble" role="status" aria-live="polite">
      <button className="analystHide" onClick={hide} type="button" aria-label="Hide analyst">✕</button>
      <span className="avatar">🧠</span>
      <div>
        <strong>Campaign Analyst</strong>
        <p>{tip}</p>
      </div>
    </div>
  );
}
