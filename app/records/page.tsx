'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { StatementListItem } from '@/types';
import { SearchBar } from '@/components/records/SearchBar';
import { FilterPanel } from '@/components/records/FilterPanel';
import { RecordsTable } from '@/components/records/RecordsTable';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';
import { ReceiptPrinterModal } from '@/components/animation/ReceiptPrinterModal';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { Toast } from '@/components/ui/Toast';
import styles from './RecordsPage.module.css';

export default function RecordsPage() {
  const [statements, setStatements] = useState<StatementListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'all' | 'monthly' | 'yearly'>('all');

  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [vendor, setVendor] = useState('');
  const [sort, setSort] = useState('recent');

  const [deleteTarget, setDeleteTarget] = useState<StatementListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fetchStatements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (month) params.set('month', month);
      if (year) params.set('year', year);
      if (vendor) params.set('vendor', vendor);
      if (sort) params.set('sort', sort);

      const res = await fetch(`/api/statements?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load tax invoice records');

      const json = await res.json();
      setStatements(json.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, month, year, vendor, sort]);

  useEffect(() => {
    fetchStatements();
  }, [fetchStatements]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/statements/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete invoice');

      setToast({
        message: `Tax Invoice ${deleteTarget.statementNumber} permanently deleted.`,
        type: 'success',
      });

      setDeleteTarget(null);
      fetchStatements();
    } catch (err: any) {
      setToast({
        message: err.message || 'Deletion failed',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const [printerModalData, setPrinterModalData] = useState<any>(null);
  const pdfDownloadFiredRef = useRef(false);

  const handleDownloadPdf = async (id: string) => {
    pdfDownloadFiredRef.current = false;
    try {
      const res = await fetch(`/api/statements/${id}`);
      if (!res.ok) throw new Error('Could not fetch invoice details');
      const json = await res.json();
      setPrinterModalData(json.data);
    } catch (err: any) {
      setToast({ message: err.message || 'Could not prepare PDF animation', type: 'error' });
    }
  };

  const triggerActualPdfDownload = useCallback(async () => {
    if (pdfDownloadFiredRef.current) return;
    pdfDownloadFiredRef.current = true;

    if (!printerModalData?.id) return;
    try {
      const res = await fetch(`/api/statements/${printerModalData.id}/pdf`);
      if (!res.ok) throw new Error('PDF download failed');
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
      setToast({ message: err.message || 'Could not download PDF', type: 'error' });
    }
  }, [printerModalData]);

  return (
    <div className={styles.container}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.breadcrumb}>WESTERN INDUSTRIES / RECORDS INTERFACE</span>
          <h1 className={styles.pageTitle}>Tax Invoice Records</h1>
          <p className={styles.pageSubtitle}>
            Sorted by most recent entries by default. View, search, edit, delete tax invoices, and download PDF statements.
          </p>
        </div>

        <div className={styles.headerButtons}>
          <Link href="/" className={styles.newEntryBtn}>
            + New Tax Invoice
          </Link>
        </div>
      </div>

      {/* Mode View Tabs & Filter Bar */}
      <div className={styles.filterBarCard}>
        <div className={styles.viewTabs}>
          <button
            onClick={() => {
              setViewMode('all');
              setMonth('');
              setYear('');
            }}
            className={`${styles.tabBtn} ${viewMode === 'all' ? styles.tabActive : ''}`}
          >
            All Invoices
          </button>
        </div>

        <SearchBar value={search} onChange={setSearch} />
        <FilterPanel
          selectedMonth={month}
          selectedYear={year}
          selectedVendor={vendor}
          selectedSort={sort}
          onMonthChange={setMonth}
          onYearChange={setYear}
          onVendorChange={setVendor}
          onSortChange={setSort}
          onReset={() => {
            setSearch('');
            setMonth('');
            setYear('');
            setVendor('');
            setSort('recent');
            setViewMode('all');
          }}
        />
      </div>

      {/* Table Section */}
      {loading && <LoadingState message="Searching tax invoice records..." />}
      {error && <ErrorState message={error} onRetry={fetchStatements} />}

      {!loading && !error && statements.length === 0 && (
        <EmptyState
          title="No tax invoices found"
          description="No tax invoices exist in the database. Create a new tax invoice to populate your register."
          action={
            <Link href="/" className={styles.newEntryBtn}>
              + Create New Tax Invoice
            </Link>
          }
        />
      )}

      {!loading && !error && statements.length > 0 && (
        <RecordsTable
          statements={statements}
          onDeleteClick={(stmt) => setDeleteTarget(stmt)}
          onDownloadPdf={handleDownloadPdf}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        statement={deleteTarget}
        isOpen={Boolean(deleteTarget)}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Receipt Printer Modal Animation for PDF */}
      <ReceiptPrinterModal
        isOpen={Boolean(printerModalData)}
        reportType="statement"
        statementData={printerModalData}
        onCompleteDownload={triggerActualPdfDownload}
        onClose={() => setPrinterModalData(null)}
      />
    </div>
  );
}
