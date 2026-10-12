import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { manufacturers } from '@/data/comprehensive-data';
import { buildProducts } from '@/data/products-data';

// Compute real KPI data from product database
function computeKPIData() {
  const products = buildProducts(manufacturers);
  const activeProducts = products.filter(p => p.status === 'ACTIVE');

  // Unique countries across all products
  const allCountries = new Set<string>();
  activeProducts.forEach(p => p.countries.forEach(c => allCountries.add(c)));

  // Products by manufacturer
  const mfgCounts = new Map<string, number>();
  activeProducts.forEach(p => {
    const name = p.manufacturer?.name || 'Unknown';
    mfgCounts.set(name, (mfgCounts.get(name) || 0) + 1);
  });
  const productsByManufacturer = Array.from(mfgCounts.entries())
    .map(([manufacturer, count]) => ({ manufacturer, count }))
    .sort((a, b) => b.count - a.count);

  // Products available per country (top countries)
  const countryCounts = new Map<string, number>();
  activeProducts.forEach(p => p.countries.forEach(c => {
    countryCounts.set(c, (countryCounts.get(c) || 0) + 1);
  }));
  const productsByCountry = Array.from(countryCounts.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Products by power class
  const powerClasses = { '< 300W': 0, '300-500W': 0, '500-1000W': 0, '1000-2000W': 0, '> 2000W': 0 };
  activeProducts.forEach(p => {
    if (p.acPower < 300) powerClasses['< 300W']++;
    else if (p.acPower < 500) powerClasses['300-500W']++;
    else if (p.acPower < 1000) powerClasses['500-1000W']++;
    else if (p.acPower < 2000) powerClasses['1000-2000W']++;
    else powerClasses['> 2000W']++;
  });
  const productsByPowerClass = Object.entries(powerClasses).map(([cls, count]) => ({ class: cls, count }));

  // Recent launches (sorted by launchDate desc, take top 5)
  const recentLaunches = [...activeProducts]
    .sort((a, b) => new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime())
    .slice(0, 5)
    .map(p => ({ id: p.id, name: p.name, manufacturer: { name: p.manufacturer?.name || 'Unknown' }, status: p.status, acPower: p.acPower }));

  // Recently updated (sorted by lastUpdated desc, take top 5)
  const recentlyUpdated = [...activeProducts]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 5)
    .map(p => ({ id: p.id, name: p.name, manufacturer: { name: p.manufacturer?.name || 'Unknown' }, status: p.status }));

  // Countries per manufacturer (for Enphase highlight)
  const mfgCountries = new Map<string, Set<string>>();
  activeProducts.forEach(p => {
    const name = p.manufacturer?.name || 'Unknown';
    if (!mfgCountries.has(name)) mfgCountries.set(name, new Set());
    p.countries.forEach(c => mfgCountries.get(name)!.add(c));
  });
  const topManufacturerCountries = Array.from(mfgCountries.entries())
    .map(([manufacturer, countries]) => ({ manufacturer, countriesTracked: countries.size }))
    .sort((a, b) => b.countriesTracked - a.countriesTracked)
    .slice(0, 10);

  return {
    totalProducts: activeProducts.length,
    totalManufacturers: manufacturers.filter(m => m.isActive).length,
    countriesTracked: allCountries.size,
    recentUpdates: activeProducts.filter(p => {
      const updated = new Date(p.lastUpdated);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return updated >= sevenDaysAgo;
    }).length,
    activeJobs: 0,
    productsByManufacturer,
    productsByCountry,
    productsByPowerClass,
    recentLaunches,
    recentlyUpdated,
    topManufacturerCountries,
  };
}

let cachedKPI: ReturnType<typeof computeKPIData> | null = null;
function getKPIData() {
  if (!cachedKPI) cachedKPI = computeKPIData();
  return cachedKPI;
}

async function getDashboardKPI(req: NextRequest) {
  try {
    // Simple authentication check
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const jwtSecret = process.env.NEXTAUTH_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    try {
      jwt.verify(token, jwtSecret);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Return computed KPI data from products-data.ts
    return NextResponse.json(getKPIData());
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export const GET = getDashboardKPI;
