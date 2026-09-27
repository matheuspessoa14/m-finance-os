import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import {
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { auth, googleProvider } from "../firebase";
import { BRAND } from "../config/brand";
import {
  BrandGlyph,
  GoogleGlyph,
} from "../components/BrandGlyph";

export function Login({ onPrivacy }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login() {
    try {
      setLoading(true);
      setError("");
      await signInWithPopup(auth, googleProvider);
    } catch (loginError) {
      console.error("Erro no login:", loginError);

      if (
        loginError?.code === "auth/popup-closed-by-user" ||
        loginError?.code === "auth/cancelled-popup-request"
      ) {
        setError(
          "O acesso foi cancelado. Tente novamente quando quiser."
        );
      } else {
        setError(
          "Não foi possível entrar com o Google. Tente novamente."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen login-minimal-screen">
      <main className="login-minimal-card">
        <section className="login-minimal-brand-panel">
          <div className="login-minimal-grid" aria-hidden="true" />

          <div className="login-minimal-brand">
            <div className="brand-mark logo-plain login-minimal-logo">
              <BrandGlyph size={58} />
            </div>

            <div>
              <strong>{BRAND.appName}</strong>
              <span>PERSONAL FINANCE SYSTEM</span>
            </div>
          </div>

          <div className="login-minimal-message">
            <span>SEU DINHEIRO • MAIS CLARO</span>
            <h1>
              Controle simples.
              <br />
              <em>Decisões melhores.</em>
            </h1>
          </div>

          <div
            className="login-minimal-orbit login-minimal-orbit--one"
            aria-hidden="true"
          />
          <div
            className="login-minimal-orbit login-minimal-orbit--two"
            aria-hidden="true"
          />
        </section>

        <section className="login-minimal-auth">
          <div className="login-minimal-auth-copy">
            <span className="eyebrow">ACESSO SEGURO</span>
            <h2>Bem-vindo.</h2>
            <p>
              Entre com sua conta Google para acessar seu espaço
              financeiro.
            </p>
          </div>

          <button
            type="button"
            className="login-minimal-google"
            onClick={login}
            disabled={loading}
          >
            <span className="login-minimal-google-icon">
              <GoogleGlyph size={21} />
            </span>

            <span>
              {loading ? "Entrando..." : "Continuar com Google"}
            </span>

            <ArrowRight size={18} />
          </button>

          {error && (
            <div
              className="login-error login-minimal-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="login-minimal-trust">
            <span>
              <ShieldCheck size={17} />
            </span>

            <div>
              <strong>Seus dados são privados</strong>
              <small>
                Cada conta acessa somente os próprios registros.
              </small>
            </div>
          </div>

          <div className="login-minimal-bottom">
            <button
              type="button"
              className="privacy-link"
              onClick={onPrivacy}
            >
              Privacidade
            </button>

            <span aria-hidden="true">•</span>

            <div>
              <LockKeyhole size={12} />
              <span>Conexão segura</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export function Splash() {
  return (
    <div
      className="splash splash-launch"
      role="status"
      aria-live="polite"
      aria-label="Abrindo M Finance.OS"
    >
      <div className="splash-launch-bg" aria-hidden="true">
        <span className="splash-launch-light splash-launch-light--one" />
        <span className="splash-launch-light splash-launch-light--two" />
        <span className="splash-launch-grid" />
      </div>

      <div className="splash-launch-stage">
        <div className="splash-launch-mark-wrap">
          <span
            className="splash-launch-halo splash-launch-halo--outer"
            aria-hidden="true"
          />
          <span
            className="splash-launch-halo splash-launch-halo--inner"
            aria-hidden="true"
          />

          <div className="splash-launch-mark">
            <div className="brand-mark logo-plain">
              <BrandGlyph size={80} />
            </div>

            <span
              className="splash-launch-shine"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="splash-launch-wordmark">
          <strong>{BRAND.appName}</strong>
          <span>Seu dinheiro, mais claro.</span>
        </div>

        <div
          className="splash-launch-loader"
          aria-hidden="true"
        >
          <i />
        </div>
      </div>

      <div className="splash-launch-status">
        <span />
        <small>Preparando seu espaço financeiro</small>
      </div>
    </div>
  );
}
