export default function SimpleTestPage() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: '16px'
        }}>
          Simple Test Page
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>
          This page uses inline styles only - no CSS imports, no Tailwind, no shadcn.
        </p>
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '24px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#111827',
            marginBottom: '16px'
          }}>
            Test Status
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Page Rendering</span>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: '500',
                color: '#059669',
                backgroundColor: '#d1fae5',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                Working
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>CSS Framework</span>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: '500',
                color: '#1e40af',
                backgroundColor: '#dbeafe',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                None (Inline Styles)
              </span>
            </div>
          </div>
        </div>
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '24px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#111827',
            marginBottom: '16px'
          }}>
            Next.js Setup Test
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
            If this page loads correctly, it confirms that the basic Next.js setup is working and the issue is related to CSS framework configuration or component imports.
          </p>
        </div>
      </div>
    </div>
  );
}
