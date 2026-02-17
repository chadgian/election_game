import { WORLD_COUNTRIES } from '../data/countries';

export default function CountrySelector({ currentCountry, onSelectCountry, parties = [], selectedParty, onSelectParty, partySource }) {
  return (
    <div className="glass countryBar">
      <label htmlFor="country">🌐 Country</label>
      <select id="country" value={currentCountry} onChange={(e) => onSelectCountry(e.target.value)}>
        {WORLD_COUNTRIES.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>

      <label htmlFor="party">🏷️ Political Party</label>
      <select id="party" value={selectedParty} onChange={(e) => onSelectParty(e.target.value)}>
        {parties.map((party) => (
          <option key={party} value={party}>{party}</option>
        ))}
      </select>

      <small>
        Select country and party before starting a campaign. Party source: {partySource}.
      </small>
    </div>
  );
}
