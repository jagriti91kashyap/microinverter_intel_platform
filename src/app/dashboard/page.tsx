'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Zap, Activity, Globe,
  Clock, FileText, ExternalLink,
  TrendingUp, ShieldAlert, Lightbulb, Target, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Link from 'next/link';
import { products, baseProducts, manufacturers, changeEvents } from '@/data/comprehensive-data';

export default function Dashboard() {

  // Core counts
  const totalProducts = products.length;
  const totalCountries = [...new Set(baseProducts.flatMap(p => p.countries))].length;
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

  const usCompetitorLaunches = competitorLaunches.filter(e =>
    e.country === 'United States' || e.region === 'North America'
  );

  const competitorMfgNames = [...new Set(competitorLaunches.map(e => e.manufacturer))];

  // Spec changes (non-launch events) in last 30 days
  const recentSpecChanges = useMemo(() =>
    recentEvents.filter(e => e.type !== 'NEW_PRODUCT'),
  [recentEvents]);

  const directCompetitorChanges = recentSpecChanges.filter(e =>
    e.manufacturer !== 'Enphase Energy' &&
    (e.country === 'United States' || e.region === 'North America')
  );

  // Recent launch events for bottom list
  const recentLaunchEvents = useMemo(() =>
    sortedEvents.filter(e => e.type === 'NEW_PRODUCT').slice(0, 5),
  [sortedEvents]);

  // Recent non-launch events for bottom list
  const recentChangeEvents_list = useMemo(() =>
    sortedEvents.filter(e => e.type !== 'NEW_PRODUCT').slice(0, 5),
  [sortedEvents]);

  // Enphase latest launch
  const latestEnphaseLaunch = useMemo(() =>
    sortedEvents.find(e => e.manufacturer === 'Enphase Energy' && e.type === 'NEW_PRODUCT'),
  [sortedEvents]);

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });


  // ═══════════════════════════════════════════════════════════════
  // EXECUTIVE SUMMARY — computed insights for dossier-style cards
  // ═══════════════════════════════════════════════════════════════

  const executiveSummary = useMemo(() => {
    // Per-module power: derive actual number of panel inputs from product data.
    // Uses multiple heuristics: name suffix (-2T/-4T/-8T), description (X-in-1),
    // maxInputCurrent multiplier (x4, /ch), and MPPT count as fallback.
    const moduleInputs = (p: typeof products[0]): number => {
      // 1) Name suffix: -1T, -2T, -4T, -6T, -8T (Hoymiles/APsystems convention)
      const tMatch = p.model.match(/(\d+)T$/i) || p.name.match(/(\d+)T\b/);
      if (tMatch) return parseInt(tMatch[1], 10);
      // 2) Description: "4-in-1", "8-in-1", "4-module", "8-module" etc.
      const descNinOne = p.aiSummary?.match(/(\d+)-in-1/i) || p.aiSummary?.match(/(\d+)-module/i);
      if (descNinOne) return parseInt(descNinOne[1], 10);
      // 3) maxInputCurrent: "20 A x4" → 4 channels, "14 A/ch" → use mppt
      const cur = p.maxInputCurrent || '';
      const xMatch = cur.match(/x(\d+)/);
      if (xMatch) return parseInt(xMatch[1], 10);
      if (cur.match(/\/ch/i)) return Math.max(p.mppt, 2);
      // 4) Fallback: mppt count (correct for single-MPPT products)
      return Math.max(p.mppt, 1);
    };
    const perModule = (p: typeof products[0]) => {
      const inputs = moduleInputs(p);
      return inputs > 0 ? Math.round(p.acPower / inputs) : p.acPower;
    };

    // Enphase strengths — microinverters only for benchmark
    const enphaseMIs = enphaseProducts.filter(p => p.productType === 'Microinverter');
    const enphaseAvgEff = enphaseMIs.length > 0
      ? enphaseMIs.reduce((s, p) => s + p.efficiency, 0) / enphaseMIs.length
      : 0;
    // Enphase official market reach: 160+ countries (per enphase.com investor communications)
    // Data tracks ~55 countries explicitly; use official figure for dashboard
    const enphaseBase = baseProducts.filter(p => p.manufacturer.name === 'Enphase Energy');
    const enphaseCountries = '160+';
    const enphaseMaxPower = Math.max(...enphaseMIs.map(p => perModule(p)), 0);
    const enphaseAvgWarranty = enphaseMIs.length > 0
      ? enphaseMIs.reduce((s, p) => s + p.warranty, 0) / enphaseMIs.length
      : 0;

    // Competitor analysis — microinverters only for fair comparison
    const competitorMIs = competitorProducts.filter(p => p.productType === 'Microinverter');
    const competitorAvgEff = competitorMIs.length > 0
      ? competitorMIs.reduce((s, p) => s + p.efficiency, 0) / competitorMIs.length
      : 0;
    const competitorMaxPower = Math.max(...competitorMIs.map(p => perModule(p)), 0);
    const competitorAvgWarranty = competitorMIs.length > 0
      ? competitorMIs.reduce((s, p) => s + p.warranty, 0) / competitorMIs.length
      : 0;

    // Top competitors by product count
    const mfrCounts: Record<string, number> = {};
    competitorProducts.forEach(p => {
      mfrCounts[p.manufacturer.name] = (mfrCounts[p.manufacturer.name] || 0) + 1;
    });
    const topCompetitors = Object.entries(mfrCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Fastest growing (most events)
    const eventCounts: Record<string, number> = {};
    recentEvents.forEach(e => {
      if (e.manufacturer !== 'Enphase Energy') {
        eventCounts[e.manufacturer] = (eventCounts[e.manufacturer] || 0) + 1;
      }
    });
    const mostActiveMfr = Object.entries(eventCounts).sort((a, b) => b[1] - a[1])[0];

    // Chinese vs non-Chinese competitor split
    const chineseMfrs = manufacturers.filter(m => m.country === 'China').map(m => m.name);
    const chineseProductCount = competitorProducts.filter(p => chineseMfrs.includes(p.manufacturer.name)).length;
    const chineseShare = competitorProducts.length > 0 ? (chineseProductCount / competitorProducts.length * 100) : 0;

    // Regions where Enphase is NOT present but competitors are
    const enphaseCountrySet = new Set(enphaseBase.flatMap(p => p.countries));
    const competitorBase = baseProducts.filter(p => p.manufacturer.name !== 'Enphase Energy');
    const competitorOnlyCountries = [...new Set(competitorBase.flatMap(p => p.countries))].filter(c => !enphaseCountrySet.has(c));

    return {
      enphaseAvgEff, enphaseCountries, enphaseMaxPower, enphaseAvgWarranty,
      competitorAvgEff, competitorMaxPower, competitorAvgWarranty,
      topCompetitors, mostActiveMfr, chineseShare, chineseProductCount,
      competitorOnlyCountries, competitorMICount: competitorMIs.length,
    };
  }, [enphaseProducts, competitorProducts, recentEvents, manufacturers, baseProducts]);

  // Donut chart data — products by manufacturer (top 6 + Others)
  const DONUT_COLORS = ['#FF6900', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#94A3B8'];
  const donutData = useMemo(() => {
    const mfrCounts: Record<string, number> = {};
    products.forEach(p => {
      mfrCounts[p.manufacturer.name] = (mfrCounts[p.manufacturer.name] || 0) + 1;
    });
    const sorted = Object.entries(mfrCounts).sort((a, b) => b[1] - a[1]);
    const top6 = sorted.slice(0, 6).map(([name, value]) => ({ name: name.replace(' Energy', '').replace(' Technologies', ''), value }));
    const othersCount = sorted.slice(6).reduce((s, [, v]) => s + v, 0);
    if (othersCount > 0) top6.push({ name: 'Others', value: othersCount });
    return top6;
  }, []);

  // Build highlight bullets
  const highlights = useMemo(() => {
    const items: { text: string; type: 'positive' | 'neutral' }[] = [];
    items.push({
      text: `Enphase leads with ${enphaseActiveCount} active SKUs across ${executiveSummary.enphaseCountries} countries — highest residential microinverter reach globally`,
      type: 'positive',
    });
    if (executiveSummary.enphaseAvgEff > executiveSummary.competitorAvgEff) {
      items.push({
        text: `Average efficiency advantage: ${executiveSummary.enphaseAvgEff.toFixed(1)}% vs competitor avg ${executiveSummary.competitorAvgEff.toFixed(1)}%`,
        type: 'positive',
      });
    }
    if (latestEnphaseLaunch) {
      items.push({
        text: `Latest launch: ${latestEnphaseLaunch.productName.split('(')[0].trim()} — ${latestEnphaseLaunch.description.split('.')[0]}`,
        type: 'positive',
      });
    }
    if (executiveSummary.enphaseAvgWarranty >= executiveSummary.competitorAvgWarranty) {
      items.push({
        text: `Warranty leadership: ${executiveSummary.enphaseAvgWarranty.toFixed(0)}-year avg vs competitor ${executiveSummary.competitorAvgWarranty.toFixed(0)}-year avg`,
        type: 'positive',
      });
    }
    return items;
  }, [executiveSummary, enphaseActiveCount, latestEnphaseLaunch]);

  // Build risk/threat bullets
  const risks = useMemo(() => {
    const items: { text: string; severity: 'high' | 'medium' | 'low' }[] = [];
    if (executiveSummary.competitorMaxPower > executiveSummary.enphaseMaxPower) {
      items.push({
        text: `Power gap: Competitor microinverters reach ${executiveSummary.competitorMaxPower}W per module vs Enphase's max ${executiveSummary.enphaseMaxPower}W per module`,
        severity: 'high',
      });
    }
    if (executiveSummary.chineseShare > 50) {
      items.push({
        text: `Chinese manufacturers hold ${executiveSummary.chineseShare.toFixed(0)}% of tracked competitor SKUs (${executiveSummary.chineseProductCount} products) — aggressive pricing pressure`,
        severity: 'high',
      });
    }
    if (executiveSummary.mostActiveMfr) {
      items.push({
        text: `Most active competitor: ${executiveSummary.mostActiveMfr[0]} with ${executiveSummary.mostActiveMfr[1]} events in 30 days`,
        severity: 'medium',
      });
    }
    if (competitorLaunches.length > 3) {
      items.push({
        text: `${competitorLaunches.length} competitor launches in 30 days from ${competitorMfgNames.length} manufacturers — accelerating market velocity`,
        severity: 'medium',
      });
    }
    if (executiveSummary.competitorOnlyCountries.length > 0) {
      items.push({
        text: `${executiveSummary.competitorOnlyCountries.length} markets where competitors are active but Enphase has no presence`,
        severity: 'low',
      });
    }
    return items;
  }, [executiveSummary, competitorLaunches, competitorMfgNames]);

  // Strategic recommendations
  const recommendations = useMemo(() => {
    const items: string[] = [];
    if (usCompetitorLaunches.length > 0) {
      items.push(`Monitor ${usCompetitorLaunches.length} new US competitor product${usCompetitorLaunches.length > 1 ? 's' : ''} for pricing and channel impact`);
    }
    if (executiveSummary.competitorMaxPower > executiveSummary.enphaseMaxPower) {
      items.push(`Evaluate high-power MI roadmap — competitors reaching ${executiveSummary.competitorMaxPower}W per module`);
    }
    if (executiveSummary.competitorOnlyCountries.length > 3) {
      const sample = executiveSummary.competitorOnlyCountries.slice(0, 3).join(', ');
      items.push(`Assess market entry for ${executiveSummary.competitorOnlyCountries.length} untapped countries (${sample}...)`);
    }
    if (directCompetitorChanges.length > 0) {
      items.push(`Review ${directCompetitorChanges.length} spec changes from direct US competitors for positioning impact`);
    }
    items.push(`Track ${executiveSummary.topCompetitors[0]?.[0] || 'top competitor'} (${executiveSummary.topCompetitors[0]?.[1] || 0} SKUs) — largest product portfolio threat`);
    return items;
  }, [executiveSummary, usCompetitorLaunches, directCompetitorChanges]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-8 border-t-4 border-t-enphase-500">
        <p className="text-[11px] font-semibold text-enphase-500 tracking-wider mb-3">MICROINVERTER MARKET INTELLIGENCE</p>
        <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight">Dashboard — {currentMonth}</h1>
        <p className="text-sm text-gray-500 mt-2">Executive summary, competitive intelligence, and strategic takeaways</p>
      </div>

      <div className="px-8 py-8 space-y-8 max-w-[1600px]">

      {/* ═══ EXECUTIVE DOSSIER ═══ */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="rounded-2xl border-2 border-enphase-200 bg-gradient-to-br from-enphase-50/40 to-white overflow-hidden">
          <div className="px-6 py-4 bg-enphase-500 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-white" />
              <h2 className="text-base font-bold text-white tracking-wide">Executive Intelligence Dossier</h2>
            </div>
            <span className="text-[11px] font-medium text-enphase-100 bg-enphase-600 px-3 py-1 rounded-full">
              Updated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-3 divide-x divide-enphase-100">
            {/* Highlights & Key Wins */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Highlights & Key Wins</h3>
              </div>
              <div className="space-y-3">
                {highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <ArrowUpRight className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[13px] text-gray-700 leading-relaxed">{h.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Radar & Threats */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Risk Radar & Threats</h3>
              </div>
              <div className="space-y-3">
                {risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                      r.severity === 'high' ? 'bg-red-500' : r.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-400'
                    }`} />
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider mr-1.5 ${
                        r.severity === 'high' ? 'text-red-500' : r.severity === 'medium' ? 'text-amber-500' : 'text-blue-400'
                      }`}>{r.severity}</span>
                      <span className="text-[13px] text-gray-700 leading-relaxed">{r.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Strategic Recommendations</h3>
              </div>
              <div className="space-y-3">
                {recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-[13px] text-gray-700 leading-relaxed">{r}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ SALESFORCE-STYLE KPI GRID — 2 rows of metric cards ═══ */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {/* Row 1 */}
        <div className="grid grid-cols-4 gap-[1px] bg-gray-200 rounded-xl overflow-hidden mb-[1px]">
          {[
            { label: 'Products Tracked', value: totalProducts, sub: `${manufacturers.length} manufacturers`, color: '#8B5CF6', href: '/search', trend: null },
            { label: 'Enphase Active SKUs', value: enphaseActiveCount, sub: `IQ7 · IQ8 · IQ9 series`, color: '#FF6900', href: '/search?manufacturer=Enphase+Energy', trend: 'up' as const },
            { label: 'Competitor Launches (30d)', value: competitorLaunches.length, sub: competitorMfgNames.slice(0, 3).join(', ') || 'None', color: '#F59E0B', href: '/changes', trend: competitorLaunches.length > 3 ? 'up' : null },
            { label: 'Market Reach', value: executiveSummary.enphaseCountries, sub: 'countries with Enphase presence', color: '#3B82F6', href: '/manufacturers', trend: 'up' as const },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white p-5 relative" style={{ borderTop: `3px solid ${kpi.color}` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{kpi.label}</span>
                <Link href={kpi.href} className="text-gray-300 hover:text-enphase-500 transition-colors"><ExternalLink className="w-3.5 h-3.5" /></Link>
              </div>
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-[32px] font-bold text-gray-900 leading-none">{kpi.value}</span>
                {kpi.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500" />}
              </div>
              <p className="text-[12px] text-gray-400">{kpi.sub}</p>
            </div>
          ))}
        </div>
        {/* Row 2 */}
        <div className="grid grid-cols-4 gap-[1px] bg-gray-200 rounded-xl overflow-hidden">
          {[
            { label: 'Enphase Efficiency', value: `${executiveSummary.enphaseAvgEff.toFixed(1)}%`, sub: `vs ${executiveSummary.competitorAvgEff.toFixed(1)}% competitor avg`, color: '#10B981', href: '/compare', trend: executiveSummary.enphaseAvgEff >= executiveSummary.competitorAvgEff ? 'up' as const : 'down' as const },
            { label: 'Max Power / Module', value: `${executiveSummary.enphaseMaxPower}W`, sub: `vs ${executiveSummary.competitorMaxPower}W competitor max`, color: '#8B5CF6', href: '/compare', trend: executiveSummary.enphaseMaxPower >= executiveSummary.competitorMaxPower ? 'up' as const : 'down' as const },
            { label: 'Warranty (avg)', value: `${executiveSummary.enphaseAvgWarranty.toFixed(0)} yrs`, sub: `vs ${executiveSummary.competitorAvgWarranty.toFixed(0)} yrs competitor avg`, color: '#F59E0B', href: '/search', trend: executiveSummary.enphaseAvgWarranty >= executiveSummary.competitorAvgWarranty ? 'up' as const : null },
            { label: 'Spec Changes (30d)', value: recentSpecChanges.length, sub: `${directCompetitorChanges.length} from US competitors`, color: '#EF4444', href: '/changes', trend: recentSpecChanges.length > 5 ? 'up' as const : null },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white p-5 relative" style={{ borderTop: `3px solid ${kpi.color}` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{kpi.label}</span>
                <Link href={kpi.href} className="text-gray-300 hover:text-enphase-500 transition-colors"><ExternalLink className="w-3.5 h-3.5" /></Link>
              </div>
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-[32px] font-bold text-gray-900 leading-none">{kpi.value}</span>
                {kpi.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500" />}
                {kpi.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
              </div>
              <p className="text-[12px] text-gray-400">{kpi.sub}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ MIDDLE SECTION: Donut Chart + Recent Activity ═══ */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="grid grid-cols-3 gap-5">
          {/* Donut Chart — Products by Manufacturer */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Products by Manufacturer</h3>
              <Link href="/manufacturers" className="text-[12px] text-enphase-500 hover:text-enphase-600 font-medium">View Report →</Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-[160px] h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={72}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((_, idx) => (
                        <Cell key={idx} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} SKUs`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-gray-900">{totalProducts}</span>
                  <span className="text-[10px] text-gray-400">Total</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {donutData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      <span className="text-gray-700">{d.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Competitor Launches */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-enphase-500" /> New Products
              </h3>
              <Link href="/changes" className="text-[12px] text-enphase-500 hover:text-enphase-600 font-medium">View Report →</Link>
            </div>
            <div className="space-y-1.5">
              {recentLaunchEvents.map(e => (
                <Link key={e.id} href={`/changes?highlight=${e.id}`} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-enphase-50 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-enphase-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold truncate text-gray-900 group-hover:text-enphase-600">{e.productName.split('(')[0].trim()}</div>
                      <div className="text-[11px] text-gray-400">{e.manufacturer}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">{new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Spec Changes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> Spec Changes
              </h3>
              <Link href="/changes" className="text-[12px] text-enphase-500 hover:text-enphase-600 font-medium">View Report →</Link>
            </div>
            <div className="space-y-1.5">
              {recentChangeEvents_list.map(e => (
                <Link key={e.id} href={`/changes?highlight=${e.id}`} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${e.type === 'SPEC_CHANGE' ? 'bg-amber-500' : e.type === 'PRICE_CHANGE' ? 'bg-emerald-500' : e.type === 'DISCONTINUATION' ? 'bg-red-500' : 'bg-gray-400'}`} />
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold truncate text-gray-900 group-hover:text-blue-600">{e.productName.split('(')[0].trim()}</div>
                      <div className="text-[11px] text-gray-400">{e.manufacturer} · {e.type.replace(/_/g, ' ').toLowerCase()}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">{new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ EVENT LOG TABLE — Salesforce Bug Status style ═══ */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Recent Market Events</h3>
            <Link href="/changes" className="text-[12px] text-enphase-500 hover:text-enphase-600 font-medium">View All Events →</Link>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-5 py-2.5">Severity</th>
                <th className="px-5 py-2.5">Product</th>
                <th className="px-5 py-2.5">Manufacturer</th>
                <th className="px-5 py-2.5">Type</th>
                <th className="px-5 py-2.5">Date</th>
                <th className="px-5 py-2.5">Region</th>
                <th className="px-5 py-2.5">Description</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.slice(0, 8).map((e) => (
                <Link key={e.id} href={`/changes?highlight=${e.id}`}>
                  <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors text-[12px] cursor-pointer">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        e.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        e.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                        e.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>{e.severity}</span>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900 max-w-[200px] truncate">{e.productName.split('(')[0].trim()}</td>
                    <td className="px-5 py-3 text-gray-600">{e.manufacturer}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-medium ${
                        e.type === 'NEW_PRODUCT' ? 'text-green-600' :
                        e.type === 'SPEC_CHANGE' ? 'text-amber-600' :
                        e.type === 'DISCONTINUATION' ? 'text-red-600' :
                        'text-gray-500'
                      }`}>{e.type.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-5 py-3 text-gray-500">{e.region || e.country || '—'}</td>
                    <td className="px-5 py-3 text-gray-500 max-w-[300px] truncate">{e.description.split('.')[0]}</td>
                  </tr>
                </Link>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      </div>
    </motion.div>
  );
}
