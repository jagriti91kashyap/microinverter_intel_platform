'use client';

import React, { Suspense, useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'next/navigation';
import { Plus, X, Download, Share2, ExternalLink, Package, Search, Globe, MapPin, ChevronLeft, ChevronRight, Check, ShieldCheck, FileText, Zap, BookmarkPlus, Bookmark, Trash2, Clock, FolderOpen, GripVertical } from 'lucide-react';
import { products, countries as allCountries, regions as allRegions } from '@/data/comprehensive-data';
import type { Product, RegionalVariant } from '@/data/comprehensive-data';

const MAX_PRODUCTS = 30;

// ═══════════════════════════════════════════════════════════════
// Saved Reports — persisted in localStorage
// ═══════════════════════════════════════════════════════════════
interface SavedReport {
  id: string;
  name: string;
  url: string;
  productIds: string;
  productNames: string[];
  productCount: number;
  savedAt: string;
}

const REPORTS_STORAGE_KEY = 'compare-saved-reports';

function loadSavedReports(): SavedReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persistReports(reports: SavedReport[]) {
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

// ═══════════════════════════════════════════════════════════════
// ISO 3166-1 alpha-2 country code mapping
// ═══════════════════════════════════════════════════════════════
const COUNTRY_ISO: Record<string, string> = {
  'United States': 'US', 'Canada': 'CA', 'Mexico': 'MX',
  'Germany': 'DE', 'France': 'FR', 'Italy': 'IT', 'Spain': 'ES',
  'Netherlands': 'NL', 'Belgium': 'BE', 'Austria': 'AT', 'Switzerland': 'CH',
  'United Kingdom': 'GB', 'Ireland': 'IE', 'Sweden': 'SE', 'Norway': 'NO',
  'Denmark': 'DK', 'Finland': 'FI', 'Poland': 'PL', 'Czech Republic': 'CZ',
  'Hungary': 'HU', 'Romania': 'RO', 'Bulgaria': 'BG', 'Greece': 'GR',
  'Portugal': 'PT', 'Luxembourg': 'LU', 'Croatia': 'HR', 'Slovakia': 'SK',
  'Slovenia': 'SI',
  'Australia': 'AU', 'New Zealand': 'NZ', 'Japan': 'JP', 'South Korea': 'KR',
  'India': 'IN', 'Thailand': 'TH', 'Philippines': 'PH', 'Vietnam': 'VN',
  'Taiwan': 'TW', 'Singapore': 'SG', 'Malaysia': 'MY', 'Indonesia': 'ID',
  'Brazil': 'BR', 'Chile': 'CL', 'Argentina': 'AR', 'Colombia': 'CO', 'Peru': 'PE',
  'South Africa': 'ZA', 'UAE': 'AE', 'Saudi Arabia': 'SA', 'Israel': 'IL',
  'Turkey': 'TR', 'Egypt': 'EG', 'Morocco': 'MA', 'Kenya': 'KE', 'Nigeria': 'NG',
};

function toISO(country: string): string {
  return COUNTRY_ISO[country] || country.substring(0, 2).toUpperCase();
}

// Region label from variant region code
const REGION_LABELS: Record<string, string> = {
  'NA': 'North America', 'EU': 'Europe', 'AU': 'Asia Pacific',
  'APAC': 'Asia Pacific', 'JP': 'Japan', 'IN': 'India',
  'UK': 'United Kingdom', 'BR': 'Latin America', 'LATAM': 'Latin America',
  'MEA': 'Middle East & Africa', 'GLOBAL': 'Global',
};

// Region badge color
const REGION_COLORS: Record<string, string> = {
  'NA': 'bg-blue-100 text-blue-700 ring-blue-200',
  'EU': 'bg-indigo-100 text-indigo-700 ring-indigo-200',
  'AU': 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  'APAC': 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  'JP': 'bg-rose-100 text-rose-700 ring-rose-200',
  'IN': 'bg-amber-100 text-amber-700 ring-amber-200',
  'BR': 'bg-green-100 text-green-700 ring-green-200',
  'UK': 'bg-purple-100 text-purple-700 ring-purple-200',
};

// 'higher' = green highlight for highest value, 'lower' = green for lowest, 'none' = just yellow for differences
type BetterDirection = 'higher' | 'lower' | 'none';

const specRows: { key: string; label: string; category: string; getValue: (p: Product) => string; getNumeric?: (p: Product) => number; better: BetterDirection }[] = [
  { key: 'manufacturer', label: 'Manufacturer', category: 'Basic', getValue: p => p.manufacturer.name, better: 'none' },
  { key: 'productType', label: 'Type of Product', category: 'Basic', getValue: p => p.productType, better: 'none' },
  { key: 'series', label: 'Series', category: 'Basic', getValue: p => p.series, better: 'none' },
  { key: 'model', label: 'Model / SKU', category: 'Basic', getValue: p => p.model, better: 'none' },
  { key: 'status', label: 'Status', category: 'Basic', getValue: p => p.status, better: 'none' },
  { key: 'acPower', label: 'Rated Output Power', category: 'Electrical', getValue: p => p.productType === 'Power Optimizer' ? 'N/A' : `${p.acPower}W`, getNumeric: p => p.acPower, better: 'higher' },
  { key: 'maxModuleSize', label: 'Maximum Array Power', category: 'Electrical', getValue: p => `${p.maxModuleSize}W`, getNumeric: p => p.maxModuleSize, better: 'higher' },
  { key: 'voltage', label: 'Nominal Grid Voltage', category: 'Electrical', getValue: p => {
    if (p.productType === 'Power Optimizer') return 'N/A';
    const v = p.voltage;
    const ranges: Record<number, string> = { 240: '211–264V AC', 230: '180–270V AC', 208: '183–229V AC', 277: '244–305V AC', 220: '176–264V AC' };
    return ranges[v] ? `${v}V (${ranges[v]})` : `${v}V`;
  }, getNumeric: p => p.voltage, better: 'none' },
  { key: 'mppt', label: 'No. of MPPTs', category: 'Electrical', getValue: p => p.productType === 'Power Optimizer' ? 'N/A' : `${p.mppt}`, getNumeric: p => p.mppt, better: 'higher' },
  { key: 'mpptVoltage', label: 'MPPT Voltage Range', category: 'Electrical', getValue: p => p.mpptVoltageRange, better: 'none' },

  { key: 'inputVoltage', label: 'Operating Voltage Range', category: 'Electrical', getValue: p => p.inputVoltageRange, better: 'none' },
  { key: 'startVoltage', label: 'Start-up Input Voltage', category: 'Electrical', getValue: p => p.startVoltage, getNumeric: p => parseFloat(p.startVoltage) || 0, better: 'lower' },
  { key: 'voc', label: 'Max Voc', category: 'Electrical', getValue: p => p.voc, getNumeric: p => parseFloat(p.voc) || 0, better: 'higher' },
  { key: 'isc', label: 'Max Isc', category: 'Electrical', getValue: p => p.isc, getNumeric: p => parseFloat(p.isc) || 0, better: 'higher' },
  { key: 'maxCurrent', label: 'Max Input Current', category: 'Electrical', getValue: p => p.maxInputCurrent, getNumeric: p => parseFloat(p.maxInputCurrent) || 0, better: 'higher' },
  { key: 'efficiency', label: 'Peak Efficiency', category: 'Electrical', getValue: p => `${p.efficiency}%`, getNumeric: p => p.efficiency, better: 'higher' },
  { key: 'maxEfficiency', label: 'Inverter Max Efficiency', category: 'Electrical', getValue: p => p.maxEfficiency, getNumeric: p => parseFloat(p.maxEfficiency) || 0, better: 'higher' },
  { key: 'cecEfficiency', label: 'CEC Weighted Efficiency', category: 'Electrical', getValue: p => p.cecEfficiency, getNumeric: p => parseFloat(p.cecEfficiency) || 0, better: 'higher' },
  { key: 'euroEfficiency', label: 'European Weighted Efficiency', category: 'Electrical', getValue: p => p.euroEfficiency, getNumeric: p => parseFloat(p.euroEfficiency) || 0, better: 'higher' },
  { key: 'thd', label: 'THD', category: 'Electrical', getValue: p => p.thd, getNumeric: p => parseFloat(p.thd.replace('<', '').replace('%', '')) || 0, better: 'lower' },
  { key: 'nightConsumption', label: 'Night Consumption', category: 'Electrical', getValue: p => p.nightConsumption, getNumeric: p => parseFloat(p.nightConsumption) || 0, better: 'lower' },
  { key: 'weight', label: 'Weight', category: 'Mechanical', getValue: p => p.weight ? `${p.weight} kg` : 'N/A', getNumeric: p => p.weight, better: 'lower' },
  { key: 'dimensions', label: 'Dimensions', category: 'Mechanical', getValue: p => `${p.dimensions} mm`, better: 'none' },
  { key: 'ipRating', label: 'IP Rating', category: 'Mechanical', getValue: p => p.ipRating, getNumeric: p => parseInt(p.ipRating.replace(/\D/g, '')) || 0, better: 'higher' },
  { key: 'tempRange', label: 'Operating Temp', category: 'Mechanical', getValue: p => p.operatingTempRange, better: 'none' },
  { key: 'communication', label: 'Communication', category: 'Connectivity', getValue: p => p.communicationType, better: 'none' },
  { key: 'monitoring', label: 'Monitoring Platform', category: 'Connectivity', getValue: p => p.monitoringPlatform, better: 'none' },
  { key: 'warranty', label: 'Warranty', category: 'Support', getValue: p => `${p.warranty} years`, getNumeric: p => p.warranty, better: 'higher' },
  { key: 'availability', label: 'Availability', category: 'Support', getValue: p => p.availability.replace('_', ' '), better: 'none' },
  { key: 'price', label: 'Price', category: 'Support', getValue: p => p.price ? `$${p.price}` : 'N/A', getNumeric: p => p.price || 0, better: 'lower' },
];

// Helper to determine cell highlighting — uses inline styles because Tailwind JIT
// cannot detect classes returned from functions (they get purged).
function getCellHighlight(spec: typeof specRows[0], products: Product[], index: number, highlightEnabled: boolean): { style: React.CSSProperties; indicator: string } {
  if (!highlightEnabled) return { style: { color: '#374151' }, indicator: '' };
  const values = products.map(p => spec.getValue(p));
  const hasDiff = new Set(values).size > 1;
  if (!hasDiff) return { style: { color: '#374151' }, indicator: '' };
  if (!spec.getNumeric || spec.better === 'none') return { style: { backgroundColor: '#FFFBEB', color: '#111827', fontWeight: 500, borderLeft: '3px solid #FBBF24' }, indicator: '' };
  const numericValues = products.map(p => spec.getNumeric!(p));
  const currentValue = numericValues[index];
  const maxValue = Math.max(...numericValues);
  const minValue = Math.min(...numericValues);
  const isBest = spec.better === 'higher' ? currentValue === maxValue : currentValue === minValue;
  const isWorst = spec.better === 'higher' ? currentValue === minValue : currentValue === maxValue;
  if (isBest && maxValue !== minValue) return { style: { backgroundColor: '#D1FAE5', color: '#065F46', fontWeight: 600, borderLeft: '3px solid #10B981' }, indicator: '' };
  if (isWorst && maxValue !== minValue) return { style: { backgroundColor: '#FEE2E2', color: '#DC2626', fontWeight: 500, borderLeft: '3px solid #F87171' }, indicator: '' };
  return { style: { backgroundColor: '#FFFBEB', color: '#111827', fontWeight: 500, borderLeft: '3px solid #FBBF24' }, indicator: '' };
}

// Group countries by region for display
function groupCountriesByRegion(countries: string[]): Record<string, string[]> {
  const regionMap: Record<string, string[]> = {
    'North America': ['United States', 'Canada', 'Mexico'],
    'Europe': ['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Austria', 'Switzerland', 'United Kingdom', 'Ireland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Greece', 'Portugal', 'Luxembourg', 'Croatia', 'Slovakia', 'Slovenia'],
    'Asia Pacific': ['Australia', 'New Zealand', 'Japan', 'South Korea', 'India', 'Thailand', 'Philippines', 'Vietnam', 'Taiwan', 'Singapore', 'Malaysia', 'Indonesia'],
    'Latin America': ['Brazil', 'Chile', 'Argentina', 'Colombia', 'Peru'],
    'Middle East & Africa': ['South Africa', 'UAE', 'Saudi Arabia', 'Israel', 'Turkey', 'Egypt', 'Morocco', 'Kenya', 'Nigeria'],
  };
  const grouped: Record<string, string[]> = {};
  for (const [region, regionCountries] of Object.entries(regionMap)) {
    const matched = countries.filter(c => regionCountries.includes(c));
    if (matched.length > 0) grouped[region] = matched;
  }
  return grouped;
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>}>
      <ComparePageContent />
    </Suspense>
  );
}

function ComparePageContent() {
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Product[]>([]);

  useEffect(() => {
    const ids = searchParams.get('ids');
    if (!ids) return;
    const idList = ids.split(',').filter(Boolean);
    // Support region-suffixed IDs like "29-na", "82-eu-nl", "10-eu" — extract base numeric ID
    const seen = new Set<string>();
    const preSelected = idList
      .map(raw => {
        const baseId = raw.replace(/-.*$/, ''); // "29-na" → "29", "82-eu-nl" → "82"
        return products.find(p => p.id === baseId) || products.find(p => p.id === raw);
      })
      .filter((p): p is Product => {
        if (!p) return false;
        // Allow same product to appear only once even if listed with different region suffixes
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    if (preSelected.length > 0) setSelected(preSelected);
  }, [searchParams]);

  const [searchTerm, setSearchTerm] = useState('');
  const [highlightDiff, setHighlightDiff] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  const geoRef = useRef<HTMLDivElement>(null);

  // Saved reports state
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [reportName, setReportName] = useState('');
  const saveDialogRef = useRef<HTMLDivElement>(null);
  const savedPanelRef = useRef<HTMLDivElement>(null);

  // Load saved reports on mount
  useEffect(() => { setSavedReports(loadSavedReports()); }, []);

  // Close dialogs on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (showSaveDialog && saveDialogRef.current && !saveDialogRef.current.contains(e.target as Node)) setShowSaveDialog(false);
      if (showSavedPanel && savedPanelRef.current && !savedPanelRef.current.contains(e.target as Node)) setShowSavedPanel(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSaveDialog, showSavedPanel]);

  const saveReport = () => {
    if (!reportName.trim() || selected.length === 0) return;
    const idsParam = selected.map(p => p.id).join(',');
    const report: SavedReport = {
      id: `rpt-${Date.now()}`,
      name: reportName.trim(),
      url: `${window.location.origin}/compare?ids=${idsParam}`,
      productIds: idsParam,
      productNames: selected.map(p => p.name),
      productCount: selected.length,
      savedAt: new Date().toISOString(),
    };
    const updated = [report, ...savedReports];
    setSavedReports(updated);
    persistReports(updated);
    setReportName('');
    setShowSaveDialog(false);
  };

  const deleteReport = (id: string) => {
    const updated = savedReports.filter(r => r.id !== id);
    setSavedReports(updated);
    persistReports(updated);
  };

  const loadReport = (report: SavedReport) => {
    const idList = report.productIds.split(',').filter(Boolean);
    const loaded = idList.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p);
    if (loaded.length > 0) {
      setSelected(loaded);
      // Update URL without full page reload
      window.history.pushState({}, '', `/compare?ids=${report.productIds}`);
    }
    setShowSavedPanel(false);
  };

  const regionNames = useMemo(() => Object.keys(allRegions).sort(), []);
  const manufacturerNames = useMemo(() => [...new Set(products.map(p => p.manufacturer.name))].sort(), []);

  const availableCountries = useMemo(() => {
    if (!selectedRegion) return allCountries;
    return (allRegions[selectedRegion] || []).slice().sort();
  }, [selectedRegion]);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    if (region && selectedCountry && !(allRegions[region] || []).includes(selectedCountry)) setSelectedCountry('');
    if (!region) setSelectedCountry('');
  };

  const filteredProducts = useMemo(() =>
    products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.manufacturer.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesManufacturer = !selectedManufacturer || p.manufacturer.name === selectedManufacturer;
      if (selectedCountry) return matchesSearch && matchesManufacturer && p.countries.includes(selectedCountry);
      if (selectedRegion) return matchesSearch && matchesManufacturer && allRegions[selectedRegion]?.some(c => p.countries.includes(c));
      return matchesSearch && matchesManufacturer;
    }),
  [searchTerm, selectedCountry, selectedRegion, selectedManufacturer]);

  const add = (p: Product) => { if (selected.length < MAX_PRODUCTS && !selected.find(s => s.id === p.id)) setSelected([...selected, p]); };
  const remove = (id: string) => setSelected(selected.filter(p => p.id !== id));
  const isSelected = (id: string) => selected.some(s => s.id === id);

  // Drag-and-drop reordering
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const moveProduct = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const next = [...selected];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setSelected(next);
  };

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) ref.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  // Shared helper: build styled cell data for exports
  const buildExportRows = () => specRows.map(spec => {
    const values = selected.map(p => spec.getValue(p));
    const hasDiff = new Set(values).size > 1;
    const cells = selected.map((p, j) => {
      const val = values[j];
      let bg = ''; let fg = ''; let border = ''; let tag: 'best' | 'worst' | 'diff' | '' = '';
      if (hasDiff) {
        if (!spec.getNumeric || spec.better === 'none') {
          bg = '#FFFBEB'; fg = '#111827'; border = '#FBBF24'; tag = 'diff';
        } else {
          const nums = selected.map(q => spec.getNumeric!(q));
          const cur = nums[j], mx = Math.max(...nums), mn = Math.min(...nums);
          const best = spec.better === 'higher' ? cur === mx : cur === mn;
          const worst = spec.better === 'higher' ? cur === mn : cur === mx;
          if (best && mx !== mn) { bg = '#D1FAE5'; fg = '#065F46'; border = '#10B981'; tag = 'best'; }
          else if (worst && mx !== mn) { bg = '#FEE2E2'; fg = '#DC2626'; border = '#F87171'; tag = 'worst'; }
          else { bg = '#FFFBEB'; fg = '#111827'; border = '#FBBF24'; tag = 'diff'; }
        }
      }
      return { val, bg, fg, border, tag };
    });
    return { label: spec.label, category: spec.category, cells };
  });

  const exportFileName = (ext: string) => {
    const date = new Date().toISOString().slice(0, 10);
    const region = selectedCountry || selectedRegion || 'All-Regions';
    const safe = region.replace(/[^a-zA-Z0-9-]/g, '_');
    return `comparison_${safe}_${date}.${ext}`;
  };

  // Excel-compatible styles — soft pastel tones matching standard Excel conditional formatting
  const XC = 'font-size:11px;font-family:Arial,Helvetica,sans-serif;padding:4px 6px;border:1px solid #D0D0D0;';
  const XH = `${XC}background-color:#F2F2F2;font-weight:bold;color:#000000;text-align:center;`;
  const XCAT = `${XC}background-color:#FCE4B5;font-weight:bold;color:#000000;`;
  const XBEST = `${XC}background-color:#C6EFCE;color:#006100;text-align:center;`;
  const XWORST = `${XC}background-color:#FFC7CE;color:#9C0006;text-align:center;`;
  const XDIFF = `${XC}background-color:#FFFFFF;color:#000000;text-align:center;`;
  const XLABEL = `${XC}background-color:#FAFAFA;font-weight:bold;color:#000000;`;

  const buildSourceRows = () => {
    const rows: { label: string; values: string[] }[] = [
      { label: 'Product Page URL', values: selected.map(p => p.productUrl || '—') },
      { label: 'Datasheet PDF URL', values: selected.map(p => p.datasheetUrl || '—') },
      { label: 'Manufacturer Website', values: selected.map(p => p.manufacturer.website) },
      { label: 'Source URL', values: selected.map(p => p.sourceUrl || '—') },
    ];
    const maxDatasheets = Math.max(...selected.map(p => p.datasheets?.length || 0), 0);
    for (let i = 0; i < maxDatasheets; i++) {
      rows.push({
        label: `Datasheet ${i + 1}`,
        values: selected.map(p => {
          const ds = p.datasheets?.[i];
          return ds ? `${ds.name} (${ds.language}) — ${ds.url}` : '—';
        }),
      });
    }
    return rows;
  };

  const exportCSV = () => {
    const h = ['Spec', ...selected.map(p => p.name)];
    const exportRows = buildExportRows();
    const rows = exportRows.map(r => [r.label, ...r.cells.map(c => c.val)]);
    rows.push(['Countries (ISO)', ...selected.map(p => p.countries.map(c => toISO(c)).join(', '))]);
    const sourceRows = buildSourceRows();
    sourceRows.forEach(sr => rows.push([sr.label, ...sr.values]));
    const csv = [h, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = exportFileName('csv'); a.click(); URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    const h = ['Spec', ...selected.map(p => p.name)];
    const exportRows = buildExportRows();
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8">
<style>
  td, th { mso-number-format:"\\@"; font-size:11px; font-family:Arial,sans-serif; }
</style>
</head><body><table>`;
    // Header row — gray background, bold
    html += '<tr>' + h.map((c, i) => `<th style="${XH}${i === 0 ? 'text-align:left;' : ''}">${c}</th>`).join('') + '</tr>';
    let prevCat = '';
    exportRows.forEach(r => {
      // Yellow category header row
      if (r.category !== prevCat) {
        html += `<tr><td colspan="${selected.length + 1}" style="${XCAT}">${r.category}</td></tr>`;
        prevCat = r.category;
      }
      html += '<tr>';
      // Spec label — light yellow background
      html += `<td style="${XLABEL}">${r.label}</td>`;
      r.cells.forEach(c => {
        if (c.tag === 'best') {
          html += `<td style="${XBEST}">${c.val}</td>`;
        } else if (c.tag === 'worst') {
          html += `<td style="${XWORST}">${c.val}</td>`;
        } else if (c.tag === 'diff') {
          html += `<td style="${XDIFF}">${c.val}</td>`;
        } else {
          html += `<td style="${XC}text-align:center;">${c.val}</td>`;
        }
      });
      html += '</tr>';
    });
    // Geography section
    html += `<tr><td colspan="${selected.length + 1}" style="${XCAT}">Geography</td></tr>`;
    html += `<tr><td style="${XLABEL}">Countries (ISO)</td>`;
    selected.forEach(p => { html += `<td style="${XC}text-align:center;">${p.countries.map(c => toISO(c)).join(', ')}</td>`; });
    html += '</tr>';
    // Source Links section
    html += `<tr><td colspan="${selected.length + 1}" style="${XCAT}">Source Links</td></tr>`;
    const excelSourceRows = buildSourceRows();
    excelSourceRows.forEach(sr => {
      html += `<tr><td style="${XLABEL}">${sr.label}</td>`;
      sr.values.forEach(v => {
        const isUrl = v.startsWith('http');
        html += `<td style="${XC}text-align:center;${isUrl ? 'color:#0563C1;text-decoration:underline;' : ''}">${isUrl ? `<a href="${v}">${v}</a>` : v}</td>`;
      });
      html += '</tr>';
    });
    // Legend row
    html += `<tr><td colspan="${selected.length + 1}" style="border:none;"></td></tr>`;
    html += `<tr><td style="${XBEST}">Best value</td><td style="${XWORST}">Worst value</td><td style="${XDIFF}">Values differ</td></tr>`;
    html += '</table></body></html>';
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = exportFileName('xls'); a.click(); URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const h = ['Spec', ...selected.map(p => p.name)];
    const exportRows = buildExportRows();
    let tableHtml = `<tr>${h.map((c, i) => `<th class="hdr"${i === 0 ? ' style="text-align:left;"' : ''}>${c}</th>`).join('')}</tr>`;
    let prevCat = '';
    exportRows.forEach(r => {
      if (r.category !== prevCat) {
        tableHtml += `<tr><td colspan="${selected.length + 1}" class="cat">${r.category}</td></tr>`;
        prevCat = r.category;
      }
      tableHtml += '<tr>';
      tableHtml += `<td class="label">${r.label}</td>`;
      r.cells.forEach(c => {
        const cls = c.tag === 'best' ? 'best' : c.tag === 'worst' ? 'worst' : c.tag === 'diff' ? 'diff' : '';
        tableHtml += `<td class="val ${cls}">${c.val}</td>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += `<tr><td colspan="${selected.length + 1}" class="cat">Geography</td></tr>`;
    tableHtml += `<tr><td class="label">Countries (ISO)</td>`;
    selected.forEach(p => { tableHtml += `<td class="val">${p.countries.map(c => toISO(c)).join(', ')}</td>`; });
    tableHtml += '</tr>';
    tableHtml += `<tr><td colspan="${selected.length + 1}" class="cat">Source Links</td></tr>`;
    const pdfSourceRows = buildSourceRows();
    pdfSourceRows.forEach(sr => {
      tableHtml += `<tr><td class="label">${sr.label}</td>`;
      sr.values.forEach(v => {
        const isUrl = v.startsWith('http');
        const displayVal = isUrl ? `<a href="${v}">${v}</a>` : v;
        tableHtml += `<td class="val src">${displayVal}</td>`;
      });
      tableHtml += '</tr>';
    });
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Product Comparison Report</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 24px; font-size: 11px; color: #000; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  table { border-collapse: collapse; width: 100%; }
  th, td { padding: 4px 6px; border: 1px solid #C0C0C0; font-size: 11px; }
  .hdr { background-color: #F2F2F2 !important; font-weight: bold; text-align: center; color: #000; }
  .cat { background-color: #FCE4B5 !important; font-weight: bold; color: #000; }
  .label { font-weight: bold; background-color: #FAFAFA !important; white-space: nowrap; }
  .val { text-align: center; }
  .best { background-color: #C6EFCE !important; color: #006100 !important; }
  .worst { background-color: #FFC7CE !important; color: #9C0006 !important; }
  .diff { background-color: #FFFFFF !important; color: #000000 !important; }
  .src { font-size: 10px; word-break: break-all; }
  .src a { color: #0563C1; text-decoration: underline; }
  .legend { margin-top: 10px; font-size: 11px; color: #333; }
  .legend span { margin-right: 18px; }
  .legend-box { display: inline-block; width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; border: 1px solid #999; }
  @media print {
    body { padding: 8px; }
    .best, .worst, .diff, .cat, .hdr, .label { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  }
</style>
</head><body>
<table>${tableHtml}</table>
<div class="legend">
  <span><span class="legend-box" style="background-color:#C6EFCE;"></span>Best</span>
  <span><span class="legend-box" style="background-color:#FFC7CE;"></span>Worst</span>
  <span><span class="legend-box" style="background-color:#FFFFFF;border:1px solid #D0D0D0;"></span>Different</span>
</div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = exportFileName('html'); a.click(); URL.revokeObjectURL(url);
  };

  const shareLink = () => {
    const url = `${window.location.origin}/compare?ids=${selected.map(p => p.id).join(',')}`;
    navigator.clipboard.writeText(url).then(() => alert('Comparison link copied to clipboard!'));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200 px-8 py-8 border-t-4 border-t-enphase-500">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-semibold text-enphase-500 tracking-wider mb-3">SIDE-BY-SIDE ANALYSIS</p>
          <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight">Product Comparison</h1>
          <p className="text-[13px] text-gray-500 mt-1">Compare up to {MAX_PRODUCTS} products — specifications, regional SKUs, and geographical availability</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Saved Reports button — always visible */}
          <div className="relative" ref={savedPanelRef}>
            <Button variant="outline" size="sm" onClick={() => { setShowSavedPanel(!showSavedPanel); setShowSaveDialog(false); }} className={savedReports.length > 0 ? '' : 'text-gray-400'}>
              <FolderOpen className="w-4 h-4 mr-1" />Saved{savedReports.length > 0 && <span className="ml-1 text-[10px] bg-enphase-100 text-enphase-600 rounded-full px-1.5 py-0 font-semibold">{savedReports.length}</span>}
            </Button>

            {/* Saved Reports dropdown panel */}
            {showSavedPanel && (
              <div className="absolute right-0 top-full mt-2 w-[420px] bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-enphase-500" />
                    <span className="text-sm font-semibold text-gray-900">Saved Reports</span>
                  </div>
                  <button onClick={() => setShowSavedPanel(false)} className="p-1 hover:bg-gray-200 rounded"><X className="w-3.5 h-3.5 text-gray-500" /></button>
                </div>
                {savedReports.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bookmark className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No saved reports yet</p>
                    <p className="text-xs text-gray-400 mt-1">Select products and click &quot;Save&quot; to bookmark a comparison</p>
                  </div>
                ) : (
                  <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100">
                    {savedReports.map(report => (
                      <div key={report.id} className="px-4 py-3 hover:bg-gray-50 transition-colors group">
                        <div className="flex items-start justify-between gap-2">
                          <button onClick={() => loadReport(report)} className="text-left flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{report.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                <Package className="w-3 h-3" />{report.productCount} product{report.productCount !== 1 ? 's' : ''}
                              </span>
                              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />{new Date(report.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {report.productNames.slice(0, 4).map((n, i) => (
                                <span key={i} className="inline-block text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded truncate max-w-[120px]">{n}</span>
                              ))}
                              {report.productNames.length > 4 && (
                                <span className="inline-block text-[10px] px-1.5 py-0.5 bg-enphase-50 text-enphase-600 rounded font-medium">+{report.productNames.length - 4} more</span>
                              )}
                            </div>
                          </button>
                          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { navigator.clipboard.writeText(report.url); }} className="p-1.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600" title="Copy link">
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteReport(report.id)} className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {selected.length > 0 && (
            <>
              {/* Save Report button with inline dialog */}
              <div className="relative" ref={saveDialogRef}>
                <Button variant="outline" size="sm" onClick={() => { setShowSaveDialog(!showSaveDialog); setShowSavedPanel(false); setReportName(''); }}>
                  <BookmarkPlus className="w-4 h-4 mr-1" />Save
                </Button>

                {showSaveDialog && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BookmarkPlus className="w-4 h-4 text-enphase-500" />
                      <span className="text-sm font-semibold text-gray-900">Save Comparison</span>
                    </div>
                    <input
                      autoFocus
                      value={reportName}
                      onChange={e => setReportName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveReport(); if (e.key === 'Escape') setShowSaveDialog(false); }}
                      placeholder="e.g. Q3 Residential MI Lineup"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-enphase-300 focus:ring-2 focus:ring-enphase-100"
                    />
                    <div className="text-[11px] text-gray-400 mt-1.5 mb-3">{selected.length} product{selected.length !== 1 ? 's' : ''} will be saved</div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
                      <Button size="sm" onClick={saveReport} disabled={!reportName.trim()} className="bg-enphase-500 hover:bg-enphase-600 text-white disabled:opacity-50">
                        <BookmarkPlus className="w-3.5 h-3.5 mr-1" />Save Report
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />CSV</Button>
              <Button variant="outline" size="sm" onClick={exportExcel}><Download className="w-4 h-4 mr-1" />Excel</Button>
              <Button variant="outline" size="sm" onClick={exportPDF}><Download className="w-4 h-4 mr-1" />PDF</Button>
              <Button variant="outline" size="sm" onClick={shareLink}><Share2 className="w-4 h-4 mr-1" />Share</Button>
              <Button variant="outline" size="sm" onClick={() => setSelected([])}><X className="w-4 h-4 mr-1" />Clear All</Button>
            </>
          )}
        </div>
      </div>
      </div>

      <div className="px-8 py-8 space-y-5">

      {/* Selected Products Summary */}
      {selected.length > 0 && (
        <div className="p-4 bg-white rounded-xl border border-gray-300 border-l-4 border-l-enphase-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Selected Products ({selected.length}/{MAX_PRODUCTS})</h3>
            {selected.length > 6 && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => scrollContainer(tableRef, 'left')} className="h-7 w-7 p-0"><ChevronLeft className="w-4 h-4" /></Button>
                <span className="text-xs text-gray-500">Scroll table</span>
                <Button variant="ghost" size="sm" onClick={() => scrollContainer(tableRef, 'right')} className="h-7 w-7 p-0"><ChevronRight className="w-4 h-4" /></Button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.map((p, idx) => (
              <Badge
                key={p.id}
                variant="secondary"
                draggable
                onDragStart={(e) => { setDragIdx(idx); e.dataTransfer.effectAllowed = 'move'; }}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverIdx(idx); }}
                onDragLeave={() => setDragOverIdx(null)}
                onDrop={(e) => { e.preventDefault(); if (dragIdx !== null) moveProduct(dragIdx, idx); setDragIdx(null); setDragOverIdx(null); }}
                onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                className={`pl-1 pr-1 py-1 flex items-center gap-1 cursor-grab active:cursor-grabbing select-none transition-all ${
                  dragIdx === idx ? 'opacity-40 scale-95' : dragOverIdx === idx ? 'ring-2 ring-enphase-400 bg-enphase-50' : 'bg-white'
                } border border-gray-200`}
              >
                <GripVertical className="w-3 h-3 text-gray-300 flex-shrink-0" />
                <span className="w-4 h-4 rounded-full bg-enphase-500 text-white text-[10px] flex items-center justify-center font-medium">{idx + 1}</span>
                <span className="text-xs font-medium max-w-[140px] truncate">{p.name}</span>
                <button onClick={() => remove(p.id)} className="ml-0.5 p-0.5 hover:bg-gray-100 rounded"><X className="w-3 h-3 text-gray-400 hover:text-red-500" /></button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Product Selector */}
      <div className="p-5 bg-white rounded-xl border border-gray-300 border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Add Products<span className="ml-2 text-xs font-normal text-gray-500">· {filteredProducts.length} available</span></h2>
          <div className="flex items-center gap-4">
            {highlightDiff && (
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 ring-1 ring-green-200"></span>Best</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-50 ring-1 ring-yellow-200"></span>Different</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-50 ring-1 ring-red-200"></span>Lowest</span>
              </div>
            )}
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={highlightDiff} onChange={e => setHighlightDiff(e.target.checked)} className="rounded border-gray-300 text-enphase-500 focus:ring-enphase-500" />
              Highlight differences
            </label>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px] bg-white">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search products..." className="w-full text-sm outline-none bg-transparent" />
          </div>
          <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 min-w-[160px] bg-white ${selectedManufacturer ? 'border-enphase-300 bg-enphase-50' : 'border-gray-200'}`}>
            <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select value={selectedManufacturer} onChange={e => setSelectedManufacturer(e.target.value)} className="w-full text-sm appearance-none bg-transparent cursor-pointer outline-none">
              <option value="">All Manufacturers</option>
              {manufacturerNames.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 min-w-[140px] bg-white ${selectedRegion ? 'border-enphase-300 bg-enphase-50' : 'border-gray-200'}`}>
            <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select value={selectedRegion} onChange={e => handleRegionChange(e.target.value)} className="w-full text-sm appearance-none bg-transparent cursor-pointer outline-none">
              <option value="">All Regions</option>
              {regionNames.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 min-w-[140px] bg-white ${selectedCountry ? 'border-enphase-300 bg-enphase-50' : 'border-gray-200'}`}>
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="w-full text-sm appearance-none bg-transparent cursor-pointer outline-none">
              <option value="">{selectedRegion ? `All in ${selectedRegion}` : 'All Countries'}</option>
              {availableCountries.map(c => <option key={c} value={c}>{c} ({toISO(c)})</option>)}
            </select>
          </div>
          {(selectedCountry || selectedRegion || selectedManufacturer) && (
            <button onClick={() => { setSelectedCountry(''); setSelectedRegion(''); setSelectedManufacturer(''); }} className="text-xs text-enphase-500 hover:text-enphase-600 font-medium whitespace-nowrap">
              Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[52px] overflow-y-auto">
          {filteredProducts.map(p => {
            const sel = isSelected(p.id);
            const variantCount = p.regionalVariants?.length || 0;
            return (
              <div
                key={p.id}
                onClick={() => sel ? remove(p.id) : add(p)}
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  sel
                    ? 'border-enphase-300 bg-enphase-50 ring-1 ring-enphase-200'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                } ${selected.length >= MAX_PRODUCTS && !sel ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${sel ? 'bg-enphase-500' : 'border border-gray-300'}`}>
                  {sel && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.manufacturer.name} · {p.acPower}W
                    {variantCount > 0 && <span className="ml-1 text-enphase-500">· {variantCount} SKU{variantCount > 1 ? 's' : ''}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500">No products match your filters</div>
        )}
      </div>

      {/* ═══ Product Details (Specifications Table) — shown below product grid ═══ */}
      {selected.length > 0 && (
        <div className="bg-white rounded-xl overflow-hidden border border-gray-300">
          <div className="flex items-center justify-between px-5 py-3.5 bg-gray-100 border-b border-gray-300">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-enphase-500" />
              <h2 className="text-sm font-semibold text-gray-900">Product Details</h2>
              <span className="text-xs text-gray-500">· {selected.length} product{selected.length > 1 ? 's' : ''}</span>
            </div>
            {selected.length > 4 && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => scrollContainer(tableRef, 'left')} className="h-7 w-7 p-0"><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => scrollContainer(tableRef, 'right')} className="h-7 w-7 p-0"><ChevronRight className="w-4 h-4" /></Button>
              </div>
            )}
          </div>
          <div ref={tableRef} className="overflow-x-auto">
            <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-700 text-[13px] min-w-[200px] sticky left-0 bg-gray-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border border-gray-300">Specification</th>
                  {selected.map((p, idx) => {
                    const isEnphaseCol = p.manufacturer.name === 'Enphase Energy';
                    return (
                      <th key={p.id} className={`text-center px-4 py-3.5 min-w-[170px] max-w-[190px] border border-gray-300 ${isEnphaseCol ? 'bg-enphase-50' : ''}`}>
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <span className={`w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-medium flex-shrink-0 ${isEnphaseCol ? 'bg-enphase-500' : 'bg-gray-500'}`}>{idx + 1}</span>
                          <span className="font-medium text-[13px] truncate max-w-[130px]">{p.name}</span>
                        </div>
                        <div className="text-[12px] font-normal truncate">
                          {isEnphaseCol ? <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold bg-enphase-500 text-white rounded uppercase tracking-wide">Enphase</span> : <span className="text-muted-foreground">{p.manufacturer.name}</span>}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); remove(p.id); }} className="mt-1 text-gray-400 hover:text-red-500 p-0.5"><X className="w-3 h-3 inline" /></button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {specRows.map((spec, i) => {
                  const prevCat = i > 0 ? specRows[i - 1].category : '';
                  const showCat = spec.category !== prevCat;
                  const values = selected.map(p => spec.getValue(p));
                  return (
                    <React.Fragment key={spec.key}>
                      {showCat && (
                        <tr><td colSpan={selected.length + 1} className="px-5 py-2.5 bg-gray-100 font-semibold text-[12px] text-gray-500 uppercase tracking-wider sticky left-0 border border-gray-300">{spec.category}</td></tr>
                      )}
                      <tr className="hover:bg-blue-50/40">
                        <td className="px-5 py-3 font-medium text-gray-700 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border border-gray-300">{spec.label}</td>
                        {selected.map((p, j) => {
                          const hl = getCellHighlight(spec, selected, j, highlightDiff);
                          return <td key={p.id} className="px-4 py-3 text-center text-[13px] border border-gray-300" style={hl.style}>{hl.indicator}{values[j]}</td>;
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })}
                {/* Product Link row */}
                <tr><td colSpan={selected.length + 1} className="px-5 py-2.5 bg-gray-100 font-semibold text-[12px] text-gray-500 uppercase tracking-wider sticky left-0 border border-gray-300">Links</td></tr>
                <tr>
                  <td className="px-5 py-3 font-medium text-gray-700 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border border-gray-300">Product Page</td>
                  {selected.map(p => (
                    <td key={p.id} className="px-4 py-3 text-center border border-gray-300">
                      {p.productUrl ? <a href={p.productUrl} target="_blank" rel="noopener noreferrer" className="text-enphase-500 hover:text-enphase-600 text-[13px] inline-flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" />View</a> : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-5 py-3 font-medium text-gray-700 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border border-gray-300">Datasheet</td>
                  {selected.map(p => (
                    <td key={p.id} className="px-4 py-3 text-center border border-gray-300">
                      {p.datasheetUrl ? <a href={p.datasheetUrl} target="_blank" rel="noopener noreferrer" className="text-enphase-500 hover:text-enphase-600 text-[13px] inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" />PDF</a> : '—'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected.length > 0 ? (
        <>
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* GEOGRAPHICAL AVAILABILITY                                  */}
          {/* Shows country ISO codes grouped by region, plus regional   */}
          {/* SKU variants with voltage/freq/certs per region           */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl overflow-hidden border border-gray-300">
            <div className="flex items-center justify-between px-5 py-3.5 bg-gray-100 border-b border-gray-300">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-enphase-500" />
                <h2 className="text-sm font-semibold text-gray-900">Geographical Availability</h2>
              </div>
              {selected.length > 4 && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => scrollContainer(geoRef, 'left')} className="h-7 w-7 p-0"><ChevronLeft className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => scrollContainer(geoRef, 'right')} className="h-7 w-7 p-0"><ChevronRight className="w-4 h-4" /></Button>
                </div>
              )}
            </div>
            <div ref={geoRef} className="overflow-x-auto">
              <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-700 text-[13px] min-w-[200px] sticky left-0 bg-gray-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border border-gray-300">Region / Detail</th>
                    {selected.map((p, idx) => {
                      const isEnphaseCol = p.manufacturer.name === 'Enphase Energy';
                      return (
                        <th key={p.id} className={`text-center px-4 py-3.5 min-w-[170px] max-w-[190px] border border-gray-300 ${isEnphaseCol ? 'bg-enphase-50' : ''}`}>
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={`w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-medium flex-shrink-0 ${isEnphaseCol ? 'bg-enphase-500' : 'bg-gray-500'}`}>{idx + 1}</span>
                            <span className="font-medium text-[13px] truncate max-w-[130px]">{p.name}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {/* Total Countries */}
                  <tr className="bg-enphase-50/30">
                    <td className="px-5 py-3 font-semibold text-gray-700 sticky left-0 bg-enphase-50/30 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border border-gray-300">Total Markets</td>
                    {selected.map(p => (
                      <td key={p.id} className="px-4 py-3 text-center border border-gray-300">
                        <span className="text-sm font-semibold text-enphase-600">{p.countries.length}</span>
                        <span className="text-[12px] text-gray-500 ml-1">countries</span>
                      </td>
                    ))}
                  </tr>

                  {/* Countries by Region — ISO codes */}
                  {['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'].map(region => {
                    const hasAny = selected.some(p => {
                      const grouped = groupCountriesByRegion(p.countries);
                      return (grouped[region] || []).length > 0;
                    });
                    if (!hasAny) return null;
                    return (
                      <tr key={region} className="hover:bg-blue-50/40">
                        <td className="px-5 py-3 font-medium text-gray-700 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border border-gray-300">
                          <span className="text-[13px]">{region}</span>
                        </td>
                        {selected.map(p => {
                          const grouped = groupCountriesByRegion(p.countries);
                          const regionCountries = grouped[region] || [];
                          return (
                            <td key={p.id} className="px-4 py-3 text-center border border-gray-300">
                              {regionCountries.length > 0 ? (
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {regionCountries.map(c => (
                                    <span key={c} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700" title={c}>
                                      {toISO(c)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[12px] text-gray-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Regional SKU Variants section */}
                  {selected.some(p => p.regionalVariants && p.regionalVariants.length > 0) && (
                    <>
                      <tr><td colSpan={selected.length + 1} className="px-5 py-2.5 bg-gray-100 font-semibold text-[12px] text-gray-500 uppercase tracking-wider sticky left-0 border border-gray-300">Regional SKU Variants</td></tr>

                      {/* Collect all unique region codes across selected products */}
                      {(() => {
                        const allRegionCodes = new Set<string>();
                        selected.forEach(p => p.regionalVariants?.forEach(v => allRegionCodes.add(v.region)));
                        const sortedRegions = ['NA', 'EU', 'AU', 'IN', 'JP', 'BR', 'UK', 'APAC', 'LATAM', 'MEA', 'GLOBAL'].filter(r => allRegionCodes.has(r));

                        return sortedRegions.map(regionCode => (
                          <React.Fragment key={`rv-${regionCode}`}>
                            {/* Region header */}
                            <tr className="bg-gray-50/50">
                              <td className="px-5 py-2.5 sticky left-0 bg-gray-50/50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border border-gray-300">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ring-1 ring-inset ${REGION_COLORS[regionCode] || 'bg-gray-100 text-gray-700 ring-gray-200'}`}>
                                  {regionCode}
                                </span>
                                <span className="ml-2 text-[13px] text-gray-500">{REGION_LABELS[regionCode] || regionCode}</span>
                              </td>
                              {selected.map(p => {
                                const variant = p.regionalVariants?.find(v => v.region === regionCode);
                                return (
                                  <td key={p.id} className="px-4 py-2.5 text-center border border-gray-300">
                                    {variant ? (
                                      <span className="text-[13px] font-mono font-medium text-gray-800">{variant.sku}</span>
                                    ) : (
                                      <span className="text-[12px] text-gray-300">Not available</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                            {/* Voltage / Frequency */}
                            <tr>
                              <td className="px-5 py-2.5 text-[13px] text-gray-500 pl-10 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border border-gray-300">Voltage / Freq</td>
                              {selected.map(p => {
                                const variant = p.regionalVariants?.find(v => v.region === regionCode);
                                return (
                                  <td key={p.id} className="px-4 py-2.5 text-center text-[13px] text-gray-600 border border-gray-300">
                                    {variant ? `${variant.voltage}V / ${variant.frequency}Hz` : '—'}
                                  </td>
                                );
                              })}
                            </tr>
                            {/* Certifications */}
                            <tr>
                              <td className="px-5 py-2.5 text-[13px] text-gray-500 pl-10 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border border-gray-300">Certifications</td>
                              {selected.map(p => {
                                const variant = p.regionalVariants?.find(v => v.region === regionCode);
                                return (
                                  <td key={p.id} className="px-4 py-2.5 text-center border border-gray-300">
                                    {variant ? (
                                      <div className="flex flex-wrap gap-1 justify-center">
                                        {variant.certifications.map((cert, ci) => (
                                          <span key={ci} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">{cert}</span>
                                        ))}
                                      </div>
                                    ) : <span className="text-[12px] text-gray-300">—</span>}
                                  </td>
                                );
                              })}
                            </tr>
                            {/* Countries for this variant */}
                            <tr>
                              <td className="px-5 py-2.5 text-[13px] text-gray-500 pl-10 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border border-gray-300">Markets</td>
                              {selected.map(p => {
                                const variant = p.regionalVariants?.find(v => v.region === regionCode);
                                return (
                                  <td key={p.id} className="px-4 py-2.5 text-center border border-gray-300">
                                    {variant ? (
                                      <div className="flex flex-wrap gap-1 justify-center">
                                        {variant.countries.map(c => (
                                          <span key={c} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600" title={c}>{toISO(c)}</span>
                                        ))}
                                      </div>
                                    ) : <span className="text-[12px] text-gray-300">—</span>}
                                  </td>
                                );
                              })}
                            </tr>
                            {/* Datasheet link */}
                            <tr>
                              <td className="px-5 py-2.5 text-[13px] text-gray-500 pl-10 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border border-gray-300">Datasheet</td>
                              {selected.map(p => {
                                const variant = p.regionalVariants?.find(v => v.region === regionCode);
                                return (
                                  <td key={p.id} className="px-4 py-2.5 text-center border border-gray-300">
                                    {variant?.datasheetUrl ? (
                                      <a href={variant.datasheetUrl} target="_blank" rel="noopener noreferrer" className="text-enphase-500 hover:text-enphase-600 text-[12px] inline-flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5" />{regionCode} PDF
                                      </a>
                                    ) : <span className="text-[12px] text-gray-300">—</span>}
                                  </td>
                                );
                              })}
                            </tr>
                          </React.Fragment>
                        ));
                      })()}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Summary: Competitive Threat & Market Perception */}
          {selected.length >= 2 && (() => {
            const enphaseProducts = selected.filter(p => p.manufacturer.name.toLowerCase().includes('enphase'));
            const competitorProducts = selected.filter(p => !p.manufacturer.name.toLowerCase().includes('enphase'));
            if (enphaseProducts.length === 0 || competitorProducts.length === 0) return null;

            // Collect all product types present in the comparison
            const allTypes = Array.from(new Set(selected.map(p => p.productType)));
            // Only compare within product types where Enphase has entries
            const enphaseTypes = Array.from(new Set(enphaseProducts.map(p => p.productType)));

            const paragraphs: string[] = [];

            // Opening: describe what Enphase has in this comparison
            const enphaseTypeList = enphaseTypes.map(t => {
              const count = enphaseProducts.filter(p => p.productType === t).length;
              return `${count} ${t}${count > 1 ? 's' : ''}`;
            }).join(', ');
            const enphasePerMpptAvg = enphaseProducts.reduce((s, p) => s + (p.mppt > 0 ? p.acPower / p.mppt : p.acPower), 0) / enphaseProducts.length;
            const enphaseAvgEff = enphaseProducts.reduce((s, p) => s + p.efficiency, 0) / enphaseProducts.length;
            const enphaseAvgWarranty = enphaseProducts.reduce((s, p) => s + p.warranty, 0) / enphaseProducts.length;
            paragraphs.push(
              `In this comparison, Enphase is represented by ${enphaseTypeList} with an average per-MPPT power of ${Math.round(enphasePerMpptAvg)}W, ${enphaseAvgEff.toFixed(1)}% average efficiency, and ${enphaseAvgWarranty.toFixed(0)}-year warranty.`
            );

            // Note product types present only on the competitor side (no direct comparison possible)
            const competitorOnlyTypes = allTypes.filter(t => !enphaseTypes.includes(t));
            if (competitorOnlyTypes.length > 0) {
              const labels = competitorOnlyTypes.map(t => {
                const who = Array.from(new Set(competitorProducts.filter(p => p.productType === t).map(p => p.manufacturer.name)));
                return `${t} (${who.join(', ')})`;
              });
              paragraphs.push(
                `The comparison also includes ${labels.join(' and ')}, which ${competitorOnlyTypes.length === 1 ? 'is a different product category' : 'are different product categories'} and cannot be directly compared against Enphase's lineup.`
              );
            }

            // Group competitors by manufacturer
            const byMfr: Record<string, Product[]> = {};
            for (const p of competitorProducts) {
              const name = p.manufacturer.name;
              if (!byMfr[name]) byMfr[name] = [];
              byMfr[name].push(p);
            }

            // Per-manufacturer analysis, scoped to shared product types
            for (const [mfrName, mfrProducts] of Object.entries(byMfr)) {
              const country = mfrProducts[0].manufacturer.country;
              const mfrTypes = Array.from(new Set(mfrProducts.map(p => p.productType)));
              const sharedTypes = mfrTypes.filter(t => enphaseTypes.includes(t));

              // If this competitor has no overlapping product types with Enphase
              if (sharedTypes.length === 0) {
                const typeLabel = mfrTypes.join(', ');
                paragraphs.push(
                  `${mfrName} (${country}) offers ${typeLabel} products in this comparison, which fall outside Enphase's product categories here. A direct competitive comparison is not applicable.`
                );
                continue;
              }

              // Compare within each shared product type
              for (const pType of sharedTypes) {
                const eProd = enphaseProducts.filter(p => p.productType === pType);
                const cProd = mfrProducts.filter(p => p.productType === pType);
                if (eProd.length === 0 || cProd.length === 0) continue;

                // Per-MPPT power = total AC output / number of MPPTs
                const perMppt = (p: Product) => p.mppt > 0 ? p.acPower / p.mppt : p.acPower;

                const eAvgEff = eProd.reduce((s, p) => s + p.efficiency, 0) / eProd.length;
                const eAvgPerMppt = eProd.reduce((s, p) => s + perMppt(p), 0) / eProd.length;
                const eAvgWarranty = eProd.reduce((s, p) => s + p.warranty, 0) / eProd.length;
                const eMaxPerMppt = Math.max(...eProd.map(p => perMppt(p)));

                const cAvgEff = cProd.reduce((s, p) => s + p.efficiency, 0) / cProd.length;
                const cAvgPerMppt = cProd.reduce((s, p) => s + perMppt(p), 0) / cProd.length;
                const cAvgWarranty = cProd.reduce((s, p) => s + p.warranty, 0) / cProd.length;
                const cMaxPerMppt = Math.max(...cProd.map(p => perMppt(p)));

                const advantages: string[] = [];
                const disadvantages: string[] = [];

                if (cAvgEff > eAvgEff) advantages.push(`a higher average efficiency (${cAvgEff.toFixed(1)}% vs Enphase's ${eAvgEff.toFixed(1)}%)`);
                else if (cAvgEff < eAvgEff) disadvantages.push(`lower efficiency (${cAvgEff.toFixed(1)}% vs ${eAvgEff.toFixed(1)}%)`);

                if (cAvgPerMppt > eAvgPerMppt) advantages.push(`stronger per-MPPT power output (${Math.round(cAvgPerMppt)}W vs ${Math.round(eAvgPerMppt)}W per MPPT)`);

                if (cAvgWarranty > eAvgWarranty) advantages.push(`a longer warranty (${cAvgWarranty.toFixed(0)} vs ${eAvgWarranty.toFixed(0)} years)`);
                else if (cAvgWarranty < eAvgWarranty) disadvantages.push(`a shorter warranty (${cAvgWarranty.toFixed(0)} vs ${eAvgWarranty.toFixed(0)} years)`);

                if (cMaxPerMppt > eMaxPerMppt) advantages.push(`higher per-MPPT power reaching ${Math.round(cMaxPerMppt)}W per MPPT`);

                const typeLabel = sharedTypes.length > 1 ? ` in the ${pType} segment` : '';
                let sentence = '';
                const threatLevel = advantages.length >= 3 ? 'direct' : advantages.length >= 2 ? 'notable' : advantages.length >= 1 ? 'emerging' : 'limited';

                if (threatLevel === 'direct') {
                  sentence = `${mfrName} (${country}) is a direct threat to Enphase${typeLabel}. They offer ${advantages.join(', ')}.`;
                  if (disadvantages.length > 0) sentence += ` However, they have ${disadvantages.join(' and ')}.`;
                  sentence += ` With ${cProd.length} comparable product${cProd.length > 1 ? 's' : ''}, they are well-positioned to compete head-to-head.`;
                } else if (threatLevel === 'notable') {
                  sentence = `${mfrName} (${country}) is a notable competitor${typeLabel} worth monitoring. They offer ${advantages.join(' and ')}.`;
                  if (disadvantages.length > 0) sentence += ` On the other hand, they have ${disadvantages.join(' and ')}.`;
                } else if (threatLevel === 'emerging') {
                  sentence = `${mfrName} (${country}) shows potential as an emerging competitor${typeLabel}. They offer ${advantages.join(', ')}, though ${disadvantages.length > 0 ? 'they still have ' + disadvantages.join(' and ') : 'their overall positioning remains behind Enphase'}.`;
                } else {
                  sentence = `${mfrName} (${country}) does not pose a significant threat to Enphase${typeLabel} based on the products compared here.`;
                  if (disadvantages.length > 0) sentence += ` They have ${disadvantages.join(' and ')}.`;
                }

                paragraphs.push(sentence);
              }
            }

            return (
              <div className="bg-white rounded-xl border border-gray-300 p-6 mt-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">AI Summary: Competitive Threat & Market Perception</h3>
                <div className="space-y-2">
                  {paragraphs.map((p, i) => (
                    <p key={i} className="text-sm text-gray-700 leading-relaxed">{p}</p>
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-300 p-12 text-center">
          <Plus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium mb-1">No products selected</h3>
          <p className="text-sm text-muted-foreground">Select up to {MAX_PRODUCTS} products above to compare specifications and regional availability</p>
        </div>
      )}
      </div>
    </motion.div>
  );
}
