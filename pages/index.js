import { useEffect, useMemo, useState } from 'react';
import CountrySelector from '../src/components/CountrySelector';
import GameHUD from '../src/components/GameHUD';
import MapBoard from '../src/components/MapBoard';
import OperationDeck from '../src/components/OperationDeck';
import AnalystBubble from '../src/components/AnalystBubble';
import { DemographicsPanel, FeedPanel, SystemsPanel } from '../src/components/SidePanels';
import {
  computeElectionScore,
  generateWeeklyEvent,
  getAnalystTip,
  getRules,
  isFinished,
  newGame,
  proceedWeek,
  resultSummary,
} from '../src/game/gameEngine';

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [state, setState] = useState(() => newGame('United States'));
  const [event, setEvent] = useState(() => generateWeeklyEvent(state));
  const [selectedOptions, setSelectedOptions] = useState([]);

  const score = useMemo(() => computeElectionScore(state), [state]);
  const rules = useMemo(() => getRules(state), [state]);
  const analystTip = useMemo(() => getAnalystTip(state, event, selectedOptions), [state, event, selectedOptions]);

  useEffect(() => {
    if (!isFinished(state)) {
      setEvent(generateWeeklyEvent(state));
      setSelectedOptions([]);
    }
  }, [state.week, selectedCountry]);

  const handleCountryChange = (country) => {
    const next = newGame(country);
    setSelectedCountry(country);
    setState(next);
    setEvent(generateWeeklyEvent(next));
    setSelectedOptions([]);
  };

  const toggleOption = (option) => {
    const exists = selectedOptions.some((item) => item.id === option.id);
    if (exists) {
      setSelectedOptions(selectedOptions.filter((item) => item.id !== option.id));
      return;
    }
    if (selectedOptions.length >= state.meta.maxActionsPerWeek) return;
    setSelectedOptions([...selectedOptions, option]);
  };

  const handleProceedWeek = () => {
    setState((prev) => proceedWeek(prev, selectedOptions));
  };

  return (
    <main className="game">
      {!isFinished(state) ? <AnalystBubble tip={analystTip} /> : null}
      <GameHUD state={state} score={score} />
      <CountrySelector currentCountry={selectedCountry} onSelect={handleCountryChange} />

      {isFinished(state) ? (
        <section className="glass final">
          <h2>🏁 Election Complete</h2>
          <p>{resultSummary(state)}</p>
          <button onClick={() => {
            const next = newGame(selectedCountry);
            setState(next);
            setEvent(generateWeeklyEvent(next));
            setSelectedOptions([]);
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
            <OperationDeck
              event={event}
              selectedOptions={selectedOptions}
              onToggleOption={toggleOption}
              onProceed={handleProceedWeek}
              remainingActions={state.meta.maxActionsPerWeek - selectedOptions.length}
            />
            <FeedPanel state={state} rules={rules} />
          </div>
        </section>
      )}
    </main>
  );
}
