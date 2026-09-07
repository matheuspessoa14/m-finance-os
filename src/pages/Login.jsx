import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { BarChart3, Cloud, PiggyBank, ShieldCheck, WalletCards } from "lucide-react";
import { auth, googleProvider } from "../firebase";
import { BRAND } from "../config/brand";
import { BrandGlyph, GoogleGlyph } from "../components/BrandGlyph";

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
      setError("Não foi possível entrar com o Google. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <main className="login-shell">
        <section className="login-showcase">
          <div className="login-brand">
            <div className="brand-mark logo-plain login-brand-icon"><BrandGlyph size={58} /></div>
            <div>
              <strong>{BRAND.appName}</strong>
              <span>PERSONAL FINANCE SYSTEM</span>
            </div>
          </div>

          <div className="login-showcase-copy">
            <span className="login-kicker">FINANÇAS PESSOAIS • CLOUD SYNC</span>
            <h1>Seu dinheiro,<br /><span>mais claro.</span></h1>
            <p>Organize rendas, gastos, parcelas e valores guardados em um só lugar — com uma visão mensal simples do que realmente está livre.</p>
          </div>

          <div className="login-feature-grid">
            <div className="login-feature"><BarChart3 size={20} /><div><strong>Visão mensal</strong><span>Entenda para onde seu dinheiro está indo.</span></div></div>
            <div className="login-feature"><WalletCards size={20} /><div><strong>Tudo organizado</strong><span>Rendas, gastos e parcelas no mesmo fluxo.</span></div></div>
            <div className="login-feature"><PiggyBank size={20} /><div><strong>Planeje melhor</strong><span>Acompanhe quanto você consegue guardar.</span></div></div>
          </div>

          <div className="login-cloud-status"><span className="status-dot" /><span>Dados sincronizados com sua conta</span><Cloud size={16} /></div>
        </section>

        <section className="login-auth">
          <div className="login-auth-heading">
            <span className="eyebrow">ACESSO SEGURO</span>
            <h2>Bem-vindo.</h2>
            <p>Entre com sua conta Google para acessar seu espaço financeiro.</p>
          </div>

          <button className="google-login-button" onClick={login} disabled={loading}>
            <span className="google-icon-wrap"><GoogleGlyph size={21} /></span>
            <span>{loading ? "Entrando..." : "Continuar com Google"}</span>
          </button>

          {error && <div className="login-error" role="alert">{error}</div>}

          <div className="login-security">
            <ShieldCheck size={18} />
            <div><strong>Seus dados são privados</strong><span>Cada conta acessa somente os próprios registros financeiros.</span></div>
          </div>

          <button type="button" className="privacy-link" onClick={onPrivacy}>Privacidade e uso de dados</button>

          <div className="login-auth-footer"><span>{BRAND.author}</span><span>•</span><span>{BRAND.appName}</span></div>
        </section>
      </main>
    </div>
  );
}

export function Splash() {
  return (
    <div className="splash">
      <div className="brand-mark logo-plain"><BrandGlyph size={28} /></div>
      <strong>{BRAND.appName}</strong>
    </div>
  );
}
