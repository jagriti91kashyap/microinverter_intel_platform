import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Raw Test Page',
  description: 'Test page without AuthProvider',
};

export default function RawTestPage() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Raw Test Page</h1>
          <p className="text-gray-600">This page bypasses the root layout to test without AuthProvider.</p>
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Page Rendering</span>
                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Working</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">No AuthProvider</span>
                <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">Bypassed</span>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
