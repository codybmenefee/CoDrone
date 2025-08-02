import { ComponentDefinition } from 'grapesjs';
import { DroneDataContext } from '../../types/report';

export const createDroneComponents = (grapesjs: any, dataContext?: DroneDataContext) => {
  const domComponents = grapesjs.DomComponents;

  // Drone Map Component
  domComponents.addType('drone-map', {
    model: {
      defaults: {
        tagName: 'div',
        droppable: false,
        resizable: true,
        attributes: { class: 'drone-map-component' },
        style: {
          width: '100%',
          height: '300px',
          border: '2px solid #e2e8f0',
          'border-radius': '8px',
          position: 'relative',
          'background-color': '#f8fafc',
          'background-image': 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
          'background-size': '20px 20px',
          'background-position': '0 0, 0 10px, 10px -10px, -10px 0px'
        },
        content: `
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #64748b;">
            <div style="font-size: 48px; margin-bottom: 8px;">🗺️</div>
            <div style="font-weight: 600; margin-bottom: 4px;">Drone Map Visualization</div>
            <div style="font-size: 14px;">${dataContext?.metadata?.location || 'Location'} - ${dataContext?.metadata?.date || 'Date'}</div>
            <div style="font-size: 12px; margin-top: 8px;">Resolution: ${dataContext?.metadata?.resolution || '2.3 cm/pixel'}</div>
          </div>
        `,
        traits: [
          {
            type: 'select',
            name: 'mapType',
            label: 'Map Type',
            options: [
              { value: 'orthomosaic', name: 'Orthomosaic' },
              { value: 'ndvi', name: 'NDVI' },
              { value: 'elevation', name: 'Elevation' },
              { value: 'thermal', name: 'Thermal' }
            ]
          },
          {
            type: 'text',
            name: 'title',
            label: 'Map Title'
          },
          {
            type: 'checkbox',
            name: 'showLegend',
            label: 'Show Legend'
          }
        ]
      }
    },
    view: {
      events: {
        click: 'onClick'
      },
      onClick() {
        console.log('Drone map component clicked');
      }
    }
  });

  // Analysis Chart Component
  domComponents.addType('analysis-chart', {
    model: {
      defaults: {
        tagName: 'div',
        droppable: false,
        resizable: true,
        attributes: { class: 'analysis-chart-component' },
        style: {
          width: '100%',
          height: '250px',
          border: '2px solid #e2e8f0',
          'border-radius': '8px',
          position: 'relative',
          'background-color': '#ffffff',
          padding: '16px'
        },
        content: `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 36px; margin-bottom: 12px;">📊</div>
            <div style="font-weight: 600; margin-bottom: 8px; color: #1e293b;">Analysis Chart</div>
            <div style="font-size: 14px; color: #64748b; margin-bottom: 16px;">
              Visual representation of drone data analysis
            </div>
            <div style="background: linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%); height: 8px; border-radius: 4px; margin-bottom: 8px;"></div>
            <div style="font-size: 12px; color: #64748b;">
              NDVI Range: Low → High
            </div>
          </div>
        `,
        traits: [
          {
            type: 'select',
            name: 'chartType',
            label: 'Chart Type',
            options: [
              { value: 'bar', name: 'Bar Chart' },
              { value: 'line', name: 'Line Chart' },
              { value: 'histogram', name: 'Histogram' },
              { value: 'scatter', name: 'Scatter Plot' }
            ]
          },
          {
            type: 'select',
            name: 'dataSource',
            label: 'Data Source',
            options: [
              { value: 'ndvi', name: 'NDVI Values' },
              { value: 'elevation', name: 'Elevation Data' },
              { value: 'volume', name: 'Volume Analysis' },
              { value: 'area', name: 'Area Analysis' }
            ]
          },
          {
            type: 'text',
            name: 'title',
            label: 'Chart Title'
          }
        ]
      }
    }
  });

  // Measurement Table Component
  domComponents.addType('measurement-table', {
    model: {
      defaults: {
        tagName: 'div',
        droppable: false,
        resizable: true,
        attributes: { class: 'measurement-table-component' },
        style: {
          width: '100%',
          border: '2px solid #e2e8f0',
          'border-radius': '8px',
          'background-color': '#ffffff',
          overflow: 'hidden'
        },
        content: `
          <table style="width: 100%; border-collapse: collapse;">
            <thead style="background-color: #f1f5f9;">
              <tr>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0;">Measurement</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0;">Value</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0;">Unit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 12px; color: #475569; border-bottom: 1px solid #f1f5f9;">Total Area</td>
                <td style="padding: 12px; text-align: right; font-weight: 500; color: #1e293b; border-bottom: 1px solid #f1f5f9;">${dataContext?.analysisResults?.area?.toFixed(2) || '45.7'}</td>
                <td style="padding: 12px; color: #475569; border-bottom: 1px solid #f1f5f9;">hectares</td>
              </tr>
              <tr>
                <td style="padding: 12px; color: #475569; border-bottom: 1px solid #f1f5f9;">Volume</td>
                <td style="padding: 12px; text-align: right; font-weight: 500; color: #1e293b; border-bottom: 1px solid #f1f5f9;">${dataContext?.analysisResults?.volume?.toFixed(0) || '1,234'}</td>
                <td style="padding: 12px; color: #475569; border-bottom: 1px solid #f1f5f9;">m³</td>
              </tr>
              <tr>
                <td style="padding: 12px; color: #475569; border-bottom: 1px solid #f1f5f9;">Image Count</td>
                <td style="padding: 12px; text-align: right; font-weight: 500; color: #1e293b; border-bottom: 1px solid #f1f5f9;">${dataContext?.metadata?.imageCount || '342'}</td>
                <td style="padding: 12px; color: #475569; border-bottom: 1px solid #f1f5f9;">images</td>
              </tr>
              <tr>
                <td style="padding: 12px; color: #475569;">Resolution</td>
                <td style="padding: 12px; text-align: right; font-weight: 500; color: #1e293b;">${dataContext?.metadata?.resolution || '2.3'}</td>
                <td style="padding: 12px; color: #475569;">cm/pixel</td>
              </tr>
            </tbody>
          </table>
        `,
        traits: [
          {
            type: 'text',
            name: 'title',
            label: 'Table Title'
          },
          {
            type: 'checkbox',
            name: 'showBorder',
            label: 'Show Border'
          },
          {
            type: 'checkbox',
            name: 'alternateRows',
            label: 'Alternate Row Colors'
          }
        ]
      }
    }
  });

  // Executive Summary Component
  domComponents.addType('executive-summary', {
    model: {
      defaults: {
        tagName: 'div',
        droppable: false,
        resizable: true,
        attributes: { class: 'executive-summary-component' },
        style: {
          width: '100%',
          padding: '24px',
          border: '2px solid #e2e8f0',
          'border-radius': '8px',
          'background-color': '#ffffff',
          'margin-bottom': '24px'
        },
        content: `
          <div style="margin-bottom: 16px;">
            <h2 style="font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Executive Summary</h2>
            <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #3b82f6, #06b6d4); border-radius: 2px;"></div>
          </div>
          <div style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
            Comprehensive drone data analysis for ${dataContext?.metadata?.location || 'the surveyed area'} conducted on ${dataContext?.metadata?.date || 'the specified date'}. 
            The survey covered ${dataContext?.analysisResults?.area?.toFixed(1) || '45.7'} hectares using high-resolution imagery with ${dataContext?.metadata?.imageCount || '342'} images captured.
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div style="padding: 16px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #3b82f6;">
              <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Survey Area</div>
              <div style="font-size: 20px; font-weight: 600; color: #1e293b;">${dataContext?.analysisResults?.area?.toFixed(1) || '45.7'} ha</div>
            </div>
            <div style="padding: 16px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #10b981;">
              <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Data Quality</div>
              <div style="font-size: 20px; font-weight: 600; color: #1e293b;">Excellent</div>
            </div>
            <div style="padding: 16px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Resolution</div>
              <div style="font-size: 20px; font-weight: 600; color: #1e293b;">${dataContext?.metadata?.resolution || '2.3 cm/px'}</div>
            </div>
          </div>
        `,
        traits: [
          {
            type: 'text',
            name: 'title',
            label: 'Summary Title'
          },
          {
            type: 'textarea',
            name: 'description',
            label: 'Summary Description'
          }
        ]
      }
    }
  });

  // Key Findings Component
  domComponents.addType('key-findings', {
    model: {
      defaults: {
        tagName: 'div',
        droppable: false,
        resizable: true,
        attributes: { class: 'key-findings-component' },
        style: {
          width: '100%',
          padding: '24px',
          border: '2px solid #e2e8f0',
          'border-radius': '8px',
          'background-color': '#ffffff'
        },
        content: `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">Key Findings</h3>
            <div style="height: 2px; width: 40px; background-color: #3b82f6; border-radius: 1px;"></div>
          </div>
          <div style="space-y: 16px;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
              <div style="width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; margin-top: 6px; margin-right: 12px; flex-shrink: 0;"></div>
              <div style="font-size: 14px; color: #475569; line-height: 1.5;">
                <strong>High-quality data capture:</strong> ${dataContext?.metadata?.imageCount || '342'} images collected with ${dataContext?.metadata?.resolution || '2.3 cm/pixel'} resolution, ensuring detailed analysis capabilities.
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
              <div style="width: 8px; height: 8px; background-color: #3b82f6; border-radius: 50%; margin-top: 6px; margin-right: 12px; flex-shrink: 0;"></div>
              <div style="font-size: 14px; color: #475569; line-height: 1.5;">
                <strong>Complete area coverage:</strong> Total surveyed area of ${dataContext?.analysisResults?.area?.toFixed(1) || '45.7'} hectares with uniform data distribution.
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
              <div style="width: 8px; height: 8px; background-color: #f59e0b; border-radius: 50%; margin-top: 6px; margin-right: 12px; flex-shrink: 0;"></div>
              <div style="font-size: 14px; color: #475569; line-height: 1.5;">
                <strong>Optimal conditions:</strong> Weather conditions were favorable during data collection, resulting in minimal shadows and consistent lighting.
              </div>
            </div>
            <div style="display: flex; align-items: flex-start;">
              <div style="width: 8px; height: 8px; background-color: #8b5cf6; border-radius: 50%; margin-top: 6px; margin-right: 12px; flex-shrink: 0;"></div>
              <div style="font-size: 14px; color: #475569; line-height: 1.5;">
                <strong>Ready for analysis:</strong> Data preprocessing completed successfully, enabling advanced analytics including NDVI, elevation, and volume calculations.
              </div>
            </div>
          </div>
        `,
        traits: [
          {
            type: 'text',
            name: 'title',
            label: 'Section Title'
          }
        ]
      }
    }
  });
};

export const droneComponentCategories = [
  {
    id: 'drone-visualization',
    label: 'Drone Visualization',
    open: true
  }
];

export const droneComponentBlocks = [
  {
    id: 'drone-map',
    label: 'Drone Map',
    category: 'drone-visualization',
    content: { type: 'drone-map' },
    media: '<div style="width:100%;height:50px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:12px;">🗺️ Map</div>'
  },
  {
    id: 'analysis-chart',
    label: 'Analysis Chart',
    category: 'drone-visualization',
    content: { type: 'analysis-chart' },
    media: '<div style="width:100%;height:50px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:12px;">📊 Chart</div>'
  },
  {
    id: 'measurement-table',
    label: 'Measurement Table',
    category: 'drone-visualization',
    content: { type: 'measurement-table' },
    media: '<div style="width:100%;height:50px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:12px;">📋 Table</div>'
  },
  {
    id: 'executive-summary',
    label: 'Executive Summary',
    category: 'drone-visualization',
    content: { type: 'executive-summary' },
    media: '<div style="width:100%;height:50px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:12px;">📄 Summary</div>'
  },
  {
    id: 'key-findings',
    label: 'Key Findings',
    category: 'drone-visualization',
    content: { type: 'key-findings' },
    media: '<div style="width:100%;height:50px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:12px;">🔍 Findings</div>'
  }
];