import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import CountrySelector from '../src/components/CountrySelector';
import GameHUD from '../src/components/GameHUD';
import MapBoard from '../src/components/MapBoard';
import AnalystBubble from '../src/components/AnalystBubble';
import { DemographicsPanel, FeedPanel, SystemsPanel } from '../src/components/SidePanels';
import { computeElectionScore, generateWeeklyEvent, getAnalystTip, getResultBreakdown, getRules, isFinished, newGame, resultSummary } from '../src/game/gameEngine';
import { loadGameState, saveGameState } from '../src/game/session';
import { buildLocalPartyMap, getPartiesForCountry } from '../src/data/parties';

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
      const cacheKey = 'election-local-party-map-v1';
      let partyMap = null;
      if (typeof window !== 'undefined') {
        const cached = window.localStorage.getItem(cacheKey);
        partyMap = cached ? JSON.parse(cached) : null;
      }

      if (!partyMap) {
        partyMap = buildLocalPartyMap();
        if (typeof window !== 'undefined') window.localStorage.setItem(cacheKey, JSON.stringify(partyMap));
      }

      const options = partyMap[country] || getPartiesForCountry(country);
      const safeOptions = options.length ? options : ['Independent'];
      setPartyOptions(safeOptions);
      setPartySource('local-cache');
      const nextParty = safeOptions.includes(preferredParty) ? preferredParty : safeOptions[0];
      setSelectedParty(nextParty);
      return { options: safeOptions, nextParty };
    } catch {
      const fallback = getPartiesForCountry(country);
      const options = fallback.length ? fallback : ['Independent'];
      setPartyOptions(options);
      setPartySource('local-fallback');
      setSelectedParty(options[0]);
      return { options, nextParty: options[0] };
    }
  };

  useEffect(() => {
    let active = true;

    const boot = async () => {
      const stored = loadGameState();
      if (stored) {
        const country = stored.country?.name || 'United States';
        const party = stored.candidate?.party || 'Independent';

        setState(stored);
        setSelectedCountry(country);
        setSelectedParty(party);
        setEvent(generateWeeklyEvent(stored));
        setIsHydrated(true);

        const loaded = await loadParties(country, party);
        if (!active) return;

        setState((prev) => ({
          ...prev,
          candidate: { ...prev.candidate, party: loaded.nextParty },
          opponent: {
            ...prev.opponent,
            party: prev.opponent?.party || loaded.options.find((p) => p !== loaded.nextParty) || 'National Opposition Coalition',
          },
        }));
        return;
      }

      await loadParties('United States', 'Independent');
      if (active) setIsHydrated(true);
    };

    boot();
    return () => {
      active = false;
    };
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
