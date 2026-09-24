"use client";

import type { ReactNode } from "react";

import Button, { ButtonState } from "../button/button";
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

export { ButtonState as DataGridActionState } from "../button/button";

export type DataGridAction = {
  label: string;
  state?: ButtonState;
  onClick?: () => void;
};

type DataGridProps<T extends object> = {
  data: T[];
  columns: DataGridColumn<T>[];
  actions?: readonly DataGridAction[];
  labels?: readonly DataGridLabel[];
};

export default function DataGrid<T extends object>({
  data,
  columns,
  actions = [],
  labels = [],
}: DataGridProps<T>) {
  return (
    <div className={styles.dataGrid}>
      {actions.length > 0 && (
        <div className={styles.actionsBar}>
          <div className={styles.actionsBarLabels}>
            {labels.map((label) => (
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
              state={action.state}
              onClick={action.onClick}
            />
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
