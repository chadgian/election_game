import { useMemo, useState } from 'react';
import { applyChoice, generateWeeklyEvent, isFinished, newGame, resultSummary } from '../src/game/gameEngine';

function Metric({ label, value }) {
  return (
    <div className="metric">
      <div className="metricLabel">{label}</div>
      <div className="metricValue">{value}</div>
    </div>
  );
}

export default function HomePage() {
  const [state, setState] = useState(() => newGame());
  const event = useMemo(() => (isFinished(state) ? null : generateWeeklyEvent(state)), [state]);

  return (
    <main className="page">
      <h1>Election Game</h1>
      <p>Week {Math.min(state.week, state.totalWeeks)} of {state.totalWeeks}</p>

      <div className="metricsRow">
        <Metric label="Funds" value={state.candidate.funds} />
        <Metric label="Momentum" value={state.candidate.momentum} />
        <Metric label="Scandal" value={state.candidate.scandalRisk} />
        <Metric label="Media" value={state.candidate.mediaTrust} />
        <Metric label="Alliance" value={state.candidate.allianceLoyalty} />
        <Metric label="Ethics" value={state.candidate.ethicsScore} />
      </div>

      {!isFinished(state) && event ? (
        <section className="card">
          <h2>{event.context}</h2>
          <p>{event.prompt}</p>
          {event.options.map((option) => (
            <div key={option.id} className={`option ${option.unethical ? 'danger' : ''}`}>
              <h3>{option.title}</h3>
              <p>{option.description}</p>
              <button onClick={() => setState((prev) => applyChoice(prev, option))}>Choose Strategy</button>
            </div>
          ))}
        </section>
      ) : (
        <section className="card">
          <h2>Election Complete</h2>
          <p>{resultSummary(state)}</p>
          <button onClick={() => setState(newGame())}>Start New Campaign</button>
        </section>
      )}

      <section className="card">
        <h2>Demographics</h2>
        {Object.values(state.candidate.demographics)
          .sort((a, b) => b.support - a.support)
          .map((demo) => (
            <p key={demo.id}>{demo.name}: {demo.support}% support • {demo.loyalty}% loyalty</p>
          ))}
      </section>

      <section className="card">
        <h2>Campaign Log</h2>
        {state.log.slice().reverse().map((entry, idx) => <p key={`${entry}-${idx}`}>• {entry}</p>)}
      </section>

      <style jsx>{`
        .page { max-width: 980px; margin: 0 auto; padding: 24px; font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
        .metricsRow { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 10px; margin-bottom: 14px; }
        .metric { background: #1e293b; border-radius: 10px; padding: 8px; text-align: center; }
        .metricLabel { font-size: 12px; color: #94a3b8; }
        .metricValue { font-size: 16px; font-weight: bold; }
        .card { background: #1e293b; border-radius: 12px; padding: 12px; margin-bottom: 12px; }
        .option { background: #334155; border-radius: 10px; padding: 10px; margin-top: 8px; }
        .option.danger { border: 1px solid #ef4444; }
        button { background: #2563eb; color: #fff; border: 0; border-radius: 8px; padding: 8px 12px; cursor: pointer; }
        @media (max-width: 700px) { .metricsRow { grid-template-columns: repeat(2, minmax(0,1fr)); } }
      `}</style>
    </main>
  );
}
