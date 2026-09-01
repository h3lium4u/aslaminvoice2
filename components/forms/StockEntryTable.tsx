'use client';

import { StatementItemInput } from '@/lib/validations';
import { StockEntryRow } from './StockEntryRow';
import styles from './StockEntryTable.module.css';

interface StockEntryTableProps {
  items: StatementItemInput[];
  onChange: (items: StatementItemInput[]) => void;
  errors?: Record<string, string>[];
}

export function StockEntryTable({ items, onChange, errors = [] }: StockEntryTableProps) {
  const handleRowChange = (
    index: number,
    field: keyof StatementItemInput,
    value: string | number
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleAddRow = () => {
    onChange([
      ...items,
      {
        sNo: items.length + 1,
        description: '',
        hsnSac: '',
        details: '',
        amount: 0,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>S.No.</th>
              <th style={{ minWidth: '240px' }}>Description *</th>
              <th style={{ width: '140px' }}>HSN/SAC Code</th>
              <th style={{ minWidth: '180px' }}>Details</th>
              <th style={{ width: '160px', textAlign: 'right' }}>Amount (₹) *</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <StockEntryRow
                key={idx}
                index={idx}
                item={item}
                onChange={handleRowChange}
                onRemove={handleRemoveRow}
                canRemove={items.length > 1}
                errors={errors[idx]}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.tableFooter}>
        <button
          type="button"
          onClick={handleAddRow}
          className={styles.addRowBtn}
        >
          + Add Item
        </button>
        <span className={styles.rowCount}>
          {items.length} {items.length === 1 ? 'item' : 'items'} total
        </span>
      </div>
    </div>
  );
}
