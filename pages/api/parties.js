const FALLBACK_PARTIES = {
  'United States': ['Democratic Party', 'Republican Party', 'Libertarian Party', 'Green Party'],
  Philippines: ['PDP–Laban', 'Lakas–CMD', 'Liberal Party', 'Nacionalista Party'],
  'United Kingdom': ['Labour Party', 'Conservative Party', 'Liberal Democrats', 'Green Party of England and Wales'],
  India: ['Bharatiya Janata Party', 'Indian National Congress', 'Aam Aadmi Party', 'Trinamool Congress'],
  Canada: ['Liberal Party of Canada', 'Conservative Party of Canada', 'New Democratic Party', 'Bloc Québécois'],
};

const normalizeParties = (items = []) => {
  const seen = new Set();
  return items
    .map((name) => name?.trim())
    .filter(Boolean)
    .filter((name) => !name.toLowerCase().includes('category:'))
    .filter((name) => {
      const key = name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);
};

const fetchFromWikidata = async (country) => {
  const query = `
    SELECT DISTINCT ?partyLabel WHERE {
      ?country rdfs:label "${country.replace(/"/g, '')}"@en.
      ?party wdt:P31/wdt:P279* wd:Q7278;
             wdt:P17 ?country.
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 30
  `;

  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      accept: 'application/sparql-results+json',
      'user-agent': 'election-command/2.0 (political-party-loader)',
    },
  });

  if (!response.ok) throw new Error(`wikidata ${response.status}`);
  const data = await response.json();
  return normalizeParties((data.results?.bindings || []).map((item) => item.partyLabel?.value));
};

export default async function handler(req, res) {
  const country = req.query.country || 'United States';

  try {
    const onlineParties = await fetchFromWikidata(country);
    if (onlineParties.length >= 2) {
      return res.status(200).json({ source: 'wikidata', country, parties: onlineParties });
    }
  } catch {
    // fallback below
  }

  const fallback = FALLBACK_PARTIES[country] || ['Centrist Reform Bloc', 'National Unity Alliance', 'Workers Front', 'Green Future Movement'];
  return res.status(200).json({ source: 'fallback', country, parties: fallback });
}
