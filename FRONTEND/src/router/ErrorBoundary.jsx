import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';

export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  
  console.error("Route Error:", error);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg)", color: "var(--text)", padding: "20px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "var(--rose)", fontSize: "2rem", marginBottom: "1rem" }}>Oops! Something went wrong.</h1>
      <p style={{ color: "var(--text2)", marginBottom: "2rem", maxWidth: "500px" }}>
        We encountered an unexpected error. Our team has been notified.
      </p>
      <div style={{ background: "var(--surface)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "2rem", width: "100%", maxWidth: "600px", overflow: "auto", textAlign: "left" }}>
        <code style={{ color: "var(--rose)" }}>
          {error?.message || error?.statusText || "Unknown Error"}
        </code>
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: "10px 20px", background: "var(--indigo)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
        >
          Try Again
        </button>
        <button 
          onClick={() => navigate('/', { replace: true })}
          style={{ padding: "10px 20px", background: "var(--surface3)", color: "var(--text)", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
