import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import AnalystBubble from '../src/components/AnalystBubble';
import OperationDeck from '../src/components/OperationDeck';
import { computeElectionScore, generateWeeklyEvent, getAnalystTip, getRules, isFinished, newGame, proceedWeek } from '../src/game/gameEngine';
import { loadGameState, saveGameState } from '../src/game/session';

export default function PlanningPage() {
  const router = useRouter();
  const [state, setState] = useState(() => newGame('United States'));
  const [event, setEvent] = useState(() => generateWeeklyEvent(state));
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [mediaChoice, setMediaChoice] = useState('answer');
  const [mediaAnswer, setMediaAnswer] = useState('');

  useEffect(() => {
    const stored = loadGameState();
    const base = stored || newGame('United States');
    setState(base);
    setEvent(generateWeeklyEvent(base));
  }, []);

  const score = useMemo(() => computeElectionScore(state), [state]);
  const rules = useMemo(() => getRules(state), [state]);
  const analystTip = useMemo(() => getAnalystTip(state, event, selectedOptions), [state, event, selectedOptions]);
  const pendingMediaQuestion = state.meta.pendingMediaQuestion;

  const toggleOption = (option) => {
    const exists = selectedOptions.some((item) => item.id === option.id);
    if (exists) return setSelectedOptions(selectedOptions.filter((item) => item.id !== option.id));
    if (selectedOptions.length >= state.meta.maxActionsPerWeek) return;
    setSelectedOptions([...selectedOptions, option]);
  };

  const handleProceedWeek = () => {
    const mediaPayload = pendingMediaQuestion
      ? (mediaChoice === 'ignore' ? { ignored: true, answer: '' } : { ignored: false, answer: mediaAnswer })
      : null;
    const next = proceedWeek(state, selectedOptions, mediaPayload);
    setState(next);
    saveGameState(next);
    setSelectedOptions([]);
    setMediaAnswer('');
    setMediaChoice('answer');
    if (!isFinished(next)) setEvent(generateWeeklyEvent(next));
    router.push('/briefing');
  };

  return (
    <main className="game">
      {!isFinished(state) ? <AnalystBubble tip={analystTip} /> : null}

      <section className="glass pageTabs">
        <Link href="/" className="tab">🏛️ HQ</Link>
        <Link href="/planning" className="tab active">🗓️ Weekly Planning</Link>
        <Link href="/briefing" className="tab">🧾 Opposition Briefing</Link>
      </section>

      <section className="glass panel">
        <h2>Week {state.week} Planning Room</h2>
        <p>{state.country.icon} {state.country.name} • {state.candidate.party} • National Pulse {score.nationalPulse}% • Target {score.target}</p>
      </section>

      {pendingMediaQuestion ? (
        <section className="glass panel mediaPanel">
          <h2>🎙️ Media Question This Week</h2>
          <p><strong>Topic:</strong> {pendingMediaQuestion.topic} | <strong>Backdrop:</strong> {pendingMediaQuestion.contextHint}</p>
          <p>{pendingMediaQuestion.question}</p>
          <div className="mediaActions">
            <label><input type="radio" name="media_choice" checked={mediaChoice === 'answer'} onChange={() => setMediaChoice('answer')} /> Answer question</label>
            <label><input type="radio" name="media_choice" checked={mediaChoice === 'ignore'} onChange={() => setMediaChoice('ignore')} /> Ignore question</label>
          </div>
          {mediaChoice === 'answer' ? (
            <textarea
              className="mediaInput"
              value={mediaAnswer}
              onChange={(e) => setMediaAnswer(e.target.value)}
              placeholder="Type your response. AI will evaluate impact based on question and campaign context."
            />
          ) : null}
        </section>
      ) : null}

      {!isFinished(state) ? (
        <section className="layoutSingle">
          <OperationDeck
            event={event}
            selectedOptions={selectedOptions}
            onToggleOption={toggleOption}
            onProceed={handleProceedWeek}
            remainingActions={state.meta.maxActionsPerWeek - selectedOptions.length}
          />
          <section className="glass panel">
            <h2>Selected Weekly Plan</h2>
            {selectedOptions.length ? selectedOptions.map((o) => <p key={o.id}>• {o.icon} {o.title} ({o.track})</p>) : <p>No actions selected yet.</p>}
            <h3>Planning Rules</h3>
            {rules.map((r) => <p key={r}>• {r}</p>)}
          </section>
        </section>
      ) : (
        <section className="glass final"><h2>Campaign already finished.</h2><Link href="/">Return to HQ</Link></section>
      )}
    </main>
  );
}
