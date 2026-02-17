function RegionCard({ region, projection }) {
  return (
    <article className={`region ${projection >= 50 ? 'lead' : 'trail'}`}>
      <header>
        <strong>{region.name}</strong>
        <span>{region.points} pts</span>
      </header>
      <div className="meter"><div style={{ width: `${projection}%` }} /></div>
      <small>{projection}% projected • turnout {region.turnout}% • offices {region.fieldOffices}</small>
    </article>
  );
}

export default function MapBoard({ state, score }) {
  const momentumEdge = state.candidate.momentum - state.opponent.momentum;
  const narrativeEdge = state.meta.narrative - state.opponent.narrative;

  return (
    <section className="glass panel">
      <h2>🗺️ Electoral Theater</h2>
      <p>You {score.player} - {score.opponent} Rival</p>
      <div className="regions">
        {Object.values(state.candidate.regions).map((region) => {
          const projection = Math.max(0, Math.min(100, Math.round(region.playerSupport + momentumEdge * 0.1 + narrativeEdge * 0.08)));
          return <RegionCard key={region.id} region={region} projection={projection} />;
        })}
      </div>
    </section>
  );
}
