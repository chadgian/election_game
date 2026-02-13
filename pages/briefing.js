import Link from 'next/link';
import { useEffect, useState } from 'react';
import { computeElectionScore, newGame } from '../src/game/gameEngine';
import { loadGameState } from '../src/game/session';

export default function BriefingPage() {
  const [state, setState] = useState(() => newGame('United States'));

  useEffect(() => {
    const stored = loadGameState();
    if (stored) setState(stored);
  }, []);

  const score = computeElectionScore(state);
  const lastHistory = state.meta.actionHistory?.[state.meta.actionHistory.length - 1];
  const lastMedia = state.meta.mediaHistory?.[state.meta.mediaHistory.length - 1];
  const opp = state.opponent.currentPlan;

  return (
    <main className="game">
      <section className="glass pageTabs">
        <Link href="/" className="tab">🏛️ HQ</Link>
        <Link href="/planning" className="tab">🗓️ Weekly Planning</Link>
        <Link href="/briefing" className="tab active">🧾 Opposition Briefing</Link>
      </section>

      <section className="layoutSingle">
        <section className="glass panel">
          <h2>Opposition Activity</h2>
          <p><strong>Party:</strong> {state.opponent.party}</p>
          <p><strong>Profile:</strong> {state.opponent.traits?.style} | Aggression {state.opponent.traits?.aggression} | Discipline {state.opponent.traits?.discipline}</p>
          {opp ? (
            <>
              <p><strong>Move:</strong> {opp.move}</p>
              <p><strong>Target:</strong> {opp.targetRegionName}</p>
              <p><strong>Impact:</strong> +{opp.momentum} opponent momentum, +{opp.narrative} narrative</p>
            </>
          ) : (
            <p>No reliable opposition move captured yet.</p>
          )}
        </section>

        <section className="glass panel">
          <h2>Campaign Event & Score Drift Check</h2>
          <p><strong>Weekly Event:</strong> {state.meta.weeklyEvent?.title || 'N/A'}</p>
          <p><strong>National Pulse:</strong> {score.nationalPulse}%</p>
          <p><strong>Projected Score:</strong> You {score.player} - {score.opponent} Rival</p>
          <p><strong>Target:</strong> {score.target}</p>
        </section>

        <section className="glass panel">
          <h2>Media Q&A Outcome</h2>
          {lastMedia ? (
            <>
              <p><strong>Question:</strong> {lastMedia.question}</p>
              <p><strong>Your response:</strong> {lastMedia.answer}</p>
              <p><strong>AI Analysis:</strong> Your score {lastMedia.playerScore} vs Opposition {lastMedia.oppositionScore}</p>
              <p><strong>Impact:</strong> {lastMedia.momentumShift >= 0 ? '+' : ''}{lastMedia.momentumShift} momentum, {lastMedia.trustShift >= 0 ? '+' : ''}{lastMedia.trustShift} media trust</p>
            </>
          ) : (
            <p>No media question resolved yet.</p>
          )}
        </section>

        <section className="glass panel">
          <h2>Your Previous Week Selections</h2>
          {lastHistory ? (
            <>
              <p><strong>Week:</strong> {lastHistory.week}</p>
              <p><strong>Tracks:</strong> {lastHistory.tracks.join(', ')}</p>
              <p><strong>Dark Tactics Used:</strong> {lastHistory.dark}</p>
            </>
          ) : (
            <p>No completed week yet.</p>
          )}
          <Link href="/planning" className="proceedBtn planLink">Plan Next Week ▶</Link>
        </section>
      </section>
    </main>
  );
}
