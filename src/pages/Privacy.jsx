import { ArrowLeft, Database, LockKeyhole, ShieldCheck, Trash2 } from "lucide-react";
import { BRAND } from "../config/brand";

export function PrivacyPage({ onBack, standalone = false }) {
  return (
    <div className={standalone ? "privacy-standalone" : "content"}>
      <main className="privacy-page">
        <button type="button" className="privacy-back" onClick={onBack}><ArrowLeft size={17} /> Voltar</button>
        <span className="eyebrow">PRIVACIDADE</span>
        <h1>Seus dados financeiros merecem clareza.</h1>
        <p className="privacy-lead">O {BRAND.appName} usa sua conta Google para autenticação e o Cloud Firestore para armazenar os registros financeiros associados ao seu UID.</p>

        <section className="privacy-grid">
          <article><LockKeyhole size={21} /><h2>Acesso por conta</h2><p>As regras do Firestore foram estruturadas para que uma conta autenticada só consiga ler e alterar os documentos associados ao próprio UID.</p></article>
          <article><Database size={21} /><h2>Dados armazenados</h2><p>Rendas, gastos, compras parceladas, aportes e metadados necessários ao funcionamento do aplicativo ficam no Firebase.</p></article>
          <article><ShieldCheck size={21} /><h2>Administração do serviço</h2><p>O administrador técnico do projeto Firebase pode ter acesso aos registros pelo Console para manutenção e suporte. Não usamos seus valores financeiros para publicidade.</p></article>
          <article><Trash2 size={21} /><h2>Exclusão</h2><p>Na tela “Minha conta”, você pode solicitar a exclusão permanente dos registros financeiros e da conta de autenticação.</p></article>
        </section>

        <section className="privacy-note">
          <strong>Importante</strong>
          <p>Este texto é uma política de privacidade inicial para a versão de lançamento. Antes de comercializar em escala, vale revisar o documento com orientação jurídica e adequação completa à LGPD.</p>
        </section>
      </main>
    </div>
  );
}
