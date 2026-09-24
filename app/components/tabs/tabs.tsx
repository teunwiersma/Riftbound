"use client";

import { useState, type ReactNode } from "react";
import styles from "./tabs.module.css";

export type Tab = {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
};

type TabsProps = {
  tabs: Tab[];
  activeTab?: string;
  defaultActiveTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  loading?: boolean;
};

export default function Tabs({
  tabs,
  activeTab,
  defaultActiveTab,
  onChange,
  className = "",
  loading = false,
}: TabsProps) {
  const firstEnabledTab = tabs.find((tab) => !tab.disabled)?.id ?? "";
  const [selectedTab, setSelectedTab] = useState(
    defaultActiveTab ?? firstEnabledTab,
  );

  const currentTabId = activeTab ?? selectedTab;
  const currentTab = tabs.find((tab) => tab.id === currentTabId) ?? tabs[0];

  function selectTab(tab: Tab) {
    if (tab.disabled) return;

    setSelectedTab(tab.id);
    onChange?.(tab.id);
  }

  return (
    <section
      className={`${styles.tabs} ${className} ${loading ? styles.loading : ""}`}
      aria-busy={loading}
    >
      <div className={styles.tabList} role="tablist" aria-label="Page sections">
        {tabs.map((tab) => {
          const isActive = tab.id === currentTab?.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              disabled={tab.disabled || loading}
              className={`${styles.tab} ${isActive ? styles.active : ""}`}
              onClick={() => selectTab(tab)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        id={currentTab ? `${currentTab.id}-panel` : undefined}
        className={styles.panel}
        role="tabpanel"
      >
        {loading ? (
          <div className={styles.loadingPanel} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            <span>Loading...</span>
          </div>
        ) : (
          currentTab?.content
        )}
      </div>
    </section>
  );
}
