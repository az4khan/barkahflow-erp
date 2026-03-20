import React from 'react';

export default function AdminShell({ children }) {
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {children}
    </div>
  );
}
