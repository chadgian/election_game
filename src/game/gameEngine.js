const TOTAL_WEEKS = 10;

const ContextType = {
  DEBATE: 'Debate',
  SOCIAL: 'Social Media',
  FUNDRAISING: 'Fundraising',
  ALLIANCE: 'Coalition',
  LEGAL: 'Legal Warfare',
  CRISIS: 'Crisis Response',
  INTERNAL: 'Campaign Management',
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

const tones = ['principled', 'pragmatic', 'aggressive', 'conciliatory', 'populist'];
const issues = ['tax', 'jobs', 'security', 'healthcare', 'education', 'climate', 'corruption', 'housing', 'tech', 'immigration'];

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
  };
  return acc;
}, {});

const mapContextBonus = {
  Debate: ['great_lakes', 'sunbelt'],
  'Social Media': ['pacific', 'northeast'],
  Fundraising: ['northeast', 'mountain'],
  Coalition: ['sunbelt', 'heartland'],
  'Legal Warfare': ['south', 'great_lakes'],
  'Crisis Response': ['south', 'heartland'],
  'Campaign Management': ['mountain', 'pacific'],
};

export const newGame = () => ({
  week: 1,
  totalWeeks: TOTAL_WEEKS,
  candidate: {
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
    demographics: buildDemographics(),
    regions: buildRegions(),
  },
  opponent: {
    name: 'Governor Slate',
    party: 'National Front',
    momentum: 50,
    scandalRisk: 14,
    attackBias: randomInt(40, 76),
  },
  delayedConsequences: {},
  log: ['Campaign launched. National map is in play.'],
});

const promptFor = (context) => ({
  Debate: 'Prime-time debate. Every answer can shift multiple swing regions.',
  'Social Media': 'Digital war room meeting: pick your narrative and target voters.',
  Fundraising: 'Finance committee needs a hard choice on donor strategy.',
  Coalition: 'A coalition bloc wants commitments before endorsing.',
  'Legal Warfare': 'Your legal team proposes a move against opposition messaging.',
  'Crisis Response': 'Breaking national crisis: lead decisively or play safe.',
  'Campaign Management': 'Field directors demand budget and staffing decisions.',
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
      title: `${context}: ${tone[0].toUpperCase()}${tone.slice(1)} ${issue} strategy`,
      description: `You emphasize ${tone} ${issue} messaging. Polls may shift, but backlash risk remains.`,
      unethical,
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
        delayedFlag: Math.random() < 0.25 ? `echo_${issue}` : null,
      },
    };
  });

  const optionCount = randomInt(3, 6);
  return {
    week: state.week,
    context,
    prompt: promptFor(context),
    options: pool.sort(() => Math.random() - 0.5).slice(0, optionCount),
  };
};

const evolveOpponent = (opponent, option) => {
  const attackBoost = option.unethical ? 3 : 1;
  return {
    ...opponent,
    momentum: clamp(opponent.momentum + randomInt(-4, 6) + attackBoost),
    scandalRisk: clamp(opponent.scandalRisk + randomInt(-2, 5) - (option.unethical ? 0 : 1)),
  };
};

export const applyChoice = (state, option) => {
  const demographicsMap = { ...state.candidate.demographics };
  const regionsMap = { ...state.candidate.regions };

  Object.entries(option.effect.supportShift).forEach(([id, value]) => {
    const group = demographicsMap[id];
    if (!group) return;
    demographicsMap[id] = { ...group, support: clamp(group.support + value * group.volatility) };
  });

  Object.entries(option.effect.regionShift || {}).forEach(([regionId, delta]) => {
    const region = regionsMap[regionId];
    if (!region) return;
    regionsMap[regionId] = {
      ...region,
      playerSupport: clamp(region.playerSupport + (delta * region.volatility) + randomInt(-2, 3)),
      turnout: clamp(region.turnout + randomInt(-1, 3)),
      fieldOffices: Math.max(0, region.fieldOffices + (option.effect.fieldDelta > 2 ? 1 : 0)),
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
    log.push(`Opposition research archived this move for week ${delayWeek}.`);
  }

  (delayedConsequences[state.week + 1] || []).forEach((effect) => {
    candidate = {
      ...candidate,
      momentum: clamp(candidate.momentum + effect.momentumDelta),
      scandalRisk: clamp(candidate.scandalRisk + effect.scandalRiskDelta),
      mediaTrust: clamp(candidate.mediaTrust + effect.mediaTrustDelta),
    };
    log.push('A delayed controversy resurfaced during the media cycle.');
  });
  delete delayedConsequences[state.week + 1];

  if (candidate.scandalRisk > 70 && Math.random() < 0.22) {
    candidate = {
      ...candidate,
      momentum: clamp(candidate.momentum - randomInt(3, 11)),
      mediaTrust: clamp(candidate.mediaTrust - randomInt(3, 11)),
    };
    log.push('Breaking scandal! Your message is knocked off the airwaves.');
  }

  const opponent = evolveOpponent(state.opponent, option);
  if (opponent.momentum - candidate.momentum > 12) {
    log.push(`${opponent.name} gains narrative control this week.`);
  }

  return {
    ...state,
    week: Math.min(state.totalWeeks + 1, state.week + 1),
    candidate,
    opponent,
    delayedConsequences,
    log: log.slice(-36),
  };
};

export const isFinished = (state) => state.week > state.totalWeeks;

export const computeElectoralScore = (state) => {
  const regionList = Object.values(state.candidate.regions);
  const playerEV = regionList.reduce((sum, region) => {
    const adjustedSupport = region.playerSupport + ((state.candidate.momentum - state.opponent.momentum) * 0.15);
    return adjustedSupport >= 50 ? sum + region.electoralVotes : sum;
  }, 0);
  const totalEV = regionList.reduce((sum, region) => sum + region.electoralVotes, 0);
  return { playerEV, opponentEV: totalEV - playerEV, totalEV };
};

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
      stability -
      state.candidate.scandalRisk +
      (electoral.playerEV - electoral.opponentEV) * 0.25,
  );

  const verdict = electoral.playerEV >= 270 ? 'Victory' : 'Defeat';
  return `${verdict} • EV ${electoral.playerEV}-${electoral.opponentEV} • Score ${finalScore} • Momentum ${state.candidate.momentum}`;
};
