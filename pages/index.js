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

  const [playerName, setPlayerName] = useState('Player Candidate');
  const [opponentName, setOpponentName] = useState('Main Rival');
  const [opponentParty, setOpponentParty] = useState('National Opposition Coalition');
  const [opponentStyle, setOpponentStyle] = useState('Technocratic Reformer');
  const [opponentAggression, setOpponentAggression] = useState(55);
  const [opponentDiscipline, setOpponentDiscipline] = useState(55);
  const [opponentMediaSkill, setOpponentMediaSkill] = useState(55);
  const [opponentPolicyDepth, setOpponentPolicyDepth] = useState(55);
  const [candidateProfile, setCandidateProfile] = useState({ race: 'Prefer not to say', age: 50, gender: 'Not specified', profession: 'Public servant', economicStatus: 'Middle class', policies: '', projects: '', lifeValues: '' });
  const [opponentProfile, setOpponentProfile] = useState({ race: 'Prefer not to say', age: 52, gender: 'Not specified', profession: 'Public servant', economicStatus: 'Middle class', policies: '', projects: '', lifeValues: '' });

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
        setPlayerName(stored.candidate?.name || 'Player Candidate');
        setOpponentName(stored.opponent?.name || 'Main Rival');
        setOpponentParty(stored.opponent?.party || 'National Opposition Coalition');
        setOpponentStyle(stored.opponent?.traits?.style || 'Technocratic Reformer');
        setOpponentAggression(stored.opponent?.traits?.aggression || 55);
        setOpponentDiscipline(stored.opponent?.traits?.discipline || 55);
        setOpponentMediaSkill(stored.opponent?.traits?.mediaSkill || 55);
        setOpponentPolicyDepth(stored.opponent?.traits?.policyDepth || 55);
        setCandidateProfile(stored.candidate?.profile || { race: 'Prefer not to say', age: 50, gender: 'Not specified', profession: 'Public servant', economicStatus: 'Middle class', policies: '', projects: '', lifeValues: '' });
        setOpponentProfile(stored.opponent?.profile || { race: 'Prefer not to say', age: 52, gender: 'Not specified', profession: 'Public servant', economicStatus: 'Middle class', policies: '', projects: '', lifeValues: '' });
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

  const resetCampaign = (country, party, parties, setup = null) => {
    const next = newGame(country, party, parties, setup || {
      playerName,
      opponentName,
      opponentParty,
      opponentTraits: { style: opponentStyle, aggression: Number(opponentAggression), discipline: Number(opponentDiscipline), mediaSkill: Number(opponentMediaSkill), policyDepth: Number(opponentPolicyDepth) },
      candidateProfile: { ...candidateProfile, age: Number(candidateProfile.age || 50) },
      opponentProfile: { ...opponentProfile, age: Number(opponentProfile.age || 52) },
    });
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


  const applyPersonalization = () => {
    resetCampaign(selectedCountry, selectedParty, partyOptions, {
      playerName,
      opponentName,
      opponentParty,
      opponentTraits: {
        style: opponentStyle,
        aggression: Number(opponentAggression),
        discipline: Number(opponentDiscipline),
        mediaSkill: Number(opponentMediaSkill),
        policyDepth: Number(opponentPolicyDepth),
      },
      candidateProfile: { ...candidateProfile, age: Number(candidateProfile.age || 50) },
      opponentProfile: { ...opponentProfile, age: Number(opponentProfile.age || 52) },
    });
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

      <section className="glass panel profileSetup">
        <h2>🧬 Campaign Personalization</h2>
        <p>Customize candidate/opponent identity, party, characteristics, and policy profile.</p>
        <div className="profileGrid">
          <div>
            <h3>Player</h3>
            <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Player name" />
            <input value={candidateProfile.race} onChange={(e) => setCandidateProfile({ ...candidateProfile, race: e.target.value })} placeholder="Race / Ethnicity" />
            <input type="number" value={candidateProfile.age} onChange={(e) => setCandidateProfile({ ...candidateProfile, age: e.target.value })} placeholder="Age" />
            <input value={candidateProfile.gender} onChange={(e) => setCandidateProfile({ ...candidateProfile, gender: e.target.value })} placeholder="Gender" />
            <input value={candidateProfile.profession} onChange={(e) => setCandidateProfile({ ...candidateProfile, profession: e.target.value })} placeholder="Profession" />
            <input value={candidateProfile.economicStatus} onChange={(e) => setCandidateProfile({ ...candidateProfile, economicStatus: e.target.value })} placeholder="Economic status" />
            <textarea value={candidateProfile.policies} onChange={(e) => setCandidateProfile({ ...candidateProfile, policies: e.target.value })} placeholder="Policies" />
            <textarea value={candidateProfile.projects} onChange={(e) => setCandidateProfile({ ...candidateProfile, projects: e.target.value })} placeholder="Proposed projects" />
            <textarea value={candidateProfile.lifeValues} onChange={(e) => setCandidateProfile({ ...candidateProfile, lifeValues: e.target.value })} placeholder="Values in life" />
          </div>
          <div>
            <h3>Opponent</h3>
            <input value={opponentName} onChange={(e) => setOpponentName(e.target.value)} placeholder="Opponent name" />
            <select value={opponentParty} onChange={(e) => setOpponentParty(e.target.value)}>
              {[...new Set([...partyOptions, 'National Opposition Coalition'])].map((party) => <option key={party} value={party}>{party}</option>)}
            </select>
            <select value={opponentStyle} onChange={(e) => setOpponentStyle(e.target.value)}>
              {['Populist Nationalist', 'Technocratic Reformer', 'Traditional Conservative', 'Grassroots Progressive', 'Media Savvy Centrist'].map((style) => <option key={style} value={style}>{style}</option>)}
            </select>
            <label>Aggression <input type="range" min="20" max="90" value={opponentAggression} onChange={(e) => setOpponentAggression(e.target.value)} /></label>
            <label>Discipline <input type="range" min="20" max="90" value={opponentDiscipline} onChange={(e) => setOpponentDiscipline(e.target.value)} /></label>
            <label>Media Skill <input type="range" min="20" max="90" value={opponentMediaSkill} onChange={(e) => setOpponentMediaSkill(e.target.value)} /></label>
            <label>Policy Depth <input type="range" min="20" max="90" value={opponentPolicyDepth} onChange={(e) => setOpponentPolicyDepth(e.target.value)} /></label>
            <input value={opponentProfile.race} onChange={(e) => setOpponentProfile({ ...opponentProfile, race: e.target.value })} placeholder="Race / Ethnicity" />
            <input type="number" value={opponentProfile.age} onChange={(e) => setOpponentProfile({ ...opponentProfile, age: e.target.value })} placeholder="Age" />
            <input value={opponentProfile.gender} onChange={(e) => setOpponentProfile({ ...opponentProfile, gender: e.target.value })} placeholder="Gender" />
            <input value={opponentProfile.profession} onChange={(e) => setOpponentProfile({ ...opponentProfile, profession: e.target.value })} placeholder="Profession" />
            <input value={opponentProfile.economicStatus} onChange={(e) => setOpponentProfile({ ...opponentProfile, economicStatus: e.target.value })} placeholder="Economic status" />
            <textarea value={opponentProfile.policies} onChange={(e) => setOpponentProfile({ ...opponentProfile, policies: e.target.value })} placeholder="Policies" />
            <textarea value={opponentProfile.projects} onChange={(e) => setOpponentProfile({ ...opponentProfile, projects: e.target.value })} placeholder="Proposed projects" />
            <textarea value={opponentProfile.lifeValues} onChange={(e) => setOpponentProfile({ ...opponentProfile, lifeValues: e.target.value })} placeholder="Values in life" />
          </div>
        </div>
        <button className="proceedBtn" onClick={applyPersonalization}>Apply Personalization & Restart Campaign</button>
      </section>

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
