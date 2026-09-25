"use client";

import type { ReactNode } from "react";

import styles from "./popup.module.css";

type PopupProps = {
  title: string;
  content: ReactNode;
  onCancel: () => void;
  onSave: () => void;
  cancelLabel?: string;
  saveLabel?: string;
  saveDisabled?: boolean;
};

export default function Popup({
  title,
  content,
  onCancel,
  onSave,
  cancelLabel = "Cancel",
  saveLabel = "Save",
  saveDisabled = false,
}: PopupProps) {
  return (
    <div className={styles.backdrop} role="presentation">
      <section
        className={styles.popup}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
      >
        <div className={styles.header}>
          <h2 id="popup-title">{title}</h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label={`Close ${title}`}
            onClick={onCancel}
          >
            X
          </button>
        </div>
        <div className={styles.content}>{content}</div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={styles.saveButton}
            disabled={saveDisabled}
            onClick={onSave}
          >
            {saveLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
