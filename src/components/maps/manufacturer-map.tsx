'use client';

import { useState, useMemo, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { geoNameToCountry } from '@/lib/country-iso';
import type { Product } from '@/data/comprehensive-data';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

type StatusFilter = 'ALL' | 'ACTIVE' | 'ANNOUNCED' | 'DISCONTINUED';

interface CountryData {
  name: string;
  products: Product[];
  activeCount: number;
  announcedCount: number;
  discontinuedCount: number;
}

interface ManufacturerMapProps {
  products: Product[];
  manufacturerName: string;
  compact?: boolean;
}

function ManufacturerMapInner({ products, manufacturerName, compact = false }: ManufacturerMapProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

  // Build country → product data map (keyed by product-data country name)
  const countryMap = useMemo(() => {
    const map = new Map<string, CountryData>();

    products.forEach((product) => {
      product.countries.forEach((country) => {
        if (!map.has(country)) {
          map.set(country, {
            name: country,
            products: [],
            activeCount: 0,
            announcedCount: 0,
            discontinuedCount: 0,
          });
        }
        const entry = map.get(country)!;
        entry.products.push(product);
        if (product.status === 'ACTIVE') entry.activeCount++;
        else if (product.status === 'ANNOUNCED' || product.status === 'COMING_SOON') entry.announcedCount++;
        else if (product.status === 'DISCONTINUED') entry.discontinuedCount++;
      });
    });

    return map;
  }, [products]);

  // Filter products for the selected country modal
  const filteredCountryProducts = useMemo(() => {
    if (!selectedCountry) return [];
    return selectedCountry.products.filter((p) => {
      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'ANNOUNCED') return p.status === 'ANNOUNCED' || p.status === 'COMING_SOON';
      return p.status === statusFilter;
    });
  }, [selectedCountry, statusFilter]);

  // Count totals
  const totalCountries = countryMap.size;
  const totalActiveCountries = Array.from(countryMap.values()).filter(c => c.activeCount > 0).length;
  const totalAnnouncedCountries = Array.from(countryMap.values()).filter(c => c.announcedCount > 0 && c.activeCount === 0).length;
  const hasAnyAnnounced = products.some(p => p.status === 'ANNOUNCED' || p.status === 'COMING_SOON');

  function resolveGeoData(geo: { properties: { name: string }; id?: string }): CountryData | undefined {
    const geoName = geo.properties?.name || '';
    // Map TopoJSON name to our product-data country name
    const productCountryName = geoNameToCountry[geoName];
    if (!productCountryName) return undefined;
    return countryMap.get(productCountryName);
  }

  function getCountryColor(geo: { properties: { name: string }; id?: string }) {
    const data = resolveGeoData(geo);

    if (!data) return '#f0f0f0';

    if (statusFilter === 'ACTIVE' && data.activeCount === 0) return '#f0f0f0';
    if (statusFilter === 'ANNOUNCED' && data.announcedCount === 0) return '#f0f0f0';
    if (statusFilter === 'DISCONTINUED' && data.discontinuedCount === 0) return '#f0f0f0';

    if (data.activeCount > 0) {
      const intensity = Math.min(data.activeCount / 8, 1);
      // Enphase orange gradient
      if (intensity > 0.6) return '#E05316';
      if (intensity > 0.3) return '#F26322';
      return '#F8A070';
    }
    if (data.announcedCount > 0) return '#FCD34D'; // yellow
    if (data.discontinuedCount > 0) return '#D1D5DB'; // gray
    return '#f0f0f0';
  }

  const statusOptions: { label: string; value: StatusFilter; color: string }[] = [
    { label: 'All', value: 'ALL', color: 'bg-gray-100 text-gray-700' },
    { label: 'Active', value: 'ACTIVE', color: 'bg-enphase-50 text-enphase-600' },
    { label: 'Announced', value: 'ANNOUNCED', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Discontinued', value: 'DISCONTINUED', color: 'bg-gray-50 text-gray-500' },
  ];

  return (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      {/* Stats bar — hidden in compact mode */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-enphase-500 inline-block" />
              <span className="text-xs text-gray-600">Active</span>
            </div>
            {hasAnyAnnounced && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-yellow-400 inline-block" />
                <span className="text-xs text-gray-600">Announced</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-gray-200 inline-block" />
              <span className="text-xs text-gray-600">No products</span>
            </div>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5 border border-gray-200">
            {statusOptions.filter(opt => opt.value !== 'ANNOUNCED' || hasAnyAnnounced).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === opt.value
                    ? opt.color + ' shadow-sm border border-current/10'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compact legend */}
      {compact && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-enphase-500 inline-block" />
            <span className="text-[10px] text-gray-500">Active</span>
          </div>
          {hasAnyAnnounced && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-yellow-400 inline-block" />
              <span className="text-[10px] text-gray-500">Announced</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-gray-200 inline-block" />
            <span className="text-[10px] text-gray-500">None</span>
          </div>
        </div>
      )}

      {/* Map */}
      <div className={`relative bg-white overflow-hidden ${compact ? 'rounded-lg' : 'border border-gray-200 rounded-xl'}`}>
        <ComposableMap
          projectionConfig={{ rotate: [-10, 0, 0], scale: compact ? 120 : 147 }}
          width={800}
          height={compact ? 320 : 400}
          style={{ width: '100%', height: 'auto' }}
        >
          <ZoomableGroup center={[0, 20]} zoom={1}>
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: Array<{ rsmKey: string; id?: string; properties: { name: string } }> }) =>
                geographies.map((geo) => {
                  const data = resolveGeoData(geo);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getCountryColor(geo)}
                      stroke="#fff"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none' },
                        hover: {
                          outline: 'none',
                          fill: data ? '#D94F04' : '#e5e7eb',
                          cursor: data ? 'pointer' : 'default',
                        },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={(evt) => {
                        if (data) {
                          setHoveredCountry(data);
                          const rect = (evt.target as SVGElement).closest('svg')?.getBoundingClientRect();
                          if (rect) {
                            setTooltipPos({
                              x: evt.clientX - rect.left,
                              y: evt.clientY - rect.top,
                            });
                          }
                        }
                      }}
                      onMouseMove={(evt) => {
                        const rect = (evt.target as SVGElement).closest('svg')?.getBoundingClientRect();
                        if (rect) {
                          setTooltipPos({
                            x: evt.clientX - rect.left,
                            y: evt.clientY - rect.top,
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredCountry(null)}
                      onClick={() => {
                        if (data) setSelectedCountry(data);
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Tooltip */}
        {hoveredCountry && (
          <div
            className="absolute pointer-events-none z-10 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs"
            style={{
              left: tooltipPos.x + 12,
              top: tooltipPos.y - 40,
            }}
          >
            <p className="font-semibold text-sm">{hoveredCountry.name}</p>
            <div className="flex items-center gap-3 mt-1">
              {hoveredCountry.activeCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  {hoveredCountry.activeCount} active
                </span>
              )}
              {hoveredCountry.announcedCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  {hoveredCountry.announcedCount} announced
                </span>
              )}
            </div>
            {!compact && <p className="text-gray-400 mt-0.5">Click to view products</p>}
          </div>
        )}

        {/* Overseas territory note */}
        {!compact && (
          <p className="absolute bottom-2 right-3 text-[10px] text-gray-400 italic">
            Some countries include overseas territories (e.g. French Guiana for France)
          </p>
        )}
      </div>

      {/* Country detail modal — hidden in compact mode */}
      {!compact && selectedCountry && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCountry(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{selectedCountry.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedCountry.products.length} products by {manufacturerName}
                </p>
              </div>
              <button
                onClick={() => setSelectedCountry(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-1 bg-gray-50">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === opt.value
                      ? opt.color + ' shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto max-h-[55vh] divide-y divide-gray-100">
              {filteredCountryProducts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No products match the selected filter</p>
              ) : (
                filteredCountryProducts.map((product) => (
                  <div key={product.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{product.model} · {product.acPower}W · {product.powerClass}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                          product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          product.status === 'ANNOUNCED' || product.status === 'COMING_SOON' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {product.status === 'COMING_SOON' ? 'ANNOUNCED' : product.status}
                        </span>
                        <span className="text-xs text-gray-400">{product.productType}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const ManufacturerMap = memo(ManufacturerMapInner);
