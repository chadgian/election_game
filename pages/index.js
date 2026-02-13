import { useMemo, useState } from 'react';
import {
  applyChoice,
  computeElectoralScore,
  generateWeeklyEvent,
  getRules,
  getVictoryIntel,
  isFinished,
  newGame,
  resultSummary,
} from '../src/game/gameEngine';

function Gauge({ label, value, tone = 'blue' }) {
  return (
    <div className="gauge">
      <div className="gaugeHeader">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="gaugeTrack">
        <div className={`gaugeFill ${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function RegionNode({ region, projection }) {
  return (
    <div className={`regionNode ${projection >= 50 ? 'blue' : 'red'}`}>
      <div className="nodeTop">
        <strong>{region.name}</strong>
        <span>{region.electoralVotes} EV</span>
      </div>
      <div className="nodeMeta">
        <span>{projection}% projected</span>
        <span>Heat {region.heat}</span>
      </div>
      <div className="nodeBar"><div style={{ width: `${projection}%` }} /></div>
      <small>Turnout {region.turnout}% · Offices {region.fieldOffices}</small>
    </div>
  );
}

function OperationCard({ option, onPick }) {
  return (
    <button className={`opCard ${option.unethical ? 'dark' : ''}`} onClick={onPick}>
      <div className="opTitle">{option.title}</div>
      <div className="opSubtitle">{option.subtitle}</div>
      <p>{option.description}</p>
      <div className="opFooter">
        <span>Cost {option.operationCost} OP</span>
        <span>{option.unethical ? 'High Exposure' : 'Controlled Risk'}</span>
      </div>
    </button>
  );
}

export default function HomePage() {
  const [state, setState] = useState(() => newGame());
  const event = useMemo(() => (isFinished(state) ? null : generateWeeklyEvent(state)), [state]);
  const electoral = useMemo(() => computeElectoralScore(state), [state]);
  const rules = useMemo(() => getRules(), []);
  const momentumEdge = state.candidate.momentum - state.opponent.momentum;
  const narrativeEdge = state.meta.playerNarrative - state.meta.opponentNarrative;

  return (
    <main className="gameShell">
      <section className="topHud">
        <div>
          <h1>ELECTION COMMAND</h1>
          <p className="tagline">Turn-based political strategy campaign simulator</p>
        </div>
        <div className="hudMeta">
          <div>Week {Math.min(state.week, state.totalWeeks)}/{state.totalWeeks}</div>
          <div>Doctrine: {state.meta.archetype.name}</div>
          <div>Operation Points: {state.meta.operationPoints}</div>
        </div>
      </section>

      <section className="scoreBand">
        <div className="scoreTile blueGlow">
          <span>Your EV</span>
          <strong>{electoral.playerEV}</strong>
        </div>
        <div className="scoreTile redGlow">
          <span>Opponent EV</span>
          <strong>{electoral.opponentEV}</strong>
        </div>
        <div className="scoreTile neutral">
          <span>Victory Intel</span>
          <small>{getVictoryIntel(state)}</small>
        </div>
      </section>

      <section className="boardLayout">
        <div className="leftPanel panel">
          <h2>Candidate Systems</h2>
          <Gauge label="Momentum" value={state.candidate.momentum} tone="blue" />
          <Gauge label="Media Trust" value={state.candidate.mediaTrust} tone="teal" />
          <Gauge label="Field Power" value={state.candidate.fieldPower} tone="green" />
          <Gauge label="Narrative Control" value={state.meta.playerNarrative} tone="purple" />
          <Gauge label="Scandal Risk" value={state.candidate.scandalRisk} tone="red" />

          <div className="statGrid">
            <div><span>Funds</span><strong>{state.candidate.funds}</strong></div>
            <div><span>Ethics</span><strong>{state.candidate.ethicsScore}</strong></div>
            <div><span>Alliance</span><strong>{state.candidate.allianceLoyalty}</strong></div>
            <div><span>Campaign Fatigue</span><strong>{state.candidate.fatigue}</strong></div>
            <div><span>Your Momentum Edge</span><strong>{momentumEdge >= 0 ? '+' : ''}{momentumEdge}</strong></div>
            <div><span>Narrative Edge</span><strong>{narrativeEdge >= 0 ? '+' : ''}{narrativeEdge}</strong></div>
          </div>

          <div className="intelCard">
            <h3>Doctrine Card</h3>
            <p>{state.meta.doctrineCard}</p>
            <small>{state.meta.archetype.doctrine}</small>
          </div>
        </div>

        <div className="centerPanel panel">
          <h2>Electoral Theater</h2>
          <div className="regionGrid">
            {Object.values(state.candidate.regions).map((region) => {
              const projection = Math.max(
                0,
                Math.min(
                  100,
                  Math.round(
                    region.playerSupport + momentumEdge * 0.12 + narrativeEdge * 0.08 + (state.candidate.fieldPower - state.opponent.groundGame) * 0.05,
                  ),
                ),
              );
              return <RegionNode key={region.id} region={region} projection={projection} />;
            })}
          </div>

          <div className="demographicPanel">
            <h3>Demographic Pressure Map</h3>
            {Object.values(state.candidate.demographics)
              .sort((a, b) => b.support - a.support)
              .map((demo) => (
                <div key={demo.id} className="demoLine">
                  <span>{demo.name}</span>
                  <span>{demo.support}% support · {demo.loyalty}% loyalty</span>
                </div>
              ))}
          </div>
        </div>

        <div className="rightPanel panel">
          {!isFinished(state) && event ? (
            <>
              <h2>{event.context}</h2>
              <p className="eventPrompt">{event.prompt}</p>
              <div className="opsDeck">
                {event.options.map((option) => (
                  <OperationCard key={option.id} option={option} onPick={() => setState((prev) => applyChoice(prev, option))} />
                ))}
              </div>
            </>
          ) : (
            <div className="finalCard">
              <h2>Election Result</h2>
              <p>{resultSummary(state)}</p>
              <button className="newRun" onClick={() => setState(newGame())}>Start New Campaign</button>
            </div>
          )}

          <div className="timeline">
            <h3>War Room Feed</h3>
            {state.log.slice().reverse().map((entry, idx) => <p key={`${entry}-${idx}`}>• {entry}</p>)}
          </div>

          <div className="rules">
            <h3>Campaign Rules</h3>
            {rules.map((rule) => <p key={rule}>• {rule}</p>)}
          </div>
        </div>
      </section>

      <style jsx>{`
        .gameShell { min-height: 100vh; padding: 20px; color: #eaf2ff; background: radial-gradient(circle at 20% -10%, #2858b8 0%, #10182c 36%, #070b14 100%); font-family: Inter, system-ui, sans-serif; }
        .topHud { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
        h1 { margin: 0; font-size: 34px; letter-spacing: .08em; }
        .tagline { margin: 4px 0 0; color: #9eb4d8; }
        .hudMeta { display: grid; gap: 4px; text-align: right; color: #bfd4ff; font-weight: 600; }

        .scoreBand { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 8px; margin-bottom: 12px; }
        .scoreTile { border-radius: 14px; border: 1px solid #2e4062; background: rgba(16, 26, 43, .92); padding: 12px; display: grid; gap: 4px; }
        .scoreTile strong { font-size: 30px; }
        .scoreTile small { color: #bbcef0; }
        .blueGlow { box-shadow: inset 0 0 0 1px #3b82f6, 0 0 24px rgba(59,130,246,.18); }
        .redGlow { box-shadow: inset 0 0 0 1px #ef4444, 0 0 24px rgba(239,68,68,.16); }

        .boardLayout { display: grid; grid-template-columns: 300px 1fr 380px; gap: 10px; }
        .panel { border-radius: 14px; border: 1px solid #2c3d5f; background: rgba(11, 17, 30, .9); padding: 12px; }
        h2 { margin: 0 0 10px; font-size: 20px; }

        .gauge { margin-bottom: 8px; }
        .gaugeHeader { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; color: #c6d8fa; }
        .gaugeTrack { height: 8px; background: #1a2a43; border-radius: 999px; overflow: hidden; }
        .gaugeFill { height: 100%; }
        .gaugeFill.blue { background: linear-gradient(90deg,#60a5fa,#2563eb); }
        .gaugeFill.teal { background: linear-gradient(90deg,#22d3ee,#0ea5e9); }
        .gaugeFill.green { background: linear-gradient(90deg,#34d399,#16a34a); }
        .gaugeFill.purple { background: linear-gradient(90deg,#a78bfa,#7c3aed); }
        .gaugeFill.red { background: linear-gradient(90deg,#fb7185,#dc2626); }

        .statGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 10px 0; }
        .statGrid div { border: 1px solid #2a3957; border-radius: 10px; padding: 8px; display: grid; gap: 2px; }
        .statGrid span { font-size: 11px; color: #99afd4; text-transform: uppercase; letter-spacing: .05em; }
        .statGrid strong { font-size: 16px; }

        .intelCard { border: 1px solid #2a3d63; border-radius: 10px; padding: 10px; background: rgba(34, 69, 138, .15); }
        .intelCard h3 { margin: 0 0 6px; }
        .intelCard p { margin: 0 0 6px; }
        .intelCard small { color: #b2c6ea; }

        .regionGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .regionNode { border-radius: 10px; border: 1px solid #2f4468; padding: 8px; background: #0f1727; }
        .regionNode.blue { box-shadow: inset 0 0 0 1px rgba(59,130,246,.32); }
        .regionNode.red { box-shadow: inset 0 0 0 1px rgba(239,68,68,.28); }
        .nodeTop, .nodeMeta { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
        .nodeMeta { color: #a8bddf; }
        .nodeBar { height: 7px; border-radius: 99px; background: #1b2b45; overflow: hidden; margin-bottom: 4px; }
        .nodeBar div { height: 100%; background: linear-gradient(90deg,#60a5fa,#22d3ee); }

        .demographicPanel { margin-top: 10px; border-top: 1px solid #27395a; padding-top: 10px; }
        .demographicPanel h3 { margin: 0 0 8px; }
        .demoLine { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #1c2a42; font-size: 13px; }

        .eventPrompt { color: #c4d6f6; }
        .opsDeck { display: grid; gap: 8px; margin-bottom: 12px; }
        .opCard { text-align: left; border: 1px solid #32548f; background: linear-gradient(135deg,#162747,#0d1527); color: #eaf2ff; border-radius: 12px; padding: 10px; cursor: pointer; display: grid; gap: 5px; }
        .opCard:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,.24); }
        .opCard.dark { border-color: #8b2742; background: linear-gradient(135deg,#35182a,#1a1018); }
        .opTitle { font-weight: 700; }
        .opSubtitle { color: #9fb8df; font-size: 12px; }
        .opFooter { display: flex; justify-content: space-between; color: #9ac4ff; font-size: 12px; }

        .timeline, .rules { border-top: 1px solid #2a3d5f; padding-top: 10px; margin-top: 10px; }
        .timeline p, .rules p { margin: 4px 0; color: #c8daf8; font-size: 13px; }

        .finalCard { border: 1px solid #1f9f69; border-radius: 12px; padding: 10px; background: rgba(7, 48, 32, .42); }
        .newRun { border: 0; background: #1d4ed8; color: white; font-weight: 700; padding: 9px 12px; border-radius: 8px; cursor: pointer; }

        @media (max-width: 1200px) {
          .boardLayout { grid-template-columns: 1fr; }
          .scoreBand { grid-template-columns: 1fr; }
          .topHud { flex-direction: column; align-items: flex-start; }
          .hudMeta { text-align: left; }
        }
      `}</style>
    </main>
  );
}
