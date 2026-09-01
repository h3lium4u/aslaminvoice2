'use client';

import Link from 'next/link';
import { StatementListItem } from '@/types';
import styles from './Records.module.css';

function formatDate(d?: string | Date): string {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(val?: number | any): string {
  if (val === undefined || val === null) return '₹ 0.00';
  return `₹ ${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface RecordsTableProps {
  statements: StatementListItem[];
  onDeleteClick: (statement: StatementListItem) => void;
  onDownloadPdf: (id: string, number: string) => void;
}

export function RecordsTable({
  statements,
  onDeleteClick,
  onDownloadPdf,
}: RecordsTableProps) {
  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Invoice No.</th>
              <th>Customer Name</th>
              <th>Financial Year</th>
              <th style={{ textAlign: 'center' }}>Items</th>
              <th style={{ textAlign: 'right' }}>Taxable Value</th>
              <th style={{ textAlign: 'right' }}>Grand Total</th>
              <th>Invoice Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {statements.map((s) => {
              return (
                <tr key={s.id} className={styles.row}>
                  {/* Invoice No */}
                  <td>
                    <Link
                      href={`/records/${s.id}`}
                      className={styles.statementIdBadge}
                    >
                      {s.statementNumber}
                    </Link>
                  </td>

                  {/* Customer Name */}
                  <td className={styles.vendorNameCell}>{s.customerName || 'N/A'}</td>

                  {/* Financial Year */}
                  <td>
                    <span className={styles.vendorCodeTag}>{s.financialYear || '2026 - 2027'}</span>
                  </td>

                  {/* Items Count */}
                  <td style={{ textAlign: 'center' }}>
                    <span className={styles.entriesCountTag}>
                      {s._count?.items ?? 0}
                    </span>
                  </td>

                  {/* Total Taxable Value */}
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatCurrency(s.totalTaxableValue)}
                  </td>

                  {/* Grand Total */}
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-green)' }}>
                    {formatCurrency(s.grandTotal)}
                  </td>

                  {/* Invoice Date */}
                  <td className={styles.dateCell}>{formatDate(s.invoiceDate || s.createdAt)}</td>

                  {/* Actions */}
                  <td>
                    <div className={styles.actionsCell}>
                      <Link
                        href={`/records/${s.id}`}
                        className={styles.actionBtn}
                        title="View invoice details"
                      >
                        View
                      </Link>

                      <Link
                        href={`/records/${s.id}/edit`}
                        className={styles.actionBtn}
                        title="Edit invoice"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => onDownloadPdf(s.id, s.statementNumber)}
                        className={styles.actionBtn}
                        title="Download PDF invoice"
                      >
                        PDF
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteClick(s)}
                        className={`${styles.actionBtn} ${styles.deleteActionBtn}`}
                        title="Delete invoice"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
