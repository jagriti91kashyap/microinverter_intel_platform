'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { manufacturers, products, countries } from '@/data/comprehensive-data';
import { Card } from '@/components/ui/card';
import { ManufacturerMap } from '@/components/maps/manufacturer-map';
import { ChevronDown, ChevronUp, Map, Zap } from 'lucide-react';

const MFR_COLORS: Record<string, string> = {
  'Enphase Energy': 'bg-enphase-500',
  'Hoymiles': 'bg-blue-500',
  'APsystems': 'bg-emerald-500',
  'SolarEdge': 'bg-purple-500',
  'Huawei': 'bg-red-500',
  'Deye': 'bg-amber-500',
  'Tesla': 'bg-gray-800',
  'FoxESS': 'bg-teal-500',
};

function getMfrColor(name: string) {
  for (const [key, color] of Object.entries(MFR_COLORS)) {
    if (name.includes(key)) return color;
  }
  return 'bg-indigo-500';
}

export default function ManufacturersPage() {
  const router = useRouter();
  const [expandedMap, setExpandedMap] = useState<string | null>(null);
  const [mfrFilters, setMfrFilters] = useState<Record<string, { productType: string; series: string }>>({});

  const totalCountries = countries.length;

  const mfrStats = useMemo(() => {
    return manufacturers.map((m) => {
      const mfrProducts = products.filter((p) => p.manufacturerId === m.id);
      const countries = new Set<string>();
      mfrProducts.forEach((p) => p.countries.forEach((c) => countries.add(c)));
      const active = mfrProducts.filter((p) => p.status === 'ACTIVE').length;
      const avgConf = mfrProducts.length > 0
        ? (mfrProducts.reduce((s, p) => s + p.confidenceScore, 0) / mfrProducts.length * 100).toFixed(1)
        : '0.0';
      return {
        ...m,
        productCount: mfrProducts.length,
        countryCount: countries.size,
        activeCount: active,
        avgConfidence: avgConf,
        mfrProducts,
      };
    }).sort((a, b) => b.productCount - a.productCount);
  }, []);

  const getFilteredProducts = (mfrId: string, allProducts: typeof products) => {
    const filters = mfrFilters[mfrId];
    if (!filters) return allProducts;
    
    let filtered = allProducts;
    if (filters.productType) {
      filtered = filtered.filter(p => p.productType === filters.productType);
    }
    if (filters.series) {
      filtered = filtered.filter(p => p.series === filters.series);
    }
    return filtered;
  };

  const setMfrFilter = (mfrId: string, key: 'productType' | 'series', value: string) => {
    setMfrFilters(prev => ({
      ...prev,
      [mfrId]: {
        ...(prev[mfrId] || { productType: '', series: '' }),
        [key]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-8 border-t-4 border-t-enphase-500">
        <p className="text-[11px] font-semibold text-enphase-500 tracking-wider mb-3">{manufacturers.length} MANUFACTURERS · {totalCountries} COUNTRIES</p>
        <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight">Manufacturers</h1>
      </div>

      <div className="px-8 py-8 space-y-5">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{mfrStats.length} manufacturers</span> · sorted by product count
        </p>

        {/* Manufacturer list */}
        <div className="space-y-3">
          {mfrStats.map((m) => {
            const isEnphase = m.name === 'Enphase Energy';
            const isMapOpen = expandedMap === m.id;

            return (
              <Card
                key={m.id}
                className={`border-l-4 border transition-all rounded-2xl overflow-hidden ${
                  isEnphase
                    ? 'bg-enphase-50/30 border-l-enphase-500 border-enphase-200'
                    : 'bg-white border-l-gray-300 border-gray-200'
                } ${isMapOpen ? 'shadow-md' : 'hover:shadow-md'}`}
              >
                {/* Main row — click toggles map */}
                <div
                  className="flex items-center p-4 gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedMap(isMapOpen ? null : m.id)}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isEnphase ? 'ring-2 ring-enphase-200' : ''} ${getMfrColor(m.name)}`}>
                    <Zap className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-base text-gray-900">
                      {m.name}
                      {isEnphase && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-enphase-500 text-white rounded uppercase tracking-wide">Enphase</span>}
                    </div>
                    <div className="text-sm text-gray-600 mt-0.5">
                      {m.country} · Est. {m.foundedYear}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 line-clamp-1">{m.description}</div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-5 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-medium">{m.productCount}</div>
                      <div className="text-xs text-gray-400">Products</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">{m.activeCount}</div>
                      <div className="text-xs text-gray-400">Active</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{m.avgConfidence}%</div>
                      <div className="text-xs text-gray-400">AI Conf</div>
                    </div>

                    {/* Map toggle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedMap(isMapOpen ? null : m.id); }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isMapOpen
                          ? 'bg-enphase-50 border-enphase-300 text-enphase-600'
                          : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                      }`}
                      title={isMapOpen ? 'Hide map' : 'Show coverage map'}
                    >
                      <Map className="w-3.5 h-3.5" />
                      {isMapOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible map section */}
                {isMapOpen && (
                  <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-3 space-y-3">
                    {/* Filters */}
                    <div className="flex items-center gap-2">
                      <select
                        value={mfrFilters[m.id]?.productType || ''}
                        onChange={(e) => setMfrFilter(m.id, 'productType', e.target.value)}
                        className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white hover:border-gray-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="">All Product Types</option>
                        {Array.from(new Set(m.mfrProducts.map(p => p.productType))).sort().map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>

                      <select
                        value={mfrFilters[m.id]?.series || ''}
                        onChange={(e) => setMfrFilter(m.id, 'series', e.target.value)}
                        className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white hover:border-gray-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="">All Series</option>
                        {Array.from(new Set(m.mfrProducts.map(p => p.series))).sort().map(series => (
                          <option key={series} value={series}>{series}</option>
                        ))}
                      </select>

                      {(mfrFilters[m.id]?.productType || mfrFilters[m.id]?.series) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setMfrFilters(prev => ({ ...prev, [m.id]: { productType: '', series: '' } })); }}
                          className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <ManufacturerMap products={getFilteredProducts(m.id, m.mfrProducts)} manufacturerName={m.name} compact />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
