export interface ReportTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  html_template: string;
  css_template: string;
  components: string[];
  created_at: string;
  updated_at: string;
}

export interface ReportTemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface DroneDataContext {
  analysisResults?: {
    area?: number;
    volume?: number;
    ndvi?: number[];
    elevation?: number[];
  };
  metadata?: {
    location?: string;
    date?: string;
    resolution?: string;
    imageCount?: number;
  };
  visualizations?: {
    mapUrl?: string;
    chartData?: any[];
    imageUrls?: string[];
  };
}

export interface ReportGenerationRequest {
  templateId: string;
  title: string;
  dataContext: DroneDataContext;
  customizations?: {
    colors?: string[];
    logo?: string;
    footer?: string;
  };
}

export interface ReportGenerationResponse {
  id: string;
  html: string;
  css: string;
  createdAt: string;
  downloadUrl?: string;
}

export interface CustomDroneComponent {
  type: string;
  label: string;
  category: string;
  attributes: Record<string, any>;
  content: string;
  style: Record<string, any>;
}

export interface ReportBuilderProps {
  templateId?: string;
  initialContent?: {
    html: string;
    css: string;
  };
  dataContext?: DroneDataContext;
  onSave?: (html: string, css: string) => void;
  onExport?: (format: 'pdf' | 'html') => void;
  readonly?: boolean;
}

export interface GrapesConfig {
  height: string;
  width: string;
  storageManager: boolean;
  showOffsets: boolean;
  noticeOnUnload: boolean;
  container: string;
  fromElement: boolean;
  plugins: string[];
  pluginsOpts: Record<string, any>;
}

export interface ExportOptions {
  format: 'pdf' | 'html';
  filename: string;
  includeStyles: boolean;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}