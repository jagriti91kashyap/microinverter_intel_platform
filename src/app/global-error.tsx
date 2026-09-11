'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontFamily: 'Inter, sans-serif' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>Something went wrong</h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{error.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={reset}
            style={{ borderRadius: '0.375rem', backgroundColor: '#F26322', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
