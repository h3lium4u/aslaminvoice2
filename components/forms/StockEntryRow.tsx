'use client';

import { StatementItemInput } from '@/lib/validations';
import styles from './StockEntryTable.module.css';

interface StockEntryRowProps {
  index: number;
  item: StatementItemInput;
  onChange: (index: number, field: keyof StatementItemInput, value: string | number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  errors?: Record<string, string>;
}

export function StockEntryRow({
  index,
  item,
  onChange,
  onRemove,
  canRemove,
  errors = {},
}: StockEntryRowProps) {
  return (
    <tr className={styles.row}>
      {/* S.No */}
      <td className={styles.sNoCell}>{index + 1}</td>

      {/* Description */}
      <td>
        <input
          type="text"
          value={item.description || ''}
          onChange={(e) => onChange(index, 'description', e.target.value)}
          placeholder="e.g. Industrial Assembly Services"
          className={`${styles.input} ${errors.description ? styles.inputError : ''}`}
        />
      </td>

      {/* HSN/SAC Code */}
      <td>
        <input
          type="text"
          value={item.hsnSac || ''}
          onChange={(e) => onChange(index, 'hsnSac', e.target.value)}
          placeholder="e.g. 998719"
          className={styles.input}
        />
      </td>

      {/* Details */}
      <td>
        <input
          type="text"
          value={item.details || ''}
          onChange={(e) => onChange(index, 'details', e.target.value)}
          placeholder="e.g. Shift 1 production batch"
          className={styles.input}
        />
      </td>

      {/* Amount */}
      <td>
        <div className={styles.currencyWrapper}>
          <span className={styles.currencySymbol}>₹</span>
          <input
            type="number"
            step="any"
            min="0"
            value={item.amount === 0 && !item.amount ? '' : item.amount}
            onChange={(e) =>
              onChange(index, 'amount', e.target.value === '' ? 0 : parseFloat(e.target.value))
            }
            placeholder="0.00"
            className={`${styles.input} ${styles.numericInput} ${
              errors.amount ? styles.inputError : ''
            }`}
          />
        </div>
      </td>

      {/* Action */}
      <td className={styles.actionCell}>
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          className={styles.removeBtn}
          title="Remove row"
        >
          Remove
        </button>
      </td>
    </tr>
  );
}
