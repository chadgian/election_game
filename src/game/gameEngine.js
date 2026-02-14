import { getCountryProfile } from '../data/countries';

const TOTAL_WEEKS = 10;
const contexts = ['Debate', 'Campaign Rally', 'Digital Push', 'Fundraising', 'Coalition Talks', 'Crisis Response', 'Ground Operations'];
const strategyTracks = ['Social Media', 'Field Outreach', 'Donor Relations', 'Policy Messaging', 'Coalition Building', 'Volunteer Ops'];
const tones = ['principled', 'pragmatic', 'aggressive', 'visionary', 'populist'];
const issues = ['economy', 'jobs', 'education', 'healthcare', 'security', 'infrastructure', 'corruption', 'climate', 'technology', 'cost of living'];
const oppositionPlaybook = ['Negative Ads', 'Regional Rally', 'Debate Attack', 'Influencer Push', 'Policy Copycat', 'Ground Sweep'];
const worldEvents = ['Fuel price spike', 'Breaking corruption leak', 'Major celebrity endorsement', 'Natural disaster response test', 'Unexpected economic report', 'Viral misinformation wave'];
const mediaQuestionTopics = [
  { topic: 'economy', intensity: 6 },
  { topic: 'jobs', intensity: 5 },
  { topic: 'corruption', intensity: 7 },
  { topic: 'security', intensity: 6 },
  { topic: 'climate', intensity: 5 },
  { topic: 'healthcare', intensity: 5 },
  { topic: 'education', intensity: 4 },
  { topic: 'cost of living', intensity: 6 },
];
const oppositionArchetypes = ['Populist Nationalist', 'Technocratic Reformer', 'Traditional Conservative', 'Grassroots Progressive', 'Media Savvy Centrist'];
const profileDefaults = {
  race: 'Prefer not to say',
  age: 50,
  gender: 'Not specified',
  profession: 'Public servant',
  economicStatus: 'Middle class',
  policies: 'Balanced growth and institutional reform',
  projects: 'Regional jobs and infrastructure program',
  lifeValues: 'Integrity, service, and accountability',
};

const tvShowsByCountry = {
  'United States': ['Town Hall Live', 'Sunday Policy Forum', 'Late Night Civic Debate'],
  Philippines: ['Harapan sa Bayan', 'National Pulse Tonight', 'Balita at Boto Special'],
  'United Kingdom': ['Westminster Live Debate', 'Nation Speaks', 'Prime Issues Tonight'],
};

const rallyGuestPool = ['Family Member', 'Community Leader', 'Faith Leader', 'Youth Organizer', 'Labor Representative', 'Business Ally', 'Entertainer', 'Co-politician'];


const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
const randomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;
const sample = (arr) => arr[randomInt(0, arr.length)];

const generateOpponentTraits = () => ({
  style: sample(oppositionArchetypes),
  aggression: randomInt(35, 86),
  discipline: randomInt(35, 86),
  mediaSkill: randomInt(35, 86),
  policyDepth: randomInt(35, 86),
});

const pickOpponentParty = (playerParty, partyList = []) => {
  const filtered = (partyList || []).filter((p) => p && p !== playerParty);
  return filtered.length ? filtered[randomInt(0, filtered.length)] : 'National Opposition Coalition';
};

const buildMediaQuestionText = (topic, state) => {
  const region = sample(state.country.regions || []).name || 'key regions';
  const demographic = sample(state.country.demographics || ['swing voters']);
  const context = state.meta.weeklyEvent?.title || 'national uncertainty';
  const pressure = sample(['in the next 30 days', 'before election day', 'starting this week', 'within your first 100 days']);
  const metric = sample(['public trust', 'consumer confidence', 'small-business sentiment', 'national stability', 'voter turnout']);
  const framing = sample([
    `After the ${context.toLowerCase()},`,
    `Given rising concern in ${region},`,
    `With ${demographic.toLowerCase()} asking for clarity,`,
    'As voters demand specifics,',
  ]);

  const topicPrompts = {
    economy: [
      `${framing} what exact fiscal action will you prioritize ${pressure} to stabilize prices and protect wages?`,
      `${framing} how will your economic team respond if growth slows while inflation remains high?`,
      `${framing} which two budget changes would you implement first to improve household purchasing power?`,
    ],
    jobs: [
      `${framing} what is your immediate plan ${pressure} to prevent more layoffs and protect local employers?`,
      `${framing} how would your administration create higher-quality jobs rather than temporary hiring spikes?`,
      `${framing} what labor-market reform will you launch first and how will you measure results?`,
    ],
    corruption: [
      `${framing} which anti-corruption reform will you pass first, and how will you enforce it transparently?`,
      `${framing} how will you stop political favoritism in public contracts ${pressure}?`,
      `${framing} what accountability mechanism will you use so voters can track corruption cases in real time?`,
    ],
    security: [
      `${framing} what concrete security step will you execute first to reduce risk in ${region}?`,
      `${framing} how will you balance civil liberties with stronger public safety operations?`,
      `${framing} what is your crisis command strategy if a major security incident happens ${pressure}?`,
    ],
    climate: [
      `${framing} what resilience project will you fund first to protect vulnerable communities ${pressure}?`,
      `${framing} how will you handle the economic cost of climate adaptation while keeping services reliable?`,
      `${framing} what climate action can deliver measurable local impact before voters return to the polls?`,
    ],
    healthcare: [
      `${framing} what healthcare reform will you prioritize first to lower costs and improve access?`,
      `${framing} how will you prevent hospital overload during sudden public-health shocks?`,
      `${framing} which healthcare service will your government expand first, and how will you fund it?`,
    ],
    education: [
      `${framing} what education policy will you deploy first to improve learning outcomes in ${region}?`,
      `${framing} how will your administration close learning gaps affecting ${demographic.toLowerCase()}?`,
      `${framing} what is your near-term plan to raise teacher support and school performance?`,
    ],
    'cost of living': [
      `${framing} families say daily expenses are unmanageable—what relief measure begins ${pressure}?`,
      `${framing} what policy mix will lower housing, transport, and food pressure without hurting jobs?`,
      `${framing} which affordability indicator will your cabinet target first: ${metric} or inflation?`,
    ],
  };

  return sample(topicPrompts[topic] || topicPrompts.economy);
};

const generateMediaQuestion = (state) => {
  if (state.week <= 1 || state.week > state.totalWeeks) return null;
  if (Math.random() < 0.5) return null;

  const base = sample(mediaQuestionTopics);
  const variation = randomInt(1000, 9999);

  return {
    id: `media_${state.week}_${base.topic}_${variation}`,
    topic: base.topic,
    week: state.week,
    intensity: clamp(base.intensity + randomInt(-1, 2)),
    question: buildMediaQuestionText(base.topic, state),
    contextHint: state.meta.weeklyEvent?.title || 'General voter anxiety',
  };
};

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

const generateOppositionPlan = (state) => {
  const targetRegion = sample(state.country.regions);
  const move = sample(oppositionPlaybook);
  const traits = state.opponent.traits || generateOpponentTraits();
  const aggressionBonus = Math.floor((traits.aggression - 50) / 18);
  const disciplineBonus = Math.floor((traits.discipline - 50) / 20);
  return {
    move,
    targetRegionId: targetRegion.id,
    targetRegionName: targetRegion.name,
    momentum: clamp(2 + randomInt(0, 5) + aggressionBonus),
    narrative: clamp(1 + randomInt(0, 4) + disciplineBonus),
    playerSupportPenalty: Math.max(1, 1 + randomInt(0, 4) + aggressionBonus),
    mediaPenalty: Math.max(0, randomInt(0, 4) + (traits.mediaSkill > 65 ? 1 : 0)),
  };
};

const generateWeeklyWorldEvent = () => ({
  title: sample(worldEvents),
  impact: randomInt(-3, 5),
  trustShift: randomInt(-3, 4),
});

const scoreMediaAnswer = (question, answer) => {
  if (!answer || !answer.trim()) return { quality: 18, confidence: 20 };
  const text = answer.toLowerCase();
  const keywords = [question.topic, 'plan', 'jobs', 'economy', 'policy', 'reform', 'budget', 'schools', 'health'];
  const keywordHits = keywords.reduce((sum, k) => sum + (text.includes(k) ? 1 : 0), 0);
  const lengthScore = Math.min(25, Math.floor(text.split(/\s+/).filter(Boolean).length / 3));
  const quality = clamp(20 + keywordHits * 8 + lengthScore + randomInt(-8, 9));
  const confidence = clamp(30 + keywordHits * 7 + randomInt(-10, 11));
  return { quality, confidence };
};

const buildOppositionMediaAnswer = (question, traits, state, oppositionScore) => {
  const styleOpeners = {
    'Populist Nationalist': [
      `Families are paying the price on ${question.topic}; we will act now and put citizens first.`,
      `The political elite failed on ${question.topic}; our movement will put ordinary citizens back in control.`,
      `People are tired of excuses on ${question.topic}; we will deliver immediate relief where it hurts most.`,
    ],
    'Technocratic Reformer': [
      `Our ${question.topic} response uses measurable targets, budget discipline, and independent monitoring.`,
      `We will handle ${question.topic} with evidence-based policy, public dashboards, and strict implementation milestones.`,
      `On ${question.topic}, our plan is technical, costed, and benchmarked against successful international models.`,
    ],
    'Traditional Conservative': [
      `We will restore order on ${question.topic} with fiscal restraint and accountable leadership.`,
      `Stability on ${question.topic} starts with responsible governance, safer communities, and disciplined spending.`,
      `Our approach to ${question.topic} protects institutions, rewards hard work, and restores public confidence.`,
    ],
    'Grassroots Progressive': [
      `On ${question.topic}, we will invest in communities and protect vulnerable groups immediately.`,
      `We will tackle ${question.topic} through people-first reforms, stronger public services, and fair opportunity.`,
      `Communities hit hardest by ${question.topic} deserve urgent support, and our platform funds that directly.`,
    ],
    'Media Savvy Centrist': [
      `Voters want practical answers on ${question.topic}; we offer a balanced plan that can pass now.`,
      `On ${question.topic}, we reject extremes and focus on pragmatic steps that produce visible results quickly.`,
      `Our ${question.topic} strategy is realistic, bipartisan, and designed for immediate implementation.`,
    ],
  };

  const contextLine = state.meta.weeklyEvent?.title
    ? sample([
      `Given this week's ${state.meta.weeklyEvent.title.toLowerCase()}, leadership must stay calm and decisive.`,
      `After the ${state.meta.weeklyEvent.title.toLowerCase()}, voters deserve a plan with clear accountability.`,
      `The ${state.meta.weeklyEvent.title.toLowerCase()} proves why ${question.topic} cannot be handled with slogans.`,
    ])
    : sample([
      `This is not the week for political theater on ${question.topic}.`,
      `The country needs execution, not talking points, on ${question.topic}.`,
      `Voters are watching who can actually deliver on ${question.topic}.`,
    ]);

  const momentumGap = state.opponent.momentum - state.candidate.momentum;
  const stanceLine = momentumGap >= 0
    ? sample([
      'We are expanding this message across key regions because it is working.',
      'Our campaign momentum shows that voters are already responding to this plan.',
      'The public is rewarding this direction, and we will keep pressing forward.',
    ])
    : sample([
      'We will sharpen our message and engage undecided voters directly in the coming week.',
      'This week we will reinforce our ground operation so this plan reaches every community.',
      'We know trust must be earned daily, and we will prove this policy can be executed.',
    ]);

  const depthLine = traits.policyDepth > 60
    ? sample([
      'We will publish monthly performance reports and independent audits.',
      'Implementation will follow a phased roadmap with measurable targets.',
      'Each action item will be tied to transparent budget and delivery timelines.',
    ])
    : sample([
      'The focus is clear communication and rapid execution on day one.',
      'People want action quickly, and that is exactly what we will deliver first.',
      'We will keep this plan straightforward, visible, and easy to track.',
    ]);

  const confidenceLine = oppositionScore >= 70
    ? sample([
      'This is the leadership standard voters expect right now.',
      'This is a serious plan for a serious moment.',
    ])
    : sample([
      'We know this challenge is difficult, but we have a workable path forward.',
      'No plan is perfect, but this one is realistic and immediately actionable.',
    ]);

  const openerPool = styleOpeners[traits.style] || styleOpeners['Media Savvy Centrist'];
  return `${sample(openerPool)} ${contextLine} ${stanceLine} ${depthLine} ${confidenceLine}`;
};

export const evaluateMediaRound = (state, payload) => {
  const question = state.meta.pendingMediaQuestion;
  if (!question) return { state, summary: null };

  const ignored = payload?.ignored;
  const answer = payload?.answer || '';
  const playerScore = ignored ? 28 : scoreMediaAnswer(question, answer).quality;

  const traits = state.opponent.traits || generateOpponentTraits();
  const oppBase = Math.round((traits.mediaSkill * 0.45) + (traits.policyDepth * 0.35) + (traits.discipline * 0.2));
  const oppositionScore = clamp(oppBase + randomInt(-10, 11));
  const oppositionAnswer = buildOppositionMediaAnswer(question, traits, state, oppositionScore);
  const delta = Math.round((playerScore - oppositionScore) / 10);

  const trustShift = ignored ? -Math.max(1, Math.round(question.intensity / 3)) : delta;
  const momentumShift = ignored ? -Math.max(1, Math.round(question.intensity / 2.5)) : Math.round(delta * 1.1);

  const nextState = {
    ...state,
    candidate: {
      ...state.candidate,
      mediaTrust: clamp(state.candidate.mediaTrust + trustShift),
      momentum: clamp(state.candidate.momentum + momentumShift),
    },
    opponent: {
      ...state.opponent,
      mediaTrustGain: trustShift < 0 ? Math.abs(trustShift) : 0,
      momentum: clamp(state.opponent.momentum + (oppositionScore > playerScore ? 2 : 0)),
    },
    meta: {
      ...state.meta,
      pendingMediaQuestion: null,
      mediaHistory: [
        ...(state.meta.mediaHistory || []),
        {
          week: question.week,
          topic: question.topic,
          question: question.question,
          answer: ignored ? '[Ignored]' : answer,
          playerScore,
          oppositionScore,
          oppositionAnswer,
          trustShift,
          momentumShift,
        },
      ].slice(-8),
    },
    log: [
      ...state.log,
      `🎙️ Media round (${question.topic}): you ${ignored ? 'ignored' : 'answered'}; impact ${momentumShift >= 0 ? '+' : ''}${momentumShift} momentum, ${trustShift >= 0 ? '+' : ''}${trustShift} trust.`,
    ].slice(-80),
  };

  return {
    state: nextState,
    summary: {
      question,
      playerScore,
      oppositionScore,
      trustShift,
      momentumShift,
      oppositionResponse: oppositionAnswer,
    },
  };
};

export const newGame = (countryName = 'United States', party = 'Independent', partyList = [], setup = {}) => {
  const country = getCountryProfile(countryName);
  const opponentTraits = setup.opponentTraits || generateOpponentTraits();
  const candidateProfile = { ...profileDefaults, ...(setup.candidateProfile || {}) };
  const opponentProfile = { ...profileDefaults, ...(setup.opponentProfile || {}) };
  const playerName = setup.playerName || 'Player Candidate';
  const opponentName = setup.opponentName || 'Main Rival';
  const opponentParty = setup.opponentParty || pickOpponentParty(party, partyList);

  return {
    week: 1,
    totalWeeks: TOTAL_WEEKS,
    country,
    candidate: {
      name: playerName,
      party,
      profile: candidateProfile,
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
      name: opponentName,
      party: opponentParty,
      profile: opponentProfile,
      traits: opponentTraits,
      momentum: 50,
      fieldPower: 47,
      narrative: 50,
      currentPlan: null,
    },
    meta: {
      narrative: 50,
      operationPoints: 3,
      maxActionsPerWeek: 3,
      mission: `Win ${country.electionType} in ${country.name}`,
      actionHistory: [],
      weeklyEvent: generateWeeklyWorldEvent(),
      strategistConfidence: 62,
      pendingEvent: null,
      pendingMediaQuestion: null,
      mediaHistory: [],
      weeklyImpact: null,
      focusRegionId: null,
      focusRegionName: null,
      weekOpportunity: null,
      rallyPlan: null,
    },
    log: [`Campaign launched in ${country.name} by ${playerName} (${party}).`],
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

  const availableShows = tvShowsByCountry[state.country.name] || ['National Policy Live', 'The Voter Hour', 'Election Night Forum'];
  const weekOpportunity = {
    tvShow: Math.random() > 0.58 ? sample(availableShows) : null,
    grandRally: state.week === state.totalWeeks ? true : false,
  };

  return {
    week: state.week,
    context,
    icon: '🗳️',
    prompt: eventPrompt(context),
    options,
    weekOpportunity,
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

const buildWeeklyImpactSummary = (beforeState, afterState, selectedOptions) => {
  const systems = [
    ['Momentum', afterState.candidate.momentum - beforeState.candidate.momentum],
    ['Media Trust', afterState.candidate.mediaTrust - beforeState.candidate.mediaTrust],
    ['Field Power', afterState.candidate.fieldPower - beforeState.candidate.fieldPower],
    ['Narrative', afterState.meta.narrative - beforeState.meta.narrative],
    ['Scandal Risk', afterState.candidate.scandalRisk - beforeState.candidate.scandalRisk],
    ['Energy', afterState.candidate.energy - beforeState.candidate.energy],
    ['Funds', afterState.candidate.funds - beforeState.candidate.funds],
  ].map(([label, delta]) => ({ label, delta }));

  const demographics = Object.values(afterState.candidate.demographics)
    .map((demo) => {
      const before = beforeState.candidate.demographics[demo.id];
      const delta = (demo.support || 0) - (before?.support || 0);
      return { name: demo.name, delta };
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const regionSwings = Object.values(afterState.candidate.regions)
    .map((region) => {
      const before = beforeState.candidate.regions[region.id];
      const supportDelta = (region.playerSupport || 0) - (before?.playerSupport || 0);
      const turnoutDelta = (region.turnout || 0) - (before?.turnout || 0);
      return { name: region.name, supportDelta, turnoutDelta };
    })
    .sort((a, b) => Math.abs(b.supportDelta) - Math.abs(a.supportDelta));

  const scoreBefore = computeElectionScore(beforeState);
  const scoreAfter = computeElectionScore(afterState);

  return {
    week: beforeState.week,
    tracks: selectedOptions.map((o) => o.track),
    systems,
    demographics: {
      topGain: demographics.find((d) => d.delta > 0) || null,
      topLoss: demographics.find((d) => d.delta < 0) || null,
      movers: demographics.slice(0, 4),
    },
    electoralTheater: {
      pulseDelta: scoreAfter.nationalPulse - scoreBefore.nationalPulse,
      scoreDelta: scoreAfter.player - scoreBefore.player,
      topRegions: regionSwings.slice(0, 3),
    },
  };
};

const applyOppositionAction = (state, weeklyLog) => {
  const plan = generateOppositionPlan(state);
  const regions = { ...state.candidate.regions };
  const target = regions[plan.targetRegionId];

  if (target) {
    regions[plan.targetRegionId] = {
      ...target,
      playerSupport: clamp(target.playerSupport - plan.playerSupportPenalty - randomInt(0, 2)),
      heat: clamp(target.heat + randomInt(2, 8)),
    };
  }

  weeklyLog.push(`🟥 Opposition move: ${plan.move} in ${plan.targetRegionName}.`);

  return {
    ...state,
    candidate: {
      ...state.candidate,
      regions,
      mediaTrust: clamp(state.candidate.mediaTrust - plan.mediaPenalty),
    },
    opponent: {
      ...state.opponent,
      momentum: clamp(state.opponent.momentum + plan.momentum),
      narrative: clamp(state.opponent.narrative + plan.narrative),
      currentPlan: plan,
    },
  };
};

const applyWeekExtras = (state, weekExtras, weeklyLog) => {
  let nextState = { ...state };
  const focusRegionId = weekExtras?.focusRegionId || null;
  const tvShow = weekExtras?.tvShow || null;
  const rallyGuests = weekExtras?.rallyGuests || [];

  if (focusRegionId) {
    const region = nextState.candidate.regions[focusRegionId];
    if (region) {
      nextState = {
        ...nextState,
        candidate: {
          ...nextState.candidate,
          regions: {
            ...nextState.candidate.regions,
            [focusRegionId]: {
              ...region,
              playerSupport: clamp(region.playerSupport + randomInt(2, 6)),
              turnout: clamp(region.turnout + randomInt(1, 5)),
            },
          },
        },
        meta: {
          ...nextState.meta,
          focusRegionId,
          focusRegionName: region.name,
        },
      };
      weeklyLog.push(`📍 Focus campaign boost applied to ${region.name}.`);
    }
  }

  if (tvShow) {
    nextState = {
      ...nextState,
      candidate: {
        ...nextState.candidate,
        momentum: clamp(nextState.candidate.momentum + randomInt(1, 6)),
        mediaTrust: clamp(nextState.candidate.mediaTrust + randomInt(1, 7)),
        energy: clamp(nextState.candidate.energy - randomInt(2, 6)),
      },
    };
    weeklyLog.push(`📺 Live TV appearance on ${tvShow} influenced national media narrative.`);
  }

  if (nextState.week === nextState.totalWeeks && rallyGuests.length) {
    const guestImpact = Math.min(10, rallyGuests.length * 2);
    nextState = {
      ...nextState,
      candidate: {
        ...nextState.candidate,
        momentum: clamp(nextState.candidate.momentum + guestImpact),
        fieldPower: clamp(nextState.candidate.fieldPower + Math.max(1, Math.round(guestImpact / 2))),
      },
      meta: {
        ...nextState.meta,
        rallyPlan: {
          guests: rallyGuests,
          impact: guestImpact,
        },
      },
    };
    weeklyLog.push(`🎉 Grand rally held with guests: ${rallyGuests.join(', ')}.`);
  }

  return nextState;
};

export const proceedWeek = (state, selectedOptions, mediaResponse = null, weekExtras = null) => {
  if (!selectedOptions.length) {
    return { ...state, log: [...state.log, 'No actions selected. Week cannot proceed.'].slice(-80) };
  }

  const beforeState = JSON.parse(JSON.stringify(state));
  let nextState = { ...state };
  const weeklyLog = [`📅 Week ${state.week} Plan:`];

  selectedOptions.forEach((option) => {
    weeklyLog.push(`${option.icon} ${option.title} (${option.track})`);
    nextState = applySingleChoice(nextState, option, weeklyLog);
  });

  nextState = applyWeekExtras(nextState, weekExtras, weeklyLog);

  if (nextState.meta.pendingMediaQuestion) {
    const mediaOutcome = evaluateMediaRound(nextState, mediaResponse);
    nextState = mediaOutcome.state;
    if (mediaOutcome.summary) {
      weeklyLog.push(`🎤 Media impact: ${mediaOutcome.summary.momentumShift >= 0 ? '+' : ''}${mediaOutcome.summary.momentumShift} momentum, ${mediaOutcome.summary.trustShift >= 0 ? '+' : ''}${mediaOutcome.summary.trustShift} trust.`);
      weeklyLog.push(`🟥 Opposition response: ${mediaOutcome.summary.oppositionResponse}`);
    }
  }

  nextState = applyOppositionAction(nextState, weeklyLog);

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

  const event = generateWeeklyWorldEvent();
  candidate = {
    ...candidate,
    momentum: clamp(candidate.momentum + event.impact),
    mediaTrust: clamp(candidate.mediaTrust + event.trustShift),
  };
  weeklyLog.push(`🌐 Weekly event: ${event.title} (${event.impact >= 0 ? '+' : ''}${event.impact} momentum).`);

  const narrativeDelta = selectedOptions.reduce((sum, o) => sum + o.effect.narrative, 0);
  const nextWeek = Math.min(state.totalWeeks + 1, state.week + 1);
  const nextMediaQuestion = generateMediaQuestion({ ...nextState, week: nextWeek });

  const history = [...nextState.meta.actionHistory, {
    week: state.week,
    tracks: selectedOptions.map((o) => o.track),
    dark: selectedOptions.filter((o) => o.unethical).length,
  }].slice(-6);

  const impactedState = {
    ...nextState,
    week: nextWeek,
    candidate,
    delayed,
    meta: {
      ...nextState.meta,
      narrative: clamp(nextState.meta.narrative + narrativeDelta),
      operationPoints: nextState.meta.maxActionsPerWeek,
      weeklyEvent: event,
      actionHistory: history,
      strategistConfidence: clamp(nextState.meta.strategistConfidence + randomInt(-7, 8)),
      pendingMediaQuestion: nextMediaQuestion,
      weekOpportunity: null,
    },
    log: [...nextState.log, ...weeklyLog].slice(-80),
  };

  const weeklyImpact = buildWeeklyImpactSummary(beforeState, impactedState, selectedOptions);

  return {
    ...impactedState,
    meta: {
      ...impactedState.meta,
      weeklyImpact,
    },
  };
};

export const isFinished = (state) => state.week > state.totalWeeks;

export const computeElectionScore = (state) => {
  const regions = Object.values(state.candidate.regions);
  const total = regions.reduce((s, r) => s + r.points, 0);

  let playerProjection = 0;
  regions.forEach((r) => {
    const projected = r.playerSupport +
      (state.candidate.momentum - state.opponent.momentum) * 0.16 +
      (state.meta.narrative - state.opponent.narrative) * 0.14 +
      (state.candidate.fieldPower - state.opponent.fieldPower) * 0.1 +
      (r.fieldOffices - 1) * 0.8;
    if (projected >= 50) playerProjection += r.points;
  });

  const opponentProjection = total - playerProjection;

  // extra moving metric to avoid perceived stagnation late-game
  const nationalPulse = clamp(
    50 +
      (state.candidate.momentum - state.opponent.momentum) * 0.35 +
      (state.meta.narrative - state.opponent.narrative) * 0.25 +
      (state.candidate.fieldPower - state.opponent.fieldPower) * 0.2,
  );

  return { player: playerProjection, opponent: opponentProjection, total, target: state.country.targetScore, nationalPulse };
};

export const getRules = (state) => [
  `Default country is ${state.country.name}; you can switch country and start a new run.`,
  `Plan up to ${state.meta.maxActionsPerWeek} actions each week, then click Proceed Week.`,
  'Mix tracks: social media, field outreach, donor relations, policy messaging, coalitions, volunteer ops.',
  'Opposition acts every week and can target regions you ignore.',
  'Random world events can alter momentum and trust.',
  'Some weeks trigger media questions. Answering well can improve trust and momentum.',
  'You can focus campaign resources on a specific region each week.',
  'Some weeks offer live TV shows; final week supports a grand rally guest list.',
  `Reach target score (${state.country.targetScore}) by endgame to win.`,
];

export const getAnalystTip = (state, event, selectedOptions) => {
  const score = computeElectionScore(state);
  const history = state.meta.actionHistory || [];
  const recentTracks = history.flatMap((h) => h.tracks || []);
  const repeatedDigital = recentTracks.filter((t) => t === 'Social Media').length >= 3;
  const hasField = selectedOptions.some((o) => o.track === 'Field Outreach');
  const hasDigital = selectedOptions.some((o) => o.track === 'Social Media');
  const darkCount = selectedOptions.filter((o) => o.unethical).length;

  const suggestions = [];

  if (!selectedOptions.length) suggestions.push('Build a balanced week plan—start with one outreach or policy action.');
  if (darkCount >= 2) suggestions.push('Too many dark tactics this week. Add at least one trust-building action.');
  if (score.player < score.target && !hasField) suggestions.push('You are below target pace. Add a Field Outreach action for turnout.');
  if (state.candidate.mediaTrust < 45 && !hasDigital) suggestions.push('Media trust is low. Include Social Media or Policy Messaging.');
  if (repeatedDigital) suggestions.push('You are overusing digital plays lately. Pivot to ground or coalition actions.');
  if (event?.context === 'Fundraising') suggestions.push('Pair fundraising with coalition or policy messaging to avoid donor-only optics.');

  if (!suggestions.length) suggestions.push('Good mix. Proceed this week if your action costs and risks look acceptable.');

  // analyst is imperfect: sometimes gives noisy/partly wrong advice
  const errorChance = Math.max(8, 35 - Math.floor(state.meta.strategistConfidence / 3));
  if (randomInt(0, 100) < errorChance) {
    return `Analyst (uncertain): ${sample(['Double down on aggressive attacks this week.', 'Ignore field outreach this turn.', 'You can safely stack dark tactics.'])}`;
  }

  return `Analyst: ${suggestions[0]}`;
};

export const getResultBreakdown = (state) => {
  const score = computeElectionScore(state);
  const demoScore = Object.values(state.candidate.demographics).reduce((s, d) => s + d.support * 0.1 + d.loyalty * 0.05, 0);

  const factors = [
    { label: 'Demographic support + loyalty', value: Math.round(demoScore) },
    { label: 'Campaign momentum', value: Math.round(state.candidate.momentum) },
    { label: 'Field power', value: Math.round(state.candidate.fieldPower) },
    { label: 'Narrative control', value: Math.round(state.meta.narrative) },
    { label: 'National pulse influence', value: Math.round(score.nationalPulse * 0.4) },
    { label: 'Regional score gap', value: Math.round((score.player - score.opponent) * 0.3) },
    { label: 'Scandal risk penalty', value: -Math.round(state.candidate.scandalRisk) },
  ];

  const final = factors.reduce((sum, factor) => sum + factor.value, 0);
  const verdict = score.player >= score.target ? 'Victory' : 'Defeat';

  const topFactors = [...factors]
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 5);

  return { verdict, final, score, factors, topFactors };
};

export const resultSummary = (state) => {
  const breakdown = getResultBreakdown(state);
  return `${breakdown.verdict} • ${state.country.name} ${breakdown.score.player}-${breakdown.score.opponent} • Pulse ${breakdown.score.nationalPulse} • Final Score ${breakdown.final}`;
};
