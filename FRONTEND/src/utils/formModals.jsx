// Reusable form modals for the admin dashboard
import { useState } from "react";

// Generic Modal Component
export function Modal({ isOpen, title, onClose, onSubmit, children }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-solid" onClick={onSubmit}>Submit</button>
        </div>
      </div>
    </>
  );
}

// Reusable form input field
export function FormField({ label, name, type = "text", value, onChange, required = false, placeholder = "" }) {
  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="form-input"
      />
    </div>
  );
}

// Reusable select field
export function FormSelect({ label, name, value, onChange, options, required = false }) {
  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="form-input"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// CSV Export utility
export function exportToCSV(data, filename = "report.csv") {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma or newline
        if (typeof value === "string" && (value.includes(",") || value.includes("\n") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    )
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

// localStorage utilities
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error reading from localStorage:`, e);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Error writing to localStorage:`, e);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Error removing from localStorage:`, e);
      return false;
    }
  }
};

// Activity logger utility
export const activityLog = {
  add: (action, details) => {
    const logs = storage.get("activityLogs", []);
    const newLog = {
      id: Date.now(),
      action,
      details,
      timestamp: new Date().toLocaleString(),
      category: getCategoryFromAction(action)
    };
    logs.unshift(newLog); // Add to beginning
    storage.set("activityLogs", logs);
    return newLog;
  },

  getAll: () => storage.get("activityLogs", []),

  getRecent: (count = 20) => {
    const logs = storage.get("activityLogs", []);
    return logs.slice(0, count);
  },

  clear: () => storage.set("activityLogs", [])
};

function getCategoryFromAction(action) {
  const actionLower = action.toLowerCase();
  if (actionLower.includes("user")) return "user";
  if (actionLower.includes("course")) return "course";
  if (actionLower.includes("department")) return "department";
  if (actionLower.includes("placement")) return "placement";
  return "system";
}
