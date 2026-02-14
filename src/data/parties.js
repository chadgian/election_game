import { WORLD_COUNTRIES } from './countries';

const PARTY_OVERRIDES = {
  'United States': ['Democratic Party', 'Republican Party', 'Libertarian Party', 'Green Party'],
  Philippines: ['PDP–Laban', 'Lakas–CMD', 'Liberal Party', 'Nacionalista Party'],
  'United Kingdom': ['Conservative Party', 'Labour Party', 'Liberal Democrats', 'Green Party'],
  India: ['Bharatiya Janata Party', 'Indian National Congress', 'Aam Aadmi Party', 'Trinamool Congress'],
  Canada: ['Liberal Party of Canada', 'Conservative Party of Canada', 'New Democratic Party', 'Bloc Québécois'],
  Japan: ['Liberal Democratic Party', 'Constitutional Democratic Party', 'Komeito', 'Japan Innovation Party'],
  Germany: ['CDU/CSU', 'SPD', 'Alliance 90/The Greens', 'FDP'],
  France: ['Renaissance', 'National Rally', 'The Republicans', 'Socialist Party'],
  Australia: ['Australian Labor Party', 'Liberal Party of Australia', 'The Nationals', 'Australian Greens'],
  Brazil: ['Workers\' Party', 'Liberal Party', 'Brazil Union', 'Social Democratic Party'],
  Mexico: ['MORENA', 'National Action Party', 'Institutional Revolutionary Party', 'Citizen\'s Movement'],
  Indonesia: ['PDI-P', 'Golkar', 'Gerindra', 'PKB'],
  'South Korea': ['People Power Party', 'Democratic Party', 'Justice Party', 'People Party'],
  'South Africa': ['African National Congress', 'Democratic Alliance', 'Economic Freedom Fighters', 'Inkatha Freedom Party'],
  Spain: ['People\'s Party', 'Spanish Socialist Workers\' Party', 'Vox', 'Sumar'],
  Italy: ['Brothers of Italy', 'Democratic Party', 'Five Star Movement', 'Lega'],
};

const makeGenericParties = (country) => {
  const base = country.split(' ')[0];
  return [
    `${base} National Party`,
    `${base} Reform Movement`,
    `${base} Democratic Alliance`,
    `${base} People\'s Coalition`,
  ];
};

export const buildLocalPartyMap = () => WORLD_COUNTRIES.reduce((acc, country) => {
  acc[country] = PARTY_OVERRIDES[country] || makeGenericParties(country);
  return acc;
}, {});

export const getPartiesForCountry = (country) => {
  const map = buildLocalPartyMap();
  return map[country] || ['Independent', 'National Unity Bloc', 'Progressive Front', 'Conservative Alliance'];
};
