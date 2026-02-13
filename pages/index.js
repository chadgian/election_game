import { useMemo, useState } from 'react';
import {
  applyChoice,
  computeElectoralScore,
  generateWeeklyEvent,
  isFinished,
  newGame,
  resultSummary,
} from '../src/game/gameEngine';

function Metric({ label, value, accent = false }) {
  return (
    <div className={`metric ${accent ? 'accent' : ''}`}>
      <div className="metricLabel">{label}</div>
      <div className="metricValue">{value}</div>
    </div>
  );
}

function RegionCard({ region, momentumEdge }) {
  const adjustedSupport = Math.round(region.playerSupport + momentumEdge * 0.15);
  const leading = adjustedSupport >= 50;

  return (
    <div className={`region ${leading ? 'lead' : 'trail'}`}>
      <div className="regionTop">
        <strong>{region.name}</strong>
        <span>{region.electoralVotes} EV</span>
      </div>
      <div className="barWrap">
        <div className="barFill" style={{ width: `${Math.max(0, Math.min(100, adjustedSupport))}%` }} />
      </div>
      <small>{adjustedSupport}% support • turnout {region.turnout}% • offices {region.fieldOffices}</small>
    </div>
  );
}

export default function HomePage() {
  const [state, setState] = useState(() => newGame());
  const event = useMemo(() => (isFinished(state) ? null : generateWeeklyEvent(state)), [state]);
  const electoral = useMemo(() => computeElectoralScore(state), [state]);
  const momentumEdge = state.candidate.momentum - state.opponent.momentum;

  return (
    <main className="page">
      <header className="hero">
        <h1>Election War Room</h1>
        <p>Inspired by the strategic pressure of The Political Machine and 270-style electoral map play.</p>
        <div className="weekLine">
          <span>Week {Math.min(state.week, state.totalWeeks)} / {state.totalWeeks}</span>
          <div className="weekBar"><div style={{ width: `${(Math.min(state.week, state.totalWeeks) / state.totalWeeks) * 100}%` }} /></div>
        </div>
      </header>

      <section className="card">
        <h2>National Snapshot</h2>
        <div className="metricsRow">
          <Metric label="Funds" value={state.candidate.funds} accent />
          <Metric label="Momentum" value={state.candidate.momentum} />
          <Metric label="Field Power" value={state.candidate.fieldPower} />
          <Metric label="Scandal" value={state.candidate.scandalRisk} />
          <Metric label="Media Trust" value={state.candidate.mediaTrust} />
          <Metric label="Ethics" value={state.candidate.ethicsScore} />
        </div>
        <div className="duelRow">
          <div>
            <strong>You:</strong> {state.candidate.name} ({state.candidate.party})
          </div>
          <div>
            <strong>Opponent:</strong> {state.opponent.name} ({state.opponent.party})
          </div>
          <div>
            <strong>Momentum Edge:</strong> {momentumEdge >= 0 ? '+' : ''}{momentumEdge}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Electoral Map Projection</h2>
        <p>Current projection: <strong>{electoral.playerEV}</strong> EV vs <strong>{electoral.opponentEV}</strong> EV (target: 270)</p>
        <div className="regionsGrid">
          {Object.values(state.candidate.regions).map((region) => (
            <RegionCard key={region.id} region={region} momentumEdge={momentumEdge} />
          ))}
        </div>
      </section>

      {!isFinished(state) && event ? (
        <section className="card">
          <h2>{event.context}</h2>
          <p>{event.prompt}</p>
          <div className="optionsGrid">
            {event.options.map((option) => (
              <div key={option.id} className={`option ${option.unethical ? 'danger' : ''}`}>
                <h3>{option.title}</h3>
                <p>{option.description}</p>
                {option.unethical ? <small className="risk">High-risk tactic: can backfire hard.</small> : <small>Conventional strategic play.</small>}
                <button onClick={() => setState((prev) => applyChoice(prev, option))}>Execute Strategy</button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="card result">
          <h2>Election Complete</h2>
          <p>{resultSummary(state)}</p>
          <button onClick={() => setState(newGame())}>Run New Campaign</button>
        </section>
      )}

      <section className="split">
        <div className="card">
          <h2>Key Demographics</h2>
          {Object.values(state.candidate.demographics)
            .sort((a, b) => b.support - a.support)
            .map((demo) => (
              <div key={demo.id} className="demoRow">
                <span>{demo.name}</span>
                <span>{demo.support}% support • {demo.loyalty}% loyalty</span>
              </div>
            ))}
        </div>

        <div className="card">
          <h2>Campaign Timeline</h2>
          {state.log.slice().reverse().map((entry, idx) => <p key={`${entry}-${idx}`}>• {entry}</p>)}
        </div>
      </section>

      <style jsx>{`
        .page { max-width: 1180px; margin: 0 auto; padding: 24px; font-family: Inter, Arial, sans-serif; background: radial-gradient(circle at top,#132b57,#0b1220 45%); color: #e2e8f0; min-height: 100vh; }
        .hero { margin-bottom: 14px; }
        .hero h1 { margin-bottom: 6px; font-size: 34px; }
        .hero p { margin: 0 0 10px; color: #9fb0c8; }
        .weekLine { display: flex; gap: 12px; align-items: center; }
        .weekBar { flex: 1; height: 9px; background: #1e293b; border-radius: 999px; overflow: hidden; }
        .weekBar div { height: 100%; background: linear-gradient(90deg,#22d3ee,#2563eb); }
        .card { background: rgba(15,23,42,.9); border: 1px solid #2d3b55; border-radius: 14px; padding: 14px; margin-bottom: 12px; }
        h2 { margin: 0 0 8px; font-size: 20px; }
        .metricsRow { display: grid; grid-template-columns: repeat(6,minmax(0,1fr)); gap: 8px; }
        .metric { background: #182235; border-radius: 10px; padding: 8px; text-align: center; }
        .metric.accent { border: 1px solid #22d3ee; }
        .metricLabel { font-size: 11px; color: #90a2bd; text-transform: uppercase; letter-spacing: .04em; }
        .metricValue { font-size: 18px; font-weight: 700; }
        .duelRow { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; margin-top: 10px; color: #c7d5ea; }
        .regionsGrid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 8px; }
        .region { background: #172131; border-radius: 10px; padding: 9px; border: 1px solid #334155; }
        .region.lead { border-color: #10b981; }
        .region.trail { border-color: #ef4444; }
        .regionTop { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .barWrap { height: 8px; background: #253246; border-radius: 999px; overflow: hidden; margin-bottom: 5px; }
        .barFill { height: 100%; background: linear-gradient(90deg,#60a5fa,#22d3ee); }
        .optionsGrid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 8px; }
        .option { background: #1a2437; border: 1px solid #334155; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
        .option h3 { margin: 0; font-size: 16px; }
        .option p { margin: 0; color: #c5d2e8; }
        .option.danger { border-color: #ef4444; background: #2b1c24; }
        .risk { color: #fca5a5; }
        button { width: fit-content; background: #2563eb; color: #fff; border: 0; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-weight: 700; }
        .result { border-color: #22c55e; }
        .split { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
        .demoRow { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #253246; font-size: 14px; }
        @media (max-width: 980px) {
          .metricsRow { grid-template-columns: repeat(3,minmax(0,1fr)); }
          .optionsGrid, .split, .regionsGrid, .duelRow { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
