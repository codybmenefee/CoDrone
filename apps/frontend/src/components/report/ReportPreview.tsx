import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Edit,
  Share,
  Printer,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { reportApi, reportUtils } from '../../lib/reportApi';
import { ExportOptions } from '../../types/report';

interface ReportPreviewProps {
  reportId: string;
  onEdit?: () => void;
  onClose?: () => void;
  showControls?: boolean;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({
  reportId,
  onEdit,
  onClose,
  showControls = true,
}) => {
  const [report, setReport] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportId, loadReport]);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      const reportData = await reportApi.getReport(reportId);
      setReport(reportData);
      setError(null);
    } catch (err) {
      setError('Failed to load report');
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  const handleExport = async (options: ExportOptions) => {
    if (!report) return;

    setIsExporting(true);
    try {
      if (options.format === 'pdf') {
        const blob = await reportApi.exportReportToPDF(reportId, options);
        reportUtils.downloadBlob(blob, `${options.filename}.pdf`);
      } else {
        const blob = await reportApi.exportReportToHTML(reportId, options);
        reportUtils.downloadBlob(blob, `${options.filename}.html`);
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  const handleShare = async () => {
    try {
      const shareData = await reportApi.shareReport(reportId, {
        shareType: 'public',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

      if (navigator.share) {
        await navigator.share({
          title: report?.title || 'Drone Analysis Report',
          text: 'Check out this drone analysis report',
          url: shareData.shareUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.shareUrl);
        alert('Share link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
      alert('Share failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading report...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadReport}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Report not found</p>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${printMode ? 'print-mode' : ''}`}>
      {/* Header */}
      {showControls && !printMode && (
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {report.title || 'Drone Analysis Report'}
              </h1>
              <p className="text-sm text-gray-500">
                Created: {new Date(report.created_at).toLocaleDateString()}
                {report.updated_at !== report.created_at && (
                  <span>
                    {' '}
                    • Updated:{' '}
                    {new Date(report.updated_at).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPrintMode(!printMode)}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {printMode ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span>{printMode ? 'Exit Print' : 'Print View'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              disabled={isExporting}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>

            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Report Content */}
      <div className={`flex-1 overflow-auto ${printMode ? 'p-0' : 'p-6'}`}>
        <div className="max-w-4xl mx-auto">
          <style>{report.css}</style>
          <div
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
            dangerouslySetInnerHTML={{ __html: report.html }}
          />
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
          defaultFilename={
            report.title?.replace(/\s+/g, '_').toLowerCase() || 'drone_report'
          }
        />
      )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print-mode {
            background: white !important;
          }
          .print-mode * {
            color: black !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

// Export Modal Component
interface ExportModalProps {
  onExport: (options: ExportOptions) => void;
  onClose: () => void;
  defaultFilename?: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  onExport,
  onClose,
  defaultFilename,
}) => {
  const [format, setFormat] = useState<'pdf' | 'html'>('pdf');
  const [filename, setFilename] = useState(defaultFilename || 'drone_report');
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

export default ReportPreview;
