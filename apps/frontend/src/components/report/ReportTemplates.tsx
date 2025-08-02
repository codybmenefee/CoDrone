import React, { useState } from 'react';
import {
  FileText,
  Crop,
  Mountain,
  BarChart,
  Camera,
  ArrowRight,
  Eye,
} from 'lucide-react';
import {
  ReportTemplate,
  ReportTemplateCategory,
  DroneDataContext,
} from '../../types/report';

interface ReportTemplatesProps {
  onSelectTemplate: (template: ReportTemplate) => void;
  dataContext?: DroneDataContext;
  onClose?: () => void;
}

const ReportTemplates: React.FC<ReportTemplatesProps> = ({
  onSelectTemplate,
  dataContext,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplate | null>(
    null
  );

  const categories: ReportTemplateCategory[] = [
    {
      id: 'all',
      name: 'All Templates',
      description: 'View all available templates',
      icon: '📄',
    },
    {
      id: 'crop-health',
      name: 'Crop Health',
      description: 'NDVI and vegetation analysis',
      icon: '🌱',
    },
    {
      id: 'volume-measurement',
      name: 'Volume Measurement',
      description: 'Stockpile and volume calculations',
      icon: '📊',
    },
    {
      id: 'area-survey',
      name: 'Area Survey',
      description: 'Land area and boundary analysis',
      icon: '🗺️',
    },
    {
      id: 'inspection',
      name: 'Inspection',
      description: 'Infrastructure and asset inspection',
      icon: '🏗️',
    },
    {
      id: 'environmental',
      name: 'Environmental',
      description: 'Environmental monitoring reports',
      icon: '🌍',
    },
  ];

  const templates: ReportTemplate[] = [
    {
      id: 'crop-health-basic',
      name: 'Basic Crop Health Analysis',
      category: 'crop-health',
      description: 'Standard NDVI analysis with vegetation health assessment',
      html_template: getCropHealthTemplate(),
      css_template: getStandardCSS(),
      components: [
        'executive-summary',
        'drone-map',
        'analysis-chart',
        'measurement-table',
        'key-findings',
      ],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 'crop-health-detailed',
      name: 'Detailed Crop Health Report',
      category: 'crop-health',
      description:
        'Comprehensive NDVI analysis with zone mapping and recommendations',
      html_template: getDetailedCropHealthTemplate(),
      css_template: getStandardCSS(),
      components: [
        'executive-summary',
        'drone-map',
        'analysis-chart',
        'measurement-table',
        'key-findings',
      ],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 'volume-basic',
      name: 'Volume Measurement Report',
      category: 'volume-measurement',
      description: 'Stockpile volume calculation with accuracy metrics',
      html_template: getVolumeTemplate(),
      css_template: getStandardCSS(),
      components: [
        'executive-summary',
        'drone-map',
        'measurement-table',
        'analysis-chart',
      ],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 'area-survey-basic',
      name: 'Area Survey Report',
      category: 'area-survey',
      description: 'Land area calculation and boundary mapping',
      html_template: getAreaSurveyTemplate(),
      css_template: getStandardCSS(),
      components: [
        'executive-summary',
        'drone-map',
        'measurement-table',
        'key-findings',
      ],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 'inspection-basic',
      name: 'Infrastructure Inspection',
      category: 'inspection',
      description: 'Detailed infrastructure analysis and defect reporting',
      html_template: getInspectionTemplate(),
      css_template: getStandardCSS(),
      components: [
        'executive-summary',
        'drone-map',
        'analysis-chart',
        'key-findings',
      ],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 'environmental-basic',
      name: 'Environmental Monitoring',
      category: 'environmental',
      description: 'Environmental impact assessment and monitoring',
      html_template: getEnvironmentalTemplate(),
      css_template: getStandardCSS(),
      components: [
        'executive-summary',
        'drone-map',
        'analysis-chart',
        'measurement-table',
        'key-findings',
      ],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'crop-health':
        return <Crop className="w-5 h-5" />;
      case 'volume-measurement':
        return <BarChart className="w-5 h-5" />;
      case 'area-survey':
        return <Mountain className="w-5 h-5" />;
      case 'inspection':
        return <Camera className="w-5 h-5" />;
      case 'environmental':
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Report Template
        </h1>
        <p className="text-gray-600">
          Select a template that best fits your drone data analysis needs.
          Templates can be customized after selection.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedCategory === category.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900'
            }`}
          >
            <div className="text-2xl mb-2">{category.icon}</div>
            <div className="text-sm font-medium">{category.name}</div>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {getCategoryIcon(template.category)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {template.category.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {template.description}
              </p>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">
                  Components included:
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.components.slice(0, 3).map(component => (
                    <span
                      key={component}
                      className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {component.replace('-', ' ')}
                    </span>
                  ))}
                  {template.components.length > 3 && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{template.components.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setPreviewTemplate(template)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => onSelectTemplate(template)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            No templates found matching your criteria.
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          dataContext={dataContext}
          onClose={() => setPreviewTemplate(null)}
          onUse={() => {
            onSelectTemplate(previewTemplate);
            setPreviewTemplate(null);
          }}
        />
      )}
    </div>
  );
};

// Template Preview Modal
interface TemplatePreviewModalProps {
  template: ReportTemplate;
  dataContext?: DroneDataContext;
  onClose: () => void;
  onUse: () => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  dataContext,
  onClose,
  onUse,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {template.name}
            </h3>
            <p className="text-gray-600">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: template.html_template.replace(/\${.*?}/g, match => {
                // Replace template variables with sample data
                if (match.includes('location'))
                  return dataContext?.metadata?.location || 'Sample Location';
                if (match.includes('date'))
                  return (
                    dataContext?.metadata?.date ||
                    new Date().toLocaleDateString()
                  );
                if (match.includes('area'))
                  return (
                    dataContext?.analysisResults?.area?.toFixed(1) || '45.7'
                  );
                return 'Sample Data';
              }),
            }}
          />
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={onUse}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Use This Template
          </button>
        </div>
      </div>
    </div>
  );
};

// Template HTML generators
function getCropHealthTemplate(): string {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
      <header style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #10b981;">
        <h1 style="font-size: 32px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
          Crop Health Analysis Report
        </h1>
        <p style="font-size: 16px; color: #64748b; margin: 0;">
          NDVI Analysis • \${metadata?.location} • \${metadata?.date}
        </p>
      </header>

      <div type="executive-summary"></div>
      <div type="drone-map"></div>
      <div type="analysis-chart"></div>
      <div type="measurement-table"></div>
      <div type="key-findings"></div>

      <section style="margin: 40px 0; padding: 24px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px;">
        <h3 style="color: #166534; margin-bottom: 16px;">Recommendations</h3>
        <ul style="color: #15803d; line-height: 1.6;">
          <li>Areas with NDVI values below 0.3 require immediate attention</li>
          <li>Consider targeted irrigation in low-vegetation zones</li>
          <li>Monitor crop development in identified stress areas</li>
          <li>Schedule follow-up analysis in 2-3 weeks</li>
        </ul>
      </section>
    </div>
  `;
}

function getDetailedCropHealthTemplate(): string {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
      <header style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #10b981;">
        <h1 style="font-size: 32px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
          Comprehensive Crop Health Analysis
        </h1>
        <p style="font-size: 16px; color: #64748b; margin: 0;">
          Advanced NDVI & Vegetation Health Assessment
        </p>
      </header>

      <div type="executive-summary"></div>
      <div type="drone-map"></div>
      <div type="analysis-chart"></div>
      <div type="measurement-table"></div>

      <section style="margin: 40px 0;">
        <h3 style="color: #1e293b; margin-bottom: 20px;">Zone Analysis</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
          <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h4 style="color: #10b981; margin-bottom: 8px;">Healthy Zone</h4>
            <p style="font-size: 14px; color: #64748b;">NDVI: 0.7-1.0 • 65% of area</p>
          </div>
          <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h4 style="color: #f59e0b; margin-bottom: 8px;">Moderate Stress</h4>
            <p style="font-size: 14px; color: #64748b;">NDVI: 0.4-0.7 • 25% of area</p>
          </div>
          <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h4 style="color: #ef4444; margin-bottom: 8px;">High Stress</h4>
            <p style="font-size: 14px; color: #64748b;">NDVI: 0.0-0.4 • 10% of area</p>
          </div>
        </div>
      </section>

      <div type="key-findings"></div>
    </div>
  `;
}

function getVolumeTemplate(): string {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
      <header style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #3b82f6;">
        <h1 style="font-size: 32px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
          Volume Measurement Report
        </h1>
        <p style="font-size: 16px; color: #64748b; margin: 0;">
          Stockpile Volume Analysis • \${metadata?.location}
        </p>
      </header>

      <div type="executive-summary"></div>
      <div type="drone-map"></div>
      <div type="measurement-table"></div>
      <div type="analysis-chart"></div>

      <section style="margin: 40px 0; padding: 24px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px;">
        <h3 style="color: #1d4ed8; margin-bottom: 16px;">Accuracy & Quality</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div>
            <p style="font-size: 14px; color: #1e40af; margin-bottom: 4px;">Measurement Accuracy</p>
            <p style="font-size: 18px; font-weight: 600; color: #1d4ed8;">±2.5%</p>
          </div>
          <div>
            <p style="font-size: 14px; color: #1e40af; margin-bottom: 4px;">Ground Sample Distance</p>
            <p style="font-size: 18px; font-weight: 600; color: #1d4ed8;">\${metadata?.resolution}</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

function getAreaSurveyTemplate(): string {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
      <header style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #f59e0b;">
        <h1 style="font-size: 32px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
          Area Survey Report
        </h1>
        <p style="font-size: 16px; color: #64748b; margin: 0;">
          Land Area Calculation & Boundary Mapping
        </p>
      </header>

      <div type="executive-summary"></div>
      <div type="drone-map"></div>
      <div type="measurement-table"></div>
      <div type="key-findings"></div>
    </div>
  `;
}

function getInspectionTemplate(): string {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
      <header style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #8b5cf6;">
        <h1 style="font-size: 32px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
          Infrastructure Inspection Report
        </h1>
        <p style="font-size: 16px; color: #64748b; margin: 0;">
          Detailed Asset Analysis & Condition Assessment
        </p>
      </header>

      <div type="executive-summary"></div>
      <div type="drone-map"></div>
      <div type="analysis-chart"></div>
      <div type="key-findings"></div>
    </div>
  `;
}

function getEnvironmentalTemplate(): string {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
      <header style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #059669;">
        <h1 style="font-size: 32px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
          Environmental Monitoring Report
        </h1>
        <p style="font-size: 16px; color: #64748b; margin: 0;">
          Environmental Impact Assessment & Analysis
        </p>
      </header>

      <div type="executive-summary"></div>
      <div type="drone-map"></div>
      <div type="analysis-chart"></div>
      <div type="measurement-table"></div>
      <div type="key-findings"></div>
    </div>
  `;
}

function getStandardCSS(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; }
    h1, h2, h3, h4, h5, h6 { font-weight: 600; margin-bottom: 0.5em; }
    p { margin-bottom: 1em; }
    .prose { max-width: none; }
    @media print {
      body { background-color: white; }
      .no-print { display: none !important; }
    }
  `;
}

export default ReportTemplates;
