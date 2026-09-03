import path from 'path';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Statement } from '@/types';
import { convertAmountToWords } from '@/lib/numberToWords';

Font.registerHyphenationCallback((word) => [word]);

const logoPath = path.join(process.cwd(), 'public', 'logo.png');

const ROYAL_BLUE = '#1e40af';
const BORDER_COLOR = '#1e40af';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 25,
    backgroundColor: '#FFFFFF',
  },

  // Outer Bill Frame
  billFrame: {
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    height: '100%',
    padding: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  // 1. Top Bar (GSTIN / PAN / TAX INVOICE / VENDOR CODE)
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  topText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: ROYAL_BLUE,
  },
  taxInvoiceTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    backgroundColor: ROYAL_BLUE,
    paddingHorizontal: 10,
    paddingVertical: 3,
    letterSpacing: 1,
    borderRadius: 2,
  },

  // 2. Company Header
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    paddingBottom: 6,
  },
  logo: {
    width: 52,
    height: 52,
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  companyTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: ROYAL_BLUE,
    letterSpacing: 1.5,
  },
  isoText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 7,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  cellText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: ROYAL_BLUE,
    textAlign: 'right',
  },

  // 3. Customer & Invoice Info Grid
  infoGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 6,
  },
  customerBox: {
    flex: 1.3,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
  },
  infoBoxTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: ROYAL_BLUE,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  customerName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    marginBottom: 2,
  },
  customerText: {
    fontSize: 8,
    color: '#222222',
    lineHeight: 1.25,
  },
  customerGstin: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: ROYAL_BLUE,
    marginTop: 3,
  },

  invoiceMetaBox: {
    flex: 0.7,
    flexDirection: 'column',
  },
  metaTopRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  metaHalf: {
    flex: 1,
    padding: 4,
  },
  metaHalfRight: {
    borderLeftWidth: 1,
    borderLeftColor: BORDER_COLOR,
  },
  metaLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: ROYAL_BLUE,
  },
  metaVal: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    marginTop: 1,
  },
  fyRow: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  fyVal: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: ROYAL_BLUE,
  },

  // 4. Description of Services Table
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 6,
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  thText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: ROYAL_BLUE,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableCell: {
    fontSize: 8.5,
    color: '#111111',
  },

  colSlNo: { width: '8%', textAlign: 'center' },
  colDesc: { width: '42%' },
  colHsn: { width: '18%' },
  colDetails: { width: '18%' },
  colAmount: { width: '14%', textAlign: 'right' },

  // 5. Calculations Block
  calcTable: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 6,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
    paddingVertical: 3.5,
    paddingHorizontal: 8,
  },
  calcLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#222222',
  },
  calcVal: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
  },
  grandTotalRow: {
    backgroundColor: '#eff6ff',
    borderBottomWidth: 0,
    paddingVertical: 5,
  },
  grandTotalLabel: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: ROYAL_BLUE,
  },
  grandTotalVal: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: ROYAL_BLUE,
  },

  // 6. Words & E&OE Row
  wordsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    padding: 6,
    marginBottom: 6,
    backgroundColor: '#fafafa',
  },
  wordsLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: ROYAL_BLUE,
    fontStyle: 'italic',
  },
  wordsVal: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    marginTop: 1,
  },
  eoeText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: ROYAL_BLUE,
    fontStyle: 'italic',
  },

  // 7. Footer Declaration & Signatory
  footerGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  declBox: {
    flex: 1.2,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
  },
  declTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: ROYAL_BLUE,
    textDecoration: 'underline',
    marginBottom: 2,
  },
  declText: {
    fontSize: 7,
    color: '#333333',
    lineHeight: 1.2,
    fontStyle: 'italic',
  },
  sigBox: {
    flex: 0.8,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sigFor: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: ROYAL_BLUE,
  },
  sigTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#222222',
    marginTop: 22,
  },
});

function formatCurrency(num: number | undefined | null): string {
  const val = Number(num) || 0;
  return `${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  const cgst = statement.cgstAmount || Math.round(totalTaxable * 0.09 * 100) / 100;
  const sgst = statement.sgstAmount || Math.round(totalTaxable * 0.09 * 100) / 100;
  const grandTotal = statement.grandTotal || Math.round((totalTaxable + cgst + sgst) * 100) / 100;
  const wordsText = statement.amountInWords || convertAmountToWords(grandTotal);

  return (
    <Document title={`${statement.statementNumber} - Tax Invoice`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.billFrame}>
          {/* 1. Top Bar */}
          <View style={styles.topBar}>
            <Text style={styles.topText}>
              GSTIN : 33DJUPS7410G2ZT   PAN : DJUPS7410G
            </Text>
            <Text style={styles.taxInvoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.topText}>VENDOR CODE : 32210</Text>
          </View>

          {/* 2. Company Header */}
          <View style={styles.companyHeader}>
            <Image src={logoPath} style={styles.logo} />
            <View style={styles.headerCenter}>
              <Text style={styles.companyTitle}>WESTERN INDUSTRIES</Text>
              <Text style={styles.isoText}>(An ISO 9001 : 2015 Certified Company)</Text>
              <Text style={styles.addressText}>
                86/3, Opp. Ponnusamy Chettiar Thottam, KARIAPATTI - 626 106. Kariapatti Taluk, Virudhunagar District.
              </Text>
              <Text style={styles.addressText}>
                e-mail : westernindustries1973@gmail.com
              </Text>
            </View>
            <View>
              <Text style={styles.cellText}>Cell :</Text>
              <Text style={styles.cellText}>90921 37558</Text>
            </View>
          </View>

          {/* 3. Customer & Invoice Metadata Info Box */}
          <View style={styles.infoGrid}>
            <View style={styles.customerBox}>
              <Text style={styles.infoBoxTitle}>Invoice to & Place of Supply</Text>
              <Text style={styles.customerName}>
                {statement.customerName || 'M/s. SUNDRAM FASTENERS Ltd.,'}
              </Text>
              <Text style={styles.customerText}>
                {statement.customerAddress || 'Krishnapuram, Aviyur - 620 160. Kariapatti Taluk, Virudhunagar District.'}
              </Text>
              <Text style={styles.customerGstin}>
                GSTIN : {statement.customerGstin || '33AAACS8779D1Z7'}  PAN : AAACS8779D
              </Text>
            </View>

            <View style={styles.invoiceMetaBox}>
              <View style={styles.metaTopRow}>
                <View style={styles.metaHalf}>
                  <Text style={styles.metaLabel}>INVOICE No.</Text>
                  <Text style={styles.metaVal}>{statement.statementNumber}</Text>
                </View>
                <View style={[styles.metaHalf, styles.metaHalfRight]}>
                  <Text style={styles.metaLabel}>Date</Text>
                  <Text style={styles.metaVal}>{formatDate(statement.invoiceDate || statement.createdAt)}</Text>
                </View>
              </View>
              <View style={styles.fyRow}>
                <Text style={styles.metaLabel}>PERIOD / FY</Text>
                <Text style={styles.fyVal}>{statement.financialYear || '2026 - 2027'}</Text>
              </View>
            </View>
          </View>

          {/* 4. Description of Services Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.thText, styles.colSlNo]}>Sl. No.</Text>
              <Text style={[styles.thText, styles.colDesc]}>Description of Services</Text>
              <Text style={[styles.thText, styles.colHsn]}>HSN / SAC CODE</Text>
              <Text style={[styles.thText, styles.colDetails]}>Details</Text>
              <Text style={[styles.thText, styles.colAmount]}>Amount (Rs.)</Text>
            </View>

            {items.map((item, idx) => (
              <View key={item.id || idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colSlNo]}>
                  {String(item.serialNumber || idx + 1).padStart(2, '0')}.
                </Text>
                <Text style={[styles.tableCell, styles.colDesc]}>{item.description || 'Labour Charges'}</Text>
                <Text style={[styles.tableCell, styles.colHsn]}>{item.hsnSac || '998898'}</Text>
                <Text style={[styles.tableCell, styles.colDetails]}>{item.details || 'Refer Annexure'}</Text>
                <Text style={[styles.tableCell, styles.colAmount]}>{formatCurrency(item.amount)}</Text>
              </View>
            ))}
          </View>

          {/* 5. Calculations Block (18% Total GST = 9% CGST + 9% SGST) */}
          <View style={styles.calcTable}>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Total Taxable Value</Text>
              <Text style={styles.calcVal}>{formatCurrency(totalTaxable)}</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Add CGST @ 9%</Text>
              <Text style={styles.calcVal}>{formatCurrency(cgst)}</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Add SGST @ 9%</Text>
              <Text style={styles.calcVal}>{formatCurrency(sgst)}</Text>
            </View>
            <View style={[styles.calcRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalVal}>Rs. {formatCurrency(grandTotal)}</Text>
            </View>
          </View>

          {/* 6. Words & E&OE Row */}
          <View style={styles.wordsRow}>
            <View>
              <Text style={styles.wordsLabel}>Indian Rupees</Text>
              <Text style={styles.wordsVal}>{wordsText}</Text>
            </View>
            <Text style={styles.eoeText}>E & O.E.</Text>
          </View>

          {/* 7. Footer Declaration & Signatory */}
          <View style={styles.footerGrid}>
            <View style={styles.declBox}>
              <Text style={styles.declTitle}>Declaration</Text>
              <Text style={styles.declText}>
                We declare that this Invoice shows the actual price of the goods described and that all particulars are true and correct
              </Text>
            </View>

            <View style={styles.sigBox}>
              <Text style={styles.sigFor}>For WESTERN INDUSTRIES</Text>
              <Text style={styles.sigTitle}>Authorised Signatory</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
