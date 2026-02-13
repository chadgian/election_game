import { useMemo, useState } from 'react';
import CountrySelector from '../src/components/CountrySelector';
import GameHUD from '../src/components/GameHUD';
import MapBoard from '../src/components/MapBoard';
import OperationDeck from '../src/components/OperationDeck';
import { DemographicsPanel, FeedPanel, SystemsPanel } from '../src/components/SidePanels';
import {
  applyChoice,
  computeElectionScore,
  generateWeeklyEvent,
  getRules,
  isFinished,
  newGame,
  resultSummary,
} from '../src/game/gameEngine';

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [state, setState] = useState(() => newGame('United States'));

  const event = useMemo(() => (isFinished(state) ? null : generateWeeklyEvent(state)), [state]);
  const score = useMemo(() => computeElectionScore(state), [state]);
  const rules = useMemo(() => getRules(state), [state]);

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setState(newGame(country));
  };

  return (
    <main className="game">
      <GameHUD state={state} score={score} />
      <CountrySelector currentCountry={selectedCountry} onSelect={handleCountryChange} />

      {isFinished(state) ? (
        <section className="glass final">
          <h2>🏁 Election Complete</h2>
          <p>{resultSummary(state)}</p>
          <button onClick={() => setState(newGame(selectedCountry))}>Play Again</button>
        </section>
      ) : (
        <section className="layout">
          <div>
            <SystemsPanel state={state} />
            <DemographicsPanel state={state} />
          </div>
          <MapBoard state={state} score={score} />
          <div>
            {event ? <OperationDeck event={event} onPick={(option) => setState((prev) => applyChoice(prev, option))} /> : null}
            <FeedPanel state={state} rules={rules} />
          </div>
        </section>
      )}
    </main>
  );
}
