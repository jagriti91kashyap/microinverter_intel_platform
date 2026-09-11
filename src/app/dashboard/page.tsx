'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Zap, Globe, Activity, 
  Clock, FileText, Cpu, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { products, manufacturers, changeEvents } from '@/data/comprehensive-data';
export default function Dashboard() {

  // Core counts
  const totalProducts = products.length;
  const totalCountries = [...new Set(products.flatMap(p => p.countries))].length;
  const enphaseActiveCount = products.filter(p => p.manufacturer.name === 'Enphase Energy' && p.status === 'ACTIVE').length;

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

  // Derive product type from event product name/description
  const getProductType = (e: typeof changeEvents[0]): string => {
    const name = (e.productName + ' ' + e.description).toLowerCase();
    if (name.includes('battery') || name.includes('storage') || name.includes('ess') || name.includes('powerwall')) return 'Storage & Batteries';
    if (name.includes('optimizer') || name.includes('ts4') || name.includes('power optimizer')) return 'Power Optimizers';
    if (name.includes('hybrid') || name.includes('gen24') || name.includes('sunny boy') || name.includes('sun2000') || name.includes('h3') || name.includes('h1-')) return 'Hybrid Inverters';
    if (name.includes('string inverter') || name.includes('grid-tied inverter') || name.includes('t-g3') || name.includes('t3.0') || name.includes('se3000') || name.includes('hd-wave')) return 'String Inverters';
    if (name.includes('ac module') || name.includes('q.peak')) return 'AC Modules';
    if (name.includes('meter') || name.includes('gateway') || name.includes('apmeter')) return 'Accessories';
    return 'Microinverters';
  };

  // Market news split by product type and region
  const recentCompetitorNews = useMemo(() =>
    sortedEvents.filter(e => e.manufacturer !== 'Enphase Energy').slice(0, 20),
  [sortedEvents]);

  const newsByProductType = useMemo(() => {
    const grouped: Record<string, typeof changeEvents> = {};
    recentCompetitorNews.forEach(e => {
      const type = getProductType(e);
      if (!grouped[type]) grouped[type] = [];
      if (grouped[type].length < 2) grouped[type].push(e);
    });
    return grouped;
  }, [recentCompetitorNews]);

  const newsByRegion = useMemo(() => {
    const regionOrder = ['North America', 'Europe', 'Asia Pacific', 'Global'];
    const grouped: Record<string, typeof changeEvents> = {};
    recentCompetitorNews.forEach(e => {
      const region = e.region && regionOrder.includes(e.region) ? e.region : 'Global';
      if (!grouped[region]) grouped[region] = [];
      if (grouped[region].length < 2) grouped[region].push(e);
    });
    // Return in defined order
    const ordered: Record<string, typeof changeEvents> = {};
    regionOrder.forEach(r => { if (grouped[r]) ordered[r] = grouped[r]; });
    return ordered;
  }, [recentCompetitorNews]);

  // Recent launch events for bottom list
  const recentLaunchEvents = useMemo(() =>
    sortedEvents.filter(e => e.type === 'NEW_PRODUCT').slice(0, 5),
  [sortedEvents]);

  // Recent non-launch events for bottom list
  const recentChangeEvents = useMemo(() =>
    sortedEvents.filter(e => e.type !== 'NEW_PRODUCT').slice(0, 5),
  [sortedEvents]);

  // Enphase latest launch
  const latestEnphaseLaunch = useMemo(() =>
    sortedEvents.find(e => e.manufacturer === 'Enphase Energy' && e.type === 'NEW_PRODUCT'),
  [sortedEvents]);

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Track expanded news card descriptions
  const [expandedNews, setExpandedNews] = useState<Set<string>>(new Set());
  const toggleNewsExpand = (id: string) => {
    setExpandedNews(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Insight banner data
  const insightBannerText = useMemo(() => {
    const parts: string[] = [];
    if (usCompetitorLaunches.length > 0) {
      parts.push(`${usCompetitorLaunches.length} competitor${usCompetitorLaunches.length !== 1 ? 's' : ''} launched in your core US market this month`);
    }
    if (directCompetitorChanges.length > 0) {
      parts.push(`${directCompetitorChanges.length} spec change${directCompetitorChanges.length !== 1 ? 's' : ''} from direct US competitors`);
    }
    if (competitorLaunches.length > 0 && usCompetitorLaunches.length === 0) {
      parts.push(`${competitorLaunches.length} new competitor product${competitorLaunches.length !== 1 ? 's' : ''} globally in last 30 days`);
    }
    return parts;
  }, [usCompetitorLaunches, directCompetitorChanges, competitorLaunches]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-8 border-t-4 border-t-enphase-500">
        <p className="text-[11px] font-semibold text-enphase-500 tracking-wider mb-3">MICROINVERTER MARKET INTELLIGENCE</p>
        <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight">Dashboard — {currentMonth}</h1>
      </div>

      <div className="px-8 py-8 space-y-8 max-w-[1600px]">

      {/* KPI Cards — promoted to top as most decision-relevant content */}
      <div className="grid gap-4 grid-cols-4">
        {[
          { label: 'Products tracked', value: totalProducts, sub: `${manufacturers.length} manufacturers · ${totalCountries} countries`, detail: `${changeEvents.length} events tracked since Jan 2024`, icon: Package, borderColor: '#8B5CF6' },
          { label: 'Competitor launches (30d)', value: competitorLaunches.length, sub: competitorMfgNames.slice(0, 4).join(' · ') || 'No recent launches', detail: `${usCompetitorLaunches.length} in Enphase's core US market`, icon: Zap, borderColor: '#F59E0B' },
          { label: 'Enphase active SKUs', value: enphaseActiveCount, sub: `IQ8 · IQ9 · IQ Battery lines`, detail: latestEnphaseLaunch ? `✓ ${latestEnphaseLaunch.productName.split('(')[0].trim()} · ${new Date(latestEnphaseLaunch.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : '', icon: Activity, borderColor: '#10B981' },
          { label: 'Spec changes (30d)', value: recentSpecChanges.length, sub: `${changeEvents.length} tracked since Jan 2024`, detail: `↑ ${directCompetitorChanges.length} from direct US competitors`, icon: FileText, borderColor: '#EF4444' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div 
              className="p-5 bg-white rounded-xl border border-gray-300 hover:shadow-md transition-all"
              style={{ borderLeft: `4px solid ${kpi.borderColor}` }}
            >
              <div className="mb-3">
                <span className="text-[13px] font-medium text-gray-500">{kpi.label}</span>
              </div>
              <div className="text-[36px] font-bold text-gray-900 leading-none mb-3">{kpi.value}</div>
              <p className="text-sm text-gray-700 mb-2 leading-relaxed">{kpi.sub}</p>
              <p className="text-[13px] text-gray-600 leading-relaxed">{kpi.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Insight Callout Banner */}
      {insightBannerText.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="flex items-start gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900 mb-1">Competitive Insight</p>
              <div className="space-y-0.5">
                {insightBannerText.map((text, i) => (
                  <p key={i} className="text-[13px] text-amber-800 leading-relaxed">{text}</p>
                ))}
              </div>
            </div>
            <Link href="/changes" className="text-[13px] text-amber-700 hover:text-amber-900 font-semibold whitespace-nowrap flex-shrink-0 mt-0.5">View details →</Link>
          </div>
        </motion.div>
      )}

      {/* Market News — By Product Type & Region */}
      <div className="grid gap-5 grid-cols-2">
        {/* By Product Type */}
        <div className="p-5 bg-white rounded-xl border border-gray-300 border-l-4 border-l-amber-400">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-500" /> Market News by Product Type
          </h2>
          <div className="space-y-3">
            {Object.entries(newsByProductType).map(([type, events]) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{type}</span>
                  <span className="text-[11px] text-gray-300">·</span>
                  <span className="text-[11px] text-gray-400">{events.length} update{events.length !== 1 ? 's' : ''}</span>
                </div>
                {events.map(e => {
                  const fullDesc = e.description;
                  const firstSentence = fullDesc.split('.')[0] + '.';
                  const hasMore = fullDesc.length > firstSentence.length + 2;
                  const isExpanded = expandedNews.has(e.id);
                  return (
                    <div key={e.id} className="flex items-start gap-2.5 py-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                      <div className="min-w-0">
                        <span className="text-[13px] text-gray-700">{isExpanded ? fullDesc : firstSentence}</span>
                        {hasMore && (
                          <button onClick={() => toggleNewsExpand(e.id)} className="text-[12px] text-enphase-500 hover:text-enphase-600 font-medium ml-1 inline-flex items-center gap-0.5">
                            {isExpanded ? <>Less <ChevronUp className="w-3 h-3" /></> : <>Read more <ChevronDown className="w-3 h-3" /></>}
                          </button>
                        )}
                        <span className="text-[12px] text-gray-400 ml-1.5">{new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* By Region */}
        <div className="p-5 bg-white rounded-xl border border-gray-300 border-l-4 border-l-blue-400">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" /> Market News by Region
          </h2>
          <div className="space-y-3">
            {Object.entries(newsByRegion).map(([region, events]) => (
              <div key={region}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{region}</span>
                  <span className="text-[11px] text-gray-300">·</span>
                  <span className="text-[11px] text-gray-400">{events.length} update{events.length !== 1 ? 's' : ''}</span>
                </div>
                {events.map(e => {
                  const fullDesc = e.description;
                  const firstSentence = fullDesc.split('.')[0] + '.';
                  const hasMore = fullDesc.length > firstSentence.length + 2;
                  const isExpanded = expandedNews.has(e.id);
                  return (
                    <div key={e.id} className="flex items-start gap-2.5 py-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                      <div className="min-w-0">
                        <span className="text-[13px] text-gray-700">{isExpanded ? fullDesc : firstSentence}</span>
                        {hasMore && (
                          <button onClick={() => toggleNewsExpand(e.id)} className="text-[12px] text-enphase-500 hover:text-enphase-600 font-medium ml-1 inline-flex items-center gap-0.5">
                            {isExpanded ? <>Less <ChevronUp className="w-3 h-3" /></> : <>Read more <ChevronDown className="w-3 h-3" /></>}
                          </button>
                        )}
                        <span className="text-[12px] text-gray-400 ml-1.5">{e.manufacturer} · {new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 grid-cols-2">
        {/* Competitor Activity — Last 30 Days */}
        <div className="p-6 bg-white rounded-xl border border-gray-300 border-l-4 border-l-enphase-500">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-enphase-500" /> Competitor Activity — Last 30 Days
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold">{competitorLaunches.length} new products</span> — {usCompetitorLaunches.length} directly in Enphase's US market.
              </p>
            </div>
            <Link href="/changes" className="text-[13px] text-enphase-500 hover:text-enphase-600 font-medium whitespace-nowrap">View all →</Link>
          </div>
          <div className="space-y-2.5">
            {recentLaunchEvents.map(e => {
              const fullDesc = e.description;
              const firstSentence = fullDesc.split('.')[0] + '.';
              const hasMore = fullDesc.length > firstSentence.length + 2;
              const isExpanded = expandedNews.has(`launch-${e.id}`);
              return (
                <div key={e.id} className="p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-enphase-500 flex-shrink-0" />
                      <div className="text-sm font-semibold truncate text-gray-900">{e.productName}</div>
                    </div>
                    <span className="text-[13px] text-gray-500 font-medium flex-shrink-0 ml-4">{new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="ml-5 mt-1">
                    <span className="text-[13px] text-gray-500">{isExpanded ? fullDesc : firstSentence}</span>
                    {hasMore && (
                      <button onClick={() => toggleNewsExpand(`launch-${e.id}`)} className="text-[12px] text-enphase-500 hover:text-enphase-600 font-medium ml-1 inline-flex items-center gap-0.5">
                        {isExpanded ? <>Less <ChevronUp className="w-3 h-3" /></> : <>Read more <ChevronDown className="w-3 h-3" /></>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Spec & Product Changes */}
        <div className="p-6 bg-white rounded-xl border border-gray-300 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" /> Spec & Product Changes
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold">{recentSpecChanges.length} changes in last 30 days</span> — {directCompetitorChanges.length} from direct US competitors.
              </p>
            </div>
            <Link href="/changes" className="text-[13px] text-enphase-500 hover:text-enphase-600 font-medium whitespace-nowrap">View all →</Link>
          </div>
          <div className="space-y-2.5">
            {recentChangeEvents.map(e => (
              <div key={e.id} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${e.type === 'SPEC_CHANGE' ? 'bg-amber-500' : e.type === 'PRICE_CHANGE' ? 'bg-emerald-500' : e.type === 'DISCONTINUATION' ? 'bg-red-500' : 'bg-gray-400'}`} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate text-gray-900">{e.productName}</div>
                    <div className="text-[13px] text-gray-500 mt-0.5">{e.manufacturer} · {e.type.replace(/_/g, ' ').toLowerCase()}</div>
                  </div>
                </div>
                <span className="text-[13px] text-gray-500 flex-shrink-0 font-medium ml-4">{new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
}
