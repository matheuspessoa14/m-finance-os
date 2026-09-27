import {
  ArrowLeft,
  Database,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { BRAND } from "../config/brand";

function PrivacyCard({
  number,
  icon: Icon,
  title,
  text,
  tone,
}) {
  return (
    <article className={`privacy-modern-card privacy-modern-card--${tone}`}>
      <div className="privacy-modern-card-top">
        <span className="privacy-modern-card-icon">
          <Icon size={19} />
        </span>

        <span className="privacy-modern-card-number">
          {number}
        </span>
      </div>

      <h2>{title}</h2>
      <p>{text}</p>
    </article>
  );
}

export function PrivacyPage({
  onBack,
  standalone = false,
}) {
  return (
    <div
      className={
        standalone
          ? "privacy-standalone privacy-modern-standalone"
          : "content privacy-modern-content"
      }
    >
      <main className="privacy-page privacy-modern-page">
        <div className="privacy-modern-topbar">
          <button
            type="button"
            className="privacy-back privacy-modern-back"
            onClick={onBack}
          >
            <ArrowLeft size={17} />
            Voltar
          </button>

          <span className="privacy-modern-status">
            <ShieldCheck size={14} />
            PRIVACIDADE & DADOS
          </span>
        </div>

        <section className="privacy-modern-hero">
          <div className="privacy-modern-hero-copy">
            <span className="eyebrow">
              PRIVACIDADE
            </span>

            <h1>
              Seus dados financeiros merecem
              <span> clareza.</span>
            </h1>

            <p className="privacy-lead">
              O {BRAND.appName} usa sua conta Google
              para autenticação e o Cloud Firestore
              para armazenar os registros financeiros
              associados ao seu UID.
            </p>
          </div>

          <div
            className="privacy-modern-hero-visual"
            aria-hidden="true"
          >
            <span className="privacy-modern-orbit privacy-modern-orbit--outer" />
            <span className="privacy-modern-orbit privacy-modern-orbit--inner" />

            <div className="privacy-modern-shield">
              <LockKeyhole size={34} />
            </div>
          </div>
        </section>

        <section className="privacy-modern-summary">
          <div>
            <span className="privacy-modern-summary-icon">
              <Fingerprint size={17} />
            </span>

            <div>
              <small>IDENTIFICAÇÃO</small>
              <strong>Conta Google + UID</strong>
            </div>
          </div>

          <div>
            <span className="privacy-modern-summary-icon">
              <Database size={17} />
            </span>

            <div>
              <small>ARMAZENAMENTO</small>
              <strong>Cloud Firestore</strong>
            </div>
          </div>

          <div>
            <span className="privacy-modern-summary-icon">
              <ShieldCheck size={17} />
            </span>

            <div>
              <small>ACESSO</small>
              <strong>Registros da própria conta</strong>
            </div>
          </div>
        </section>

        <section className="privacy-modern-grid">
          <PrivacyCard
            number="01"
            icon={LockKeyhole}
            title="Acesso por conta"
            text="As regras do Firestore foram estruturadas para que uma conta autenticada só consiga ler e alterar os documentos associados ao próprio UID."
            tone="access"
          />

          <PrivacyCard
            number="02"
            icon={Database}
            title="Dados armazenados"
            text="Rendas, gastos, compras parceladas, aportes e metadados necessários ao funcionamento do aplicativo ficam no Firebase."
            tone="storage"
          />

          <PrivacyCard
            number="03"
            icon={ShieldCheck}
            title="Administração do serviço"
            text="O administrador técnico do projeto Firebase pode ter acesso aos registros pelo Console para manutenção e suporte. Não usamos seus valores financeiros para publicidade."
            tone="admin"
          />

          <PrivacyCard
            number="04"
            icon={Trash2}
            title="Exclusão"
            text="Na tela “Minha conta”, você pode solicitar a exclusão permanente dos registros financeiros e da conta de autenticação."
            tone="delete"
          />
        </section>

        <section className="privacy-modern-note">
          <div className="privacy-modern-note-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <small>IMPORTANTE</small>
            <strong>
              Política inicial da versão de lançamento
            </strong>
            <p>
              Este texto é uma política de privacidade
              inicial para a versão de lançamento.
              Antes de comercializar em escala, vale
              revisar o documento com orientação
              jurídica e adequação completa à LGPD.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
