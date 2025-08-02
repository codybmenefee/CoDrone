import React, { useEffect, useRef, useState } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import webpage from 'grapesjs-preset-webpage';
import exportPlugin from 'grapesjs-plugin-export';
import { Save, Download, Eye, EyeOff, FileText } from 'lucide-react';
import {
  ReportBuilderProps,
  DroneDataContext,
  ExportOptions,
} from '../types/report';
import {
  createDroneComponents,
  droneComponentCategories,
  droneComponentBlocks,
} from './report/DroneComponents';
import html2pdf from 'html2pdf.js';

const ReportBuilder: React.FC<ReportBuilderProps> = ({
  templateId,
  initialContent,
  dataContext,
  onSave,
  onExport,
  readonly = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    const grapesEditor = grapesjs.init({
      container: editorRef.current,
      height: '600px',
      width: 'auto',
      storageManager: false,
      showOffsets: true,
      noticeOnUnload: false,
      fromElement: true,
      canvas: {
        styles: [
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        ],
      },
      plugins: [webpage, exportPlugin],
      pluginsOpts: {
        [webpage as unknown as string]: {
          modalImportTitle: 'Import Template',
          modalImportLabel: '<div>Paste here your HTML/CSS template</div>',
          modalImportContent: function (editor: Editor) {
            return editor.getHtml() + '<style>' + editor.getCss() + '</style>';
          },
        },
        [exportPlugin as unknown as string]: {
          addExportBtn: false,
          addImportBtn: false,
        },
      },
      blockManager: {
        appendTo: '.blocks-container',
      },
      styleManager: {
        appendTo: '.styles-container',
        sectors: [
          {
            name: 'General',
            open: true,
            properties: [
              'float',
              'display',
              'position',
              'top',
              'right',
              'left',
              'bottom',
            ],
          },
          {
            name: 'Dimension',
            open: false,
            properties: [
              'width',
              'height',
              'max-width',
              'min-height',
              'margin',
              'padding',
            ],
          },
          {
            name: 'Typography',
            open: false,
            properties: [
              'font-family',
              'font-size',
              'font-weight',
              'letter-spacing',
              'color',
              'line-height',
              'text-align',
              'text-decoration',
              'text-shadow',
            ],
          },
          {
            name: 'Background',
            open: false,
            properties: [
              'background-color',
              'background-image',
              'background-size',
              'background-position',
            ],
          },
          {
            name: 'Border',
            open: false,
            properties: ['border', 'border-radius', 'box-shadow'],
          },
        ],
      },
      layerManager: {
        appendTo: '.layers-container',
      },
      traitManager: {
        appendTo: '.traits-container',
      },
    });

    // Add custom drone components
    createDroneComponents(grapesEditor, dataContext);

    // Add component categories and blocks
    const blockManager = grapesEditor.BlockManager;

    // Add drone component categories
    droneComponentCategories.forEach(category => {
      blockManager.add(category.id, {
        label: category.label,
        category: {
          id: category.id,
          label: category.label,
          open: category.open,
        },
      });
    });

    // Add drone component blocks
    droneComponentBlocks.forEach(block => {
      blockManager.add(block.id, {
        label: block.label,
        category: block.category,
        content: block.content,
        media: block.media,
      });
    });

    // Load initial content if provided
    if (initialContent) {
      grapesEditor.setComponents(initialContent.html);
      grapesEditor.setStyle(initialContent.css);
    } else {
      // Load default template
      const defaultTemplate = getDefaultTemplate(dataContext);
      grapesEditor.setComponents(defaultTemplate.html);
      grapesEditor.setStyle(defaultTemplate.css);
    }

    // Set up event listeners
    grapesEditor.on('change:changesCount', () => {
      // Auto-save functionality could be added here
      console.log('Content changed');
    });

    setEditor(grapesEditor);

    return () => {
      grapesEditor.destroy();
    };
  }, [templateId, initialContent, dataContext]);

  const getDefaultTemplate = (context?: DroneDataContext) => {
    return {
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
          <header style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #3b82f6;">
            <h1 style="font-size: 32px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
              Drone Analysis Report
            </h1>
            <p style="font-size: 16px; color: #64748b; margin: 0;">
              ${context?.metadata?.location || 'Survey Location'} • ${context?.metadata?.date || new Date().toLocaleDateString()}
            </p>
          </header>

          <div style="margin-bottom: 40px;">
            <div type="executive-summary"></div>
          </div>

          <div style="margin-bottom: 40px;">
            <div type="drone-map"></div>
          </div>

          <div style="margin-bottom: 40px;">
            <div type="measurement-table"></div>
          </div>

          <div style="margin-bottom: 40px;">
            <div type="analysis-chart"></div>
          </div>

          <div style="margin-bottom: 40px;">
            <div type="key-findings"></div>
          </div>

          <footer style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
            <p>Generated by Canopy Copilot • ${new Date().toLocaleDateString()}</p>
          </footer>
        </div>
      `,
      css: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          color: #1e293b;
          background-color: #f8fafc;
        }
        @media print {
          body { background-color: white; }
          .no-print { display: none !important; }
        }
      `,
    };
  };

  const handleSave = async () => {
    if (!editor || !onSave) return;

    setIsSaving(true);
    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      await onSave(html, css);
    } catch (error) {
      console.error('Error saving report:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (options: ExportOptions) => {
    if (!editor) return;

    setIsExporting(true);
    try {
      const html = editor.getHtml();
      const css = editor.getCss();

      if (options.format === 'pdf') {
        await exportToPDF(html, css, options);
      } else {
        await exportToHTML(html, css, options);
      }

      if (onExport) {
        onExport(options.format);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const exportToPDF = async (
    html: string,
    css: string,
    options: ExportOptions
  ) => {
    const element = document.createElement('div');
    element.innerHTML = html;

    const style = document.createElement('style');
    style.textContent = css;
    element.appendChild(style);

    const opt = {
      margin: options.margins || { top: 20, right: 20, bottom: 20, left: 20 },
      filename: options.filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: {
        unit: 'mm',
        format: options.pageSize?.toLowerCase() || 'a4',
        orientation: options.orientation || 'portrait',
      },
    };

    await html2pdf().set(opt).from(element).save();
  };

  const exportToHTML = async (
    html: string,
    css: string,
    options: ExportOptions
  ) => {
    const fullHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${options.filename}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        ${options.includeStyles ? `<style>${css}</style>` : ''}
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${options.filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const togglePreview = () => {
    if (!editor) return;

    const newPreviewMode = !isPreviewMode;
    setIsPreviewMode(newPreviewMode);

    // Toggle GrapesJS UI
    editor.runCommand(newPreviewMode ? 'sw-visibility' : 'sw-visibility');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Report Builder
          </h2>
          {templateId && (
            <span className="text-sm text-gray-500">
              Template: {templateId}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={togglePreview}
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {isPreviewMode ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span>{isPreviewMode ? 'Edit' : 'Preview'}</span>
          </button>

          {onSave && (
            <button
              onClick={handleSave}
              disabled={isSaving || readonly}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          )}

          <button
            onClick={() => setShowExportModal(true)}
            disabled={isExporting}
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        {!isPreviewMode && (
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {/* Blocks Panel */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Components
                </h3>
                <div className="blocks-container"></div>
              </div>

              {/* Styles Panel */}
              <div className="border-t border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Styles
                </h3>
                <div className="styles-container"></div>
              </div>

              {/* Traits Panel */}
              <div className="border-t border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Properties
                </h3>
                <div className="traits-container"></div>
              </div>

              {/* Layers Panel */}
              <div className="border-t border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Layers
                </h3>
                <div className="layers-container"></div>
              </div>
            </div>
          </div>
        )}

        {/* Main Editor */}
        <div className="flex-1">
          <div ref={editorRef} className="h-full" />
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};

// Export Modal Component
interface ExportModalProps {
  onExport: (options: ExportOptions) => void;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ onExport, onClose }) => {
  const [format, setFormat] = useState<'pdf' | 'html'>('pdf');
  const [filename, setFilename] = useState('drone-report');
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Legal'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    'portrait'
  );
  const [includeStyles, setIncludeStyles] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExport({
      format,
      filename,
      pageSize,
      orientation,
      includeStyles,
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Export Report
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select
              value={format}
              onChange={e => setFormat(e.target.value as 'pdf' | 'html')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="html">HTML</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filename
            </label>
            <input
              type="text"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter filename"
            />
          </div>

          {format === 'pdf' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Size
                </label>
                <select
                  value={pageSize}
                  onChange={e =>
                    setPageSize(e.target.value as 'A4' | 'Letter' | 'Legal')
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orientation
                </label>
                <select
                  value={orientation}
                  onChange={e =>
                    setOrientation(e.target.value as 'portrait' | 'landscape')
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </>
          )}

          {format === 'html' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeStyles"
                checked={includeStyles}
                onChange={e => setIncludeStyles(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="includeStyles"
                className="ml-2 block text-sm text-gray-700"
              >
                Include CSS styles
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Export
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportBuilder;
