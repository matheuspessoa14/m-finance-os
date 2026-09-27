import {
  Download,
  LogOut,
  MonitorSmartphone,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  capitalize,
  monthLabel,
  parseMonth,
} from "../utils/date";

function AccountActionCard({
  icon: Icon,
  eyebrow,
  title,
  text,
  action,
  tone = "default",
  children,
}) {
  return (
    <article className={`account-modern-action account-modern-action--${tone}`}>
      <div className="account-modern-action-head">
        <span className="account-modern-action-icon">
          <Icon size={19} />
        </span>

        <div>
          <small>{eyebrow}</small>
          <h3>{title}</h3>
        </div>
      </div>

      {text && <p>{text}</p>}

      {children}

      {action && (
        <div className="account-modern-action-footer">
          {action}
        </div>
      )}
    </article>
  );
}

export function AccountPage({
  user,
  month,
  onExport,
  onPrivacy,
  onLogout,
  onDeleteAccount,
  pwa,
}) {
  const currentMonthLabel = capitalize(
    monthLabel.format(parseMonth(month))
  );

  const displayName = user.displayName || "Minha conta";
  const initial = (
    user.displayName ||
    user.email ||
    "M"
  )[0]?.toUpperCase();

  return (
    <div className="content account-modern-page">
      <section className="page-heading account-modern-heading">
        <div>
          <span className="eyebrow">
            CONTA & CONFIGURAÇÕES
          </span>

          <h1>Minha conta</h1>

          <p>
            Perfil, privacidade, exportação e acesso ao
            M Finance.OS em um só lugar.
          </p>
        </div>
      </section>

      <section className="account-modern-profile">
        <div className="account-modern-profile-main">
          <div className="account-modern-avatar">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>

          <div className="account-modern-profile-copy">
            <div className="account-modern-profile-label">
              <UserRound size={14} />
              <span>PERFIL CONECTADO</span>
            </div>

            <strong>{displayName}</strong>
            <span>{user.email}</span>
          </div>
        </div>

        <div className="account-modern-profile-meta">
          <span className="account-modern-google-badge">
            <ShieldCheck size={14} />
            Conta Google
          </span>

          <small title={user.uid}>
            ID da conta · {user.uid}
          </small>
        </div>
      </section>

      <section className="account-modern-grid">
        <AccountActionCard
          icon={Download}
          eyebrow="BACKUP"
          title="Exportar dados"
          text={`Baixe os lançamentos de ${currentMonthLabel} em CSV para abrir no Excel, Google Sheets ou guardar como backup.`}
          tone="export"
          action={
            <button
              type="button"
              className="primary-button"
              onClick={() => onExport(month)}
            >
              <Download size={17} />
              Exportar mês
            </button>
          }
        />

        <AccountActionCard
          icon={MonitorSmartphone}
          eyebrow="APLICATIVO"
          title="Instalar no celular"
          tone="install"
        >
          {pwa.installed ? (
            <div className="account-modern-status account-modern-status--success">
              <ShieldCheck size={16} />
              <div>
                <strong>Aplicativo instalado</strong>
                <span>
                  O M Finance.OS já está disponível neste
                  dispositivo.
                </span>
              </div>
            </div>
          ) : pwa.canInstall ? (
            <>
              <p>
                Instale o M Finance.OS para abrir em tela cheia e
                acessar como um aplicativo.
              </p>

              <div className="account-modern-action-footer">
                <button
                  type="button"
                  className="primary-button"
                  onClick={pwa.install}
                >
                  <MonitorSmartphone size={17} />
                  Instalar aplicativo
                </button>
              </div>
            </>
          ) : (
            <div className="account-modern-install-help">
              <strong>Adicionar à tela inicial</strong>

              <span>
                iPhone: Safari → Compartilhar → Adicionar à Tela
                de Início.
              </span>

              <span>
                Android: Chrome → menu → Instalar app ou
                Adicionar à tela inicial.
              </span>
            </div>
          )}
        </AccountActionCard>

        <AccountActionCard
          icon={ShieldCheck}
          eyebrow="SEGURANÇA"
          title="Privacidade"
          text="Veja como seus dados são usados, armazenados e protegidos dentro do aplicativo."
          tone="privacy"
          action={
            <button
              type="button"
              className="secondary-button"
              onClick={onPrivacy}
            >
              <ShieldCheck size={17} />
              Ver privacidade
            </button>
          }
        />

        <AccountActionCard
          icon={LogOut}
          eyebrow="SESSÃO"
          title="Acesso atual"
          text="Encerre o acesso neste navegador sem excluir nenhum dado da sua conta."
          tone="session"
          action={
            <button
              type="button"
              className="secondary-button"
              onClick={onLogout}
            >
              <LogOut size={17} />
              Sair da conta
            </button>
          }
        />
      </section>

      <section className="account-modern-danger">
        <div className="account-modern-danger-copy">
          <span className="account-modern-danger-icon">
            <Trash2 size={18} />
          </span>

          <div>
            <small>ZONA SENSÍVEL</small>
            <strong>Excluir minha conta</strong>
            <p>
              Remove rendas, gastos, parcelas, aportes e a conta
              de autenticação. Essa ação não pode ser desfeita.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="danger-button"
          onClick={onDeleteAccount}
        >
          <Trash2 size={17} />
          Excluir conta e dados
        </button>
      </section>
    </div>
  );
}
