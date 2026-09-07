import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  History,
  LogOut,
  Menu,
  PiggyBank,
  ReceiptText,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { BRAND } from "../config/brand";
import { buildMonthOptions, capitalize, currentMonth, monthLabel, parseMonth } from "../utils/date";
import { BrandGlyph } from "./BrandGlyph";
import { SyncStatus } from "./Feedback";

export const PRIMARY_NAV = [
  { id: "dashboard", label: "Resumo", icon: BarChart3 },
  { id: "rendas", label: "Rendas", icon: ArrowUpRight },
  { id: "parcelas", label: "Parcelas", icon: CreditCard },
  { id: "gastos", label: "Gastos", icon: ReceiptText },
  { id: "aportes", label: "Guardar", icon: PiggyBank },
];

export const EXTRA_NAV = [
  { id: "historico", label: "Histórico", icon: History },
  { id: "conta", label: "Minha conta", icon: Settings },
];

const ALL_NAV = [...PRIMARY_NAV, ...EXTRA_NAV, { id: "privacidade", label: "Privacidade", icon: ShieldCheck }];

export function getPageTitle(page) {
  return ALL_NAV.find((item) => item.id === page)?.label || "Resumo";
}

export function DesktopSidebar({ page, onPage, user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark small logo-plain"><BrandGlyph size={20} /></div>
        <div>
          <strong>{BRAND.appName}</strong>
          <span>{BRAND.signature}</span>
        </div>
      </div>

      <nav>
        {PRIMARY_NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} className={page === id ? "nav-item active" : "nav-item"} onClick={() => onPage(id)}>
            <Icon size={19} />
            {label}
          </button>
        ))}
        <div className="nav-divider" />
        {EXTRA_NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} className={page === id ? "nav-item active" : "nav-item"} onClick={() => onPage(id)}>
            <Icon size={19} />
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-user">
        {user.photoURL ? (
          <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
        ) : (
          <div className="avatar-fallback">{(user.displayName || user.email || "M")[0]}</div>
        )}
        <div>
          <strong>{user.displayName || "Minha conta"}</strong>
          <span>{user.email}</span>
        </div>
        <button className="icon-button" onClick={onLogout} title="Sair" aria-label="Sair">
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}


function MonthPicker({ month, months, current, setMonth }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function chooseMonth(key) {
    setMonth(key);
    setOpen(false);
  }

  const selectedLabel = `${capitalize(monthLabel.format(parseMonth(month)))}${
    month === current ? " • atual" : ""
  }`;

  return (
    <div className="month-picker-custom" ref={rootRef}>
      <button
        type="button"
        className={open ? "month-picker-trigger open" : "month-picker-trigger"}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="month-picker-copy">
          <span className="month-picker-caption">PERÍODO</span>
          <strong>{selectedLabel}</strong>
        </span>

        <ChevronDown
          size={15}
          className={open ? "month-picker-chevron open" : "month-picker-chevron"}
        />
      </button>

      {open && (
        <div className="month-picker-menu" role="listbox" aria-label="Selecionar período">
          {months.map((key) => {
            const selected = key === month;
            const isCurrent = key === current;
            const label = capitalize(monthLabel.format(parseMonth(key)));

            return (
              <button
                key={key}
                type="button"
                role="option"
                aria-selected={selected}
                className={selected ? "month-option selected" : "month-option"}
                onClick={() => chooseMonth(key)}
              >
                <span>{label}</span>
                {isCurrent && <small>atual</small>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Header({ page, month, setMonth, user, menuOpen, setMenuOpen, onPage, onExport, onLogout, online, syncing }) {
  const title = getPageTitle(page);
  const months = buildMonthOptions();
  const current = currentMonth();
  const currentIndex = months.indexOf(month);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex >= 0 && currentIndex < months.length - 1;

  function changeMonth(direction) {
    if (currentIndex < 0) return setMonth(current);
    const next = months[currentIndex + direction];
    if (next) setMonth(next);
  }

  function navigate(target) {
    setMenuOpen(false);
    onPage(target);
  }

  return (
    <header className="topbar">
      <div className="topbar-title">
        <span className="mobile-eyebrow">{BRAND.systemLabel} / workspace</span>
        <span className="desktop-path">{BRAND.systemLabel} <b>/</b> {title.toLowerCase()}</span>
        <h2>{title}</h2>
      </div>

      <div className="topbar-actions">
        <SyncStatus online={online} syncing={syncing} />

        <div className="period-control" aria-label="Selecionar período">
          <button className="period-arrow" type="button" disabled={!canGoBack} onClick={() => changeMonth(-1)} title="Mês anterior">
            <ChevronLeft size={17} />
          </button>

          <MonthPicker
            month={month}
            months={months}
            current={current}
            setMonth={setMonth}
          />

          <button className="period-arrow" type="button" disabled={!canGoForward} onClick={() => changeMonth(1)} title="Próximo mês">
            <ChevronRight size={17} />
          </button>
        </div>

        <button className="mobile-menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-account-menu">
          <div className="mobile-menu-profile">
            <strong>{user.displayName || "Minha conta"}</strong>
            <span>{user.email}</span>
          </div>
          <button type="button" onClick={() => navigate("conta")}><Settings size={16} /> Minha conta</button>
          <button type="button" onClick={() => navigate("historico")}><History size={16} /> Histórico</button>
          <button type="button" onClick={() => { setMenuOpen(false); onExport(); }}><Download size={16} /> Exportar mês</button>
          <button type="button" onClick={() => navigate("privacidade")}><ShieldCheck size={16} /> Privacidade</button>
          <button type="button" className="mobile-menu-logout" onClick={onLogout}><LogOut size={16} /> Sair</button>
        </div>
      )}
    </header>
  );
}

export function MobileNav({ page, onPage }) {
  return (
    <nav className="mobile-nav" aria-label="Navegação principal">
      {PRIMARY_NAV.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" className={page === id ? "active" : ""} onClick={() => onPage(id)}>
          <Icon size={19} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
