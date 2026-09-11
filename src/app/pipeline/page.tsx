'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Globe, FileText, Cpu, Database, CheckCircle, AlertTriangle, Clock, Play, RefreshCw, Download, Layers, Zap, Search, Languages, ExternalLink } from 'lucide-react';
import { crawlJobs, products, manufacturers } from '@/data/comprehensive-data';

const LANGUAGE_NAMES: Record<string, string> = {
  'en': 'English', 'de': 'German', 'fr': 'French', 'es': 'Spanish', 'it': 'Italian',
  'nl': 'Dutch', 'pl': 'Polish', 'ja': 'Japanese', 'ko': 'Korean', 'zh-CN': 'Chinese', 'pt-BR': 'Portuguese'
};

export default function PipelinePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'crawl' | 'multilang' | 'extract' | 'normalize' | 'dedup' | 'summary'>('overview');
  const [crawlingMfg, setCrawlingMfg] = useState<string | null>(null);
  const [crawlResults, setCrawlResults] = useState<Record<string, { status: string; pages: number; products: number }>>({});

  const stats = useMemo(() => ({
    totalCrawls: crawlJobs.length,
    completedCrawls: crawlJobs.filter(j => j.status === 'COMPLETED').length,
    runningCrawls: crawlJobs.filter(j => j.status === 'RUNNING').length,
    totalPages: crawlJobs.reduce((s, j) => s + j.pagesProcessed, 0),
    totalDatasheets: crawlJobs.reduce((s, j) => s + j.datasheetsFound, 0),
    totalProducts: products.length,
    totalSpecs: products.reduce((s, p) => s + p.specifications.length, 0),
    duplicatesDetected: 12,
    summariesGenerated: products.filter(p => p.aiSummary).length,
    avgConfidence: (products.reduce((s, p) => s + p.confidenceScore, 0) / products.length * 100).toFixed(1),
  }), []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200 px-8 py-8 border-t-4 border-t-enphase-500">
        <p className="text-[11px] font-semibold text-enphase-500 tracking-wider mb-3">AUTOMATED DATA COLLECTION</p>
        <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight">AI Pipeline</h1>
        <p className="text-[13px] text-gray-500 mt-1">Automatically crawl, download, extract, normalize, deduplicate, and summarize microinverter data</p>
      </div>

      <div className="px-8 py-8 space-y-5">

      {/* Pipeline Stages */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {([
          { key: 'overview', label: 'Overview', icon: Layers },
          { key: 'crawl', label: 'Crawl', icon: Globe },
          { key: 'multilang', label: 'Multi-Lang', icon: Languages },
          { key: 'extract', label: 'Extract', icon: FileText },
          { key: 'normalize', label: 'Normalize', icon: RefreshCw },
          { key: 'dedup', label: 'Deduplicate', icon: Search },
          { key: 'summary', label: 'Summarize', icon: Bot },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <tab.icon className="w-3.5 h-3.5" />{tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <>
          <div className="grid gap-4 grid-cols-5">
            {[
              { label: 'Crawl Jobs', value: stats.totalCrawls, sub: `${stats.completedCrawls} completed`, icon: Globe, color: 'bg-blue-500' },
              { label: 'Pages Processed', value: stats.totalPages, sub: `${stats.totalDatasheets} datasheets`, icon: FileText, color: 'bg-purple-500' },
              { label: 'Specs Extracted', value: stats.totalSpecs, sub: `${stats.totalProducts} products`, icon: Cpu, color: 'bg-emerald-500' },
              { label: 'Duplicates Found', value: stats.duplicatesDetected, sub: 'Auto-resolved', icon: Database, color: 'bg-amber-500' },
              { label: 'AI Summaries', value: stats.summariesGenerated, sub: `${stats.avgConfidence}% avg confidence`, icon: Bot, color: 'bg-enphase-500' },
            ].map(s => (
              <div key={s.label} className="p-5 bg-white rounded-xl border border-gray-300 border-l-4" style={{ borderLeftColor: s.color === 'bg-blue-500' ? '#3B82F6' : s.color === 'bg-purple-500' ? '#8B5CF6' : s.color === 'bg-emerald-500' ? '#10B981' : s.color === 'bg-amber-500' ? '#F59E0B' : '#F26322' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                  <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center`}><s.icon className="w-4 h-4 text-white" /></div>
                </div>
                <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Pipeline Flow */}
          <div className="p-6 bg-white rounded-xl border border-gray-300 border-l-4 border-l-emerald-500">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Pipeline Flow</h2>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {[
                { label: 'Crawl Websites', desc: `${manufacturers.length} sources`, status: 'active', icon: Globe },
                { label: 'Download Datasheets', desc: `${stats.totalDatasheets} found`, status: 'active', icon: Download },
                { label: 'Extract Specs', desc: `${stats.totalSpecs} extracted`, status: 'active', icon: Cpu },
                { label: 'Normalize Units', desc: 'Auto-conversion', status: 'active', icon: RefreshCw },
                { label: 'Detect Duplicates', desc: `${stats.duplicatesDetected} found`, status: 'active', icon: Search },
                { label: 'Generate Summaries', desc: `${stats.summariesGenerated} generated`, status: 'active', icon: Bot },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${step.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <step.icon className={`w-5 h-5 ${step.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-xs font-medium">{step.label}</div>
                    <div className="text-xs text-muted-foreground">{step.desc}</div>
                  </div>
                  {i < 5 && <div className="w-8 h-px bg-gray-300 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Crawl Jobs */}
      {activeTab === 'crawl' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Crawl Jobs</h2>
            <Button size="sm"><Play className="w-4 h-4 mr-1" />Start New Crawl</Button>
          </div>
          {crawlJobs.map(job => (
            <div key={job.id} className="p-4 bg-white rounded-xl border border-gray-300 border-l-4 border-l-blue-400">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${job.status === 'COMPLETED' ? 'bg-green-100' : job.status === 'RUNNING' ? 'bg-blue-100' : job.status === 'FAILED' ? 'bg-red-100' : 'bg-gray-100'}`}>
                    {job.status === 'COMPLETED' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                     job.status === 'RUNNING' ? <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" /> :
                     job.status === 'FAILED' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
                     <Clock className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{job.manufacturer}</div>
                    <div className="text-xs text-muted-foreground">{job.url}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{job.pagesProcessed} pages</span>
                  <span>{job.datasheetsFound} datasheets</span>
                  <span>{job.productsFound} products</span>
                  <Badge variant={job.status === 'COMPLETED' ? 'default' : job.status === 'RUNNING' ? 'secondary' : 'destructive'} className="text-xs">{job.status}</Badge>
                  <span>{new Date(job.startTime).toLocaleDateString()}</span>
                </div>
              </div>
              {job.status === 'RUNNING' && (
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(job.pagesProcessed / (job.pagesProcessed + 10)) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Multi-Language Crawl */}
      {activeTab === 'multilang' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Multi-Language Crawler</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Discover and extract localized content from regional manufacturer websites</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{manufacturers.filter(m => m.regionalWebsites?.length).length} manufacturers</Badge>
              <Badge variant="outline" className="text-xs">{manufacturers.reduce((s, m) => s + (m.regionalWebsites?.length || 0), 0)} regional sites</Badge>
            </div>
          </div>

          <div className="grid gap-3">
            {manufacturers.filter(m => m.regionalWebsites?.length).map(mfg => {
              const isRunning = crawlingMfg === mfg.id;
              const result = crawlResults[mfg.id];
              
              const simulateCrawl = () => {
                setCrawlingMfg(mfg.id);
                setCrawlResults(prev => ({ ...prev, [mfg.id]: { status: 'running', pages: 0, products: 0 } }));
                
                let pages = 0;
                const interval = setInterval(() => {
                  pages += Math.floor(Math.random() * 3) + 1;
                  setCrawlResults(prev => ({ ...prev, [mfg.id]: { status: 'running', pages, products: Math.floor(pages / 2) } }));
                }, 500);
                
                setTimeout(() => {
                  clearInterval(interval);
                  const finalPages = pages + Math.floor(Math.random() * 5);
                  setCrawlResults(prev => ({ ...prev, [mfg.id]: { status: 'completed', pages: finalPages, products: Math.floor(finalPages / 2) } }));
                  setCrawlingMfg(null);
                }, 3000);
              };

              return (
                <div key={mfg.id} className="p-4 bg-white rounded-xl border border-gray-300 border-l-4 border-l-purple-400">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${result?.status === 'completed' ? 'bg-green-100' : isRunning ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {result?.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                         isRunning ? <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" /> :
                         <Languages className="w-5 h-5 text-gray-500" />}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{mfg.name}</div>
                        <div className="text-xs text-muted-foreground">{mfg.regionalWebsites?.length} regional sites • {mfg.country}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result && (
                        <div className="text-xs text-muted-foreground mr-2">
                          {result.pages} pages • {result.products} products
                        </div>
                      )}
                      <Button size="sm" variant={result?.status === 'completed' ? 'outline' : 'default'} disabled={isRunning} onClick={simulateCrawl}>
                        {isRunning ? <><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Crawling...</> :
                         result?.status === 'completed' ? <><RefreshCw className="w-3 h-3 mr-1" />Re-crawl</> :
                         <><Play className="w-3 h-3 mr-1" />Start Crawl</>}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {mfg.regionalWebsites?.map((site, i) => (
                      <a key={i} href={site.url} target="_blank" rel="noopener noreferrer" 
                         className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors">
                        <span className="font-medium">{site.language.toUpperCase()}</span>
                        <span className="text-muted-foreground">• {site.country}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </a>
                    ))}
                  </div>
                  
                  {isRunning && (
                    <div className="mt-3">
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all animate-pulse" style={{ width: '60%' }} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Discovering regional content and translating to English...</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-white rounded-xl border border-gray-300 border-l-4 border-l-enphase-500">
            <div className="flex items-start gap-3">
              <Bot className="w-5 h-5 text-enphase-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm">AI Translation Pipeline</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Content extracted from regional sites is automatically translated to English using GPT-4o-mini. 
                  Technical terms, model numbers, and specifications are preserved exactly as they appear in the source.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                    <Badge key={code} variant="outline" className="text-xs">{name}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extract */}
      {activeTab === 'extract' && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Specification Extraction</h2>
          <div className="grid gap-3 grid-cols-3">
            {products.slice(0, 9).map(p => (
              <div key={p.id} className="p-4 bg-white rounded-xl border border-gray-300 border-l-4 border-l-emerald-400">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-gray-500" />
                  <div className="text-sm font-medium truncate">{p.name}</div>
                </div>
                <div className="space-y-1.5">
                  {p.specifications.slice(0, 4).map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{s.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{s.value} {s.unit}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.confidence > 0.9 ? 'bg-green-500' : s.confidence > 0.7 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      </div>
                    </div>
                  ))}
                  {p.specifications.length > 4 && <div className="text-xs text-muted-foreground">+{p.specifications.length - 4} more specs</div>}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Source: {p.sourceUrl ? 'Official' : 'Datasheet'}</span>
                  <span className="text-muted-foreground">Confidence: {(p.confidenceScore * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Normalize */}
      {activeTab === 'normalize' && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Unit Normalization</h2>
          <div className="p-6 bg-white rounded-xl border border-gray-300 border-l-4 border-l-amber-500">
            <p className="text-sm text-muted-foreground mb-4">All extracted specifications are normalized to standard units for accurate comparison.</p>
            <div className="grid gap-2 grid-cols-2">
              {[
                { from: 'kW, W, mW', to: 'W (Watts)', example: '0.3kW → 300W' },
                { from: 'kg, g, lbs', to: 'kg (Kilograms)', example: '2.5 lbs → 1.13 kg' },
                { from: 'mm, cm, in', to: 'mm (Millimeters)', example: '12.5 cm → 125 mm' },
                { from: '°C, °F', to: '°C (Celsius)', example: '140°F → 60°C' },
                { from: 'V, kV', to: 'V (Volts)', example: '0.24 kV → 240V' },
                { from: 'A, mA', to: 'A (Amperes)', example: '12500 mA → 12.5A' },
              ].map(n => (
                <div key={n.to} className="flex items-center justify-between p-3 rounded border border-gray-100 text-sm">
                  <div><div className="font-medium">{n.from}</div><div className="text-xs text-muted-foreground">→ {n.to}</div></div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{n.example}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Deduplicate */}
      {activeTab === 'dedup' && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Duplicate Detection</h2>
          <div className="p-6 bg-white rounded-xl border border-gray-300 border-l-4 border-l-blue-500">
            <p className="text-sm text-muted-foreground mb-4">AI-powered deduplication identifies products listed under different names or with minor variations.</p>
            <div className="space-y-3">
              {[
                { group: ['IQ8M-72-2-US', 'IQ8M Microinverter 72-cell'], confidence: 0.95, action: 'Merged' },
                { group: ['YC600 (US)', 'YC600-NA'], confidence: 0.92, action: 'Merged' },
                { group: ['HMS-2000-4T (EU)', 'HMS-2000-4T Europe'], confidence: 0.88, action: 'Flagged' },
              ].map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded border border-gray-100">
                  <div>
                    <div className="text-sm font-medium">{d.group.join(' ↔ ')}</div>
                    <div className="text-xs text-muted-foreground">Similarity: {(d.confidence * 100).toFixed(0)}%</div>
                  </div>
                  <Badge variant={d.action === 'Merged' ? 'default' : 'secondary'} className="text-xs">{d.action}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">AI Summaries</h2>
          <p className="text-sm text-muted-foreground">Concise factual summaries generated for each product with source citations and confidence scores.</p>
          <div className="space-y-3">
            {products.slice(0, 6).map(p => (
              <div key={p.id} className="p-4 bg-white rounded-xl border border-gray-300 border-l-4 border-l-enphase-500">
                <div className="flex items-start gap-3">
                  <Bot className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{p.name}</div>
                    <p className="text-sm text-muted-foreground mt-1">{p.aiSummary}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>Confidence: <span className="font-medium">{(p.confidenceScore * 100).toFixed(0)}%</span></span>
                      {p.sourceUrl && <span>Source: <a href={p.sourceUrl} className="text-enphase-500 hover:text-enphase-600">{p.sourceUrl.split('/')[2]}</a></span>}
                      {p.extractionDate && <span>Extracted: {new Date(p.extractionDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </motion.div>
  );
}
