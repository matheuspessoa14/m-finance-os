import { Download, LogOut, MonitorSmartphone, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { capitalize, monthLabel, parseMonth } from "../utils/date";

export function AccountPage({ user, month, onExport, onPrivacy, onLogout, onDeleteAccount, pwa }) {
  return (
    <div className="content">
      <section className="page-heading account-heading">
        <div>
          <span className="eyebrow">CONTA & CONFIGURAÇÕES</span>
          <h1>Minha conta</h1>
          <p>Gerencie seus dados, exportações, instalação do aplicativo e privacidade.</p>
        </div>
      </section>

      <section className="account-grid">
        <article className="settings-card profile-settings-card">
          <div className="settings-card-header"><UserRound size={20} /><div><strong>Perfil</strong><span>Conta conectada pelo Google</span></div></div>
          <div className="profile-summary">
            {user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : <div className="avatar-fallback large">{(user.displayName || user.email || "M")[0]}</div>}
            <div><strong>{user.displayName || "Minha conta"}</strong><span>{user.email}</span><small>UID: {user.uid}</small></div>
          </div>
        </article>

        <article className="settings-card">
          <div className="settings-card-header"><Download size={20} /><div><strong>Exportar dados</strong><span>Backup do período atual em CSV</span></div></div>
          <p>Baixe os lançamentos de {capitalize(monthLabel.format(parseMonth(month)))} para abrir no Excel, Google Sheets ou guardar como backup.</p>
          <button type="button" className="primary-button" onClick={() => onExport(month)}><Download size={17} /> Exportar mês</button>
        </article>

        <article className="settings-card">
          <div className="settings-card-header"><MonitorSmartphone size={20} /><div><strong>Instalar no celular</strong><span>Use como um aplicativo</span></div></div>
          {pwa.installed ? (
            <p className="settings-success">✓ O M Finance.OS já está instalado neste dispositivo.</p>
          ) : pwa.canInstall ? (
            <button type="button" className="primary-button" onClick={pwa.install}><MonitorSmartphone size={17} /> Instalar M Finance.OS</button>
          ) : (
            <p>No iPhone, abra pelo Safari e use <strong>Compartilhar → Adicionar à Tela de Início</strong>. No Android, prefira o <strong>Google Chrome atualizado</strong> e procure “Instalar app” ou “Adicionar à tela inicial” no menu.</p>
          )}
        </article>

        <article className="settings-card">
          <div className="settings-card-header"><ShieldCheck size={20} /><div><strong>Privacidade</strong><span>Como seus dados são armazenados</span></div></div>
          <p>Veja quais informações o aplicativo usa, como o Firebase protege cada conta e como solicitar a exclusão dos dados.</p>
          <button type="button" className="secondary-button" onClick={onPrivacy}><ShieldCheck size={17} /> Ver privacidade</button>
        </article>

        <article className="settings-card session-card">
          <div className="settings-card-header"><LogOut size={20} /><div><strong>Sessão</strong><span>Encerrar acesso neste navegador</span></div></div>
          <button type="button" className="secondary-button" onClick={onLogout}><LogOut size={17} /> Sair da conta</button>
        </article>

        <article className="settings-card danger-zone">
          <div className="settings-card-header"><Trash2 size={20} /><div><strong>Excluir minha conta</strong><span>Ação permanente</span></div></div>
          <p>Remove suas rendas, gastos, parcelas, aportes e depois exclui a conta de autenticação. Essa ação não pode ser desfeita.</p>
          <button type="button" className="danger-button" onClick={onDeleteAccount}><Trash2 size={17} /> Excluir conta e dados</button>
        </article>
      </section>
    </div>
  );
}
