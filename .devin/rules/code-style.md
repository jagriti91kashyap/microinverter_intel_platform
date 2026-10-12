# Code Style Rules

## General
- Do NOT add or remove comments unless explicitly asked
- Imports always at top of file
- No emojis in code unless requested
- Use existing patterns (P() helper, country groups, efficiency corrections map)

## Data Architecture (products-data.ts)
- All products are created via the `P()` helper function in `buildProducts()`
- Key parameters (positional):
  - `mpptRange`: MPPT voltage range string (e.g., `'16-60 VDC'`)
  - `pptrRange`: Power point tracking range (default `'X'` if not applicable)
  - `cecEff`, `euroEff`, `maxEff`: Efficiency strings, overridden by `efficiencyCorrections` map
  - `extra`: `Record<string, string>` for additional specs like battery capacity

## Adding New Products
1. Pick next available ID number
2. Add P() call in the appropriate manufacturer section
3. Add efficiency correction entry in `efficiencyCorrections`
4. Update manufacturer `totalProducts` in `comprehensive-data.ts`
5. If new product type, update `deriveProductType()`
6. If new manufacturer, add to manufacturer array, accessories map, and manufacturer index comment

## Manufacturer Index (in buildProducts)
```
Enphase=0, APsystems=1, Hoymiles=2, Deye=3, Sigenergy=4, Envertech=5,
Chilicon=6, SMA=7, Fronius=8, SolarEdge=9, Tigo=10, TSUN=11, AEconversion=12, Atmoce=13,
Q CELLS=14, Huawei=15, FoxESS=16, Tesla=17, Anker=18, Marstek=19, EcoFlow=20
```

## Efficiency Corrections
- Always override via `efficiencyCorrections` map, not in P() call
- After all products are created, `efficiencyCorrections` overrides CEC/Euro/Max efficiency per product ID

## Regional Variants
- `regionalVariantsMap` defines per-product regional SKUs (model numbers, voltage, certifications, datasheet URLs)
- `splitProductsByRegionalSKU()` creates separate product entries per region for products with multiple regional variants
- `RegionalVariant` type: `region` field is `string` to support per-country codes like EU-DE, EU-FR etc.

## Country Groups
- Products use predefined country arrays
- `NA`: US, Canada, Mexico
- `EU`: 25 European countries
- Per-manufacturer groups: `enphaseNA`, `hoy230V`, `hoyNA`, `hoyLATAM`, `apsGlobal`, `sigGlobal`, `foxGlobal`, `ankerEU`, `marstekEU`, `ecoflowEU`, `ecoflowNA`, etc.
- Enphase has per-product country lists (verified from regional stores): `enIQ8HC`, `enIQ8P`, `enIQ9N`, etc.
