export function SystemsPanel({ state }) {
  const gauges = [
    ['Momentum', state.candidate.momentum],
    ['Media Trust', state.candidate.mediaTrust],
    ['Field Power', state.candidate.fieldPower],
    ['Narrative', state.meta.narrative],
    ['Scandal Risk', state.candidate.scandalRisk],
    ['Energy', state.candidate.energy],
  ];

  return (
    <section className="glass panel">
      <h2>⚙️ Systems</h2>
      {gauges.map(([label, value]) => (
        <div key={label} className="gaugeRow">
          <span>{label}</span><strong>{value}</strong>
          <div className="meter"><div style={{ width: `${value}%` }} /></div>
        </div>
      ))}
    </section>
  );
}

export function DemographicsPanel({ state }) {
  return (
    <section className="glass panel">
      <h2>👥 Demographics</h2>
      {Object.values(state.candidate.demographics).sort((a, b) => b.support - a.support).map((d) => (
        <div key={d.id} className="line"><span>{d.name}</span><span>{d.support}% • loyalty {d.loyalty}%</span></div>
      ))}
    </section>
  );
}

export function FeedPanel({ state, rules }) {
  return (
    <section className="glass panel">
      <h2>📡 War Feed</h2>
      <div className="feed">{state.log.slice().reverse().map((e, i) => <p key={`${e}-${i}`}>• {e}</p>)}</div>
      <h3>Rules</h3>
      {rules.map((r) => <p key={r}>• {r}</p>)}
    </section>
  );
}
