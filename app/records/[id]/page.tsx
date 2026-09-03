'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Statement } from '@/types';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';
import { Toast } from '@/components/ui/Toast';
import { convertAmountToWords } from '@/lib/numberToWords';
import styles from './ViewRecord.module.css';

function formatDate(d?: string | Date): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(val?: number | any): string {
  if (val === undefined || val === null) return '₹ 0.00';
  return `₹ ${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ViewRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [statement, setStatement] = useState<Statement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    async function loadStatement() {
      try {
        const res = await fetch(`/api/statements/${id}`);
        if (!res.ok) throw new Error('Tax Invoice not found');
        const json = await res.json();
        setStatement(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStatement();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!statement) return;
    setToast({ message: 'Generating PDF document...', type: 'info' });
    try {
      const res = await fetch(`/api/statements/${id}/pdf`);
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${statement.statementNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setToast({ message: 'PDF downloaded successfully.', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'PDF failed', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!statement) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/statements/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete invoice');

      setToast({ message: 'Tax Invoice deleted successfully.', type: 'success' });
      setTimeout(() => {
        router.push('/records');
      }, 1000);
    } catch (err: any) {
      setToast({ message: err.message || 'Delete failed', type: 'error' });
      setIsDeleting(false);
    }
  };

  if (loading) return <div style={{ padding: 32 }}><LoadingState message="Loading tax invoice..." /></div>;
  if (error || !statement) return <div style={{ padding: 32 }}><ErrorState message={error || 'Tax invoice not found'} /></div>;

  // 18% Total GST (9% CGST + 9% SGST)
  const totalTaxable = statement.totalTaxableValue || statement.items.reduce((acc, it) => acc + Number(it.amount || 0), 0);
  const cgst = statement.cgstAmount || Math.round(totalTaxable * 0.09 * 100) / 100;
  const sgst = statement.sgstAmount || Math.round(totalTaxable * 0.09 * 100) / 100;
  const grandTotal = statement.grandTotal || Math.round((totalTaxable + cgst + sgst) * 100) / 100;
  const amountWords = statement.amountInWords || convertAmountToWords(grandTotal);

  return (
    <div className={styles.container}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Action Header */}
      <div className={styles.topActions}>
        <Link href="/records" className={styles.backBtn}>
          Back to Records
        </Link>

        <div className={styles.actionButtons}>
          <button onClick={handleDownloadPdf} className={styles.pdfBtn} style={{ backgroundColor: '#1e40af' }}>
            Download PDF
          </button>
          <Link href={`/records/${id}/edit`} className={styles.editBtn}>
            Edit Invoice
          </Link>
          <button onClick={() => setShowDeleteModal(true)} className={styles.deleteBtn}>
            Delete
          </button>
        </div>
      </div>

      {/* Digital Document View */}
      <div className={styles.documentCard}>
        {/* Document Header */}
        <div className={styles.docHeader}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img src="/logo.png" alt="Logo" style={{ width: 48, height: 48, objectFit: 'contain' }} />
              <div>
                <div className={styles.companyTitle} style={{ color: '#1e40af' }}>WESTERN INDUSTRIES</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  86/3, Opp. Ponnusamy Chettiar Thottam, KARIAPATTI - 626 106. Kariapatti Taluk, Virudhunagar District.
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  GSTIN: 33DJUPS7410G2ZT | PAN: DJUPS7410G | Vendor Code: 32210
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e40af', letterSpacing: 1 }}>TAX INVOICE</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>FY: {statement.financialYear || '2026 - 2027'}</div>
            </div>
          </div>
          <div className={styles.headerLine} style={{ backgroundColor: '#1e40af', marginTop: 12 }} />
        </div>

        {/* Metadata & Customer Grid */}
        <div className={styles.metaGrid}>
          <div className={styles.metaBox}>
            <span className={styles.metaLabel}>Invoice No.</span>
            <span className={styles.metaValueBadge}>{statement.statementNumber}</span>
          </div>
          <div className={styles.metaBox}>
            <span className={styles.metaLabel}>Invoice Date</span>
            <span className={styles.metaValue}>{formatDate(statement.invoiceDate || statement.createdAt)}</span>
          </div>
          <div className={styles.metaBox}>
            <span className={styles.metaLabel}>Customer Name</span>
            <span className={styles.metaValue}>{statement.customerName || 'M/s. SUNDRAM FASTENERS Ltd.,'}</span>
          </div>
          <div className={styles.metaBox}>
            <span className={styles.metaLabel}>Customer GSTIN</span>
            <span className={styles.metaValue}>{statement.customerGstin || '33AAACS8779D1Z7'}</span>
          </div>
        </div>

        {/* Customer Address */}
        {statement.customerAddress && (
          <div style={{ marginBottom: 20, padding: 12, backgroundColor: 'var(--bg-secondary)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
            <span className={styles.metaLabel}>Customer Address</span>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 4 }}>{statement.customerAddress}</div>
          </div>
        )}

        {/* Item Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr style={{ backgroundColor: '#1e40af' }}>
                <th style={{ width: '60px', textAlign: 'center', backgroundColor: '#1e40af' }}>S.No.</th>
                <th style={{ backgroundColor: '#1e40af' }}>Description</th>
                <th style={{ width: '140px', backgroundColor: '#1e40af' }}>HSN/SAC Code</th>
                <th style={{ backgroundColor: '#1e40af' }}>Details</th>
                <th style={{ textAlign: 'right', width: '160px', backgroundColor: '#1e40af' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {statement.items.map((item, idx) => (
                <tr key={item.id || idx} className={styles.row}>
                  <td className={styles.sNoCell}>{item.serialNumber || idx + 1}</td>
                  <td>{item.description || 'Labour Charges'}</td>
                  <td>{item.hsnSac || '998898'}</td>
                  <td>{item.details || 'Refer Annexure'}</td>
                  <td className={styles.numericCell}>{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tax Calculations & Amount in Words (18% Total GST = 9% CGST + 9% SGST) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginTop: 24, padding: 16, backgroundColor: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Amount in Words</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontStyle: 'italic' }}>{amountWords}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>Total Taxable Value:</span>
              <strong>{formatCurrency(totalTaxable)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>Add CGST @ 9%:</span>
              <strong>{formatCurrency(cgst)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>Add SGST @ 9%:</span>
              <strong>{formatCurrency(sgst)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: '#1e40af', borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
              <span>Grand Total:</span>
              <strong>{formatCurrency(grandTotal)}</strong>
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className={styles.docFooter} style={{ marginTop: 32 }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Declaration:</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              We declare that this invoice shows the actual price of services/goods and all details are true. E & O.E.
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>For WESTERN INDUSTRIES</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 24 }}>Authorised Signatory</div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        statement={statement}
        isOpen={showDeleteModal}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
