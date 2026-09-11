export default function StaticTestPage() {
  return (
    <html>
      <body>
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <h1>Static Test Page</h1>
          <p>This is a completely static page with no React hooks or complex logic.</p>
          <div style={{ backgroundColor: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
            <h2>Status Check</h2>
            <p>If you can see this page, the basic Next.js setup is working.</p>
          </div>
        </div>
      </body>
    </html>
  );
}
