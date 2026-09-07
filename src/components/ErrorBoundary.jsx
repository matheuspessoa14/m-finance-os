import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { BrandGlyph } from "./BrandGlyph";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Erro inesperado no M Finance.OS:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="fatal-error-screen">
        <section className="fatal-error-card">
          <div className="fatal-error-brand">
            <BrandGlyph size={54} />
            <span>M Finance.OS</span>
          </div>

          <div className="fatal-error-icon">
            <AlertTriangle size={24} />
          </div>

          <span className="eyebrow">ERRO INESPERADO</span>
          <h1>Algo não saiu como esperado.</h1>
          <p>
            Seus dados continuam no Firebase. Recarregue o aplicativo para
            restaurar a interface.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            <RotateCcw size={17} />
            Tentar novamente
          </button>
        </section>
      </main>
    );
  }
}
