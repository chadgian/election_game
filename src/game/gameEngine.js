const TOTAL_WEEKS = 10;

const ContextType = {
  DEBATE: 'Debate Arena',
  SOCIAL: 'Media Blitz',
  FUNDRAISING: 'War Chest',
  ALLIANCE: 'Coalition Table',
  LEGAL: 'Legal Front',
  CRISIS: 'Crisis Desk',
  INTERNAL: 'HQ Operations',
};

const demographics = [
  ['youth', 'Youth Vote', 0.16, 0.8],
  ['women', 'Women', 0.19, 0.6],
  ['old_cons', 'Old Conservatives', 0.14, 0.4],
  ['suburbs', 'Middle-Class Suburbs', 0.15, 0.5],
  ['business', 'Business Leaders', 0.07, 0.35],
  ['brokers', 'Power Brokers', 0.03, 0.25],
  ['black', 'Black Voters', 0.1, 0.7],
  ['latino', 'Latino Voters', 0.09, 0.75],
  ['working', 'Working Class', 0.13, 0.65],
  ['urban', 'Urban Professionals', 0.08, 0.7],
  ['rural', 'Rural Voters', 0.12, 0.45],
];

const regions = [
  { id: 'pacific', name: 'Pacific Coast', electoralVotes: 74, leaning: 55, volatility: 0.8 },
  { id: 'heartland', name: 'Heartland', electoralVotes: 88, leaning: 44, volatility: 0.6 },
  { id: 'sunbelt', name: 'Sunbelt', electoralVotes: 92, leaning: 49, volatility: 0.85 },
  { id: 'great_lakes', name: 'Great Lakes', electoralVotes: 64, leaning: 50, volatility: 0.9 },
  { id: 'northeast', name: 'Northeast', electoralVotes: 73, leaning: 54, volatility: 0.7 },
  { id: 'mountain', name: 'Mountain', electoralVotes: 41, leaning: 46, volatility: 0.75 },
  { id: 'south', name: 'Deep South', electoralVotes: 106, leaning: 42, volatility: 0.65 },
];

const archetypes = [
  {
    id: 'builder',
    name: 'Consensus Builder',
    bonus: { allianceLoyalty: 8, mediaTrust: 4, ethicsScore: 5, funds: -10 },
    doctrine: 'Steady coalition politics and lower backlash from moderate strategies.',
  },
  {
    id: 'machine',
    name: 'Party Machine',
    bonus: { funds: 40, fieldPower: 8, ethicsScore: -4, legalHeat: 6 },
    doctrine: 'Strong fundraising and field logistics, but vulnerable to ethics attacks.',
  },
  {
    id: 'outsider',
    name: 'Insurgent Outsider',
    bonus: { momentum: 10, scandalRisk: 8, mediaTrust: -4, ethicsScore: 2 },
    doctrine: 'Explosive momentum spikes and high-risk volatility.',
  },
];

const tones = ['principled', 'pragmatic', 'aggressive', 'conciliatory', 'populist'];
const issues = ['tax', 'jobs', 'security', 'healthcare', 'education', 'climate', 'corruption', 'housing', 'tech', 'immigration'];
const operationTypes = ['Tour', 'Ad Buy', 'Town Hall', 'Opposition Hit', 'Legal Motion', 'Grassroots Push'];

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
const randomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const buildDemographics = () => demographics.reduce((acc, [id, name, turnoutWeight, volatility]) => {
  acc[id] = { id, name, turnoutWeight, volatility, support: 50, loyalty: 50 };
  return acc;
}, {});

const buildRegions = () => regions.reduce((acc, region) => {
  acc[region.id] = {
    ...region,
    playerSupport: clamp(region.leaning + randomInt(-4, 5)),
    turnout: clamp(62 + randomInt(-8, 9)),
    fieldOffices: 1,
    heat: randomInt(35, 75),
  };
  return acc;
}, {});

const mapContextBonus = {
  'Debate Arena': ['great_lakes', 'sunbelt'],
  'Media Blitz': ['pacific', 'northeast'],
  'War Chest': ['northeast', 'mountain'],
  'Coalition Table': ['sunbelt', 'heartland'],
  'Legal Front': ['south', 'great_lakes'],
  'Crisis Desk': ['south', 'heartland'],
  'HQ Operations': ['mountain', 'pacific'],
};

const doctrineCardForWeek = (week) => {
  const cards = [
    'Ground Surge: +field power in two closest swing regions.',
    'Narrative Lock: reduce opponent momentum gains this week.',
    'Rapid Response: less damage from scandals for one turn.',
    'Microtarget Push: extra support swing in volatile demographics.',
  ];
  return cards[(week - 1) % cards.length];
};

const applyArchetypeBonus = (candidate, archetype) => {
  const bonus = archetype.bonus;
  return {
    ...candidate,
    funds: Math.max(0, candidate.funds + (bonus.funds || 0)),
    momentum: clamp(candidate.momentum + (bonus.momentum || 0)),
    scandalRisk: clamp(candidate.scandalRisk + (bonus.scandalRisk || 0)),
    mediaTrust: clamp(candidate.mediaTrust + (bonus.mediaTrust || 0)),
    allianceLoyalty: clamp(candidate.allianceLoyalty + (bonus.allianceLoyalty || 0)),
    ethicsScore: clamp(candidate.ethicsScore + (bonus.ethicsScore || 0)),
    legalHeat: clamp(candidate.legalHeat + (bonus.legalHeat || 0)),
    fieldPower: clamp(candidate.fieldPower + (bonus.fieldPower || 0)),
  };
};

export const newGame = () => {
  const archetype = archetypes[randomInt(0, archetypes.length)];

  const baseCandidate = {
    name: 'Player Candidate',
    party: 'Unity Party',
    incumbent: Math.random() > 0.5,
    funds: 260,
    momentum: 50,
    scandalRisk: 10,
    mediaTrust: 50,
    allianceLoyalty: 50,
    ethicsScore: 70,
    legalHeat: 0,
    fieldPower: 42,
    fatigue: 10,
    command: 55,
    demographics: buildDemographics(),
    regions: buildRegions(),
  };

  return {
    week: 1,
    totalWeeks: TOTAL_WEEKS,
    candidate: applyArchetypeBonus(baseCandidate, archetype),
    opponent: {
      name: 'Governor Slate',
      party: 'National Front',
      momentum: 50,
      scandalRisk: 14,
      attackBias: randomInt(40, 76),
      groundGame: randomInt(45, 65),
    },
    meta: {
      archetype,
      doctrineCard: doctrineCardForWeek(1),
      playerNarrative: randomInt(45, 60),
      opponentNarrative: randomInt(45, 60),
      operationPoints: 2,
    },
    delayedConsequences: {},
    log: [`Campaign launched with ${archetype.name} doctrine.`],
  };
};

const promptFor = (context) => ({
  'Debate Arena': 'Prime-time debate duel. One answer can flip a region.',
  'Media Blitz': 'Narrative war across cable, streams, and short-form platforms.',
  'War Chest': 'Fundraising command needs your immediate allocation strategy.',
  'Coalition Table': 'Backchannel allies demand concessions for endorsements.',
  'Legal Front': 'Your legal team can strike, but legal heat rises fast.',
  'Crisis Desk': 'A national crisis is live. Delay means narrative collapse.',
  'HQ Operations': 'Your campaign machine needs staffing and logistics orders.',
}[context]);

const contexts = Object.values(ContextType);

const baseRegionalShift = (context, tone) => {
  const boost = (tone === 'pragmatic' || tone === 'conciliatory') ? 2 : 1;
  const risk = tone === 'aggressive' ? -1 : 0;
  return (mapContextBonus[context] || []).reduce((acc, regionId) => {
    acc[regionId] = boost + risk;
    return acc;
  }, {});
};

const makeOperationFlavor = (tone, issue, context) => {
  const op = operationTypes[randomInt(0, operationTypes.length)];
  return `${op}: ${tone[0].toUpperCase()}${tone.slice(1)} ${issue} play from ${context}`;
};

export const generateWeeklyEvent = (state) => {
  const context = state.week === 1
    ? ContextType.FUNDRAISING
    : [3, 4].includes(state.week)
      ? ContextType.ALLIANCE
      : [6, 9].includes(state.week)
        ? ContextType.DEBATE
        : contexts[randomInt(0, contexts.length)];

  const pool = Array.from({ length: 50 }, (_, idx) => {
    const tone = tones[idx % tones.length];
    const issue = issues[(idx + randomInt(0, issues.length)) % issues.length];
    const unethical = (tone === 'aggressive' || idx % 10 === 0) && Math.random() > 0.52;

    const progBoost = ['principled', 'populist'].includes(tone) ? 4 : 1;
    const consBoost = tone === 'aggressive' ? 4 : 1;
    const moderateBoost = ['pragmatic', 'conciliatory'].includes(tone) ? 4 : 1;

    const supportShift = {
      youth: progBoost,
      urban: progBoost,
      black: progBoost - 1,
      latino: moderateBoost,
      suburbs: moderateBoost,
      working: moderateBoost,
      old_cons: consBoost,
      rural: consBoost,
      business: issue === 'tax' ? -consBoost : consBoost,
      brokers: context === ContextType.ALLIANCE ? 5 : 1,
      women: tone === 'aggressive' ? -2 : 2,
    };

    if (state.candidate.incumbent && context === ContextType.DEBATE) {
      supportShift.suburbs -= 2;
    }

    return {
      id: `${context.toLowerCase().replace(/\s+/g, '_')}_${idx}`,
      title: makeOperationFlavor(tone, issue, context),
      subtitle: `${context} • ${issue.toUpperCase()} • ${unethical ? 'Dark Ops' : 'Standard Ops'}`,
      description: `You deploy a ${tone} ${issue} operation with strategic upside and political exposure.`,
      unethical,
      operationCost: unethical ? 2 : 1,
      effect: {
        supportShift,
        regionShift: baseRegionalShift(context, tone),
        fundsDelta: randomInt(-30, 52) + (context === ContextType.FUNDRAISING ? 24 : 0),
        momentumDelta: randomInt(-8, 11) + (context === ContextType.DEBATE ? 4 : 0),
        scandalRiskDelta: randomInt(-3, 8) + (tone === 'aggressive' ? 2 : 0),
        integrityDelta: tone === 'principled' ? 4 : tone === 'aggressive' ? -3 : 0,
        mediaTrustDelta: tone === 'conciliatory' ? 4 : randomInt(-4, 5),
        allianceDelta: context === ContextType.ALLIANCE ? randomInt(-8, 13) : 0,
        legalHeatDelta: context === ContextType.LEGAL ? randomInt(2, 12) : 0,
        fieldDelta: context === ContextType.INTERNAL ? randomInt(2, 8) : randomInt(-2, 4),
        commandDelta: randomInt(-4, 7),
        narrativeDelta: randomInt(-5, 8),
        delayedFlag: Math.random() < 0.25 ? `echo_${issue}` : null,
      },
    };
  });

  return {
    week: state.week,
    context,
    prompt: promptFor(context),
    options: pool.sort(() => Math.random() - 0.5).slice(0, 5),
  };
};

const evolveOpponent = (opponent, option) => {
  const attackBoost = option.unethical ? 3 : 1;
  return {
    ...opponent,
    momentum: clamp(opponent.momentum + randomInt(-4, 6) + attackBoost),
    scandalRisk: clamp(opponent.scandalRisk + randomInt(-2, 5) - (option.unethical ? 0 : 1)),
    groundGame: clamp(opponent.groundGame + randomInt(-3, 5)),
  };
};

const updateNarrative = (state, option) => {
  const playerNarrative = clamp(state.meta.playerNarrative + option.effect.narrativeDelta + randomInt(-3, 5));
  const opponentNarrative = clamp(state.meta.opponentNarrative + randomInt(-4, 5) + (option.unethical ? 2 : 0));
  return { playerNarrative, opponentNarrative };
};

export const applyChoice = (state, option) => {
  if (option.operationCost > state.meta.operationPoints) {
    return {
      ...state,
      log: [...state.log, 'Operation failed: insufficient command points this week.'].slice(-40),
    };
  }

  const demographicsMap = { ...state.candidate.demographics };
  const regionsMap = { ...state.candidate.regions };

  Object.entries(option.effect.supportShift).forEach(([id, value]) => {
    const group = demographicsMap[id];
    if (!group) return;
    demographicsMap[id] = {
      ...group,
      support: clamp(group.support + value * group.volatility),
      loyalty: clamp(group.loyalty + (value > 0 ? 1 : -1)),
    };
  });

  Object.entries(option.effect.regionShift || {}).forEach(([regionId, delta]) => {
    const region = regionsMap[regionId];
    if (!region) return;
    regionsMap[regionId] = {
      ...region,
      playerSupport: clamp(region.playerSupport + (delta * region.volatility) + randomInt(-2, 3)),
      turnout: clamp(region.turnout + randomInt(-1, 3) + (option.effect.fieldDelta > 2 ? 1 : 0)),
      fieldOffices: Math.max(0, region.fieldOffices + (option.effect.fieldDelta > 3 ? 1 : 0)),
      heat: clamp(region.heat + randomInt(-4, 5)),
    };
  });

  const consequencePenalty = option.unethical ? randomInt(1, 7) : 0;

  let candidate = {
    ...state.candidate,
    funds: Math.max(0, state.candidate.funds + option.effect.fundsDelta),
    momentum: clamp(state.candidate.momentum + option.effect.momentumDelta),
    scandalRisk: clamp(state.candidate.scandalRisk + option.effect.scandalRiskDelta + consequencePenalty),
    mediaTrust: clamp(state.candidate.mediaTrust + option.effect.mediaTrustDelta),
    legalHeat: clamp(state.candidate.legalHeat + option.effect.legalHeatDelta),
    allianceLoyalty: clamp(state.candidate.allianceLoyalty + option.effect.allianceDelta),
    ethicsScore: clamp(state.candidate.ethicsScore + option.effect.integrityDelta - (option.unethical ? 9 : 0)),
    fieldPower: clamp(state.candidate.fieldPower + option.effect.fieldDelta),
    command: clamp(state.candidate.command + option.effect.commandDelta),
    fatigue: clamp(state.candidate.fatigue + randomInt(2, 8) - (option.effect.fieldDelta > 0 ? 1 : 0)),
    demographics: demographicsMap,
    regions: regionsMap,
  };

  const delayedConsequences = { ...state.delayedConsequences };
  const log = [...state.log, `Week ${state.week}: ${option.title}`];

  if (option.effect.delayedFlag) {
    const delayWeek = Math.min(state.totalWeeks, state.week + randomInt(1, 4));
    delayedConsequences[delayWeek] = [
      ...(delayedConsequences[delayWeek] || []),
      {
        momentumDelta: -randomInt(1, 6),
        scandalRiskDelta: randomInt(1, 7),
        mediaTrustDelta: -randomInt(1, 5),
      },
    ];
    log.push(`Opposition research banked this decision for week ${delayWeek}.`);
  }

  (delayedConsequences[state.week + 1] || []).forEach((effect) => {
    candidate = {
      ...candidate,
      momentum: clamp(candidate.momentum + effect.momentumDelta),
      scandalRisk: clamp(candidate.scandalRisk + effect.scandalRiskDelta),
      mediaTrust: clamp(candidate.mediaTrust + effect.mediaTrustDelta),
    };
    log.push('A delayed controversy detonated in the media cycle.');
  });
  delete delayedConsequences[state.week + 1];

  if (candidate.scandalRisk > 70 && Math.random() < 0.22) {
    candidate = {
      ...candidate,
      momentum: clamp(candidate.momentum - randomInt(3, 11)),
      mediaTrust: clamp(candidate.mediaTrust - randomInt(3, 11)),
    };
    log.push('Breaking scandal! Your campaign loses message discipline.');
  }

  const opponent = evolveOpponent(state.opponent, option);
  if (opponent.momentum - candidate.momentum > 12) {
    log.push(`${opponent.name} captures the narrative this week.`);
  }

  const narrative = updateNarrative(state, option);
  const nextWeek = Math.min(state.totalWeeks + 1, state.week + 1);

  return {
    ...state,
    week: nextWeek,
    candidate,
    opponent,
    delayedConsequences,
    meta: {
      ...state.meta,
      ...narrative,
      operationPoints: 2,
      doctrineCard: doctrineCardForWeek(nextWeek),
    },
    log: log.slice(-40),
  };
};

export const isFinished = (state) => state.week > state.totalWeeks;

export const computeElectoralScore = (state) => {
  const regionList = Object.values(state.candidate.regions);
  const momentumEdge = state.candidate.momentum - state.opponent.momentum;
  const narrativeEdge = state.meta.playerNarrative - state.meta.opponentNarrative;
  const groundEdge = state.candidate.fieldPower - state.opponent.groundGame;

  const playerEV = regionList.reduce((sum, region) => {
    const adjustedSupport =
      region.playerSupport +
      momentumEdge * 0.12 +
      narrativeEdge * 0.08 +
      groundEdge * 0.05 +
      (region.fieldOffices - 1) * 0.4;
    return adjustedSupport >= 50 ? sum + region.electoralVotes : sum;
  }, 0);

  const totalEV = regionList.reduce((sum, region) => sum + region.electoralVotes, 0);
  return { playerEV, opponentEV: totalEV - playerEV, totalEV };
};

export const getVictoryIntel = (state) => {
  const electoral = computeElectoralScore(state);
  const distance = 270 - electoral.playerEV;
  if (distance <= 0) return 'You are on a winning electoral path. Protect against late scandals.';
  if (distance <= 25) return 'Within striking distance: one swing-region surge can win this.';
  if (distance <= 60) return 'Tough map. Prioritize field operations and narrative control now.';
  return 'Long-shot scenario: you need high-risk plays and coalition breakthroughs.';
};

export const getRules = () => ([
  'Each week represents one campaign turn. You select exactly one operation card.',
  'Operation cards shift demographics, map control, narrative, and risk.',
  'Unethical cards can give spikes but raise scandal and delayed blowback.',
  'Electoral Votes are computed from region support + momentum + narrative + field game.',
  'Reach 270+ EV by the end of Week 10 to win.',
]);

export const resultSummary = (state) => {
  const demoValues = Object.values(state.candidate.demographics);
  const turnoutScore = demoValues.reduce((sum, demo) => sum + demo.support * demo.turnoutWeight, 0);
  const loyaltyScore = demoValues.reduce((sum, demo) => sum + demo.loyalty, 0) / demoValues.length;
  const stability = (state.candidate.mediaTrust + state.candidate.ethicsScore + state.candidate.allianceLoyalty + loyaltyScore) / 4;
  const electoral = computeElectoralScore(state);
  const finalScore = Math.round(
    turnoutScore +
      state.candidate.momentum +
      state.candidate.funds / 10 +
      state.candidate.fieldPower / 2 +
      state.meta.playerNarrative / 2 +
      stability -
      state.candidate.scandalRisk +
      (electoral.playerEV - electoral.opponentEV) * 0.25,
  );

  const verdict = electoral.playerEV >= 270 ? 'Victory' : 'Defeat';
  return `${verdict} • EV ${electoral.playerEV}-${electoral.opponentEV} • Score ${finalScore} • Doctrine: ${state.meta.archetype.name}`;
};
