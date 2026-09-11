// Map geo.properties.name (from world-atlas@2 TopoJSON) to our product-data country names.
// Primary matching uses geo.properties.name since numeric IDs can lose leading zeros.

// Maps our product-data country names → TopoJSON geo.properties.name
export const productNameToGeoName: Record<string, string> = {
  'United States': 'United States of America',
  'Czech Republic': 'Czechia',
  'UAE': 'United Arab Emirates',
  // These already match directly:
  // 'Canada', 'Mexico', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands',
  // 'Belgium', 'Austria', 'Switzerland', 'United Kingdom', 'Ireland', 'Sweden',
  // 'Norway', 'Denmark', 'Finland', 'Poland', 'Hungary', 'Romania', 'Greece',
  // 'Portugal', 'Croatia', 'Slovakia', 'Slovenia', 'Bulgaria', 'Australia',
  // 'New Zealand', 'Japan', 'South Korea', 'India', 'China', 'Thailand',
  // 'Vietnam', 'Indonesia', 'Philippines', 'Brazil', 'Chile', 'Colombia',
  // 'Argentina', 'South Africa', 'Saudi Arabia', 'Israel', 'Turkey', 'Nigeria',
  // 'Kenya', 'Egypt', 'Morocco', 'Taiwan', 'Singapore', 'Malaysia',
  // 'Luxembourg' (too small for 110m map)
};

// Reverse: TopoJSON geo.properties.name → our product-data country name
export const geoNameToProductName: Record<string, string> = {
  'United States of America': 'United States',
  'Czechia': 'Czech Republic',
  'United Arab Emirates': 'UAE',
};

// All product-data country names that map directly (name matches geo.properties.name)
const directMatchCountries = [
  'Canada', 'Mexico', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands',
  'Belgium', 'Austria', 'Switzerland', 'United Kingdom', 'Ireland', 'Sweden',
  'Norway', 'Denmark', 'Finland', 'Poland', 'Hungary', 'Romania', 'Greece',
  'Portugal', 'Luxembourg', 'Croatia', 'Slovakia', 'Slovenia', 'Bulgaria',
  'Australia', 'New Zealand', 'Japan', 'South Korea', 'India', 'China',
  'Thailand', 'Vietnam', 'Indonesia', 'Philippines', 'Brazil', 'Chile',
  'Colombia', 'Argentina', 'South Africa', 'Saudi Arabia', 'Israel', 'Turkey',
  'Nigeria', 'Kenya', 'Egypt', 'Morocco', 'Taiwan', 'Singapore', 'Malaysia',
];

// Build a complete mapping: geo.properties.name → product-data country name
// This covers both direct matches and renamed countries.
export const geoNameToCountry: Record<string, string> = {
  ...geoNameToProductName,
};
directMatchCountries.forEach((name) => {
  geoNameToCountry[name] = name;
});

// Given a geo.properties.name from the map, return the product-data country name (or undefined)
export function resolveGeoCountryName(geoName: string): string | undefined {
  return geoNameToCountry[geoName];
}
