# Data Integrity Rules

## mpptRange/pptrRange
- All manufacturers have been verified and corrected against official datasheets
- Hoymiles HM/HMS/HMT/HiFlow → `16-60 VDC`
- APsystems DS3/EZ1/QT2 → `28-45 VDC`, QT2D → `52-118 VDC`
- Deye SUN-G3 → `25-55 VDC`
- Sigenergy SigenMicro → `16-60 VDC`, SP2 → `50-550 VDC`, TP2 → `160-1000 VDC`
- Envertech EVT300/400 → `22-50 VDC`, EVT560/720 → `24-45 VDC`
- TSUN → `16-60 VDC`
- Huawei → `140-980 VDC`, FoxESS T → `140-1000 VDC`, H1-G2 → `80-550 VDC`
- Tesla SI → `60-480 VDC`, Atmoce MI-600 → `16-60 VDC`

## Country Mappings
- Verified from official regional stores
- **Enphase Japan**: ONLY IQ8HC is sold in Japan (IQ8HC-72-M-JP model), launched Apr 28, 2025 via ITOCHU distribution
- **Hoymiles**: Japan NOT included in 230V markets
- **Enphase IQ8P**: EU added based on active INT datasheet (IQ8P-72-2-INT covers 230V/50Hz with IEC 62109, EN 50549-1 certs)
- Per-country EU variants added with 2-letter codes: EU-DE, EU-FR, EU-IT, EU-ES, EU-NL, EU-BE, EU-AT, EU-CH, EU-GB, EU-IE, EU-SE, EU-NO, EU-DK, EU-FI, EU-PL, EU-CZ, EU-HU, EU-RO, EU-GR, EU-PT, EU-LU, EU-HR, EU-SK, EU-SI, EU-BG

## Enphase Country Availability (verified from regional stores + datasheets)
- IQ8/IQ8+/IQ8M/IQ8A/IQ8H → enphaseNA (NA-only, -US models only)
- IQ8MC → enIQ8MC (US+EU only, not AU/IN/JP)
- IQ8AC → enIQ8AC (US+EU+AU, NOT JP)
- IQ8HC → enIQ8HC (US+EU+AU+IN+JP) - ONLY model in Japan
- IQ8X → enIQ8X (US+EU+AU, NOT JP)
- IQ8P → enIQ8P (US+EU+AU+IN, NOT JP)
- IQ9N → enIQ9N (US+EU+AU, NOT JP)
- IQ7+ → enIQ7Plus (US+EU+AU+IN, NOT JP)
- IQ7A → enIQ7A (US+EU+AU+IN, NOT JP)

## Other Manufacturers Japan Status
- Sigenergy: includes Japan (verified from sigenergy.com region selector)
- APsystems: includes Japan in apsGlobal
- Hoymiles: Japan NOT included (230V EU markets only)
- Q CELLS: includes Japan in qcellsGlobal
- Huawei: includes Japan in huaweiGlobal

## SolarEdge
- P-Series (P505/P600/P800/P1100) replaced by S-Series (S440/S500B/S650B/S650A)
- IDs 134-137 reused for S-Series
- Added U-Series (U650/U650B) and C-Series (C651U) for US domestic content
