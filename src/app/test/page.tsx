export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-gray-600">This is a minimal test page to isolate rendering issues.</p>
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Check</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Page Rendering</span>
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Working</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Next.js Server</span>
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Running</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">TypeScript</span>
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Compiled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
