import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import CountrySelector from '../src/components/CountrySelector';
import GameHUD from '../src/components/GameHUD';
import MapBoard from '../src/components/MapBoard';
import AnalystBubble from '../src/components/AnalystBubble';
import { DemographicsPanel, FeedPanel, SystemsPanel } from '../src/components/SidePanels';
import { computeElectionScore, generateWeeklyEvent, getAnalystTip, getResultBreakdown, getRules, isFinished, newGame, resultSummary } from '../src/game/gameEngine';
import { loadGameState, saveGameState } from '../src/game/session';

export default function HQPage() {
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [partyOptions, setPartyOptions] = useState(['Independent']);
  const [selectedParty, setSelectedParty] = useState('Independent');
  const [partySource, setPartySource] = useState('loading');
  const [isHydrated, setIsHydrated] = useState(false);
  const [state, setState] = useState(() => newGame('United States', 'Independent', ['Independent']));
  const [event, setEvent] = useState(() => generateWeeklyEvent(state));

  const loadParties = async (country, preferredParty) => {
    try {
      const response = await fetch(`/api/parties?country=${encodeURIComponent(country)}`);
      const data = await response.json();
      const options = data.parties?.length ? data.parties : ['Independent'];
      setPartyOptions(options);
      setPartySource(data.source || 'fallback');
      const nextParty = options.includes(preferredParty) ? preferredParty : options[0];
      setSelectedParty(nextParty);
      return { options, nextParty };
    } catch {
      const options = ['Independent'];
      setPartyOptions(options);
      setPartySource('fallback');
      setSelectedParty(options[0]);
      return { options, nextParty: options[0] };
    }
  };

  useEffect(() => {
    const boot = async () => {
      const stored = loadGameState();
      if (stored) {
        const party = stored.candidate?.party || 'Independent';
        const country = stored.country?.name || 'United States';
        const loaded = await loadParties(country, party);
        const hydrated = {
          ...stored,
          candidate: { ...stored.candidate, party: loaded.nextParty },
          opponent: { ...stored.opponent, party: stored.opponent?.party || loaded.options.find((p) => p !== loaded.nextParty) || 'National Opposition Coalition' },
        };
        setState(hydrated);
        setSelectedCountry(country);
        setEvent(generateWeeklyEvent(hydrated));
        setIsHydrated(true);
        return;
      }
      await loadParties('United States', 'Independent');
      setIsHydrated(true);
    };
    boot();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveGameState(state);
  }, [state, isHydrated]);

  const score = useMemo(() => computeElectionScore(state), [state]);
  const rules = useMemo(() => getRules(state), [state]);
  const analystTip = useMemo(() => getAnalystTip(state, event, []), [state, event]);
  const resultBreakdown = useMemo(() => getResultBreakdown(state), [state]);

  const resetCampaign = (country, party, parties) => {
    const next = newGame(country, party, parties);
    setState(next);
    setEvent(generateWeeklyEvent(next));
  };

  const handleCountryChange = async (country) => {
    setSelectedCountry(country);
    const loaded = await loadParties(country, selectedParty);
    resetCampaign(country, loaded.nextParty, loaded.options);
  };

  const handlePartyChange = (party) => {
    setSelectedParty(party);
    resetCampaign(selectedCountry, party, partyOptions);
  };

  return (
    <main className="game">
      {!isFinished(state) ? <AnalystBubble tip={analystTip} /> : null}
      <GameHUD state={state} score={score} />
      <CountrySelector
        currentCountry={selectedCountry}
        onSelectCountry={handleCountryChange}
        parties={partyOptions}
        selectedParty={selectedParty}
        onSelectParty={handlePartyChange}
        partySource={partySource}
      />

      <section className="glass pageTabs">
        <Link href="/" className="tab active">🏛️ HQ</Link>
        <Link href="/planning" className="tab">🗓️ Weekly Planning</Link>
        <Link href="/briefing" className="tab">🧾 Opposition Briefing</Link>
        <Link href="/tutorial" className="tab">📘 Tutorial</Link>
      </section>

      {isFinished(state) ? (
        <section className="glass final">
          <h2>🏁 Election Complete</h2>
          <p>{resultSummary(state)}</p>
          <h3>Top factors behind the result</h3>
          {resultBreakdown.topFactors.map((factor) => (
            <p key={factor.label}>• {factor.label}: {factor.value >= 0 ? '+' : ''}{factor.value}</p>
          ))}
          <button onClick={() => resetCampaign(selectedCountry, selectedParty, partyOptions)}>Play Again</button>
        </section>
      ) : (
        <section className="layout">
          <div>
            <SystemsPanel state={state} />
            <DemographicsPanel state={state} />
          </div>
          <MapBoard state={state} score={score} />
          <div>
            <section className="glass panel">
              <h2>🧭 Week {state.week} Brief</h2>
              <p><strong>Your party:</strong> {state.candidate.party}</p>
              <p><strong>Opposition:</strong> {state.opponent.party} ({state.opponent.traits?.style})</p>
              <p><strong>Current Event:</strong> {state.meta.weeklyEvent.title}</p>
              <p><strong>Opposition plan:</strong> {state.opponent.currentPlan ? `${state.opponent.currentPlan.move} targeting ${state.opponent.currentPlan.targetRegionName}` : 'No confirmed intel yet.'}</p>
              <p><strong>National Pulse:</strong> {score.nationalPulse}%</p>
              <Link href="/planning" className="proceedBtn planLink">Go to Planning Page ▶</Link>
            </section>
            <FeedPanel state={state} rules={rules} />
          </div>
        </section>
      )}
    </main>
  );
}
