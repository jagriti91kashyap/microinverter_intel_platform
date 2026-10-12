'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { products, baseProducts, manufacturers, changeEvents } from '@/data/comprehensive-data';

const DONUT_COLORS = ['#FF6900', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#94A3B8'];

export default function Dashboard() {
  const router = useRouter();

  // Core counts
  const totalProducts = products.length;
  const enphaseProducts = products.filter(p => p.manufacturer.name === 'Enphase Energy');
  const enphaseActiveCount = enphaseProducts.filter(p => p.status === 'ACTIVE').length;
  const competitorProducts = products.filter(p => p.manufacturer.name !== 'Enphase Energy');

  // ── All intelligence sourced from changeEvents (the real activity feed) ──
  const sortedEvents = useMemo(() =>
    [...changeEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  []);

  // Events in the last 30 days
  const recentEvents = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return sortedEvents.filter(e => new Date(e.date) > cutoff);
  }, [sortedEvents]);

  // Competitor NEW_PRODUCT launches in last 30 days
  const competitorLaunches = useMemo(() =>
    recentEvents.filter(e => e.type === 'NEW_PRODUCT' && e.manufacturer !== 'Enphase Energy'),
  [recentEvents]);

  const competitorMfgNames = [...new Set(competitorLaunches.map(e => e.manufacturer))];

  // Spec changes (non-launch events) in last 30 days
  const recentSpecChanges = useMemo(() =>
    recentEvents.filter(e => e.type !== 'NEW_PRODUCT'),
  [recentEvents]);

  const directCompetitorChanges = recentSpecChanges.filter(e =>
    e.manufacturer !== 'Enphase Energy' &&
    (e.country === 'United States' || e.region === 'North America')
  );

  // Recent events for activity feed
  const recentLaunchEvents = useMemo(() =>
    sortedEvents.filter(e => e.type === 'NEW_PRODUCT').slice(0, 5),
  [sortedEvents]);

  const recentChangeEvents_list = useMemo(() =>
    sortedEvents.filter(e => e.type !== 'NEW_PRODUCT').slice(0, 5),
  [sortedEvents]);

  // Executive summary computations
  const executiveSummary = useMemo(() => {
    const moduleInputs = (p: typeof products[0]): number => {
      const tMatch = p.model.match(/(\d+)T$/i) || p.name.match(/(\d+)T\b/);
      if (tMatch) return parseInt(tMatch[1], 10);
      const descNinOne = p.aiSummary?.match(/(\d+)-in-1/i) || p.aiSummary?.match(/(\d+)-module/i);
      if (descNinOne) return parseInt(descNinOne[1], 10);
      const cur = p.maxInputCurrent || '';
      const xMatch = cur.match(/x(\d+)/);
      if (xMatch) return parseInt(xMatch[1], 10);
      if (cur.match(/\/ch/i)) return Math.max(p.mppt, 2);
      return Math.max(p.mppt, 1);
    };
    const perModule = (p: typeof products[0]) => {
      const inputs = moduleInputs(p);
      return inputs > 0 ? Math.round(p.acPower / inputs) : p.acPower;
    };

    const enphaseMIs = enphaseProducts.filter(p => p.productType === 'Microinverter');
    const enphaseAvgEff = enphaseMIs.length > 0 ? enphaseMIs.reduce((s, p) => s + p.efficiency, 0) / enphaseMIs.length : 0;
    const enphaseCountries = '160+';
    const enphaseMaxPower = Math.max(...enphaseMIs.map(p => perModule(p)), 0);
    const enphaseAvgWarranty = enphaseMIs.length > 0 ? enphaseMIs.reduce((s, p) => s + p.warranty, 0) / enphaseMIs.length : 0;

    const competitorMIs = competitorProducts.filter(p => p.productType === 'Microinverter');
    const competitorAvgEff = competitorMIs.length > 0 ? competitorMIs.reduce((s, p) => s + p.efficiency, 0) / competitorMIs.length : 0;
    const competitorPowers = competitorMIs.map(p => ({ name: p.name, perModule: perModule(p) }));
    const competitorMaxPowerObj = competitorPowers.reduce((max, curr) => curr.perModule > max.perModule ? curr : max, { name: '', perModule: 0 });
    const competitorMaxPower = competitorMaxPowerObj.perModule;
    const competitorAvgWarranty = competitorMIs.length > 0 ? competitorMIs.reduce((s, p) => s + p.warranty, 0) / competitorMIs.length : 0;

    const chineseMfrs = manufacturers.filter(m => m.country === 'China').map(m => m.name);
    const chineseProductCount = competitorProducts.filter(p => chineseMfrs.includes(p.manufacturer.name)).length;
    const chineseShare = competitorProducts.length > 0 ? (chineseProductCount / competitorProducts.length * 100) : 0;

    return {
      enphaseAvgEff, enphaseCountries, enphaseMaxPower, enphaseAvgWarranty,
      competitorAvgEff, competitorMaxPower, competitorAvgWarranty,
      competitorMaxPowerProduct: competitorMaxPowerObj.name,
      chineseShare, chineseProductCount,
    };
  }, [enphaseProducts, competitorProducts, manufacturers]);

  // Donut chart data
  const donutData = useMemo(() => {
    const mfrCounts: Record<string, number> = {};
    products.forEach(p => { mfrCounts[p.manufacturer.name] = (mfrCounts[p.manufacturer.name] || 0) + 1; });
    const sorted = Object.entries(mfrCounts).sort((a, b) => b[1] - a[1]);
    const top6 = sorted.slice(0, 6).map(([name, value]) => ({ name: name.replace(' Energy', '').replace(' Technologies', ''), value }));
    const othersCount = sorted.slice(6).reduce((s, [, v]) => s + v, 0);
    if (othersCount > 0) top6.push({ name: 'Others', value: othersCount });
    return top6;
  }, []);

  // SVG donut segments
  const donutSegments = useMemo(() => {
    const total = donutData.reduce((s, d) => s + d.value, 0);
    if (total === 0) return [];
    const radius = 15.915;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    return donutData.map((d, i) => {
      const len = (d.value / total) * circumference;
      const seg = { color: DONUT_COLORS[i % DONUT_COLORS.length], dashArray: `${len} ${circumference - len}`, dashOffset: -offset };
      offset += len;
      return seg;
    });
  }, [donutData]);

  // KPI data
  const kpis = [
    { label: 'Products Tracked', value: String(totalProducts), sub: `${manufacturers.length} manufacturers`, href: '/search', trend: null as string | null },
    { label: 'Enphase SKUs', value: String(enphaseActiveCount), sub: 'IQ7 · IQ8 · IQ9', href: '/search?manufacturer=Enphase+Energy', trend: 'up' },
    { label: 'New Launches', value: String(competitorLaunches.length), sub: competitorMfgNames.slice(0, 2).join(', ') || 'None (30d)', href: '/changes', trend: competitorLaunches.length > 3 ? 'up' : null },
    { label: 'Market Reach', value: executiveSummary.enphaseCountries, sub: 'countries', href: '/manufacturers', trend: 'up' },
    { label: 'Efficiency', value: `${executiveSummary.enphaseAvgEff.toFixed(1)}%`, sub: `vs ${executiveSummary.competitorAvgEff.toFixed(1)}%`, href: '/compare', trend: executiveSummary.enphaseAvgEff >= executiveSummary.competitorAvgEff ? 'up' : 'down' },
    { label: 'Max Power', value: `${executiveSummary.enphaseMaxPower}W`, sub: `vs ${executiveSummary.competitorMaxPower}W`, href: '/compare', trend: executiveSummary.enphaseMaxPower >= executiveSummary.competitorMaxPower ? 'up' : 'down' },
    { label: 'Warranty', value: `${executiveSummary.enphaseAvgWarranty.toFixed(0)} yrs`, sub: `vs ${executiveSummary.competitorAvgWarranty.toFixed(0)} yrs`, href: '/search', trend: executiveSummary.enphaseAvgWarranty >= executiveSummary.competitorAvgWarranty ? 'up' : null },
    { label: 'Spec Changes', value: String(recentSpecChanges.length), sub: `${directCompetitorChanges.length} US competitors`, href: '/changes', trend: recentSpecChanges.length > 5 ? 'up' : null },
  ];

  // Key insights (simplified from executive dossier)
  const insights = useMemo(() => {
    const items: { text: string; type: 'positive' | 'warning' }[] = [];
    items.push({ text: `Enphase leads with ${enphaseActiveCount} active SKUs across ${executiveSummary.enphaseCountries} countries`, type: 'positive' });
    if (executiveSummary.enphaseAvgEff > executiveSummary.competitorAvgEff)
      items.push({ text: `Efficiency advantage: ${executiveSummary.enphaseAvgEff.toFixed(1)}% vs ${executiveSummary.competitorAvgEff.toFixed(1)}% avg`, type: 'positive' });
    if (executiveSummary.competitorMaxPower > executiveSummary.enphaseMaxPower)
      items.push({ text: `Competitors reaching ${executiveSummary.competitorMaxPower}W/module vs Enphase ${executiveSummary.enphaseMaxPower}W`, type: 'warning' });
    if (executiveSummary.chineseShare > 50)
      items.push({ text: `Chinese manufacturers hold ${executiveSummary.chineseShare.toFixed(0)}% of competitor SKUs`, type: 'warning' });
    return items;
  }, [executiveSummary, enphaseActiveCount]);

  return (
    <div className="min-h-screen">
      {/* ── Clean header ── */}
      <div className="px-8 pt-8 pb-6">
        <p className="text-xs font-medium text-enphase-500 uppercase tracking-widest mb-1">Market Intelligence</p>
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
      </div>

      <div className="px-8 pb-10 space-y-6 max-w-[1600px]">

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-4 gap-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              onClick={() => router.push(kpi.href)}
              className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">{kpi.label}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-gray-900 tracking-tight">{kpi.value}</span>
                {kpi.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                {kpi.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-400" />}
              </div>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Key Insights + Donut ── */}
        <div className="grid grid-cols-3 gap-3">

          {/* Insights card */}
          <div className="col-span-2 rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-900">Key Insights</h2>
              <Link href="/compare" className="text-xs text-enphase-500 hover:text-enphase-600 font-medium flex items-center gap-0.5">
                Compare <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {insights.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${item.type === 'positive' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Donut card */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">By Manufacturer</h2>
              <Link href="/manufacturers" className="text-xs text-enphase-500 hover:text-enphase-600 font-medium flex items-center gap-0.5">
                View <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative" style={{ width: 140, height: 140 }}>
                <svg viewBox="0 0 36 36" width="140" height="140">
                  {donutSegments.map((seg, i) => (
                    <circle key={i} cx="18" cy="18" r="15.915" fill="none" stroke={seg.color}
                      strokeWidth="3" strokeDasharray={seg.dashArray} strokeDashoffset={seg.dashOffset}
                      transform="rotate(-90 18 18)" />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">{totalProducts}</span>
                  <span className="text-[10px] text-gray-400">Total</span>
                </div>
              </div>
              <div className="w-full mt-4 space-y-1">
                {donutData.slice(0, 5).map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      <span className="text-gray-500">{d.name}</span>
                    </div>
                    <span className="font-medium text-gray-700">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Activity Feed ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* New Products */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">New Products</h2>
              <Link href="/changes" className="text-xs text-enphase-500 hover:text-enphase-600 font-medium flex items-center gap-0.5">
                All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-1">
              {recentLaunchEvents.map(e => (
                <Link key={e.id} href={`/changes?highlight=${e.id}`}
                  className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-xl hover:bg-gray-50/80 transition-colors cursor-pointer group">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-enphase-600 transition-colors">{e.productName.split('(')[0].trim()}</p>
                    <p className="text-xs text-gray-400">{e.manufacturer}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 ml-3">{new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Spec Changes */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Spec Changes</h2>
              <Link href="/changes" className="text-xs text-enphase-500 hover:text-enphase-600 font-medium flex items-center gap-0.5">
                All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-1">
              {recentChangeEvents_list.map(e => (
                <Link key={e.id} href={`/changes?highlight=${e.id}`}
                  className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-xl hover:bg-gray-50/80 transition-colors cursor-pointer group">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-enphase-600 transition-colors">{e.productName.split('(')[0].trim()}</p>
                    <p className="text-xs text-gray-400">{e.manufacturer} · {e.type.replace(/_/g, ' ').toLowerCase()}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 ml-3">{new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Events Table ── */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Events</h2>
            <Link href="/changes" className="text-xs text-enphase-500 hover:text-enphase-600 font-medium flex items-center gap-0.5">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-t border-gray-100 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-2.5">Product</th>
                <th className="px-6 py-2.5">Manufacturer</th>
                <th className="px-6 py-2.5">Type</th>
                <th className="px-6 py-2.5">Date</th>
                <th className="px-6 py-2.5">Region</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.slice(0, 6).map((e) => (
                <tr key={e.id} onClick={() => router.push(`/changes?highlight=${e.id}`)}
                  className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors text-sm cursor-pointer">
                  <td className="px-6 py-3 font-medium text-gray-900 max-w-[220px] truncate">{e.productName.split('(')[0].trim()}</td>
                  <td className="px-6 py-3 text-gray-500">{e.manufacturer}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      e.type === 'NEW_PRODUCT' ? 'bg-emerald-50 text-emerald-600' :
                      e.type === 'SPEC_CHANGE' ? 'bg-amber-50 text-amber-600' :
                      e.type === 'DISCONTINUATION' ? 'bg-red-50 text-red-500' :
                      'bg-gray-50 text-gray-500'
                    }`}>{e.type.replace(/_/g, ' ').toLowerCase()}</span>
                  </td>
                  <td className="px-6 py-3 text-gray-400 text-xs">{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="px-6 py-3 text-gray-400 text-xs">{e.region || e.country || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
