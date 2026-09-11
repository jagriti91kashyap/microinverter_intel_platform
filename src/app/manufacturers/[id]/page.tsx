'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { manufacturers, products } from '@/data/comprehensive-data';
import { ManufacturerMap } from '@/components/maps/manufacturer-map';
import { ArrowLeft, Globe, MapPin, Calendar, Package, ExternalLink, ChevronDown, ChevronUp, Zap, ShieldCheck, TrendingUp } from 'lucide-react';

type Tab = 'map' | 'products';

export default function ManufacturerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const manufacturer = useMemo(() => manufacturers.find((m) => m.id === id), [id]);
  const mfrProducts = useMemo(
    () => products.filter((p) => p.manufacturerId === id),
    [id]
  );

  const stats = useMemo(() => {
    if (!mfrProducts.length) return null;
    const countries = new Set<string>();
    mfrProducts.forEach((p) => p.countries.forEach((c) => countries.add(c)));
    const active = mfrProducts.filter((p) => p.status === 'ACTIVE').length;
    const announced = mfrProducts.filter((p) => p.status === 'ANNOUNCED' || p.status === 'COMING_SOON').length;
    const avgConf = (mfrProducts.reduce((s, p) => s + p.confidenceScore, 0) / mfrProducts.length * 100).toFixed(1);
    const types = new Set(mfrProducts.map((p) => p.productType));
    return { countryCount: countries.size, active, announced, total: mfrProducts.length, avgConf, types: Array.from(types) };
  }, [mfrProducts]);

  if (!manufacturer) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Manufacturer not found</p>
          <p className="text-sm text-gray-500 mt-1">ID: {id}</p>
          <button onClick={() => router.push('/manufacturers')} className="mt-4 text-sm text-enphase-500 hover:text-enphase-600 font-medium">
            ← Back to Manufacturers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push('/manufacturers')}
            className="mt-1 p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{manufacturer.name}</h1>
            <p className="text-[13px] text-gray-500 mt-0.5 max-w-2xl">{manufacturer.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                {manufacturer.headquarters}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                Founded {manufacturer.foundedYear}
              </span>
              <a
                href={manufacturer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-enphase-500 hover:text-enphase-600"
              >
                <Globe className="w-3 h-3" />
                Website
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-enphase-500 flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
                <p className="text-[11px] text-gray-500">Total Products</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{stats.active}</p>
                <p className="text-[11px] text-gray-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{stats.announced}</p>
                <p className="text-[11px] text-gray-500">Announced</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{stats.countryCount}</p>
                <p className="text-[11px] text-gray-500">Countries</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{stats.avgConf}%</p>
                <p className="text-[11px] text-gray-500">AI Confidence</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'map'
              ? 'border-enphase-500 text-enphase-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Geographic Coverage
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-enphase-500 text-enphase-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Products ({mfrProducts.length})
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'map' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Product Availability by Country</h2>
          <ManufacturerMap products={mfrProducts} manufacturerName={manufacturer.name} />
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-2">
          {mfrProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${
                    product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    product.status === 'ANNOUNCED' || product.status === 'COMING_SOON' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {product.status === 'COMING_SOON' ? 'ANNOUNCED' : product.status}
                  </span>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{product.acPower}W</p>
                    <p className="text-xs text-gray-500">{product.powerClass}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{product.countries.length}</p>
                    <p className="text-xs text-gray-500">Countries</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{(product.confidenceScore * 100).toFixed(0)}%</p>
                    <p className="text-xs text-gray-500">Confidence</p>
                  </div>
                  {expandedProduct === product.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedProduct === product.id && (
                <div className="px-5 pb-4 pt-1 border-t border-gray-100 bg-gray-50/50">
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Key Specs</p>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>Efficiency: <span className="font-medium text-gray-900">{product.efficiency}%</span></p>
                        <p>MPPT: <span className="font-medium text-gray-900">{product.mppt} tracker(s)</span></p>
                        <p>Warranty: <span className="font-medium text-gray-900">{product.warranty} years</span></p>
                        <p>Voltage: <span className="font-medium text-gray-900">{product.voltage}V</span></p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Communication</p>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>Type: <span className="font-medium text-gray-900">{product.communicationType}</span></p>
                        <p>Monitoring: <span className="font-medium text-gray-900">{product.monitoringPlatform}</span></p>
                        <p>IP Rating: <span className="font-medium text-gray-900">{product.ipRating}</span></p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">AI Summary</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{product.aiSummary}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">Available In ({product.countries.length} countries)</p>
                    <div className="flex flex-wrap gap-1">
                      {product.countries.map((country) => (
                        <span key={country} className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-[11px] text-gray-600">
                          {country}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
