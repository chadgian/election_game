import { WORLD_COUNTRIES } from '../data/countries';

export default function CountrySelector({ currentCountry, onSelect }) {
  return (
    <div className="glass countryBar">
      <label htmlFor="country">🌐 Country</label>
      <select id="country" value={currentCountry} onChange={(e) => onSelect(e.target.value)}>
        {WORLD_COUNTRIES.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>
      <small>Changing country starts a new campaign run with country-specific setup.</small>
    </div>
  );
}
