const TOTAL_WEEKS = 10;

const ContextType = {
  DEBATE: 'DEBATE',
  SOCIAL: 'SOCIAL',
  FUNDRAISING: 'FUNDRAISING',
  ALLIANCE: 'ALLIANCE',
  LEGAL: 'LEGAL',
  CRISIS: 'CRISIS',
  INTERNAL: 'INTERNAL',
};

const demographics = [
  ['youth', 'Youth Vote', 0.16, 0.35, 0.8],
  ['women', 'Women', 0.19, 0.55, 0.6],
  ['old_cons', 'Old Conservatives', 0.14, 0.75, 0.4],
  ['suburbs', 'Middle-Class Suburbs', 0.15, 0.7, 0.5],
  ['business', 'Business Leaders', 0.07, 0.95, 0.35],
  ['brokers', 'Power Brokers', 0.03, 1.0, 0.25],
  ['black', 'Black Voters', 0.1, 0.4, 0.7],
  ['latino', 'Latino Voters', 0.09, 0.45, 0.75],
  ['working', 'Working Class', 0.13, 0.5, 0.65],
  ['urban', 'Urban Professionals', 0.08, 0.65, 0.7],
  ['rural', 'Rural Voters', 0.12, 0.55, 0.45],
];

const tones = ['principled', 'pragmatic', 'aggressive', 'conciliatory', 'populist'];
const issues = ['tax', 'jobs', 'security', 'healthcare', 'education', 'climate', 'corruption', 'housing', 'tech', 'immigration'];

const clamp = value => Math.max(0, Math.min(100, Math.round(value)));
const randomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const buildDemographics = () =>
  demographics.reduce((acc, [id, name, turnoutWeight, donationStrength, volatility]) => {
    acc[id] = {
      id,
      name,
      turnoutWeight,
      donationStrength,
      volatility,
      support: 50,
      loyalty: 50,
    };
    return acc;
  }, {});

export const newGame = () => ({
  week: 1,
  totalWeeks: TOTAL_WEEKS,
  candidate: {
    name: 'Player Candidate',
    party: 'Unity Party',
    incumbent: Math.random() > 0.5,
    funds: 250,
    momentum: 50,
    scandalRisk: 10,
    mediaTrust: 50,
    allianceLoyalty: 50,
    ethicsScore: 70,
    legalHeat: 0,
    demographics: buildDemographics(),
  },
  delayedConsequences: {},
  log: [],
});

const promptFor = context => ({
  DEBATE: 'Debate night: choose a stance under pressure.',
  SOCIAL: 'Social strategy meeting: what message do you amplify this week?',
  FUNDRAISING: 'Finance team asks you to choose this week\'s fundraising route.',
  ALLIANCE: 'A coalition partner offers terms with hidden tradeoffs.',
  LEGAL: 'Your legal team proposes a counterstrike against an opponent.',
  CRISIS: 'A breaking crisis dominates media coverage and voter attention.',
  INTERNAL: 'Campaign infighting erupts between advisors and donor factions.',
}[context]);

const contexts = Object.values(ContextType);

export const generateWeeklyEvent = state => {
  const context =
    state.week === 1
      ? ContextType.FUNDRAISING
      : [3, 4].includes(state.week)
        ? ContextType.ALLIANCE
        : [6, 9].includes(state.week)
          ? ContextType.DEBATE
          : contexts[randomInt(0, contexts.length)];

  const pool = Array.from({length: 50}, (_, idx) => {
    const tone = tones[idx % tones.length];
    const issue = issues[(idx + randomInt(0, issues.length)) % issues.length];
    const unethical = (tone === 'aggressive' || idx % 11 === 0) && Math.random() > 0.5;

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
      id: `${context.toLowerCase()}_${idx}`,
      title: `${context}: ${tone[0].toUpperCase()}${tone.slice(1)} ${issue} push`,
      description: `Frame a ${tone} stance on ${issue}. Gains one bloc while you risk others.`,
      unethical,
      effect: {
        supportShift,
        fundsDelta: randomInt(-35, 51) + (context === ContextType.FUNDRAISING ? 20 : 0),
        momentumDelta: randomInt(-8, 11) + (context === ContextType.DEBATE ? 3 : 0),
        scandalRiskDelta: randomInt(-3, 8) + (tone === 'aggressive' ? 2 : 0),
        integrityDelta: tone === 'principled' ? 4 : tone === 'aggressive' ? -3 : 0,
        mediaTrustDelta: tone === 'conciliatory' ? 3 : randomInt(-4, 5),
        allianceDelta: context === ContextType.ALLIANCE ? randomInt(-8, 12) : 0,
        legalHeatDelta: context === ContextType.LEGAL ? randomInt(2, 11) : 0,
        delayedFlag: Math.random() < 0.22 ? `echo_${issue}` : null,
      },
    };
  });

  const optionCount = randomInt(3, 6);
  const options = pool.sort(() => Math.random() - 0.5).slice(0, optionCount);

  return {
    week: state.week,
    context,
    prompt: promptFor(context),
    options,
  };
};

export const applyChoice = (state, option) => {
  const demographicsMap = {...state.candidate.demographics};

  Object.entries(option.effect.supportShift).forEach(([id, value]) => {
    if (!demographicsMap[id]) return;
    const group = demographicsMap[id];
    demographicsMap[id] = {
      ...group,
      support: clamp(group.support + value * group.volatility),
    };
  });

  const consequencePenalty = option.unethical ? randomInt(0, 6) : 0;

  let candidate = {
    ...state.candidate,
    funds: Math.max(0, state.candidate.funds + option.effect.fundsDelta),
    momentum: clamp(state.candidate.momentum + option.effect.momentumDelta),
    scandalRisk: clamp(state.candidate.scandalRisk + option.effect.scandalRiskDelta + consequencePenalty),
    mediaTrust: clamp(state.candidate.mediaTrust + option.effect.mediaTrustDelta),
    legalHeat: clamp(state.candidate.legalHeat + option.effect.legalHeatDelta),
    allianceLoyalty: clamp(state.candidate.allianceLoyalty + option.effect.allianceDelta),
    ethicsScore: clamp(state.candidate.ethicsScore + option.effect.integrityDelta - (option.unethical ? 8 : 0)),
    demographics: demographicsMap,
  };

  const delayedConsequences = {...state.delayedConsequences};
  const log = [...state.log, `Week ${state.week}: ${option.title}`];

  if (option.effect.delayedFlag) {
    const delayWeek = Math.min(state.totalWeeks, state.week + randomInt(1, 4));
    delayedConsequences[delayWeek] = [...(delayedConsequences[delayWeek] || []), {
      momentumDelta: -randomInt(1, 6),
      scandalRiskDelta: randomInt(1, 7),
      mediaTrustDelta: -randomInt(1, 5),
    }];
    log.push(`A delayed consequence was seeded for week ${delayWeek}.`);
  }

  (delayedConsequences[state.week + 1] || []).forEach(effect => {
    candidate = {
      ...candidate,
      momentum: clamp(candidate.momentum + effect.momentumDelta),
      scandalRisk: clamp(candidate.scandalRisk + effect.scandalRiskDelta),
      mediaTrust: clamp(candidate.mediaTrust + effect.mediaTrustDelta),
    };
    log.push('A delayed controversy resurfaced in the news cycle.');
  });
  delete delayedConsequences[state.week + 1];

  if (candidate.scandalRisk > 70 && Math.random() < 0.2) {
    candidate = {
      ...candidate,
      momentum: clamp(candidate.momentum - randomInt(3, 10)),
      mediaTrust: clamp(candidate.mediaTrust - randomInt(3, 10)),
    };
    log.push('A major scandal story broke in the media cycle.');
  }

  return {
    ...state,
    week: Math.min(state.totalWeeks + 1, state.week + 1),
    candidate,
    delayedConsequences,
    log: log.slice(-30),
  };
};

export const isFinished = state => state.week > state.totalWeeks;

export const resultSummary = state => {
  const demoValues = Object.values(state.candidate.demographics);
  const turnoutScore = demoValues.reduce((sum, demo) => sum + demo.support * demo.turnoutWeight, 0);
  const loyaltyScore = demoValues.reduce((sum, demo) => sum + demo.loyalty, 0) / demoValues.length;
  const stability = (state.candidate.mediaTrust + state.candidate.ethicsScore + state.candidate.allianceLoyalty + loyaltyScore) / 4;

  const finalScore = Math.round(turnoutScore + state.candidate.momentum + state.candidate.funds / 10 + stability - state.candidate.scandalRisk);
  const verdict = finalScore >= 145 ? 'Victory' : 'Defeat';

  return `${verdict} • Score ${finalScore} • Momentum ${state.candidate.momentum} • Scandal ${state.candidate.scandalRisk}`;
};
