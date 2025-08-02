import React from 'react';
import {
  Home,
  Map,
  Upload,
  FileText,
  Settings,
  HelpCircle,
  Database,
  Activity
} from 'lucide-react';
import type { VolumeResult } from '../../types';

interface SidebarProps {
  uploadedFiles?: Array<{
    filename: string;
    filepath: string;
    type: 'dsm' | 'orthomosaic' | 'pointcloud' | 'image';
    size: number;
    uploadTime: string;
  }>;
  volumeResults?: VolumeResult[];
}

const Sidebar: React.FC<SidebarProps> = ({ uploadedFiles = [], volumeResults = [] }) => {
  const navigationItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: Map, label: 'Map View', active: false },
    { icon: Upload, label: 'Upload Data', active: false },
    { icon: FileText, label: 'Reports', active: false },
    { icon: Activity, label: 'Analysis', active: false },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings' },
    { icon: HelpCircle, label: 'Help' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                ${item.active
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* File Summary */}
      {uploadedFiles.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Data Files</span>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500">
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
            </div>
            <div className="flex flex-wrap gap-1">
              {['dsm', 'orthomosaic', 'pointcloud', 'image'].map(type => {
                const count = uploadedFiles.filter(f => f.type === type).length;
                if (count === 0) return null;

                const colors = {
                  dsm: 'bg-blue-100 text-blue-700',
                  orthomosaic: 'bg-green-100 text-green-700',
                  pointcloud: 'bg-purple-100 text-purple-700',
                  image: 'bg-gray-100 text-gray-700'
                };

                return (
                  <span
                    key={type}
                    className={`px-2 py-0.5 rounded text-xs ${colors[type as keyof typeof colors]}`}
                  >
                    {count} {type}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {volumeResults.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Analysis Results</span>
          </div>
          <div className="text-xs text-gray-500">
            {volumeResults.length} volume calculation{volumeResults.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="px-4 py-3 border-t border-gray-200 space-y-1">
        {bottomItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          CoDrone v1.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
