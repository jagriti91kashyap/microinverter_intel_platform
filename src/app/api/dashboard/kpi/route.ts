import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Mock data for dashboard
const mockDashboardData = {
  totalProducts: 10,
  totalManufacturers: 5,
  recentUpdates: 3,
  activeJobs: 2,
  productsByManufacturer: [
    { manufacturer: 'Enphase Energy', count: 4 },
    { manufacturer: 'SolarEdge Technologies', count: 2 },
    { manufacturer: 'SMA Solar Technology', count: 1 },
    { manufacturer: 'Huawei Solar', count: 1 },
    { manufacturer: 'APsystems', count: 2 }
  ],
  productsByCountry: [
    { country: 'United States', count: 6 },
    { country: 'Germany', count: 3 },
    { country: 'China', count: 4 },
    { country: 'Israel', count: 2 },
    { country: 'Australia', count: 3 }
  ],
  productsByPowerClass: [
    { class: '< 300W', count: 3 },
    { class: '300-500W', count: 5 },
    { class: '500-1000W', count: 2 },
    { class: '> 1000W', count: 0 }
  ],
  recentLaunches: [
    { id: 'prod12', name: 'IQ9N Microinverter', manufacturer: { name: 'Enphase Energy' }, status: 'ACTIVE' },
    { id: 'prod4', name: 'DS3-L Microinverter', manufacturer: { name: 'APsystems' }, status: 'ACTIVE' }
  ],
  recentlyUpdated: [
    { id: 'prod1', name: 'IQ8 Microinverter', manufacturer: { name: 'Enphase Energy' }, status: 'ACTIVE' },
    { id: 'prod2', name: 'IQ8P Microinverter', manufacturer: { name: 'Enphase Energy' }, status: 'ACTIVE' }
  ]
};

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

    // Return mock data
    return NextResponse.json(mockDashboardData);
    
  } catch (error) {
    console.error('Dashboard KPI error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export const GET = getDashboardKPI;
