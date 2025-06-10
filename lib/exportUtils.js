import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportAsPNG = async (elementId, filename = 'dashboard') => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }
  
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
    allowTaint: true
  });
  
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL();
  link.click();
};

export const exportAsPDF = async (elementId, filename = 'dashboard') => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }
  
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
    allowTaint: true
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF();
  
  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  
  let position = 0;
  
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  pdf.save(`${filename}.pdf`);
};

export const exportAsHTML = (dashboardConfig, data) => {
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${dashboardConfig.title}</title>
    <script src="https://unpkg.com/recharts@2.8.0/umd/Recharts.js"></script>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
        .dashboard { max-width: 1200px; margin: 0 auto; }
    </style>
</head>
<body class="${dashboardConfig.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}">
    <div class="dashboard">
        <h1 class="text-3xl font-bold mb-2">${dashboardConfig.title}</h1>
        ${dashboardConfig.subtitle ? `<p class="text-gray-600 mb-6">${dashboardConfig.subtitle}</p>` : ''}
        <div id="dashboard-container"></div>
    </div>
    
    <script>
        const data = ${JSON.stringify(data)};
        const config = ${JSON.stringify(dashboardConfig)};
        
        // Dashboard rendering logic would go here
        // This is a simplified version - in practice, you'd recreate the charts
        document.getElementById('dashboard-container').innerHTML = 
            '<p>Dashboard exported successfully. Charts would be rendered here.</p>';
    </script>
</body>
</html>`;
  
  const blob = new Blob([htmlTemplate], { type: 'text/html' });
  const link = document.createElement('a');
  link.download = `${dashboardConfig.title.replace(/\s+/g, '_').toLowerCase()}.html`;
  link.href = URL.createObjectURL(blob);
  link.click();
};

export const generateEmbedCode = (dashboardConfig) => {
  const embedCode = `<iframe 
  src="data:text/html;charset=utf-8,${encodeURIComponent(exportAsHTML(dashboardConfig))}" 
  width="100%" 
  height="600" 
  frameborder="0">
</iframe>`;
  
  return embedCode;
};

export const exportAsExcel = async (data, dashboardConfig, aiInsights, filename = 'dashboard') => {
  try {
    // Import xlsx library dynamically if available
    const XLSX = await import('xlsx').catch(() => null);
    
    if (!XLSX) {
      // Fallback to CSV export if xlsx is not available
      exportAsCSV(data, filename);
      return;
    }

    const workbook = XLSX.utils.book_new();
    
    // Create main data sheet
    if (data && data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    }
    
    // Create dashboard config sheet
    if (dashboardConfig) {
      const configData = [
        ['Title', dashboardConfig.title],
        ['Subtitle', dashboardConfig.subtitle || ''],
        ['Theme', dashboardConfig.theme],
        ['Charts Count', dashboardConfig.charts.length],
        ['Export Date', new Date().toISOString()]
      ];
      
      dashboardConfig.charts.forEach((chart, index) => {
        configData.push([`Chart ${index + 1} - Title`, chart.title]);
        configData.push([`Chart ${index + 1} - Type`, chart.type]);
        configData.push([`Chart ${index + 1} - X-Axis`, chart.xAxis]);
        configData.push([`Chart ${index + 1} - Y-Axis`, chart.yAxis]);
        configData.push([`Chart ${index + 1} - Group By`, chart.groupBy || 'None']);
      });
      
      const configWorksheet = XLSX.utils.aoa_to_sheet(configData);
      XLSX.utils.book_append_sheet(workbook, configWorksheet, 'Dashboard Config');
    }
    
    // Create AI insights sheet if available
    if (aiInsights) {
      const insightsData = [
        ['Executive Summary', aiInsights.executiveSummary || ''],
        [''],
        ['Key Trends']
      ];
      
      if (aiInsights.trends) {
        aiInsights.trends.forEach((trend, index) => {
          insightsData.push([`Trend ${index + 1}`, trend]);
        });
      }
      
      insightsData.push(['']);
      insightsData.push(['Recommendations']);
      
      if (aiInsights.recommendations) {
        aiInsights.recommendations.forEach((rec, index) => {
          insightsData.push([`Recommendation ${index + 1}`, rec]);
        });
      }
      
      const insightsWorksheet = XLSX.utils.aoa_to_sheet(insightsData);
      XLSX.utils.book_append_sheet(workbook, insightsWorksheet, 'AI Insights');
    }
    
    // Save the file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    
  } catch (error) {
    console.error('Excel export failed:', error);
    // Fallback to CSV export
    exportAsCSV(data, filename);
  }
};

// Fallback CSV export function
const exportAsCSV = (data, filename = 'dashboard') => {
  if (!data || data.length === 0) {
    throw new Error('No data available for export');
  }
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma or quote
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.download = `${filename}.csv`;
  link.href = URL.createObjectURL(blob);
  link.click();
};
