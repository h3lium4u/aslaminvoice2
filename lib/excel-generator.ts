import * as XLSX from 'xlsx';
import { Statement } from '@/types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(d?: string | Date): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatDateTime(d?: string | Date): string {
  if (!d) return '';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function applyHeaderStyle(ws: XLSX.WorkSheet, range: string) {
  const ref = XLSX.utils.decode_range(range);
  for (let col = ref.s.c; col <= ref.e.c; col++) {
    const cell = XLSX.utils.encode_cell({ r: ref.s.r, c: col });
    if (!ws[cell]) continue;
    ws[cell].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '1a1a1a' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        bottom: { style: 'thin', color: { rgb: '444444' } },
      },
    };
  }
}

export function generateMonthlyExcel(
  statements: Statement[],
  month: number,
  year: number
): Buffer {
  const wb = XLSX.utils.book_new();

  const summaryHeaders = [
    'Invoice No.', 'Customer Name', 'Customer GSTIN',
    'Items', 'Taxable Value', 'Grand Total', 'Created At',
  ];
  const summaryData = statements.map((s) => [
    s.statementNumber,
    s.customerName || 'N/A',
    s.customerGstin || 'URP',
    s.items.length,
    Number(s.totalTaxableValue || 0),
    Number(s.grandTotal || 0),
    formatDateTime(s.createdAt),
  ]);

  const summaryWs = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryData]);
  summaryWs['!cols'] = [20, 30, 20, 10, 18, 18, 22].map((w) => ({ wch: w }));
  summaryWs['!freeze'] = { xSplit: 0, ySplit: 1 };
  applyHeaderStyle(summaryWs, `A1:G1`);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  const entriesHeaders = [
    'Invoice No.', 'S.No.', 'Description', 'HSN/SAC', 'Details',
    'Amount (₹)',
  ];
  const entriesData: (string | number)[][] = [];
  for (const s of statements) {
    for (const item of s.items) {
      entriesData.push([
        s.statementNumber,
        item.serialNumber,
        item.description || item.partNumber || '',
        item.hsnSac || '',
        item.details || '',
        Number(item.amount ?? item.closingStock ?? 0),
      ]);
    }
  }

  const entriesWs = XLSX.utils.aoa_to_sheet([entriesHeaders, ...entriesData]);
  entriesWs['!cols'] = [20, 7, 30, 15, 25, 18].map((w) => ({ wch: w }));
  entriesWs['!freeze'] = { xSplit: 0, ySplit: 1 };
  applyHeaderStyle(entriesWs, `A1:F1`);
  XLSX.utils.book_append_sheet(wb, entriesWs, 'Entries');

  return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }) as Buffer;
}

export function generateYearlyExcel(
  statements: Statement[],
  year: number
): Buffer {
  const wb = XLSX.utils.book_new();

  const monthlyMap = new Map<number, { count: number; items: number }>();
  for (let m = 1; m <= 12; m++) {
    monthlyMap.set(m, { count: 0, items: 0 });
  }
  for (const s of statements) {
    const entry = monthlyMap.get(s.month || 1)!;
    if (entry) {
      entry.count += 1;
      entry.items += s.items.length;
    }
  }

  const monthSummaryHeaders = ['Month', 'Invoices', 'Total Items'];
  const monthSummaryData = Array.from(monthlyMap.entries()).map(([m, v]) => [
    MONTHS[m - 1], v.count, v.items,
  ]);

  const monthSummaryWs = XLSX.utils.aoa_to_sheet([monthSummaryHeaders, ...monthSummaryData]);
  monthSummaryWs['!cols'] = [15, 14, 14].map((w) => ({ wch: w }));
  monthSummaryWs['!freeze'] = { xSplit: 0, ySplit: 1 };
  applyHeaderStyle(monthSummaryWs, `A1:C1`);
  XLSX.utils.book_append_sheet(wb, monthSummaryWs, 'Monthly Summary');

  const stmtHeaders = [
    'Invoice No.', 'Customer Name', 'Customer GSTIN', 'Financial Year',
    'Items', 'Taxable Value', 'Grand Total', 'Created At',
  ];
  const stmtData = statements.map((s) => [
    s.statementNumber,
    s.customerName || 'N/A',
    s.customerGstin || 'URP',
    s.financialYear || '2026 - 2027',
    s.items.length,
    Number(s.totalTaxableValue || 0),
    Number(s.grandTotal || 0),
    formatDateTime(s.createdAt),
  ]);

  const stmtWs = XLSX.utils.aoa_to_sheet([stmtHeaders, ...stmtData]);
  stmtWs['!cols'] = [20, 28, 18, 16, 10, 18, 18, 22].map((w) => ({ wch: w }));
  stmtWs['!freeze'] = { xSplit: 0, ySplit: 1 };
  applyHeaderStyle(stmtWs, `A1:H1`);
  XLSX.utils.book_append_sheet(wb, stmtWs, 'All Invoices');

  const allEntriesHeaders = [
    'Invoice No.', 'Financial Year', 'S.No.', 'Description',
    'HSN/SAC', 'Details', 'Amount (₹)',
  ];
  const allEntriesData: (string | number)[][] = [];
  for (const s of statements) {
    for (const item of s.items) {
      allEntriesData.push([
        s.statementNumber,
        s.financialYear || '2026 - 2027',
        item.serialNumber,
        item.description || item.partNumber || '',
        item.hsnSac || '',
        item.details || '',
        Number(item.amount ?? item.closingStock ?? 0),
      ]);
    }
  }

  const allEntriesWs = XLSX.utils.aoa_to_sheet([allEntriesHeaders, ...allEntriesData]);
  allEntriesWs['!cols'] = [20, 16, 7, 30, 15, 25, 18].map((w) => ({ wch: w }));
  allEntriesWs['!freeze'] = { xSplit: 0, ySplit: 1 };
  applyHeaderStyle(allEntriesWs, `A1:G1`);
  XLSX.utils.book_append_sheet(wb, allEntriesWs, 'All Entries');

  return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }) as Buffer;
}
