import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Simple Error Boundary to catch silent runtime errors and display them to the user
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("SECURE HEALTH HUB Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', color: '#ef4444' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>SECURE HEALTH HUB: System Error</h1>
          <p style={{ marginTop: '10px' }}>A runtime error occurred during initialization.</p>
          <pre style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', color: '#1e293b', textAlign: 'left', display: 'inline-block' }}>
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', display: 'block', margin: '20px auto', padding: '10px 20px', backgroundColor: '#2563EB', color: '#fff', border: 'none', borderRadius: '999px', cursor: 'pointer' }}
          >
            Refresh System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
