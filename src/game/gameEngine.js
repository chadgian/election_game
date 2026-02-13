import { getCountryProfile } from '../data/countries';

const TOTAL_WEEKS = 10;
const contexts = ['Debate', 'Campaign Rally', 'Digital Push', 'Fundraising', 'Coalition Talks', 'Crisis Response', 'Ground Operations'];
const strategyTracks = ['Social Media', 'Field Outreach', 'Donor Relations', 'Policy Messaging', 'Coalition Building', 'Volunteer Ops'];
const tones = ['principled', 'pragmatic', 'aggressive', 'visionary', 'populist'];
const issues = ['economy', 'jobs', 'education', 'healthcare', 'security', 'infrastructure', 'corruption', 'climate', 'technology', 'cost of living'];

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
const randomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const buildDemographics = (country) => country.demographics.reduce((acc, name, i) => {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  acc[id] = { id, name, support: clamp(48 + randomInt(-8, 9)), loyalty: clamp(50 + randomInt(-6, 7)), volatility: 0.65 + (i % 4) * 0.08 };
  return acc;
}, {});

const buildRegions = (country) => country.regions.reduce((acc, r) => {
  acc[r.id] = {
    ...r,
    playerSupport: clamp(r.leaning + randomInt(-5, 6)),
    turnout: clamp(60 + randomInt(-10, 11)),
    fieldOffices: 1,
    heat: clamp(45 + randomInt(-20, 21)),
  };
  return acc;
}, {});

export const newGame = (countryName = 'United States') => {
  const country = getCountryProfile(countryName);
  return {
    week: 1,
    totalWeeks: TOTAL_WEEKS,
    country,
    candidate: {
      name: 'Player Candidate',
      funds: 250,
      momentum: 52,
      scandalRisk: 12,
      mediaTrust: 50,
      fieldPower: 45,
      ethics: 68,
      energy: 75,
      demographics: buildDemographics(country),
      regions: buildRegions(country),
    },
    opponent: {
      name: 'Main Rival',
      momentum: 50,
      fieldPower: 47,
      narrative: 50,
    },
    meta: {
      narrative: 50,
      operationPoints: 3,
      maxActionsPerWeek: 3,
      mission: `Win ${country.electionType} in ${country.name}`,
    },
    log: [`Campaign launched in ${country.name}.`],
    delayed: {},
  };
};

const eventPrompt = (context) => ({
  Debate: 'Live debate: shape the national narrative.',
  'Campaign Rally': 'Mass rally logistics and message discipline matter.',
  'Digital Push': 'Multi-platform content strategy can move fast.',
  Fundraising: 'Balance donor influence with credibility.',
  'Coalition Talks': 'Secure allies while protecting core identity.',
  'Crisis Response': 'Respond quickly or lose trust.',
  'Ground Operations': 'Deploy staff to maximize local turnout.',
}[context]);

const mapRegionContextBoost = (country, context) => {
  const keys = country.regions.map((r) => r.id);
  const a = keys[randomInt(0, keys.length)];
  const b = keys[randomInt(0, keys.length)];
  const bonus = { [a]: 2, [b]: 1 };
  if (context === 'Ground Operations') bonus[a] += 1;
  if (context === 'Crisis Response') bonus[b] += 1;
  return bonus;
};

export const generateWeeklyEvent = (state) => {
  const context = state.week === 1 ? 'Fundraising' : contexts[randomInt(0, contexts.length)];
  const regionalBoost = mapRegionContextBoost(state.country, context);

  const options = Array.from({ length: 8 }, (_, i) => {
    const tone = tones[(state.week + i) % tones.length];
    const issue = issues[randomInt(0, issues.length)];
    const track = strategyTracks[(state.week + i) % strategyTracks.length];
    const unethical = (tone === 'aggressive' && Math.random() > 0.45) || Math.random() > 0.9;

    const supportShift = {};
    Object.keys(state.candidate.demographics).forEach((k) => {
      supportShift[k] = randomInt(-3, 5) + (tone === 'visionary' ? 1 : 0) + (track === 'Field Outreach' ? 1 : 0);
    });

    return {
      id: `${context}_${i}_${issue}`,
      title: `${tone[0].toUpperCase()}${tone.slice(1)} ${issue} move`,
      subtitle: `${track} · ${context} · ${unethical ? '⚠ Dark tactic' : '✅ Standard tactic'}`,
      description: `Run a ${tone} ${track.toLowerCase()} operation focused on ${issue}.`,
      icon: unethical ? '🕶️' : track === 'Social Media' ? '📱' : track === 'Field Outreach' ? '🚌' : '🎯',
      track,
      unethical,
      operationCost: unethical ? 2 : 1,
      effect: {
        supportShift,
        regionShift: regionalBoost,
        funds: randomInt(-35, 55) + (context === 'Fundraising' ? 25 : 0),
        momentum: randomInt(-7, 10),
        mediaTrust: randomInt(-5, 6) + (track === 'Social Media' ? 1 : 0),
        scandal: randomInt(-2, 8) + (unethical ? 4 : 0),
        fieldPower: randomInt(-2, 5) + (track === 'Field Outreach' ? 2 : 0),
        narrative: randomInt(-6, 7) + (track === 'Policy Messaging' ? 2 : 0),
        delayed: Math.random() > 0.75,
      },
    };
  });

  return {
    week: state.week,
    context,
    icon: '🗳️',
    prompt: eventPrompt(context),
    options,
  };
};

const applySingleChoice = (state, option, weeklyLog) => {
  const demographics = { ...state.candidate.demographics };
  Object.entries(option.effect.supportShift).forEach(([id, delta]) => {
    const d = demographics[id];
    if (!d) return;
    demographics[id] = {
      ...d,
      support: clamp(d.support + delta * d.volatility),
      loyalty: clamp(d.loyalty + (delta > 0 ? 1 : -1)),
    };
  });

  const regions = { ...state.candidate.regions };
  Object.entries(option.effect.regionShift).forEach(([regionId, boost]) => {
    const r = regions[regionId];
    if (!r) return;
    regions[regionId] = {
      ...r,
      playerSupport: clamp(r.playerSupport + boost * r.volatility + randomInt(-2, 3)),
      turnout: clamp(r.turnout + randomInt(-1, 3)),
      fieldOffices: Math.max(0, r.fieldOffices + (option.effect.fieldPower > 2 ? 1 : 0)),
      heat: clamp(r.heat + randomInt(-4, 5)),
    };
  });

  let candidate = {
    ...state.candidate,
    funds: Math.max(0, state.candidate.funds + option.effect.funds),
    momentum: clamp(state.candidate.momentum + option.effect.momentum),
    mediaTrust: clamp(state.candidate.mediaTrust + option.effect.mediaTrust),
    scandalRisk: clamp(state.candidate.scandalRisk + option.effect.scandal),
    fieldPower: clamp(state.candidate.fieldPower + option.effect.fieldPower),
    ethics: clamp(state.candidate.ethics - (option.unethical ? 7 : 0)),
    energy: clamp(state.candidate.energy - randomInt(2, 7)),
    demographics,
    regions,
  };

  const delayed = { ...state.delayed };
  if (option.effect.delayed) {
    const w = Math.min(state.totalWeeks, state.week + randomInt(1, 4));
    delayed[w] = [...(delayed[w] || []), { momentum: -randomInt(1, 5), mediaTrust: -randomInt(1, 5), scandal: randomInt(1, 6) }];
    weeklyLog.push(`⏳ Hidden consequence scheduled for week ${w}.`);
  }

  return {
    ...state,
    candidate,
    delayed,
  };
};

export const proceedWeek = (state, selectedOptions) => {
  if (!selectedOptions.length) {
    return { ...state, log: [...state.log, 'No actions selected. Week cannot proceed.'].slice(-60) };
  }

  let nextState = { ...state };
  const weeklyLog = [`📅 Week ${state.week} Plan:`];

  selectedOptions.forEach((option) => {
    weeklyLog.push(`${option.icon} ${option.title} (${option.track})`);
    nextState = applySingleChoice(nextState, option, weeklyLog);
  });

  const delayed = { ...nextState.delayed };
  let candidate = { ...nextState.candidate };

  (delayed[state.week + 1] || []).forEach((e) => {
    candidate = {
      ...candidate,
      momentum: clamp(candidate.momentum + e.momentum),
      mediaTrust: clamp(candidate.mediaTrust + e.mediaTrust),
      scandalRisk: clamp(candidate.scandalRisk + e.scandal),
    };
    weeklyLog.push('💥 Delayed backlash triggered.');
  });
  delete delayed[state.week + 1];

  const opponent = {
    ...nextState.opponent,
    momentum: clamp(nextState.opponent.momentum + randomInt(-4, 6) + selectedOptions.filter((o) => o.unethical).length),
    fieldPower: clamp(nextState.opponent.fieldPower + randomInt(-2, 4)),
    narrative: clamp(nextState.opponent.narrative + randomInt(-3, 5)),
  };

  const narrativeDelta = selectedOptions.reduce((sum, o) => sum + o.effect.narrative, 0);
  const nextWeek = Math.min(state.totalWeeks + 1, state.week + 1);

  return {
    ...nextState,
    week: nextWeek,
    candidate,
    opponent,
    delayed,
    meta: {
      ...nextState.meta,
      narrative: clamp(nextState.meta.narrative + narrativeDelta),
      operationPoints: nextState.meta.maxActionsPerWeek,
    },
    log: [...nextState.log, ...weeklyLog].slice(-60),
  };
};

export const isFinished = (state) => state.week > state.totalWeeks;

export const computeElectionScore = (state) => {
  const regions = Object.values(state.candidate.regions);
  const total = regions.reduce((s, r) => s + r.points, 0);
  const player = regions.reduce((sum, r) => {
    const projected = r.playerSupport + (state.candidate.momentum - state.opponent.momentum) * 0.1 + (state.meta.narrative - state.opponent.narrative) * 0.08;
    return projected >= 50 ? sum + r.points : sum;
  }, 0);
  return { player, opponent: total - player, total, target: state.country.targetScore };
};

export const getRules = (state) => [
  `Default country is ${state.country.name}; you can switch country and start a new run.`,
  `Plan up to ${state.meta.maxActionsPerWeek} actions each week, then click Proceed Week.`,
  'Mix strategy tracks: social media, field outreach, donor relations, policy messaging, coalitions, volunteers.',
  'Risky tactics can trigger delayed scandals.',
  `Reach target score (${state.country.targetScore}) by endgame to win.`,
];

export const getAnalystTip = (state, event, selectedOptions) => {
  const score = computeElectionScore(state);
  const behind = score.player < score.target;
  const hasField = selectedOptions.some((o) => o.track === 'Field Outreach');
  const hasDigital = selectedOptions.some((o) => o.track === 'Social Media');
  const darkCount = selectedOptions.filter((o) => o.unethical).length;

  if (!selectedOptions.length) {
    return 'Analyst: Build a balanced week plan—start with one outreach or policy action before proceeding.';
  }
  if (darkCount >= 2) {
    return 'Analyst: Too many dark tactics this week. Add at least one trust-building action to avoid backlash.';
  }
  if (behind && !hasField) {
    return 'Analyst: You are below target pace. Add a Field Outreach action to improve turnout in key regions.';
  }
  if (state.candidate.mediaTrust < 45 && !hasDigital) {
    return 'Analyst: Media trust is low. Include a Social Media or Policy Messaging action this week.';
  }
  if (event.context === 'Fundraising') {
    return 'Analyst: Pair fundraising with coalition or policy messaging to avoid donor-only optics.';
  }
  return 'Analyst: Good mix. Proceed this week if your action costs and risks look acceptable.';
};

export const resultSummary = (state) => {
  const score = computeElectionScore(state);
  const demoScore = Object.values(state.candidate.demographics).reduce((s, d) => s + d.support * 0.1 + d.loyalty * 0.05, 0);
  const final = Math.round(demoScore + state.candidate.momentum + state.candidate.fieldPower + state.meta.narrative - state.candidate.scandalRisk + (score.player - score.opponent) * 0.3);
  const verdict = score.player >= score.target ? 'Victory' : 'Defeat';
  return `${verdict} • ${state.country.name} ${score.player}-${score.opponent} • Target ${score.target} • Final Score ${final}`;
};
