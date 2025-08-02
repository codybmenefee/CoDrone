import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface AppLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  chat: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ sidebar, main, chat }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      // Auto-close panels on mobile
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
        setIsChatOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Load panel states from localStorage
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('codrone-sidebar-open');
    const savedChatState = localStorage.getItem('codrone-chat-open');

    if (savedSidebarState !== null && !isMobile) {
      setIsSidebarOpen(JSON.parse(savedSidebarState));
    }
    if (savedChatState !== null && !isMobile) {
      setIsChatOpen(JSON.parse(savedChatState));
    }
  }, [isMobile]);

  // Save panel states to localStorage
  useEffect(() => {
    localStorage.setItem('codrone-sidebar-open', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('codrone-chat-open', JSON.stringify(isChatOpen));
  }, [isChatOpen]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleChat = () => setIsChatOpen(!isChatOpen);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 lg:hidden"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isSidebarOpen ? 'w-64' : 'w-0'}
          ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'relative'}
          transition-all duration-300 ease-in-out
          bg-white border-r border-gray-200 overflow-hidden
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">CoDrone</h2>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="h-full overflow-y-auto">
          {sidebar}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main Content */}
        <div className="flex-1 relative">
          {/* Toggle Sidebar Button (Desktop) */}
          {!isMobile && !isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="absolute top-4 left-4 z-10 p-2 bg-white rounded-lg shadow-md border border-gray-200"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          )}

          {/* Toggle Chat Button */}
          {!isChatOpen && (
            <button
              onClick={toggleChat}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-lg shadow-md border border-gray-200"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          )}

          {main}
        </div>
      </div>

      {/* Chat Panel */}
      <div
        className={`
          ${isChatOpen ? 'w-96' : 'w-0'}
          ${isMobile ? 'fixed inset-y-0 right-0 z-40' : 'relative'}
          transition-all duration-300 ease-in-out
          bg-white border-l border-gray-200 overflow-hidden
          flex flex-col
        `}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">AI Assistant</h2>
          <button
            onClick={toggleChat}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          {chat}
        </div>
      </div>

      {/* Mobile Chat Overlay */}
      {isMobile && isChatOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleChat}
        />
      )}
    </div>
  );
};

export default AppLayout;
