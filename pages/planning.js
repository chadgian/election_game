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
  const [focusRegionId, setFocusRegionId] = useState('');
  const [takeTvShow, setTakeTvShow] = useState(false);
  const [rallyGuests, setRallyGuests] = useState([]);

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

  const toggleRallyGuest = (guest) => {
    const exists = rallyGuests.includes(guest);
    if (exists) return setRallyGuests(rallyGuests.filter((g) => g !== guest));
    if (rallyGuests.length >= 4) return;
    setRallyGuests([...rallyGuests, guest]);
  };

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
    const weekExtras = {
      focusRegionId: focusRegionId || null,
      tvShow: takeTvShow && event.weekOpportunity?.tvShow ? event.weekOpportunity.tvShow : null,
      rallyGuests,
    };
    const next = proceedWeek(state, selectedOptions, mediaPayload, weekExtras);
    setState(next);
    saveGameState(next);
    setSelectedOptions([]);
    setMediaAnswer('');
    setMediaChoice('answer');
    setFocusRegionId('');
    setTakeTvShow(false);
    setRallyGuests([]);
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
        <Link href="/tutorial" className="tab">📘 Tutorial</Link>
      </section>

      <section className="glass panel">
        <h2>Week {state.week} Planning Room</h2>
        <p>{state.country.icon} {state.country.name} • {state.candidate.party} • National Pulse {score.nationalPulse}% • Target {score.target}</p>
      </section>


      <section className="glass panel">
        <h2>🎛️ Personalized Week Controls</h2>
        <p><strong>Candidate:</strong> {state.candidate.name} vs {state.opponent.name}</p>
        <label htmlFor="focusRegion">Focus Campaign Region</label>
        <select id="focusRegion" value={focusRegionId} onChange={(e) => setFocusRegionId(e.target.value)}>
          <option value="">No special focus</option>
          {state.country.regions.map((region) => (
            <option key={region.id} value={region.id}>{region.name}</option>
          ))}
        </select>

        {event.weekOpportunity?.tvShow ? (
          <p>
            <label>
              <input type="checkbox" checked={takeTvShow} onChange={(e) => setTakeTvShow(e.target.checked)} />
              Join TV Live Show: <strong>{event.weekOpportunity.tvShow}</strong>
            </label>
          </p>
        ) : (
          <p>No TV live show invitation this week.</p>
        )}

        {event.week === state.totalWeeks ? (
          <>
            <h3>🎉 Grand Rally Guest List (max 4)</h3>
            {['Family Member', 'Community Leader', 'Faith Leader', 'Youth Organizer', 'Labor Representative', 'Business Ally', 'Entertainer', 'Co-politician'].map((guest) => (
              <label key={guest} className="guestPick">
                <input type="checkbox" checked={rallyGuests.includes(guest)} onChange={() => toggleRallyGuest(guest)} /> {guest}
              </label>
            ))}
          </>
        ) : null}
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
