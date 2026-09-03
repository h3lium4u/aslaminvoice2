'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CreateStatementInput, StatementItemInput } from '@/lib/validations';
import { Statement } from '@/types';
import { StockEntryTable } from './StockEntryTable';
import { Toast } from '@/components/ui/Toast';
import { ReceiptPrinterModal } from '@/components/animation/ReceiptPrinterModal';
import { convertAmountToWords } from '@/lib/numberToWords';
import styles from './StatementForm.module.css';

const FINANCIAL_YEARS = [
  '2022 - 2023',
  '2023 - 2024',
  '2024 - 2025',
  '2025 - 2026',
  '2026 - 2027',
  '2027 - 2028',
];

// Permanent Fixed Customer Details as requested
export const DEFAULT_CUSTOMER = {
  name: 'M/s. SUNDRAM FASTENERS Ltd.,',
  address: 'Krishnapuram, Aviyur - 620 160. Kariapatti Taluk, Virudhunagar District.',
  gstin: '33AAACS8779D1Z7',
  pan: 'AAACS8779D',
};

interface StatementFormProps {
  initialData?: Statement;
  isEditing?: boolean;
}

export function StatementForm({ initialData, isEditing = false }: StatementFormProps) {
  const router = useRouter();
  const todayStr = new Date().toISOString().split('T')[0];

  const [statementNumber, setStatementNumber] = useState<string>(
    initialData?.statementNumber || `INV-${Date.now().toString().slice(-6)}`
  );
  const [invoiceDate, setInvoiceDate] = useState<string>(
    initialData?.invoiceDate
      ? new Date(initialData.invoiceDate).toISOString().split('T')[0]
      : todayStr
  );
  const [financialYear, setFinancialYear] = useState<string>(
    initialData?.financialYear || '2026 - 2027'
  );

  // Permanent Customer Details (Read-only for workers)
  const customerName = initialData?.customerName || DEFAULT_CUSTOMER.name;
  const customerAddress = initialData?.customerAddress || DEFAULT_CUSTOMER.address;
  const customerGstin = initialData?.customerGstin || DEFAULT_CUSTOMER.gstin;

  // Dynamic Item Table (Pre-filled with Labour Charges default if new entry)
  const [items, setItems] = useState<StatementItemInput[]>(
    initialData?.items && initialData.items.length > 0
      ? initialData.items.map((it) => ({
          sNo: it.serialNumber,
          description: it.description || '',
          hsnSac: it.hsnSac || '',
          details: it.details || '',
          amount: Number(it.amount) || 0,
        }))
      : [
          {
            sNo: 1,
            description: 'Labour Charges',
            hsnSac: '998898',
            details: 'Refer Annexure',
            amount: 0,
          },
        ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [rowErrors, setRowErrors] = useState<Record<string, string>[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Auto-calculated Tax & Total values (8% Total GST = 4% CGST + 4% SGST)
  const totalTaxableValue = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const cgstAmount = Math.round(totalTaxableValue * 0.04 * 100) / 100;
  const sgstAmount = Math.round(totalTaxableValue * 0.04 * 100) / 100;
  const grandTotal = Math.round((totalTaxableValue + cgstAmount + sgstAmount) * 100) / 100;
  const amountInWords = convertAmountToWords(grandTotal);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const validate = (): boolean => {
    if (!statementNumber.trim()) {
      setToast({ message: 'Invoice Number is required.', type: 'error' });
      return false;
    }

    const filledItems = items.filter((it) => it.description.trim() || Number(it.amount) > 0);
    if (filledItems.length === 0) {
      setToast({ message: 'Please enter at least one service/item in the invoice.', type: 'error' });
      return false;
    }

    const rErrors: Record<string, string>[] = [];
    let hasError = false;

    items.forEach((item) => {
      const err: Record<string, string> = {};
      if (!item.description || !item.description.trim()) {
        err.description = 'Description required';
      }
      if (isNaN(item.amount) || item.amount < 0) {
        err.amount = 'Invalid amount';
      }
      rErrors.push(err);
      if (Object.keys(err).length > 0) hasError = true;
    });

    setRowErrors(rErrors);
    if (hasError) {
      setToast({ message: 'Please resolve item row errors.', type: 'error' });
      return false;
    }

    return true;
  };

  const saveInvoice = async (): Promise<Statement | null> => {
    if (!validate()) return null;

    setIsSubmitting(true);

    const filledItems = items.filter((it) => it.description.trim() || Number(it.amount) > 0);

    const payload: CreateStatementInput & Record<string, any> = {
      statementNumber: statementNumber.trim(),
      invoiceDate,
      financialYear,
      customerName,
      customerAddress,
      customerGstin,
      totalTaxableValue,
      cgstAmount,
      sgstAmount,
      grandTotal,
      amountInWords,
      items: filledItems.map((it, idx) => ({
        sNo: idx + 1,
        description: it.description.trim(),
        hsnSac: it.hsnSac?.trim() || undefined,
        details: it.details?.trim() || undefined,
        amount: Number(it.amount) || 0,
      })),
    };

    try {
      const url = isEditing ? `/api/statements/${initialData?.id}` : '/api/statements';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save tax invoice');
      }

      setIsDirty(false);
      setToast({
        message: isEditing ? 'Tax Invoice updated successfully.' : 'Tax Invoice saved successfully.',
        type: 'success',
      });

      return data.data as Statement;
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || 'Something went wrong.', type: 'error' });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await saveInvoice();
    if (saved) {
      setTimeout(() => {
        router.push('/records');
      }, 1000);
    }
  };

  const [printerModalData, setPrinterModalData] = useState<any>(null);
  const pdfDownloadFiredRef = useRef(false);

  const handleSaveAndPdf = async () => {
    setIsDownloadingPdf(true);
    const saved = await saveInvoice();
    if (saved) {
      pdfDownloadFiredRef.current = false;
      setPrinterModalData({
        statementId: saved.id,
        statementNumber: saved.statementNumber,
        invoiceDate: saved.invoiceDate,
        financialYear: saved.financialYear,
        customerName: saved.customerName,
        customerAddress: saved.customerAddress,
        customerGstin: saved.customerGstin,
        totalTaxableValue: saved.totalTaxableValue,
        cgstAmount: saved.cgstAmount,
        sgstAmount: saved.sgstAmount,
        grandTotal: saved.grandTotal,
        amountInWords: saved.amountInWords,
        items: saved.items,
      });
    } else {
      setIsDownloadingPdf(false);
    }
  };

  const triggerActualPdfDownload = useCallback(async () => {
    if (pdfDownloadFiredRef.current) return;
    pdfDownloadFiredRef.current = true;

    if (!printerModalData?.statementId) return;
    try {
      const res = await fetch(`/api/statements/${printerModalData.statementId}/pdf`);
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${printerModalData.statementNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setToast({ message: 'Tax Invoice PDF downloaded successfully.', type: 'success' });
    } catch (err: any) {
      setToast({
        message: 'PDF generation failed.',
        type: 'error',
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  }, [printerModalData]);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 1. Header Information */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logo.jpg"
              alt="Western Industries Logo"
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'contain',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
                padding: '2px',
                border: '1px solid #cbd5e1',
              }}
            />
            <h2 className={styles.sectionTitle}>NEW TAX INVOICE</h2>
          </div>
          <span className={styles.sectionBadge}>INVOICE DETAILS</span>
        </div>

        <div className={styles.grid}>
          {/* Invoice No. */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Invoice No. *</label>
            <input
              type="text"
              value={statementNumber}
              onChange={(e) => {
                setStatementNumber(e.target.value);
                setIsDirty(true);
              }}
              placeholder="e.g. INV-2026-001"
              className={styles.input}
            />
          </div>

          {/* Date */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Date *</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => {
                setInvoiceDate(e.target.value);
                setIsDirty(true);
              }}
              className={styles.input}
            />
          </div>

          {/* Financial Year */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Financial Year *</label>
            <select
              value={financialYear}
              onChange={(e) => {
                setFinancialYear(e.target.value);
                setIsDirty(true);
              }}
              className={styles.input}
            >
              {FINANCIAL_YEARS.map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Customer Details (PERMANENT / FIXED FOR SUNDRAM FASTENERS LTD.) */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>INVOICE TO & PLACE OF SUPPLY</h2>
          <span className={styles.sectionBadge} style={{ backgroundColor: '#800000', color: '#ffffff', padding: '2px 8px', borderRadius: '4px' }}>
            PERMANENT CUSTOMER
          </span>
        </div>

        <div className={styles.grid}>
          <div className={styles.fieldGroup} style={{ gridColumn: 'span 2' }}>
            <label className={styles.label}>Customer / Invoicee Name</label>
            <input
              type="text"
              value={customerName}
              readOnly
              className={`${styles.input} ${styles.readOnlyInput}`}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>GSTIN & PAN</label>
            <input
              type="text"
              value={`GSTIN: ${DEFAULT_CUSTOMER.gstin}  PAN: ${DEFAULT_CUSTOMER.pan}`}
              readOnly
              className={`${styles.input} ${styles.readOnlyInput}`}
            />
          </div>

          <div className={styles.fieldGroup} style={{ gridColumn: 'span 3' }}>
            <label className={styles.label}>Customer Address</label>
            <input
              type="text"
              value={customerAddress}
              readOnly
              className={`${styles.input} ${styles.readOnlyInput}`}
            />
          </div>
        </div>
      </div>

      {/* 3. Services / Item Details Dynamic Table */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>DESCRIPTION OF SERVICES</h2>
          <span className={styles.sectionBadge}>DYNAMIC TABLE</span>
        </div>

        <StockEntryTable
          items={items}
          onChange={(newItems) => {
            setItems(newItems);
            setIsDirty(true);
          }}
          errors={rowErrors}
        />
      </div>

      {/* 4. Automatically Calculated Tax & Total Box (8% Total GST) */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>TAX & AMOUNT CALCULATIONS</h2>
          <span className={styles.sectionBadge}>AUTO CALCULATED (8% GST)</span>
        </div>

        <div className={styles.calculationsContainer}>
          <div className={styles.calcRow}>
            <span>Total Taxable Value</span>
            <strong>₹ {totalTaxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div className={styles.calcRow}>
            <span>Add CGST @ 4%</span>
            <strong>₹ {cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div className={styles.calcRow}>
            <span>Add SGST @ 4%</span>
            <strong>₹ {sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div className={`${styles.calcRow} ${styles.grandTotalRow}`}>
            <span>Grand Total</span>
            <strong>₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>

          <div className={styles.wordsBox}>
            <span className={styles.wordsLabel}>Indian Rupees (Amount in Words):</span>
            <div className={styles.wordsText}>{amountInWords}</div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className={styles.actionFooter}>
        <button
          type="button"
          onClick={() => router.push('/records')}
          className={styles.cancelBtn}
        >
          Cancel
        </button>

        <div className={styles.rightActions}>
          <button
            type="submit"
            disabled={isSubmitting || isDownloadingPdf}
            className={styles.saveBtn}
          >
            {isSubmitting ? 'Saving...' : 'Save Invoice'}
          </button>

          <button
            type="button"
            onClick={handleSaveAndPdf}
            disabled={isSubmitting || isDownloadingPdf}
            className={styles.savePdfBtn}
          >
            {isDownloadingPdf ? 'Generating PDF...' : 'Save & Download PDF'}
          </button>
        </div>
      </div>

      {/* Animated Receipt Printer Modal */}
      <ReceiptPrinterModal
        isOpen={Boolean(printerModalData)}
        statementData={printerModalData}
        onCompleteDownload={triggerActualPdfDownload}
        onClose={() => {
          setPrinterModalData(null);
          router.push('/records');
        }}
      />
    </form>
  );
}
