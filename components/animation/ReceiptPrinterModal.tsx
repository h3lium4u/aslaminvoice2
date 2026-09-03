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
      hsnSac?: string;
      details?: string;
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
  const taxableTotal = items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const grandTotal = statementData?.grandTotal || Math.round((taxableTotal * 1.08) * 100) / 100;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>
            PRINTING TAX INVOICE
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
                  {stage === 'printing' && 'Printing Invoice Document...'}
                  {stage === 'complete' && 'Tax Invoice PDF Ready'}
                </ReceiptPrinter.Status>
              </ReceiptPrinter.Screen>
            </ReceiptPrinter.Header>

            <ReceiptPrinter.Output>
              <ReceiptPrinter.Paper>
                {/* Header matching physical bill */}
                <div className={styles.receiptHeader}>
                  <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#800000', display: 'flex', justifyContent: 'space-between' }}>
                    <span>GSTIN: 33DJUPS7410G2ZT</span>
                    <span>VENDOR CODE: 32210</span>
                  </div>
                  <span className={styles.receiptCompany} style={{ color: '#800000', fontSize: '15px', fontWeight: '800', marginTop: '4px' }}>
                    WESTERN INDUSTRIES
                  </span>
                  <span style={{ fontSize: '8px', fontWeight: '600', color: '#333333' }}>
                    (An ISO 9001 : 2015 Certified Company)
                  </span>
                  <span className={styles.receiptTitle} style={{ borderColor: '#800000', color: '#800000' }}>
                    TAX INVOICE
                  </span>
                </div>

                {/* Details */}
                <div className={styles.receiptSection} style={{ borderTop: '1px solid #800000', borderBottom: '1px solid #800000', padding: '6px 0' }}>
                  <div className={styles.receiptRow}>
                    <span className={styles.receiptLabel}>INVOICE TO</span>
                    <span className={styles.receiptValueBold} style={{ color: '#0f172a' }}>
                      {statementData?.customerName || 'M/s. SUNDRAM FASTENERS Ltd.,'}
                    </span>
                  </div>
                  <div className={styles.receiptRow}>
                    <span className={styles.receiptLabel}>INVOICE NO</span>
                    <span className={styles.receiptValueBold}>{statementData?.statementNumber || 'INV-001'}</span>
                  </div>
                </div>

                {/* Items */}
                <div className={styles.receiptItemsSection}>
                  <div className={styles.receiptItemHeader} style={{ backgroundColor: '#fff0f0', color: '#800000', borderBottom: '1px solid #800000' }}>
                    <span style={{ width: '12%' }}>SL.</span>
                    <span style={{ width: '48%' }}>DESCRIPTION</span>
                    <span style={{ width: '20%' }}>HSN</span>
                    <span style={{ width: '20%', textAlign: 'right' }}>AMOUNT</span>
                  </div>

                  {items.length === 0 ? (
                    <div className={styles.receiptItemRow}>
                      <span style={{ width: '12%' }}>01.</span>
                      <span style={{ width: '48%' }}>Labour Charges</span>
                      <span style={{ width: '20%' }}>998898</span>
                      <span style={{ width: '20%', textAlign: 'right' }}>₹0.00</span>
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div key={idx} className={styles.receiptItemRow}>
                        <span style={{ width: '12%' }}>{String(idx + 1).padStart(2, '0')}.</span>
                        <span style={{ width: '48%' }}>{item.description || 'Labour Charges'}</span>
                        <span style={{ width: '20%' }}>{item.hsnSac || '998898'}</span>
                        <span style={{ width: '20%', textAlign: 'right' }}>₹{Number(item.amount || 0).toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className={styles.receiptSection} style={{ borderTop: '1px solid #800000', marginTop: 8, paddingTop: 4 }}>
                  <div className={styles.receiptRow}>
                    <span className={styles.receiptLabel} style={{ fontWeight: 700, color: '#800000' }}>GRAND TOTAL</span>
                    <span className={styles.receiptValueBold} style={{ color: '#800000', fontSize: '13px' }}>
                      ₹{Number(grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className={styles.receiptFooter} style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 6 }}>
                  <span style={{ fontWeight: 'bold', color: '#800000' }}>For WESTERN INDUSTRIES</span>
                  <span>Authorised Signatory</span>
                </div>
              </ReceiptPrinter.Paper>
            </ReceiptPrinter.Output>
          </ReceiptPrinter.Machine>
        </ReceiptPrinter.Root>

        {stage === 'complete' && (
          <div className={styles.modalFooter}>
            <span className={styles.successText} style={{ color: '#800000' }}>
              ✓ Tax Invoice PDF Downloaded
            </span>
            <button onClick={onClose} className={styles.doneBtn} style={{ backgroundColor: '#800000', color: '#ffffff' }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
