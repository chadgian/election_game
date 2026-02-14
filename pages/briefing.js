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
  const weeklyImpact = state.meta.weeklyImpact;

  return (
    <main className="game">
      <section className="glass pageTabs">
        <Link href="/" className="tab">🏛️ HQ</Link>
        <Link href="/planning" className="tab">🗓️ Weekly Planning</Link>
        <Link href="/briefing" className="tab active">🧾 Opposition Briefing</Link>
        <Link href="/tutorial" className="tab">📘 Tutorial</Link>
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
          <h2>🪪 Candidate Profiles</h2>
          <p><strong>{state.candidate.name}</strong> ({state.candidate.party})</p>
          <p>{state.candidate.profile?.race} • {state.candidate.profile?.gender} • age {state.candidate.profile?.age}</p>
          <p><strong>Profession:</strong> {state.candidate.profile?.profession} | <strong>Economic Status:</strong> {state.candidate.profile?.economicStatus}</p>
          <p><strong>Policies:</strong> {state.candidate.profile?.policies}</p>
          <p><strong>Projects:</strong> {state.candidate.profile?.projects}</p>
          <p><strong>Values:</strong> {state.candidate.profile?.lifeValues}</p>
          <hr />
          <p><strong>{state.opponent.name}</strong> ({state.opponent.party})</p>
          <p>{state.opponent.profile?.race} • {state.opponent.profile?.gender} • age {state.opponent.profile?.age}</p>
          <p><strong>Profession:</strong> {state.opponent.profile?.profession} | <strong>Economic Status:</strong> {state.opponent.profile?.economicStatus}</p>
          <p><strong>Policies:</strong> {state.opponent.profile?.policies}</p>
          <p><strong>Projects:</strong> {state.opponent.profile?.projects}</p>
          <p><strong>Values:</strong> {state.opponent.profile?.lifeValues}</p>
        </section>

        <section className="glass panel">
          <h2>🎯 Strategic Focus Tracker</h2>
          <p><strong>Focused Region:</strong> {state.meta.focusRegionName || 'None selected last week'}</p>
          <p><strong>Grand Rally:</strong> {state.meta.rallyPlan ? `Hosted with ${state.meta.rallyPlan.guests.join(', ')}` : 'No grand rally yet'}</p>
          <p><strong>Rally Impact:</strong> {state.meta.rallyPlan ? `+${state.meta.rallyPlan.impact} momentum package` : 'N/A'}</p>
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
              <p><strong>Opposition answer:</strong> {lastMedia.oppositionAnswer}</p>
              <p><strong>Impact:</strong> {lastMedia.momentumShift >= 0 ? '+' : ''}{lastMedia.momentumShift} momentum, {lastMedia.trustShift >= 0 ? '+' : ''}{lastMedia.trustShift} media trust</p>
            </>
          ) : (
            <p>No media question resolved yet.</p>
          )}
        </section>


        <section className="glass panel impactPanel">
          <h2>📈 Last Week Impact Summary</h2>
          {weeklyImpact ? (
            <>
              <p><strong>Week:</strong> {weeklyImpact.week}</p>
              <p><strong>Selected tracks:</strong> {weeklyImpact.tracks.join(', ') || 'N/A'}</p>

              <h3>Systems</h3>
              {weeklyImpact.systems.map((s) => (
                <p key={s.label}>• {s.label}: {s.delta >= 0 ? '+' : ''}{s.delta}</p>
              ))}

              <h3>Demographics</h3>
              <p><strong>Top gain:</strong> {weeklyImpact.demographics.topGain ? `${weeklyImpact.demographics.topGain.name} (${weeklyImpact.demographics.topGain.delta >= 0 ? '+' : ''}${weeklyImpact.demographics.topGain.delta})` : 'None'}</p>
              <p><strong>Top loss:</strong> {weeklyImpact.demographics.topLoss ? `${weeklyImpact.demographics.topLoss.name} (${weeklyImpact.demographics.topLoss.delta})` : 'None'}</p>

              <h3>Electoral Theater</h3>
              <p><strong>National pulse:</strong> {weeklyImpact.electoralTheater.pulseDelta >= 0 ? '+' : ''}{weeklyImpact.electoralTheater.pulseDelta}</p>
              <p><strong>Projected score swing:</strong> {weeklyImpact.electoralTheater.scoreDelta >= 0 ? '+' : ''}{weeklyImpact.electoralTheater.scoreDelta}</p>
              {weeklyImpact.electoralTheater.topRegions.map((r) => (
                <p key={r.name}>• {r.name}: support {r.supportDelta >= 0 ? '+' : ''}{r.supportDelta}, turnout {r.turnoutDelta >= 0 ? '+' : ''}{r.turnoutDelta}</p>
              ))}
            </>
          ) : (
            <p>No completed week impact summary yet.</p>
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
