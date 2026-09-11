/**
 * Product Data Accuracy Calculator — per manufacturer
 * 
 * Evaluates completeness and quality of each product field.
 * Fields are grouped into categories with weighted importance.
 */

import { manufacturers, products } from '../src/data/comprehensive-data';

// ─── FIELD DEFINITIONS ───
// Each field has a weight (importance) and a validator function.
// Validator returns 1.0 (fully accurate), 0.5 (partial), or 0.0 (missing/fake).

interface FieldCheck {
  name: string;
  weight: number;
  category: 'Core Identity' | 'Electrical Specs' | 'Mechanical' | 'Links & Sources' | 'Market Data' | 'Extended Specs' | 'Metadata Arrays';
  check: (p: any) => number;
}

const isReal = (v: any): boolean => v !== undefined && v !== null && v !== '' && v !== 'N/A' && v !== 'X' && v !== '#' && v !== 0;
const isRealUrl = (v: any): boolean => typeof v === 'string' && v.length > 5 && (v.startsWith('http://') || v.startsWith('https://'));

const fields: FieldCheck[] = [
  // Core Identity (most important)
  { name: 'name', weight: 10, category: 'Core Identity', check: p => isReal(p.name) ? 1 : 0 },
  { name: 'series', weight: 8, category: 'Core Identity', check: p => isReal(p.series) ? 1 : 0 },
  { name: 'model', weight: 9, category: 'Core Identity', check: p => isReal(p.model) ? 1 : 0 },
  { name: 'manufacturer', weight: 10, category: 'Core Identity', check: p => isReal(p.manufacturer?.name) ? 1 : 0 },
  { name: 'status', weight: 8, category: 'Core Identity', check: p => ['ACTIVE','DISCONTINUED','ANNOUNCED','COMING_SOON'].includes(p.status) ? 1 : 0 },

  // Electrical Specs
  { name: 'acPower', weight: 10, category: 'Electrical Specs', check: p => p.acPower > 0 ? 1 : 0 },
  { name: 'maxModuleSize', weight: 7, category: 'Electrical Specs', check: p => p.maxModuleSize > 0 ? 1 : 0 },
  { name: 'voltage', weight: 8, category: 'Electrical Specs', check: p => p.voltage > 0 ? 1 : 0 },
  { name: 'mppt', weight: 7, category: 'Electrical Specs', check: p => p.mppt > 0 ? 1 : 0 },
  { name: 'efficiency', weight: 9, category: 'Electrical Specs', check: p => p.efficiency > 0 ? 1 : 0 },
  { name: 'inputVoltageRange', weight: 6, category: 'Electrical Specs', check: p => isReal(p.inputVoltageRange) ? 1 : 0 },
  { name: 'mpptVoltageRange', weight: 5, category: 'Electrical Specs', check: p => isReal(p.mpptVoltageRange) ? 1 : 0 },
  { name: 'peakPowerTrackingRange', weight: 4, category: 'Electrical Specs', check: p => isReal(p.peakPowerTrackingRange) ? 1 : 0 },
  { name: 'maxInputCurrent', weight: 6, category: 'Electrical Specs', check: p => isReal(p.maxInputCurrent) ? 1 : 0 },
  { name: 'thd', weight: 4, category: 'Electrical Specs', check: p => isReal(p.thd) ? 1 : 0 },
  { name: 'cecEfficiency', weight: 5, category: 'Electrical Specs', check: p => isReal(p.cecEfficiency) ? 1 : 0 },
  { name: 'euroEfficiency', weight: 4, category: 'Electrical Specs', check: p => isReal(p.euroEfficiency) ? 1 : 0 },
  { name: 'maxEfficiency', weight: 5, category: 'Electrical Specs', check: p => isReal(p.maxEfficiency) ? 1 : 0 },
  { name: 'startVoltage', weight: 4, category: 'Electrical Specs', check: p => isReal(p.startVoltage) ? 1 : 0 },
  { name: 'nightConsumption', weight: 3, category: 'Electrical Specs', check: p => isReal(p.nightConsumption) ? 1 : 0 },
  { name: 'voc', weight: 4, category: 'Electrical Specs', check: p => isReal(p.voc) ? 1 : 0 },
  { name: 'isc', weight: 4, category: 'Electrical Specs', check: p => isReal(p.isc) ? 1 : 0 },

  // Mechanical
  { name: 'weight', weight: 6, category: 'Mechanical', check: p => p.weight > 0 ? 1 : 0 },
  { name: 'dimensions', weight: 6, category: 'Mechanical', check: p => isReal(p.dimensions) ? 1 : 0 },
  { name: 'ipRating', weight: 5, category: 'Mechanical', check: p => isReal(p.ipRating) ? 1 : 0 },
  { name: 'operatingTempRange', weight: 5, category: 'Mechanical', check: p => isReal(p.operatingTempRange) ? 1 : 0 },

  // Links & Sources
  { name: 'datasheetUrl', weight: 7, category: 'Links & Sources', check: p => isRealUrl(p.datasheetUrl) ? 1 : 0 },
  { name: 'productUrl', weight: 7, category: 'Links & Sources', check: p => isRealUrl(p.productUrl) ? 1 : 0 },
  { name: 'sourceUrl', weight: 5, category: 'Links & Sources', check: p => isRealUrl(p.sourceUrl) ? 1 : 0 },
  { name: 'imageUrl', weight: 3, category: 'Links & Sources', check: p => isRealUrl(p.imageUrl) ? 1 : 0 },

  // Market Data
  { name: 'warranty', weight: 7, category: 'Market Data', check: p => p.warranty > 0 ? 1 : 0 },
  { name: 'countries', weight: 8, category: 'Market Data', check: p => Array.isArray(p.countries) && p.countries.length > 0 ? 1 : 0 },
  { name: 'price', weight: 4, category: 'Market Data', check: p => p.price > 0 ? 1 : 0 },
  { name: 'availability', weight: 5, category: 'Market Data', check: p => ['IN_STOCK','OUT_OF_STOCK','LIMITED'].includes(p.availability) ? 1 : 0 },
  { name: 'launchDate', weight: 6, category: 'Market Data', check: p => isReal(p.launchDate) ? 1 : 0 },
  { name: 'powerClass', weight: 4, category: 'Market Data', check: p => isReal(p.powerClass) ? 1 : 0 },
  { name: 'communicationType', weight: 5, category: 'Market Data', check: p => isReal(p.communicationType) ? 1 : 0 },
  { name: 'monitoringPlatform', weight: 4, category: 'Market Data', check: p => isReal(p.monitoringPlatform) ? 1 : 0 },
  { name: 'aiSummary', weight: 3, category: 'Market Data', check: p => typeof p.aiSummary === 'string' && p.aiSummary.length > 20 ? 1 : 0 },

  // Metadata Arrays (empty = 0, populated = 1)
  { name: 'specifications[]', weight: 6, category: 'Metadata Arrays', check: p => p.specifications?.length > 0 ? 1 : 0 },
  { name: 'certifications[]', weight: 6, category: 'Metadata Arrays', check: p => p.certifications?.length > 0 ? 1 : 0 },
  { name: 'accessories[]', weight: 3, category: 'Metadata Arrays', check: p => p.accessories?.length > 0 ? 1 : 0 },
  { name: 'datasheets[]', weight: 2, category: 'Metadata Arrays', check: p => p.datasheets?.length > 0 ? 1 : 0 },
  { name: 'revisionHistory[]', weight: 2, category: 'Metadata Arrays', check: p => p.revisionHistory?.length > 0 ? 1 : 0 },
  { name: 'regionalVariants[]', weight: 3, category: 'Metadata Arrays', check: p => p.regionalVariants && p.regionalVariants.length > 0 ? 1 : 0 },
];

const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);

// ─── PER-MANUFACTURER CALCULATION ───
interface MfrResult {
  manufacturer: string;
  productCount: number;
  overallAccuracy: number;
  categoryScores: Record<string, number>;
  weakestFields: { name: string; score: number }[];
  strongestFields: { name: string; score: number }[];
}

const results: MfrResult[] = [];

for (const mfr of manufacturers) {
  const mfrProducts = products.filter(p => p.manufacturerId === mfr.id);
  if (mfrProducts.length === 0) continue;

  // Per-field average across all products for this manufacturer
  const fieldScores: Record<string, { total: number; count: number; weight: number; category: string }> = {};
  for (const f of fields) {
    fieldScores[f.name] = { total: 0, count: 0, weight: f.weight, category: f.category };
  }

  let mfrWeightedTotal = 0;

  for (const product of mfrProducts) {
    let productWeightedScore = 0;
    for (const f of fields) {
      const score = f.check(product);
      fieldScores[f.name].total += score;
      fieldScores[f.name].count += 1;
      productWeightedScore += score * f.weight;
    }
    mfrWeightedTotal += productWeightedScore / totalWeight;
  }

  const overallAccuracy = (mfrWeightedTotal / mfrProducts.length) * 100;

  // Category scores
  const categories = [...new Set(fields.map(f => f.category))];
  const categoryScores: Record<string, number> = {};
  for (const cat of categories) {
    const catFields = fields.filter(f => f.category === cat);
    const catWeight = catFields.reduce((s, f) => s + f.weight, 0);
    let catScore = 0;
    for (const f of catFields) {
      const avg = fieldScores[f.name].count > 0 ? fieldScores[f.name].total / fieldScores[f.name].count : 0;
      catScore += avg * f.weight;
    }
    categoryScores[cat] = (catScore / catWeight) * 100;
  }

  // Weakest and strongest fields
  const fieldAvgs = Object.entries(fieldScores).map(([name, s]) => ({
    name,
    score: s.count > 0 ? (s.total / s.count) * 100 : 0,
  }));
  fieldAvgs.sort((a, b) => a.score - b.score);
  const weakestFields = fieldAvgs.filter(f => f.score < 100).slice(0, 5);
  const strongestFields = fieldAvgs.filter(f => f.score === 100);

  results.push({
    manufacturer: mfr.name,
    productCount: mfrProducts.length,
    overallAccuracy: Math.round(overallAccuracy * 10) / 10,
    categoryScores: Object.fromEntries(Object.entries(categoryScores).map(([k, v]) => [k, Math.round(v * 10) / 10])),
    weakestFields,
    strongestFields,
  });
}

// ─── SORT BY ACCURACY DESC ───
results.sort((a, b) => b.overallAccuracy - a.overallAccuracy);

// ─── OUTPUT ───
console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║           PRODUCT DATA ACCURACY REPORT — BY MANUFACTURER                   ║');
console.log('║           Total fields evaluated: ' + fields.length + ' per product (weighted)                  ║');
console.log('║           Total products: ' + products.length + '                                               ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

for (const r of results) {
  const bar = '█'.repeat(Math.round(r.overallAccuracy / 2.5)) + '░'.repeat(40 - Math.round(r.overallAccuracy / 2.5));
  console.log(`┌─── ${r.manufacturer} (${r.productCount} products) ───`);
  console.log(`│  Overall Accuracy: ${r.overallAccuracy}%  ${bar}`);
  console.log(`│`);
  console.log(`│  Category Breakdown:`);
  for (const [cat, score] of Object.entries(r.categoryScores)) {
    const catBar = '▓'.repeat(Math.round(score / 5)) + '░'.repeat(20 - Math.round(score / 5));
    console.log(`│    ${cat.padEnd(20)} ${String(score).padStart(5)}%  ${catBar}`);
  }
  if (r.weakestFields.length > 0) {
    console.log(`│`);
    console.log(`│  Weakest Fields (needs data):`);
    for (const f of r.weakestFields) {
      console.log(`│    ⚠ ${f.name.padEnd(22)} ${f.score}%`);
    }
  }
  console.log(`└${'─'.repeat(70)}\n`);
}

// ─── SUMMARY TABLE ───
console.log('\n┌──────────────────────────────┬──────────┬───────────┐');
console.log('│ Manufacturer                 │ Products │ Accuracy  │');
console.log('├──────────────────────────────┼──────────┼───────────┤');
for (const r of results) {
  console.log(`│ ${r.manufacturer.padEnd(28)} │ ${String(r.productCount).padStart(8)} │ ${String(r.overallAccuracy + '%').padStart(9)} │`);
}
console.log('├──────────────────────────────┼──────────┼───────────┤');
const avgAccuracy = Math.round((results.reduce((s, r) => s + r.overallAccuracy, 0) / results.length) * 10) / 10;
console.log(`│ ${'AVERAGE (all manufacturers)'.padEnd(28)} │ ${String(products.length).padStart(8)} │ ${String(avgAccuracy + '%').padStart(9)} │`);
console.log('└──────────────────────────────┴──────────┴───────────┘');

// ─── GLOBAL FIELD COVERAGE ───
console.log('\n\n── GLOBAL FIELD COVERAGE (across all products) ──\n');
const globalFieldScores = fields.map(f => {
  let filled = 0;
  for (const p of products) {
    filled += f.check(p);
  }
  return { name: f.name, category: f.category, coverage: Math.round((filled / products.length) * 1000) / 10 };
});
globalFieldScores.sort((a, b) => a.coverage - b.coverage);
for (const f of globalFieldScores) {
  const icon = f.coverage === 100 ? '✓' : f.coverage >= 80 ? '◐' : f.coverage >= 50 ? '◔' : '✗';
  console.log(`  ${icon} ${f.name.padEnd(22)} ${String(f.coverage + '%').padStart(6)}  (${f.category})`);
}
