import path from 'path';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Statement } from '@/types';
import { convertAmountToWords } from '@/lib/numberToWords';

Font.registerHyphenationCallback((word) => [word]);

const logoPath = path.join(process.cwd(), 'public', 'logo.jpg');

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 25,
    paddingBottom: 40,
    paddingHorizontal: 30,
    backgroundColor: '#FFFFFF',
  },
  // Company Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 4,
  },
  companyName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    letterSpacing: 1,
  },
  companySubtext: {
    fontSize: 8,
    color: '#475569',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#059669',
    letterSpacing: 1.5,
  },
  invoiceBadge: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
    marginTop: 4,
  },
  headerDivider: {
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
    marginBottom: 12,
  },

  // Info Cards (Customer + Invoice details)
  infoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  customerBox: {
    flex: 1.2,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#f8fafc',
  },
  invoiceBox: {
    flex: 0.8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#f8fafc',
  },
  boxTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 4,
    marginBottom: 6,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  fieldLabel: {
    width: 90,
    fontSize: 8,
    color: '#64748b',
    fontFamily: 'Helvetica-Bold',
  },
  fieldValue: {
    flex: 1,
    fontSize: 8.5,
    color: '#0f172a',
  },

  // Dynamic Item Table
  table: {
    width: '100%',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 2,
  },
  tableHeaderText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 8.5,
    color: '#1e293b',
  },

  colSno: { width: '8%', textAlign: 'center' },
  colDesc: { width: '38%' },
  colHsn: { width: '16%' },
  colDetails: { width: '22%' },
  colAmount: { width: '16%', textAlign: 'right' },

  // Tax & Totals Section
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  wordsContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#f8fafc',
  },
  wordsTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  wordsText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    lineHeight: 1.3,
  },

  totalsContainer: {
    width: 220,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#ffffff',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 8.5,
    color: '#475569',
  },
  totalValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#059669',
    paddingTop: 5,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  grandTotalValue: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#059669',
  },

  // Declaration & Signatory Section
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 8,
    marginTop: 'auto',
  },
  declarationBox: {
    width: '60%',
  },
  declarationTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    marginBottom: 2,
  },
  declarationText: {
    fontSize: 7,
    color: '#64748b',
    lineHeight: 1.3,
  },
  signatoryBox: {
    width: '35%',
    alignItems: 'flex-end',
  },
  signatoryCompany: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 28,
  },
  signatoryLine: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
    borderTopWidth: 0.5,
    borderTopColor: '#475569',
    paddingTop: 2,
    textAlign: 'center',
    width: 140,
  },

  // Page numbering footer
  pageFooter: {
    position: 'absolute',
    bottom: 15,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 4,
  },
  pageFooterText: {
    fontSize: 7,
    color: '#94a3b8',
  },
});

function formatCurrency(num: number | undefined | null): string {
  const val = Number(num) || 0;
  return `₹ ${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr?: string | Date): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface PDFDocumentProps {
  statement: Statement;
  generatedAt: Date;
}

export function StockStatementDocument({ statement }: PDFDocumentProps) {
  const items = statement.items || [];
  const totalTaxable = statement.totalTaxableValue || items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const cgst = statement.cgstAmount || Math.round(totalTaxable * 0.04 * 100) / 100;
  const sgst = statement.sgstAmount || Math.round(totalTaxable * 0.04 * 100) / 100;
  const grandTotal = statement.grandTotal || Math.round((totalTaxable + cgst + sgst) * 100) / 100;
  const wordsText = statement.amountInWords || convertAmountToWords(grandTotal);

  return (
    <Document title={`${statement.statementNumber} - Tax Invoice`}>
      <Page size="A4" style={styles.page}>
        {/* Company Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src={logoPath} style={styles.logo} />
            <View>
              <Text style={styles.companyName}>{statement.industryName || 'WESTERN INDUSTRIES'}</Text>
              <Text style={styles.companySubtext}>
                {statement.companyAddress || 'Plot No 42, Western Industrial Estate, Phase 2, City - 560001'}
              </Text>
              <Text style={styles.companySubtext}>
                GSTIN: {statement.companyGstin || '29ABCDE1234F1ZH'} | PAN: {statement.companyPan || 'ABCDE1234F'} | Code: {statement.vendorCode || '32210'}
              </Text>
              <Text style={styles.companySubtext}>
                Ph: {statement.companyPhone || '+91 98765 43210'} | Email: {statement.companyEmail || 'info@westernindustries.in'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.invoiceBadge}>FY: {statement.financialYear || '2026 - 2027'}</Text>
          </View>
        </View>

        <View style={styles.headerDivider} />

        {/* Customer & Invoice Details Cards */}
        <View style={styles.infoContainer}>
          <View style={styles.customerBox}>
            <Text style={styles.boxTitle}>Customer / Invoicee Details</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Name:</Text>
              <Text style={styles.fieldValue}>{statement.customerName || 'N/A'}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Address:</Text>
              <Text style={styles.fieldValue}>{statement.customerAddress || 'N/A'}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Customer GSTIN:</Text>
              <Text style={styles.fieldValue}>{statement.customerGstin || 'URP / Not Provided'}</Text>
            </View>
          </View>

          <View style={styles.invoiceBox}>
            <Text style={styles.boxTitle}>Invoice Metadata</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Invoice No.:</Text>
              <Text style={[styles.fieldValue, { fontFamily: 'Helvetica-Bold' }]}>{statement.statementNumber}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Invoice Date:</Text>
              <Text style={styles.fieldValue}>{formatDate(statement.invoiceDate || statement.createdAt)}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Financial Year:</Text>
              <Text style={styles.fieldValue}>{statement.financialYear || '2026 - 2027'}</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Item Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colSno]}>S.No</Text>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colHsn]}>HSN/SAC</Text>
            <Text style={[styles.tableHeaderText, styles.colDetails]}>Details</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount (₹)</Text>
          </View>

          {items.map((item, idx) => (
            <View
              key={item.id || idx}
              style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.tableCell, styles.colSno]}>{item.serialNumber || idx + 1}</Text>
              <Text style={[styles.tableCell, styles.colDesc]}>{item.description || '—'}</Text>
              <Text style={[styles.tableCell, styles.colHsn]}>{item.hsnSac || '—'}</Text>
              <Text style={[styles.tableCell, styles.colDetails]}>{item.details || '—'}</Text>
              <Text style={[styles.tableCell, styles.colAmount]}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Summary (Amount in words + Tax totals - 8% Total GST) */}
        <View style={styles.summaryContainer}>
          <View style={styles.wordsContainer}>
            <Text style={styles.wordsTitle}>Amount in Words:</Text>
            <Text style={styles.wordsText}>{wordsText}</Text>
          </View>

          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Taxable Value:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalTaxable)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>CGST @ 4%:</Text>
              <Text style={styles.totalValue}>{formatCurrency(cgst)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>SGST @ 4%:</Text>
              <Text style={styles.totalValue}>{formatCurrency(sgst)}</Text>
            </View>

            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Grand Total:</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Declaration & Signatory Footer */}
        <View style={styles.footerSection}>
          <View style={styles.declarationBox}>
            <Text style={styles.declarationTitle}>Declaration & Terms:</Text>
            <Text style={styles.declarationText}>
              We declare that this tax invoice shows the actual price of the services/goods described and that all particulars are true and correct.
            </Text>
            <Text style={[styles.declarationText, { marginTop: 4, fontFamily: 'Helvetica-Bold' }]}>
              E & O.E. (Errors and Omissions Excepted)
            </Text>
          </View>

          <View style={styles.signatoryBox}>
            <Text style={styles.signatoryCompany}>For WESTERN INDUSTRIES</Text>
            <Text style={styles.signatoryLine}>Authorised Signatory</Text>
          </View>
        </View>

        {/* Page Footer */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.pageFooterText}>WESTERN INDUSTRIES — Tax Invoice System</Text>
          <Text
            style={styles.pageFooterText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
