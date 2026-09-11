'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, FileText, Shield, DollarSign, XCircle, Zap, Filter, Download, ExternalLink } from 'lucide-react';
import { changeEvents, regions } from '@/data/comprehensive-data';

const typeIcons: Record<string, any> = {
  NEW_PRODUCT: Zap,
  SPEC_CHANGE: Package,
  DATASHEET_REVISION: FileText,
  WARRANTY_UPDATE: Shield,
  PRICE_CHANGE: DollarSign,
  DISCONTINUATION: XCircle,
};

const typeBadge: Record<string, string> = {
  NEW_PRODUCT: 'bg-green-50 text-green-700',
  SPEC_CHANGE: 'bg-blue-50 text-blue-700',
  DATASHEET_REVISION: 'bg-purple-50 text-purple-700',
  WARRANTY_UPDATE: 'bg-yellow-50 text-yellow-700',
  PRICE_CHANGE: 'bg-orange-50 text-orange-700',
  DISCONTINUATION: 'bg-red-50 text-red-700',
};

const severityDot: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-gray-300',
};

const formatMonthYear = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.toLocaleString('en-US', { month: 'short' })}-${d.getFullYear().toString().slice(-2)}`;
};

const getQuarter = (dateStr: string) => {
  const d = new Date(dateStr);
  return `Q${Math.ceil((d.getMonth() + 1) / 3)}'${d.getFullYear().toString().slice(-2)}`;
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const mon = d.toLocaleString('en-US', { month: 'short' });
  const yr = d.getFullYear().toString().slice(-2);
  return `${day}-${mon}-${yr}`;
};

const toSourceUrl = (source: string) => {
  if (source.startsWith('http://') || source.startsWith('https://')) return source;
  if (source.includes('.') && source.includes('/')) return `https://${source}`;
  if (source.includes('.com') || source.includes('.de') || source.includes('.org')) return `https://${source}`;
  return '';
};

const typeLabel = (t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace('Datasheet Revision', 'Datasheet Rev.');

export default function ChangesPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [mfgFilter, setMfgFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [quarterFilter, setQuarterFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const allRevisions = useMemo(() => {
    return [...changeEvents]
      .filter(e => new Date(e.date).getFullYear() >= 2025)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  const filtered = useMemo(() => {
    let result = allRevisions;
    if (typeFilter) result = result.filter(e => e.type === typeFilter);
    if (mfgFilter) result = result.filter(e => e.manufacturer === mfgFilter);
    if (quarterFilter) result = result.filter(e => getQuarter(e.date) === quarterFilter);
    if (monthFilter) result = result.filter(e => formatMonthYear(e.date) === monthFilter);
    if (regionFilter) result = result.filter(e => (e as any).region === regionFilter);
    if (countryFilter) result = result.filter(e => (e as any).country === countryFilter);
    return result;
  }, [allRevisions, typeFilter, mfgFilter, quarterFilter, monthFilter, regionFilter, countryFilter]);

  const stats = useMemo(() => ({
    newProducts: allRevisions.filter(e => e.type === 'NEW_PRODUCT').length,
    specChanges: allRevisions.filter(e => e.type === 'SPEC_CHANGE').length,
    datasheetRevisions: allRevisions.filter(e => e.type === 'DATASHEET_REVISION').length,
    warrantyUpdates: allRevisions.filter(e => e.type === 'WARRANTY_UPDATE').length,
    priceChanges: allRevisions.filter(e => e.type === 'PRICE_CHANGE').length,
    discontinuations: allRevisions.filter(e => e.type === 'DISCONTINUATION').length,
  }), [allRevisions]);

  const allMfgs = [...new Set(allRevisions.map(e => e.manufacturer))].sort();

  const allQuarters = useMemo(() => {
    const qSet = new Set(allRevisions.map(e => getQuarter(e.date)));
    return [...qSet].sort((a, b) => {
      const p = (q: string) => (2000 + parseInt(q.slice(3))) * 10 + parseInt(q[1]);
      return p(b) - p(a);
    });
  }, [allRevisions]);

  const allMonths = useMemo(() => {
    const src = quarterFilter ? allRevisions.filter(e => getQuarter(e.date) === quarterFilter) : allRevisions;
    const mSet = new Set(src.map(e => formatMonthYear(e.date)));
    return [...mSet].sort((a, b) => {
      const p = (m: string) => { const [mon, yr] = m.split('-'); return new Date(2000 + parseInt(yr), new Date(Date.parse(mon + ' 1, 2000')).getMonth()).getTime(); };
      return p(b) - p(a);
    });
  }, [allRevisions, quarterFilter]);

  const allRegions = useMemo(() => {
    const rSet = new Set(allRevisions.map(e => (e as any).region).filter(Boolean));
    return ['Global', ...Object.keys(regions)].filter(r => rSet.has(r) || r === 'Global');
  }, [allRevisions]);

  const allCountries = useMemo(() => {
    const base = regionFilter && regionFilter !== 'Global' ? allRevisions.filter(e => (e as any).region === regionFilter) : allRevisions;
    return [...new Set(base.map(e => (e as any).country).filter((c: string) => c && c !== 'Global'))].sort();
  }, [allRevisions, regionFilter]);

  const exportCSV = () => {
    const h = ['Date', 'Quarter', 'Type', 'Product', 'Manufacturer', 'Region', 'Country', 'Severity', 'Description', 'Change', 'Source URL'];
    const rows = filtered.map(e => {
      const change = e.oldValue && e.newValue ? `${e.field}: ${e.oldValue} → ${e.newValue}` : '';
      return [e.date, getQuarter(e.date), e.type, e.productName, e.manufacturer, (e as any).region || '', (e as any).country || '', e.severity, e.description, change, toSourceUrl(e.source) || e.source];
    });
    const csv = [h, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'change-events.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-8 border-t-4 border-t-enphase-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-enphase-500 tracking-wider mb-3">PRODUCT UPDATES & CHANGES</p>
            <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight">Latest News</h1>
            <p className="text-[13px] text-gray-500 mt-1">Product updates, spec changes, price changes, warranties, and discontinuations</p>
          </div>
          <Button size="sm" onClick={exportCSV} className="bg-enphase-500 hover:bg-enphase-600 text-white"><Download className="w-4 h-4 mr-1" />Export CSV</Button>
        </div>
      </div>

      <div className="px-8 py-8 space-y-5">

      {/* Stats row */}
      <div className="grid gap-4 grid-cols-6">
        {([
          { label: 'New Products', count: stats.newProducts, type: 'NEW_PRODUCT', iconColor: 'text-green-500', countColor: 'text-green-700' },
          { label: 'Spec Changes', count: stats.specChanges, type: 'SPEC_CHANGE', iconColor: 'text-blue-500', countColor: 'text-blue-700' },
          { label: 'Datasheet Rev.', count: stats.datasheetRevisions, type: 'DATASHEET_REVISION', iconColor: 'text-purple-500', countColor: 'text-purple-700' },
          { label: 'Warranty', count: stats.warrantyUpdates, type: 'WARRANTY_UPDATE', iconColor: 'text-yellow-500', countColor: 'text-yellow-700' },
          { label: 'Price Changes', count: stats.priceChanges, type: 'PRICE_CHANGE', iconColor: 'text-orange-500', countColor: 'text-orange-700' },
          { label: 'Discontinued', count: stats.discontinuations, type: 'DISCONTINUATION', iconColor: 'text-red-500', countColor: 'text-red-700' },
        ] as const).map(s => {
          const Icon = typeIcons[s.type];
          const active = typeFilter === s.type;
          return (
            <button key={s.type} onClick={() => setTypeFilter(active ? '' : s.type)} className={`p-3 rounded-xl text-left transition-all border-l-4 border border-gray-300 ${active ? 'border-l-enphase-500 bg-enphase-50/50' : s.type === 'NEW_PRODUCT' ? 'border-l-green-500 bg-white hover:shadow-md' : s.type === 'SPEC_CHANGE' ? 'border-l-blue-500 bg-white hover:shadow-md' : s.type === 'DATASHEET_REVISION' ? 'border-l-purple-500 bg-white hover:shadow-md' : s.type === 'WARRANTY_UPDATE' ? 'border-l-yellow-500 bg-white hover:shadow-md' : s.type === 'PRICE_CHANGE' ? 'border-l-orange-500 bg-white hover:shadow-md' : 'border-l-red-500 bg-white hover:shadow-md'}`}>
              <div className="flex items-center gap-2 mb-1"><Icon className={`w-3.5 h-3.5 ${s.iconColor}`} /><span className="text-xs font-medium text-gray-500">{s.label}</span></div>
              <div className={`text-xl font-semibold ${s.countColor}`}>{s.count}</div>
            </button>
          );
        })}
      </div>

      {/* Filters — grouped into two compact rows to reduce scan fatigue */}
      <div className="p-4 bg-white rounded-xl border border-gray-300 border-l-4 border-l-blue-400 space-y-2.5">
        {/* Row 1: Time + Type + Manufacturer */}
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-12 flex-shrink-0">Time</span>
          <select value={quarterFilter} onChange={e => { setQuarterFilter(e.target.value); setMonthFilter(''); }} className="px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white min-w-[110px]">
            <option value="">All Quarters</option>
            {allQuarters.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white min-w-[110px]">
            <option value="">All Months</option>
            {allMonths.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white min-w-[120px]">
            <option value="">All Types</option>
            {Object.keys(typeIcons).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <select value={mfgFilter} onChange={e => setMfgFilter(e.target.value)} className="px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white min-w-[140px]">
            <option value="">All Manufacturers</option>
            {allMfgs.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <div className="ml-auto flex items-center gap-2">
            {(typeFilter || mfgFilter || quarterFilter || monthFilter || regionFilter || countryFilter) && (
              <button onClick={() => { setTypeFilter(''); setMfgFilter(''); setQuarterFilter(''); setMonthFilter(''); setRegionFilter(''); setCountryFilter(''); }} className="text-xs text-enphase-500 hover:text-enphase-600 font-medium">Clear all</button>
            )}
            <span className="text-xs text-gray-400">{filtered.length} of {allRevisions.length}</span>
          </div>
        </div>
        {/* Row 2: Geography (only shown when relevant) */}
        <div className="flex gap-2 items-center pl-[22px]">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-12 flex-shrink-0">Geo</span>
          <select value={regionFilter} onChange={e => { setRegionFilter(e.target.value); setCountryFilter(''); }} className="px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white min-w-[130px]">
            <option value="">All Regions</option>
            {allRegions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className="px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white min-w-[140px]">
            <option value="">All Countries</option>
            {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden border border-gray-300 shadow-sm border-t-4 border-t-enphase-500">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-enphase-50">
                <th className="text-left px-5 py-3.5 font-semibold text-enphase-800 text-[13px] w-[100px] border border-gray-300">Date</th>
                <th className="text-left px-5 py-3.5 font-semibold text-enphase-800 text-[13px] w-[110px] border border-gray-300">Type</th>
                <th className="text-left px-5 py-3.5 font-semibold text-enphase-800 text-[13px] border border-gray-300">Product</th>
                <th className="text-left px-5 py-3.5 font-semibold text-enphase-800 text-[13px] border border-gray-300">Manufacturer</th>
                <th className="text-left px-5 py-3.5 font-semibold text-enphase-800 text-[13px] min-w-[260px] border border-gray-300">Description</th>
                <th className="text-left px-5 py-3.5 font-semibold text-enphase-800 text-[13px] w-[170px] border border-gray-300">Change</th>
                <th className="text-left px-5 py-3.5 font-semibold text-enphase-800 text-[13px] w-[90px] border border-gray-300">Region</th>
                <th className="text-center px-5 py-3.5 font-semibold text-enphase-800 text-[13px] w-[60px] border border-gray-300">Source</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event, i) => {
                const srcUrl = toSourceUrl(event.source);
                return (
                  <tr key={event.id + '-' + i} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-3.5 text-[13px] text-gray-500 whitespace-nowrap font-mono border border-gray-300">{formatDate(event.date)}</td>
                    <td className="px-5 py-3.5 border border-gray-300">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-medium ${typeBadge[event.type] || 'bg-gray-50 text-gray-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${severityDot[event.severity]}`} />
                        {typeLabel(event.type)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-900 text-[13px] border border-gray-300">{event.productName}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600 border border-gray-300">{event.manufacturer}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600 leading-relaxed border border-gray-300">{event.description}</td>
                    <td className="px-5 py-3.5 text-[13px] border border-gray-300">
                      {event.oldValue && event.newValue ? (
                        <span><span className="text-red-500 line-through">{event.oldValue}</span> <span className="text-gray-400">→</span> <span className="text-green-600 font-medium">{event.newValue}</span></span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-500 whitespace-nowrap border border-gray-300">
                      {(event as any).country && (event as any).country !== 'Global' ? (event as any).country : (event as any).region || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-center border border-gray-300">
                      {srcUrl ? (
                        <a href={srcUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-enphase-500 hover:text-enphase-600" title={event.source}>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12"><AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-muted-foreground text-sm">No events match your filters.</p></div>
      )}
      </div>
    </motion.div>
  );
}
