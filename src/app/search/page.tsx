'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Search, Download, ExternalLink, Package, Filter, ChevronDown, ChevronUp,
  FileText, Wrench, CheckCircle, X, Globe, MapPin, Scale, Check
} from 'lucide-react';
import { products, manufacturers, countries, regions } from '@/data/comprehensive-data';
import type { Product as ProductType } from '@/data/comprehensive-data';

const COUNTRY_ISO: Record<string, string> = {
  'United States': 'US', 'Canada': 'CA', 'Mexico': 'MX',
  'Germany': 'DE', 'France': 'FR', 'Italy': 'IT', 'Spain': 'ES',
  'Netherlands': 'NL', 'Belgium': 'BE', 'Austria': 'AT', 'Switzerland': 'CH',
  'United Kingdom': 'GB', 'Ireland': 'IE', 'Sweden': 'SE', 'Norway': 'NO',
  'Denmark': 'DK', 'Finland': 'FI', 'Poland': 'PL', 'Czech Republic': 'CZ',
  'Hungary': 'HU', 'Romania': 'RO', 'Bulgaria': 'BG', 'Greece': 'GR',
  'Portugal': 'PT', 'Luxembourg': 'LU', 'Croatia': 'HR', 'Slovakia': 'SK',
  'Slovenia': 'SI', 'Australia': 'AU', 'New Zealand': 'NZ', 'Japan': 'JP',
  'South Korea': 'KR', 'India': 'IN', 'Thailand': 'TH', 'Philippines': 'PH',
  'Vietnam': 'VN', 'Taiwan': 'TW', 'Singapore': 'SG', 'Malaysia': 'MY',
  'Indonesia': 'ID', 'Brazil': 'BR', 'Chile': 'CL', 'Argentina': 'AR',
  'Colombia': 'CO', 'Peru': 'PE', 'South Africa': 'ZA', 'UAE': 'AE',
  'Saudi Arabia': 'SA', 'Israel': 'IL', 'Turkey': 'TR', 'Egypt': 'EG',
  'Morocco': 'MA', 'Kenya': 'KE', 'Nigeria': 'NG',
};

function toISO(country: string): string {
  return COUNTRY_ISO[country] || country.substring(0, 2).toUpperCase();
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [mfgFilter, setMfgFilter] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [minPower, setMinPower] = useState(0);
  const [maxPower, setMaxPower] = useState(99999);
  const [minWarranty, setMinWarranty] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'specs' | 'certs' | 'compatibility' | 'datasheets' | 'history'>('specs');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const blurTimeout = useRef<NodeJS.Timeout | null>(null);

  const regionNames = useMemo(() => Object.keys(regions).sort(), []);

  const availableCountries = useMemo(() => {
    if (!selectedRegion) return countries;
    return (regions[selectedRegion] || []).slice().sort();
  }, [selectedRegion]);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    if (region && selectedCountry && !(regions[region] || []).includes(selectedCountry)) setSelectedCountry('');
    if (!region) setSelectedCountry('');
  };

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    const prodSugg = products.filter(p => p.name.toLowerCase().includes(q) || p.series.toLowerCase().includes(q)).slice(0, 4).map(p => ({ id: p.id, label: p.name, sub: p.manufacturer.name, type: 'product' as const }));
    const mfgSugg = manufacturers.filter(m => m.name.toLowerCase().includes(q)).slice(0, 2).map(m => ({ id: m.id, label: m.name, sub: m.country, type: 'manufacturer' as const }));
    return [...prodSugg, ...mfgSugg];
  }, [query]);

  const filtered = useMemo(() => {
    let result = products;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.manufacturer.name.toLowerCase().includes(q) || p.series.toLowerCase().includes(q) || p.model.toLowerCase().includes(q) || p.aiSummary.toLowerCase().includes(q));
    }
    if (mfgFilter) {
      if (mfgFilter === '_competitors') {
        result = result.filter(p => p.manufacturer.name !== 'Enphase Energy');
      } else {
        result = result.filter(p => p.manufacturer.name === mfgFilter);
      }
    }
    if (selectedCountry) {
      result = result.filter(p => p.countries.includes(selectedCountry));
    } else if (selectedRegion) {
      const regionCountries = regions[selectedRegion] || [];
      result = result.filter(p => p.countries.some(c => regionCountries.includes(c)));
    }
    if (minPower > 0) result = result.filter(p => p.acPower >= minPower);
    if (maxPower < 99999) result = result.filter(p => p.acPower <= maxPower);
    if (minWarranty > 0) result = result.filter(p => p.warranty >= minWarranty);
    return result;
  }, [query, mfgFilter, selectedRegion, selectedCountry, minPower, maxPower, minWarranty]);

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setMfgFilter(''); setSelectedRegion(''); setSelectedCountry('');
    setMinPower(0); setMaxPower(99999); setMinWarranty(0);
  };

  const hasActiveFilters = !!(mfgFilter || selectedRegion || selectedCountry || minPower > 0 || maxPower < 99999 || minWarranty > 0);
  const activeFilterCount = [mfgFilter, selectedRegion, selectedCountry, minPower > 0, maxPower < 99999, minWarranty > 0].filter(Boolean).length;

  const exportCSV = () => {
    const h = ['Name','Manufacturer','Series','Model','AC Power','Efficiency','Warranty','Status','Countries','Product URL'];
    const rows = filtered.map(p => [p.name, p.manufacturer.name, p.series, p.model, p.acPower, p.efficiency, p.warranty, p.status, p.countries.map(c => toISO(c)).join(' '), p.productUrl || '']);
    const csv = [h, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'product-library.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const compareUrl = `/compare?ids=${[...compareIds].join(',')}`;
  const MAX_ISO = 8;

  const totalCountries = countries.length;
  const totalManufacturers = manufacturers.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-8 border-t-4 border-t-enphase-500">
        <p className="text-[11px] font-semibold text-enphase-500 tracking-wider mb-3">ALL MANUFACTURERS · {totalCountries} COUNTRIES</p>
        <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight">Product Library</h1>
      </div>

      <div className="px-8 py-8 space-y-5 pb-24">

      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-3 bg-[#2C2C2C] rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-enphase-500 shadow-lg">
          <Search className="w-5 h-5 text-enphase-400 flex-shrink-0" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            onBlur={() => { blurTimeout.current = setTimeout(() => setShowSuggestions(false), 200); }}
            placeholder="Search products, manufacturers, specs — e.g. '400W Germany'"
            className="w-full text-base outline-none bg-transparent text-white placeholder:text-gray-400"
          />
          {query && (
            <button onClick={() => { setQuery(''); setShowSuggestions(false); }} className="text-gray-400 hover:text-gray-300 flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              {suggestions.map(s => (
                <button key={s.id + s.type} onMouseDown={() => { if (blurTimeout.current) clearTimeout(blurTimeout.current); }} onClick={() => { setQuery(s.label); setShowSuggestions(false); }} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-0">
                  <div><div className="text-sm font-medium">{s.label}</div><div className="text-xs text-muted-foreground">{s.sub}</div></div>
                  <Badge variant="outline" className="text-xs">{s.type}</Badge>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => { setMfgFilter(''); setSelectedRegion(''); setSelectedCountry(''); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !mfgFilter && !selectedRegion && !selectedCountry
              ? 'bg-enphase-500 text-white border border-enphase-500 shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Check className="w-4 h-4 inline mr-1.5" />All
        </button>
        <button
          onClick={() => { setMfgFilter('Enphase Energy'); setSelectedRegion(''); setSelectedCountry(''); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            mfgFilter === 'Enphase Energy'
              ? 'bg-enphase-500 text-white border border-enphase-500 shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Enphase only
        </button>
        <button
          onClick={() => { setMfgFilter(mfgFilter === '_competitors' ? '' : '_competitors'); setSelectedRegion(''); setSelectedCountry(''); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            mfgFilter === '_competitors'
              ? 'bg-blue-500 text-white border border-blue-500 shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Competitors
        </button>
        <button
          onClick={() => { setSelectedRegion('Europe'); setSelectedCountry(''); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedRegion === 'Europe'
              ? 'bg-amber-500 text-white border border-amber-500 shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          EMEA
        </button>
        <button
          onClick={() => { setSelectedRegion('North America'); setSelectedCountry(''); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedRegion === 'North America'
              ? 'bg-teal-500 text-white border border-teal-500 shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          North America
        </button>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="ml-auto">
          <Filter className="w-4 h-4 mr-1.5" />More Filters
          {activeFilterCount > 0 && <span className="ml-1.5 w-4 h-4 bg-enphase-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold flex-shrink-0">{activeFilterCount}</span>}
        </Button>
        <Link href={compareIds.size > 0 ? compareUrl : '/compare'}>
          <Button variant="outline" size="sm" className="border-enphase-300 text-enphase-600 hover:bg-enphase-50">
            <Scale className="w-4 h-4 mr-1.5" />Compare
            {compareIds.size > 0 && <span className="ml-1.5 w-4 h-4 bg-enphase-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold flex-shrink-0">{compareIds.size}</span>}
          </Button>
        </Link>
        <Button size="sm" onClick={exportCSV} className="bg-enphase-500 hover:bg-enphase-600 text-white"><Download className="w-4 h-4 mr-1" />Export</Button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="p-5 border border-gray-200 bg-white rounded-2xl shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Manufacturer</label>
                  <select value={mfgFilter} onChange={e => setMfgFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="">All</option>
                    {manufacturers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Region</label>
                  <select value={selectedRegion} onChange={e => handleRegionChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="">All Regions</option>
                    {regionNames.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Country</label>
                  <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="">{selectedRegion ? `All in ${selectedRegion}` : 'All Countries'}</option>
                    {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Min Power (W)</label>
                  <input type="number" value={minPower || ''} onChange={e => setMinPower(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Max Power (W)</label>
                  <input type="number" value={maxPower >= 99999 ? '' : maxPower} onChange={e => setMaxPower(Number(e.target.value) || 99999)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="No limit" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Min Warranty (yr)</label>
                  <input type="number" value={minWarranty || ''} onChange={e => setMinWarranty(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0" />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>


      <p className="text-sm text-gray-600">
        <span className="font-semibold text-gray-900">{filtered.length} products</span> · sorted by most recent update
        {compareIds.size > 0 && <span className="ml-2 text-enphase-500 font-medium">· {compareIds.size} selected for comparison</span>}
      </p>

      {/* Results */}
      <div className="space-y-3">
        {filtered.map(p => {
          const isExpanded = expandedId === p.id;
          const inCompare = compareIds.has(p.id);
          const isoCodes = p.countries.map(c => toISO(c));
          const visibleISO = isoCodes.slice(0, MAX_ISO);
          const remainingCount = isoCodes.length - MAX_ISO;

          const isEnphase = p.manufacturer.name === 'Enphase Energy';

          return (
            <Card key={p.id} className={`border-l-4 border transition-all rounded-2xl ${isEnphase ? 'bg-enphase-50/30' : 'bg-white'} ${isExpanded ? 'border-l-enphase-500 border-gray-300 shadow-md' : inCompare ? 'border-l-blue-500 border-blue-200 bg-blue-50/30 shadow-sm' : isEnphase ? 'border-l-enphase-500 border-enphase-200 hover:border-enphase-300 hover:shadow-md' : 'border-l-gray-300 border-gray-200 hover:border-gray-300 hover:shadow-md'}`}>
              <div className="flex">
                {/* Compare checkbox */}
                <div className="flex items-start pt-[14px] pl-3 pr-1 flex-shrink-0">
                  <button
                    onClick={(e) => toggleCompare(p.id, e)}
                    title={inCompare ? 'Remove from comparison' : 'Add to comparison'}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium transition-all ${inCompare ? 'bg-enphase-500 border-enphase-500 text-white' : 'border-gray-300 text-gray-400 hover:border-enphase-400 hover:text-enphase-500'}`}
                  >
                    {inCompare ? <Check className="w-3 h-3" /> : <Scale className="w-3 h-3" />}
                  </button>
                </div>

                {/* Card main button */}
                <button onClick={() => { setExpandedId(isExpanded ? null : p.id); setDetailTab('specs'); }} className="w-full text-left p-4 pl-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isEnphase ? 'bg-enphase-500 ring-2 ring-enphase-200' : p.manufacturer.name.includes('Hoymiles') ? 'bg-blue-500' : p.manufacturer.name.includes('APsystems') ? 'bg-emerald-500' : p.manufacturer.name.includes('SolarEdge') ? 'bg-purple-500' : p.manufacturer.name.includes('Huawei') ? 'bg-red-500' : p.manufacturer.name.includes('Deye') ? 'bg-amber-500' : p.manufacturer.name.includes('Tesla') ? 'bg-gray-800' : p.manufacturer.name.includes('FoxESS') ? 'bg-teal-500' : 'bg-indigo-500'}`}>
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-base text-gray-900">
                          {p.name}
                          {isEnphase && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-enphase-500 text-white rounded uppercase tracking-wide">Enphase</span>}
                          <span className="text-gray-500 font-normal ml-1">· {p.countries[0] ? toISO(p.countries[0]) : ''}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">{p.manufacturer.name} · {p.series} · {p.model}</div>
                        <div className="text-sm text-gray-700 mt-2 line-clamp-1">{p.aiSummary}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right hidden sm:block"><div className="text-sm font-medium">{p.acPower}W</div><div className="text-xs text-muted-foreground">AC Power</div></div>
                      <div className="text-right hidden sm:block"><div className="text-sm font-medium">{p.efficiency}%</div><div className="text-xs text-muted-foreground">Efficiency</div></div>
                      <div className="text-right hidden md:block"><div className="text-sm font-medium">{p.warranty} yr</div><div className="text-xs text-muted-foreground">Warranty</div></div>
                      <Badge variant={p.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">{p.status}</Badge>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                </button>
              </div>

              {/* Expanded Detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50/70 rounded-b-2xl">
                      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                        {(['specs', 'certs', 'compatibility', 'datasheets', 'history'] as const).map(t => (
                          <button key={t} onClick={() => setDetailTab(t)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${detailTab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                            {t === 'specs' ? 'Specifications' : t === 'certs' ? 'Certifications' : t === 'compatibility' ? 'Compatibility' : t === 'datasheets' ? 'Datasheets' : 'Revision History'}
                          </button>
                        ))}
                      </div>

                      {detailTab === 'specs' && (
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">Type of Product</span><span className="font-medium">{p.productType}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">Rated Output Power</span><span className="font-medium">{p.acPower}W</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">Maximum Array Power</span><span className="font-medium">{p.maxModuleSize}W</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">Nominal Grid Voltage</span><span className="font-medium">{p.voltage}V</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">No. of MPPTs</span><span className="font-medium">{p.mppt}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">MPPT Voltage Range</span><span className="font-medium">{p.mpptVoltageRange}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">Operating Voltage Range</span><span className="font-medium">{p.inputVoltageRange}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">Start-up Input Voltage</span><span className="font-medium">{p.startVoltage}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">Max Voc</span><span className="font-medium">{p.voc}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">Max Isc</span><span className="font-medium">{p.isc}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">Max Input Current</span><span className="font-medium">{p.maxInputCurrent}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">Peak Efficiency</span><span className="font-medium">{p.efficiency}%</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">Inverter Max Efficiency</span><span className="font-medium">{p.maxEfficiency}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">CEC Weighted Efficiency</span><span className="font-medium">{p.cecEfficiency}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">European Weighted Efficiency</span><span className="font-medium">{p.euroEfficiency}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">THD</span><span className="font-medium">{p.thd}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">Night Consumption</span><span className="font-medium">{p.nightConsumption}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">IP Rating</span><span className="font-medium">{p.ipRating}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">Operating Temp</span><span className="font-medium">{p.operatingTempRange}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">Communication</span><span className="font-medium">{p.communicationType}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">Monitoring Platform</span><span className="font-medium">{p.monitoringPlatform}</span></div>
                          <div className="flex items-center justify-between p-2 rounded border border-gray-200 rounded-lg text-sm bg-white"><span className="text-muted-foreground">Warranty</span><span className="font-medium">{p.warranty} years</span></div>
                        </div>
                      )}

                      {detailTab === 'certs' && (
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {p.certifications.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 text-sm bg-white">
                              <CheckCircle className={`w-4 h-4 flex-shrink-0 ${c.certified ? 'text-green-500' : 'text-gray-300'}`} />
                              <div><div className="font-medium">{c.standard}</div><div className="text-xs text-muted-foreground">{c.country}{c.certNumber ? ` · ${c.certNumber}` : ''}</div></div>
                            </div>
                          ))}
                        </div>
                      )}

                      {detailTab === 'compatibility' && (
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {p.accessories.length === 0 ? (
                            <p className="text-xs text-muted-foreground col-span-full">No accessory data available</p>
                          ) : p.accessories.map(a => (
                            <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 text-sm bg-white">
                              <Wrench className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <div className="min-w-0"><div className="font-medium truncate">{a.name}</div><div className="text-xs text-muted-foreground">{a.type}{a.price ? ` · $${a.price}` : ''}</div></div>
                            </div>
                          ))}
                        </div>
                      )}

                      {detailTab === 'datasheets' && (
                        <div className="space-y-2">
                          {p.datasheets.length === 0 ? (
                            <div className="text-xs text-muted-foreground">
                              {p.datasheetUrl ? (
                                <a href={p.datasheetUrl} target="_blank" rel="noopener noreferrer" className="text-enphase-500 hover:text-enphase-600 flex items-center gap-1"><FileText className="w-3 h-3" />View datasheet on manufacturer site</a>
                              ) : 'No datasheet data available'}
                            </div>
                          ) : p.datasheets.map(d => (
                            <div key={d.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 text-sm bg-white">
                              <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /><div><div className="font-medium">{d.name}</div><div className="text-xs text-muted-foreground">{d.language} · v{d.version} · {d.pages} pages · {d.fileSize}</div></div></div>
                              <span className="text-xs text-muted-foreground">{new Date(d.uploadDate).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {detailTab === 'history' && (
                        <div className="space-y-2">
                          {p.revisionHistory.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No revision history tracked yet</p>
                          ) : p.revisionHistory.map(r => (
                            <div key={r.id} className="flex items-start gap-3 p-2 rounded-lg border border-gray-200 text-sm bg-white">
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${r.type === 'NEW_PRODUCT' ? 'bg-green-500' : r.type === 'SPEC_CHANGE' ? 'bg-blue-500' : r.type === 'DATASHEET_REVISION' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                              <div className="min-w-0">
                                <div className="font-medium">{r.description}</div>
                                <div className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()} · {r.source}{r.oldValue ? ` · ${r.oldValue} → ${r.newValue}` : ''}</div>
                              </div>
                              <Badge variant="outline" className="text-xs flex-shrink-0">{r.type.replace(/_/g, ' ')}</Badge>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        {p.productUrl && <a href={p.productUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-enphase-500 hover:text-enphase-600 flex items-center gap-1"><ExternalLink className="w-3 h-3" />Product Page</a>}
                        {p.datasheetUrl && <a href={p.datasheetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-enphase-500 hover:text-enphase-600 flex items-center gap-1"><FileText className="w-3 h-3" />Datasheet</a>}
                        <span className="text-xs text-muted-foreground ml-auto">Confidence: {(p.confidenceScore * 100).toFixed(0)}% · Updated: {new Date(p.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm"><Package className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-muted-foreground">No products match your search criteria.</p></div>
      )}
      </div>

      {/* Sticky Compare Action Bar */}
      <AnimatePresence>
        {compareIds.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-[240px] right-0 z-50 bg-white border-t-2 border-t-enphase-500 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-6 py-3"
          >
            <div className="max-w-[1400px] mx-auto flex items-center gap-4">
              <Scale className="w-4 h-4 text-enphase-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900 flex-shrink-0">{compareIds.size} selected</span>
              <div className="flex gap-1.5 flex-1 overflow-hidden">
                {[...compareIds].map(id => {
                  const prod = products.find(p => p.id === id);
                  return prod ? (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-enphase-50 text-enphase-700 text-xs font-medium rounded-full border border-enphase-200 whitespace-nowrap">
                      {prod.name}
                      <button onClick={(e) => toggleCompare(id, e)} className="hover:text-red-500 ml-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  ) : null;
                })}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={() => setCompareIds(new Set())} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Clear</button>
                <Link href={compareUrl} className="inline-flex items-center gap-2 px-4 py-2 bg-enphase-500 hover:bg-enphase-600 text-white text-sm font-medium rounded-lg transition-colors">
                  <Scale className="w-4 h-4" />Compare {compareIds.size} products →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
