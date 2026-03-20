import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminShell from './AdminShell';

const OWN_SHELL_PREFIXES = ['/purchase', '/accounting', '/inventory', '/sd', '/pos', '/dist', '/hr'];

export default function ERPLayout() {
  const { pathname } = useLocation();
  const isOwnShell = OWN_SHELL_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (isOwnShell) {
    return (
      <div style={{ height:'100%', overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <Outlet />
      </div>
    );
  }

  if (pathname === '/' || pathname === '/inbox') {
    return <Outlet />;
  }

  return <AdminShell><Outlet /></AdminShell>;
}
