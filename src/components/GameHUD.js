export default function GameHUD({ state, score }) {
  return (
    <section className="hud glass">
      <div>
        <h1>{state.country.icon} Campaign Command</h1>
        <p>{state.country.name} • {state.country.electionType}</p>
      </div>
      <div className="hudStats">
        <span>Week {Math.min(state.week, state.totalWeeks)}/{state.totalWeeks}</span>
        <span>🎯 Target: {score.target}</span>
        <span>🧭 Mission: {state.meta.mission}</span>
      </div>
    </section>
  );
}
