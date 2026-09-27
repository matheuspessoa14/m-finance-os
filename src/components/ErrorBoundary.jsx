import React from "react";
import {
  AlertTriangle,
  CloudCheck,
  Home,
  RotateCcw,
} from "lucide-react";
import { BrandGlyph } from "./BrandGlyph";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, info) {
    console.error(
      "Erro inesperado no M Finance.OS:",
      error,
      info
    );
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="fatal-error-screen fatal-error-v2">
        <section className="fatal-error-card fatal-error-card-v2">
          <div className="fatal-v2-brand">
            <div className="brand-mark logo-plain">
              <BrandGlyph size={48} />
            </div>

            <div>
              <strong>M Finance.OS</strong>
              <span>RECUPERAÇÃO SEGURA</span>
            </div>
          </div>

          <div className="fatal-v2-visual" aria-hidden="true">
            <span className="fatal-v2-ring fatal-v2-ring--one" />
            <span className="fatal-v2-ring fatal-v2-ring--two" />

            <div className="fatal-v2-icon">
              <AlertTriangle size={30} />
            </div>
          </div>

          <span className="fatal-v2-eyebrow">
            A INTERFACE ENCONTROU UM PROBLEMA
          </span>

          <h1>Não foi possível carregar esta tela.</h1>

          <p>
            Os registros que já foram sincronizados continuam
            salvos. Recarregue o aplicativo para restaurar a
            interface.
          </p>

          <div className="fatal-v2-safe-note">
            <CloudCheck size={18} />
            <div>
              <strong>Seus dados sincronizados permanecem seguros</strong>
              <span>
                O erro afetou a interface, não apaga seus registros
                salvos.
              </span>
            </div>
          </div>

          <div className="fatal-v2-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => window.location.reload()}
            >
              <RotateCcw size={17} />
              Tentar novamente
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => window.location.assign("/")}
            >
              <Home size={17} />
              Ir para o início
            </button>
          </div>

          {import.meta.env.DEV && this.state.error?.message && (
            <details className="fatal-v2-details">
              <summary>Detalhes para desenvolvimento</summary>
              <code>{this.state.error.message}</code>
            </details>
          )}
        </section>
      </main>
    );
  }
}
