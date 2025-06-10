import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error('CSV parsing failed: ' + results.errors[0].message));
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        reject(new Error('CSV parsing failed: ' + error.message));
      }
    });
  });
};

export const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Excel parsing failed: ' + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('File reading failed'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const validateFileType = (file) => {
  const validTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  return validTypes.includes(file.type) || 
         file.name.endsWith('.csv') || 
         file.name.endsWith('.xlsx') || 
         file.name.endsWith('.xls');
};

export const processFileData = async (file) => {
  if (!validateFileType(file)) {
    throw new Error('Invalid file type. Please upload a CSV or Excel file.');
  }
  
  let data;
  
  if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
    data = await parseCSV(file);
  } else {
    data = await parseExcel(file);
  }
  
  if (!data || data.length === 0) {
    throw new Error('No data found in file');
  }
  
  return data;
};
