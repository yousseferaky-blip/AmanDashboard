import React, { useState } from 'react';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Fixed Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Main Content Area with dynamic margin */}
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{ 
          marginRight: sidebarCollapsed ? '4rem' : '16rem' // 64px when collapsed, 256px when expanded
        }}
      >
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-end">
            {/* Left side - Menu button and title */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebarCollapse}
                className="flex items-center justify-center p-2 rounded-md relative z-50 hover:bg-gray-100 transition-colors"
                title={sidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Right side - User info */}
   
          </div>
        </div>
        
        {/* Content Area */}
        <main className="flex-1 p-2">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 