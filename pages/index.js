import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import CountrySelector from '../src/components/CountrySelector';
import GameHUD from '../src/components/GameHUD';
import MapBoard from '../src/components/MapBoard';
import AnalystBubble from '../src/components/AnalystBubble';
import { DemographicsPanel, FeedPanel, SystemsPanel } from '../src/components/SidePanels';
import { computeElectionScore, generateWeeklyEvent, getAnalystTip, getRules, isFinished, newGame, resultSummary } from '../src/game/gameEngine';
import { loadGameState, saveGameState } from '../src/game/session';

export default function HQPage() {
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [state, setState] = useState(() => newGame('United States'));
  const [event, setEvent] = useState(() => generateWeeklyEvent(state));

  useEffect(() => {
    const stored = loadGameState();
    if (stored) {
      setState(stored);
      setSelectedCountry(stored.country?.name || 'United States');
      setEvent(generateWeeklyEvent(stored));
    }
  }, []);

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  const score = useMemo(() => computeElectionScore(state), [state]);
  const rules = useMemo(() => getRules(state), [state]);
  const analystTip = useMemo(() => getAnalystTip(state, event, []), [state, event]);

  const handleCountryChange = (country) => {
    const next = newGame(country);
    setSelectedCountry(country);
    setState(next);
    setEvent(generateWeeklyEvent(next));
  };

  return (
    <main className="game">
      {!isFinished(state) ? <AnalystBubble tip={analystTip} /> : null}
      <GameHUD state={state} score={score} />
      <CountrySelector currentCountry={selectedCountry} onSelect={handleCountryChange} />

      <section className="glass pageTabs">
        <Link href="/" className="tab active">🏛️ HQ</Link>
        <Link href="/planning" className="tab">🗓️ Weekly Planning</Link>
        <Link href="/briefing" className="tab">🧾 Opposition Briefing</Link>
      </section>

      {isFinished(state) ? (
        <section className="glass final">
          <h2>🏁 Election Complete</h2>
          <p>{resultSummary(state)}</p>
          <button onClick={() => {
            const next = newGame(selectedCountry);
            setState(next);
            setEvent(generateWeeklyEvent(next));
          }}>
            Play Again
          </button>
        </section>
      ) : (
        <section className="layout">
          <div>
            <SystemsPanel state={state} />
            <DemographicsPanel state={state} />
          </div>
          <MapBoard state={state} score={score} />
          <div>
            <section className="glass panel">
              <h2>🧭 Week {state.week} Brief</h2>
              <p><strong>Current Event:</strong> {state.meta.weeklyEvent.title}</p>
              <p><strong>Opposition plan:</strong> {state.opponent.currentPlan ? `${state.opponent.currentPlan.move} targeting ${state.opponent.currentPlan.targetRegionName}` : 'No confirmed intel yet.'}</p>
              <p><strong>National Pulse:</strong> {score.nationalPulse}%</p>
              <Link href="/planning" className="proceedBtn planLink">Go to Planning Page ▶</Link>
            </section>
            <FeedPanel state={state} rules={rules} />
          </div>
        </section>
      )}
    </main>
  );
}
