import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { generateUrbanCartDataset } from '../data/syntheticDemo';
import { analyzeDataset } from '../utils/dataAnalytics';
import { DatasetAnalysisResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export class ApiService {
  /**
   * Load synthetic UrbanCart demo dataset
   */
  async loadDemoDataset(): Promise<DatasetAnalysisResult> {
    try {
      // Try backend endpoint first if available
      const response = await fetch(`${API_BASE_URL}/api/demo`, {
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (e) {
      console.warn('Backend /api/demo unavailable, using in-memory engine.');
    }

    // High performance in-memory generation
    const records = generateUrbanCartDataset();
    return analyzeDataset('UrbanCart_Synthetic_Demo_Q1_Q2_2025.csv', records, true);
  }

  /**
   * Upload and process a merchant CSV or XLSX file
   */
  async uploadDataset(file: File): Promise<DatasetAnalysisResult> {
    // 1. Validate file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(extension || '')) {
      throw new Error('Unsupported file format. Please upload a CSV (.csv) or Excel (.xlsx, .xls) file.');
    }

    // 2. Validate file size (max 10MB)
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`);
    }

    if (file.size === 0) {
      throw new Error('The uploaded file is empty (0 bytes).');
    }

    // Try backend FastAPI upload endpoint first
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errJson = await response.json().catch(() => null);
        if (errJson?.detail) {
          throw new Error(errJson.detail);
        }
      }
    } catch (e: any) {
      // If network fails (e.g. backend offline), fallback seamlessly to client-side parser
      console.warn('Backend upload failed or offline. Parsing client-side:', e.message);
    }

    // Client-side fallback parser for CSV and Excel
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      if (extension === 'csv') {
        reader.onload = (e) => {
          try {
            const csvText = e.target?.result as string;
            Papa.parse(csvText, {
              header: true,
              dynamicTyping: true,
              skipEmptyLines: 'greedy',
              complete: (results) => {
                if (!results.data || results.data.length === 0) {
                  reject(new Error('The CSV file does not contain any valid rows.'));
                  return;
                }
                const cleanRows = results.data.filter((r: any) => Object.keys(r).length > 0 && Object.values(r).some(v => v !== null && v !== ''));
                if (cleanRows.length === 0) {
                  reject(new Error('The uploaded CSV file contains no usable merchant rows.'));
                  return;
                }
                const analyzed = analyzeDataset(file.name, cleanRows as Record<string, any>[], false, file.size);
                resolve(analyzed);
              },
              error: (err) => {
                reject(new Error(`Failed to parse CSV file: ${err.message}`));
              },
            });
          } catch (err: any) {
            reject(new Error(`Error reading CSV: ${err.message}`));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file from disk.'));
        reader.readAsText(file);
      } else {
        // Excel file (.xlsx, .xls)
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
              reject(new Error('The Excel workbook has no sheets.'));
              return;
            }

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: null }) as Record<string, any>[];

            if (!jsonRows || jsonRows.length === 0) {
              reject(new Error(`The sheet "${firstSheetName}" contains no readable data.`));
              return;
            }

            const analyzed = analyzeDataset(file.name, jsonRows, false, file.size);
            resolve(analyzed);
          } catch (err: any) {
            reject(new Error(`Corrupted or unreadable Excel file: ${err.message}`));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read Excel file.'));
        reader.readAsArrayBuffer(file);
      }
    });
  }
}

export const apiService = new ApiService();
