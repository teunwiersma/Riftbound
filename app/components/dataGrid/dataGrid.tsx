"use client";

import { useState, type ReactNode } from "react";

import Button from "../button/button";
import styles from "./dataGrid.module.css";

export type DataGridColumn<T> = {
  key: keyof T;
  header: string;
  render?: (row: T) => ReactNode;
};

export type DataGridLabel = {
  label: string;
  value: string;
};

export type DataGridActionHandler<T> = (
  selectedRows: T[],
  selectedRowIds: string[],
) => void | Promise<void>;

export type DataGridAction<T> = {
  label: string;
  disabled?: boolean;
  onClick?: DataGridActionHandler<T>;
  selectAll?: boolean;
  requiresSelection?: boolean;
};

type DataGridProps<T extends object> = {
  data: T[];
  columns: DataGridColumn<T>[];
  actions?: readonly DataGridAction<T>[];
  labels?: readonly DataGridLabel[];
  selectable?: boolean;
  rowIdKey?: keyof T;
};

export default function DataGrid<T extends object>({
  data,
  columns,
  actions,
  labels,
  selectable = false,
  rowIdKey = "id" as keyof T,
}: DataGridProps<T>) {
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [isActionPending, setIsActionPending] = useState(false);

  const rowIds = data.map((row) => String(row[rowIdKey]));

  const toggleRow = (row: T) => {
    const rowId = String(row[rowIdKey]);
    setSelectedRowIds((currentIds) =>
      currentIds.includes(rowId)
        ? currentIds.filter((id) => id !== rowId)
        : [...currentIds, rowId],
    );
  };

  const selectedRows = data.filter((row) =>
    selectedRowIds.includes(String(row[rowIdKey])),
  );

  const handleAction = async (action: DataGridAction<T>) => {
    if (action.selectAll) {
      const allRowsSelected =
        rowIds.length > 0 &&
        rowIds.every((rowId) => selectedRowIds.includes(rowId));

      setSelectedRowIds(allRowsSelected ? [] : rowIds);
      return;
    }

    if (!action.onClick) {
      return;
    }

    setIsActionPending(true);

    try {
      await action.onClick(selectedRows, selectedRowIds);
      setSelectedRowIds([]);
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <div className={styles.dataGrid}>
      {actions && actions.length > 0 && (
        <div className={styles.actionsBar}>
          <div className={styles.actionsBarLabels}>
            {labels &&
              labels.map((label) => (
                <span className={styles.actionsBarLabel} key={label.label}>
                  {label.label}
                  <span className={styles.actionsBarValue}>{label.value}</span>
                </span>
              ))}
          </div>
          {actions.map((action) => (
            <Button
              key={action.label}
              label={action.label}
              className={styles.actionsBarButton}
              disabled={
                action.disabled ||
                isActionPending ||
                (action.requiresSelection && selectedRowIds.length === 0)
              }
              onClick={() => void handleAction(action)}
            />
          ))}
        </div>
      )}
      <table>
        <thead>
          <tr>
            {selectable && <th aria-label="Select row" />}
            {columns.map((column) => (
              <th key={String(column.key)}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const rowId = String(row[rowIdKey]);
            const isSelected = selectedRowIds.includes(rowId);

            return (
              <tr
                key={rowId || rowIndex}
                className={isSelected ? styles.selectedRow : undefined}
                onClick={() => selectable && toggleRow(row)}
              >
                {selectable && (
                  <td className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      aria-label={`Select row ${rowId}`}
                      onChange={() => toggleRow(row)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={String(column.key)}>
                    {column.render
                      ? column.render(row)
                      : String(row[column.key] ?? "")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
