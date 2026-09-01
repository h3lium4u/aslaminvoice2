'use client';

import { useState, useEffect, useRef } from 'react';
import { ReceiptPrinter, ReceiptPrinterStage } from './ReceiptPrinter';
import styles from './ReceiptPrinterModal.module.css';

export interface ReceiptPrinterModalProps {
  isOpen: boolean;
  reportType?: 'statement' | 'monthly' | 'yearly';
  statementData?: {
    statementNumber?: string;
    customerName?: string;
    grandTotal?: number;
    items?: {
      serialNumber?: number;
      description?: string;
      amount?: number;
    }[];
  } | null;
  reportData?: any;
  onCompleteDownload: () => void;
  onClose: () => void;
}

export function ReceiptPrinterModal({
  isOpen,
  reportType = 'statement',
  statementData,
  onCompleteDownload,
  onClose,
}: ReceiptPrinterModalProps) {
  const [stage, setStage] = useState<ReceiptPrinterStage>('processing');

  const onCompleteRef = useRef(onCompleteDownload);
  useEffect(() => {
    onCompleteRef.current = onCompleteDownload;
  }, [onCompleteDownload]);

  const downloadFiredRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setStage('processing');
      downloadFiredRef.current = false;
      return;
    }

    downloadFiredRef.current = false;

    const timer1 = setTimeout(() => {
      setStage('printing');
    }, 700);

    const timer2 = setTimeout(() => {
      setStage('complete');
      if (!downloadFiredRef.current) {
        downloadFiredRef.current = true;
        onCompleteRef.current();
      }
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const items = statementData?.items || [];
  const grandTotal = statementData?.grandTotal || items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0) * 1.08;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>
            PRINTING TAX INVOICE PDF
          </span>
          <button onClick={onClose} className={styles.closeBtn}>
            Close ✕
          </button>
        </div>

        <ReceiptPrinter.Root stage={stage} className={styles.printerRoot}>
          <ReceiptPrinter.Machine>
            <ReceiptPrinter.Header>
              <ReceiptPrinter.Screen className={styles.screenFull}>
                <ReceiptPrinter.Status>
                  {stage === 'processing' && 'Processing Tax Invoice...'}
                  {stage === 'printing' && 'Printing Tax Invoice PDF...'}
                  {stage === 'complete' && 'Tax Invoice PDF Ready'}
                </ReceiptPrinter.Status>
              </ReceiptPrinter.Screen>
            </ReceiptPrinter.Header>

            <ReceiptPrinter.Output>
              <ReceiptPrinter.Paper>
                {/* Header */}
                <div className={styles.receiptHeader}>
                  <span className={styles.receiptCompany}>WESTERN INDUSTRIES</span>
                  <span className={styles.receiptTitle}>TAX INVOICE RECEIPT</span>
                </div>

                {/* Details */}
                <div className={styles.receiptSection}>
                  <div className={styles.receiptRow}>
                    <span className={styles.receiptLabel}>INVOICE NO.</span>
                    <span className={styles.receiptValueBold}>{statementData?.statementNumber || 'INV-001'}</span>
                  </div>
                  <div className={styles.receiptRow}>
                    <span className={styles.receiptLabel}>CUSTOMER</span>
                    <span className={styles.receiptValue}>{statementData?.customerName || 'Customer'}</span>
                  </div>
                </div>

                {/* Items */}
                <div className={styles.receiptItemsSection}>
                  <div className={styles.receiptItemHeader}>
                    <span style={{ width: '15%' }}>S.NO</span>
                    <span style={{ width: '55%' }}>DESCRIPTION</span>
                    <span style={{ width: '30%', textAlign: 'right' }}>AMOUNT</span>
                  </div>

                  {items.length === 0 ? (
                    <div className={styles.receiptNoItems}>No items</div>
                  ) : (
                    items.map((item, idx) => (
                      <div key={idx} className={styles.receiptItemRow}>
                        <span style={{ width: '15%' }}>{idx + 1}</span>
                        <span style={{ width: '55%' }}>{item.description || '—'}</span>
                        <span style={{ width: '30%', textAlign: 'right' }}>₹{Number(item.amount || 0).toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className={styles.receiptSection} style={{ borderTop: '1px double #333', marginTop: 8, paddingTop: 4 }}>
                  <div className={styles.receiptRow}>
                    <span className={styles.receiptLabel} style={{ fontWeight: 700 }}>GRAND TOTAL</span>
                    <span className={styles.receiptValueBold} style={{ color: '#059669' }}>
                      ₹{Number(grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className={styles.receiptFooter}>
                  <span>WESTERN INDUSTRIES TAX SYSTEM</span>
                  <span className={styles.receiptTimestamp}>
                    {new Date().toLocaleString('en-IN')}
                  </span>
                </div>
              </ReceiptPrinter.Paper>
            </ReceiptPrinter.Output>
          </ReceiptPrinter.Machine>
        </ReceiptPrinter.Root>

        {stage === 'complete' && (
          <div className={styles.modalFooter}>
            <span className={styles.successText}>
              ✓ PDF Downloaded
            </span>
            <button onClick={onClose} className={styles.doneBtn}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
