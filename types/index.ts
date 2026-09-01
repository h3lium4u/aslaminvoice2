export interface StatementItem {
  id: string;
  statementId: string;
  serialNumber: number;
  
  // Tax Invoice fields
  description?: string;
  hsnSac?: string | null;
  details?: string | null;
  amount?: number | any;

  // Legacy fields
  daNumber?: string | null;
  entryDate?: string | Date;
  partNumber?: string;
  despatches?: string | null;
  openingStock?: number | any;
  closingStock?: number | any;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Statement {
  id: string;
  statementNumber: string; // Invoice No.
  invoiceDate?: string | Date;
  financialYear?: string;
  
  customerName?: string;
  customerAddress?: string;
  customerGstin?: string | null;

  industryName?: string;
  vendorName?: string;
  vendorCode?: string;
  companyGstin?: string;
  companyPan?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;

  totalTaxableValue?: number | any;
  cgstAmount?: number | any;
  sgstAmount?: number | any;
  grandTotal?: number | any;
  amountInWords?: string;

  month: number;
  year: number;
  status: string;
  pdfUrl: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  items: StatementItem[];
}

export interface StatementListItem {
  id: string;
  statementNumber: string;
  invoiceDate?: string | Date;
  financialYear?: string;
  customerName?: string;
  customerAddress?: string;
  customerGstin?: string | null;
  totalTaxableValue?: number | any;
  grandTotal?: number | any;
  industryName: string;
  vendorName: string;
  vendorCode: string;
  month: number;
  year: number;
  status: string;
  pdfUrl: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count: { items: number };
}

export interface DashboardStats {
  totalEntries: number;
  currentMonthEntries: number;
  currentYearEntries: number;
  totalRevenue?: number;
  lastEntry: string | null;
}

export interface MonthlyReport {
  month: number;
  year: number;
  statementCount: number;
  totalItems: number;
  totalOpeningStock: number;
  totalClosingStock: number;
  vendors: { vendorName: string; vendorCode: string; count: number }[];
}

export interface YearlyReport {
  year: number;
  statementCount: number;
  totalItems: number;
  totalOpeningStock: number;
  totalClosingStock: number;
  monthlyBreakdown: {
    month: number;
    statementCount: number;
    itemCount: number;
    totalOpening: number;
    totalClosing: number;
  }[];
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
}
