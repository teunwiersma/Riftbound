import type { ReactNode } from "react";

import styles from "./dataGrid.module.css";

export type DataGridColumn<T> = {
  key: keyof T;
  header: string;
  render?: (row: T) => ReactNode;
};

type DataGridProps<T extends object> = {
  data: T[];
  columns: DataGridColumn<T>[];
  actions?: readonly string[];
};

export default function DataGrid<T extends object>({
  data,
  columns,
  actions = [],
}: DataGridProps<T>) {
  return (
    <div className={styles.dataGrid}>
      {actions.length > 0 && (
        <div className={styles.actionsBar}>
          {actions.map((action) => (
            <button
              key={action}
              type="button"
              className={styles.actionsBarButton}
            >
              {action}
            </button>
          ))}
        </div>
      )}
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={String(column.key)}>
                  {column.render
                    ? column.render(row)
                    : String(row[column.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
