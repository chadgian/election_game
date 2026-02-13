export const WORLD_COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria',
  'Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia',
  'Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cabo Verde','Cambodia','Cameroon',
  'Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Cote d\'Ivoire',
  'Croatia','Cuba','Cyprus','Czech Republic','Democratic Republic of the Congo','Denmark','Djibouti','Dominica','Dominican Republic','Ecuador',
  'Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland','France','Gabon','Gambia',
  'Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland',
  'India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Kuwait',
  'Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi',
  'Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia',
  'Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria',
  'North Korea','North Macedonia','Norway','Oman','Pakistan','Palau','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland',
  'Portugal','Qatar','Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino',
  'Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands',
  'Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria','Tajikistan',
  'Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda','Ukraine',
  'United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Vanuatu','Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe'
];

export const COUNTRY_PROFILES = {
  'United States': {
    code: 'US',
    icon: '🇺🇸',
    electionType: 'Presidential Electoral College',
    targetScore: 270,
    currency: 'USD',
    regions: [
      { id: 'west_coast', name: 'West Coast', points: 74, leaning: 56, volatility: 0.8 },
      { id: 'great_plains', name: 'Great Plains', points: 52, leaning: 42, volatility: 0.6 },
      { id: 'sunbelt', name: 'Sunbelt', points: 106, leaning: 49, volatility: 0.9 },
      { id: 'great_lakes', name: 'Great Lakes', points: 66, leaning: 50, volatility: 0.9 },
      { id: 'northeast', name: 'Northeast', points: 87, leaning: 54, volatility: 0.7 },
      { id: 'mountain', name: 'Mountain West', points: 41, leaning: 46, volatility: 0.75 },
      { id: 'deep_south', name: 'Deep South', points: 112, leaning: 41, volatility: 0.65 }
    ],
    demographics: ['Youth Vote','Women','Black Voters','Latino Voters','Suburban Families','Rural Voters','Union Workers','Faith Voters']
  },
  Philippines: {
    code: 'PH',
    icon: '🇵🇭',
    electionType: 'National Popular Vote (Presidential)',
    targetScore: 50,
    currency: 'PHP',
    regions: [
      { id: 'ncr', name: 'NCR / Metro Manila', points: 9, leaning: 51, volatility: 0.9 },
      { id: 'north_luzon', name: 'North Luzon', points: 14, leaning: 48, volatility: 0.8 },
      { id: 'south_luzon', name: 'South Luzon + Bicol', points: 15, leaning: 50, volatility: 0.85 },
      { id: 'visayas', name: 'Visayas', points: 16, leaning: 49, volatility: 0.9 },
      { id: 'mindanao', name: 'Mindanao', points: 18, leaning: 47, volatility: 0.85 },
      { id: 'bangsamoro', name: 'BARMM', points: 6, leaning: 45, volatility: 0.95 },
      { id: 'overseas', name: 'Overseas Filipino Vote', points: 5, leaning: 52, volatility: 0.75 }
    ],
    demographics: ['Kabataan','Urban Workers','OFW Families','Middle Class','Rural Farmers','Mindanao Voters','Business Sector','Women Voters']
  },
  India: {
    code: 'IN',
    icon: '🇮🇳',
    electionType: 'Parliamentary National Mandate',
    targetScore: 272,
    currency: 'INR'
  },
  'United Kingdom': {
    code: 'GB',
    icon: '🇬🇧',
    electionType: 'Parliamentary Seats',
    targetScore: 326,
    currency: 'GBP'
  },
  Canada: {
    code: 'CA',
    icon: '🇨🇦',
    electionType: 'Parliamentary Seats',
    targetScore: 170,
    currency: 'CAD'
  },
  Japan: {
    code: 'JP',
    icon: '🇯🇵',
    electionType: 'Diet Majority',
    targetScore: 233,
    currency: 'JPY'
  }
};

export const getCountryProfile = (countryName) => {
  const profile = COUNTRY_PROFILES[countryName] || {};
  const genericRegions = [
    { id: 'capital', name: 'Capital Region', points: 20, leaning: 52, volatility: 0.9 },
    { id: 'north', name: 'Northern Provinces', points: 15, leaning: 47, volatility: 0.8 },
    { id: 'central', name: 'Central Belt', points: 20, leaning: 50, volatility: 0.85 },
    { id: 'south', name: 'Southern Zone', points: 18, leaning: 46, volatility: 0.82 },
    { id: 'urban', name: 'Major Urban Centers', points: 17, leaning: 53, volatility: 0.9 },
    { id: 'rural', name: 'Rural Bloc', points: 15, leaning: 44, volatility: 0.75 },
    { id: 'diaspora', name: 'Diaspora / External Vote', points: 5, leaning: 51, volatility: 0.7 }
  ];

  return {
    name: countryName,
    code: profile.code || countryName.slice(0, 2).toUpperCase(),
    icon: profile.icon || '🌍',
    electionType: profile.electionType || 'National Election',
    targetScore: profile.targetScore || 50,
    currency: profile.currency || 'Local Currency',
    regions: profile.regions || genericRegions,
    demographics: profile.demographics || ['Youth','Women','Workers','Rural Voters','Urban Professionals','Business Sector','Seniors','Minority Communities']
  };
};
