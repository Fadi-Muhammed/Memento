// atoms.jsx — shared atoms + icons + sample data for Memento screens
// Loaded as a Babel script; exports to window for cross-file React access.

const I = {
  search: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><path d="m13.5 13.5-3-3"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>,
  arrow_r: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 8h10m-4-4 4 4-4 4"/></svg>,
  arrow_l: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M13 8H3m4-4-4 4 4 4"/></svg>,
  chev_r: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="m4.5 2.5 3.5 3.5-3.5 3.5"/></svg>,
  chev_d: <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m2.5 4.5 3.5 3.5 3.5-3.5"/></svg>,
  check: <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 5 2 2 4-5"/></svg>,
  dot: <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor"><circle cx="3" cy="3" r="2.5"/></svg>,
  filter: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 4h12M4 8h8M6 12h4"/></svg>,
  more: <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="13" cy="8" r="1.3"/></svg>,
  bell: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 6.5a4 4 0 0 1 8 0c0 4 1.5 5 1.5 5h-11s1.5-1 1.5-5Z"/><path d="M6.5 13.5a1.5 1.5 0 0 0 3 0"/></svg>,
  home: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 6-5 6 5v6a1 1 0 0 1-1 1h-3v-4H6v4H3a1 1 0 0 1-1-1Z"/></svg>,
  inbox: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5"/><path d="M2 9h3l1 2h4l1-2h3v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1Z"/></svg>,
  user: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="6" r="2.5"/><path d="M3 13.5c.7-2.3 2.7-3.5 5-3.5s4.3 1.2 5 3.5"/></svg>,
  scissor: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="4" cy="4" r="2"/><circle cx="4" cy="12" r="2"/><path d="m6 6 8 8M14 4 7.5 8.5"/></svg>,
  settings: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="2"/><path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8 3.4 3.4"/></svg>,
  bot: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="2.5" y="5" width="11" height="8" rx="2"/><circle cx="6" cy="9" r=".7" fill="currentColor"/><circle cx="10" cy="9" r=".7" fill="currentColor"/><path d="M8 5V3M6.5 3h3"/></svg>,
  send: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 8 12-5.5L8.5 14 7 9 2 8Z"/></svg>,
  phone: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2.5h2l1 3-1.5 1a8 8 0 0 0 4 4l1-1.5 3 1v2A1.5 1.5 0 0 1 11 13.5C6.6 13.3 2.7 9.4 2.5 5A1.5 1.5 0 0 1 4 3.5"/></svg>,
  edit: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2.5 13.5 5 5 13.5l-3 .5.5-3 8.5-8.5Z"/></svg>,
  pause: <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><rect x="3" y="2" width="2" height="8" rx=".5"/><rect x="7" y="2" width="2" height="8" rx=".5"/></svg>,
  whatsapp: <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5C4.4 1.5 1.5 4.4 1.5 8c0 1.2.3 2.3.9 3.3L1.5 14.5l3.3-.9c1 .5 2.1.8 3.2.8 3.6 0 6.5-2.9 6.5-6.5S11.6 1.5 8 1.5Zm3.7 9c-.2.4-.9.8-1.3.9-.3 0-.7.1-1.2-.1-.3-.1-.6-.2-1.1-.4-1.9-.8-3.1-2.7-3.2-2.8-.1-.1-.8-1-.8-2s.5-1.4.7-1.6c.1-.1.3-.2.5-.2h.4c.1 0 .3 0 .5.4.2.4.5 1.4.6 1.5l.1.3c0 .1 0 .2-.1.3-.1.2-.2.3-.3.4l-.2.2c-.1.1-.2.2 0 .4.1.3.5.9 1.1 1.4.7.6 1.3.8 1.5.9.2.1.3.1.4-.1l.5-.7c.1-.2.3-.1.4-.1.2.1 1.1.5 1.3.6.2.1.3.1.4.2.1.2.1.6 0 1Z"/></svg>,
  back: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3 5 8l5 5"/></svg>,
  external: <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 2H2v8h8V7M7 2h3v3M5.5 6.5 10 2"/></svg>,
  star: <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5L1 4.5 4.5 4Z"/></svg>,
  copy: <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="4.5" y="4.5" width="7" height="7" rx="1"/><path d="M2.5 9.5V3a.5.5 0 0 1 .5-.5h6.5"/></svg>,
};

// ─── Logo ────────────────────────────────────────────────
const Logo = ({ size = 14 }) => (
  <span className="logo" style={{ fontSize: size }}>
    <span className="logo-mark">M</span>
    <span>Memento</span>
  </span>
);

// ─── Atoms ───────────────────────────────────────────────
const Avatar = ({ name, tone = 'neutral', size }) => {
  const initials = name.split(' ').map(p => p[0]).slice(0, 2).join('');
  const tones = {
    accent: { background: 'var(--mm-accent-soft)', color: 'var(--mm-accent-strong)' },
    success: { background: 'var(--mm-success-soft)', color: 'var(--mm-success)' },
    info: { background: 'var(--mm-info-soft)', color: 'var(--mm-info)' },
    neutral: {},
  };
  return <div className={'avatar ' + (size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : '')} style={tones[tone]}>{initials}</div>;
};

const Pill = ({ kind = 'default', children }) => (
  <span className={'pill pill-' + kind}>{children}</span>
);

const StageChip = ({ stage }) => (
  <span className="stage-chip">{stage}</span>
);

// ─── Sample data (Al-Khayyat Tailoring, Doha) ─────────────
const SAMPLE = {
  shop: 'Al-Khayyat Tailoring',
  owner: 'Yousef',
  customers: [
    { id: 'c1', name: 'Ahmed Al-Mansoori',  phone: '+974 5512 3098', last: '2m ago',  ltv: 4800, garment: 'thobe' },
    { id: 'c2', name: 'Fatima Al-Kuwari',   phone: '+974 6633 2211', last: '17m ago', ltv: 6200, garment: 'abaya' },
    { id: 'c3', name: 'Khalid bin Hamad',   phone: '+974 5588 4422', last: '1h ago',  ltv: 12400, garment: 'thobe' },
    { id: 'c4', name: 'Mariam Al-Thani',    phone: '+974 7711 0098', last: '3h ago',  ltv: 1800, garment: 'abaya' },
    { id: 'c5', name: 'Omar Al-Naimi',      phone: '+974 5544 9911', last: 'Yesterday', ltv: 2400, garment: 'suit'  },
    { id: 'c6', name: 'Layla Al-Marri',     phone: '+974 6622 7733', last: 'Yesterday', ltv: 3100, garment: 'abaya' },
    { id: 'c7', name: 'Hassan Al-Khater',   phone: '+974 5599 1144', last: '2d ago',  ltv: 5600, garment: 'thobe' },
    { id: 'c8', name: 'Noor Al-Sulaiti',    phone: '+974 7733 4455', last: '4d ago',  ltv: 0,    garment: 'alteration' },
  ],
  leads: [
    { id: 'L-2841', name: 'Ahmed Al-Mansoori', phone: '+974 5512 3098', garment: 'thobe',     fabric: 'cotton',     deadline: 'next Thursday', returning: true,  status: 'qualified', ago: '14m', followup: 'sent_2h' },
    { id: 'L-2840', name: 'Fatima Al-Kuwari',  phone: '+974 6633 2211', garment: 'abaya',     fabric: 'crepe black',deadline: '2 weeks',      returning: false, status: 'qualified', ago: '38m', followup: 'none' },
    { id: 'L-2839', name: '+974 5512 3877',    phone: '+974 5512 3877', garment: 'suit',      fabric: 'wool',       deadline: 'flexible',     returning: false, status: 'new',       ago: '1h',  followup: 'none' },
    { id: 'L-2838', name: 'Mariam Al-Thani',   phone: '+974 7711 0098', garment: 'alteration',fabric: '—',          deadline: 'this Sat',     returning: true,  status: 'converted', ago: '3h',  followup: 'done' },
    { id: 'L-2837', name: 'Omar Al-Naimi',     phone: '+974 5544 9911', garment: 'suit',      fabric: 'navy wool',  deadline: 'May 22',       returning: false, status: 'qualified', ago: '5h',  followup: 'sent_24h' },
    { id: 'L-2836', name: 'Khalid bin Hamad',  phone: '+974 5588 4422', garment: 'thobe',     fabric: 'cotton blend',deadline: 'Eid',         returning: true,  status: 'converted', ago: 'Yest', followup: 'done' },
    { id: 'L-2835', name: '+974 6622 0011',    phone: '+974 6622 0011', garment: 'abaya',     fabric: 'not sure',   deadline: '—',            returning: false, status: 'lost',      ago: '2d',  followup: 'done' },
  ],
  orders: [
    { id: 'O-1142', cust: 'Ahmed Al-Mansoori', garment: 'thobe',  fabric: 'Cotton blend, white',     price: 480,  deposit: 200, due: 'May 21', stage: 'fitting',   notify: true  },
    { id: 'O-1141', cust: 'Khalid bin Hamad',  garment: 'thobe ×3', fabric: 'Egyptian cotton',       price: 1620, deposit: 800, due: 'May 24', stage: 'stitched',  notify: false },
    { id: 'O-1140', cust: 'Fatima Al-Kuwari',  garment: 'abaya',  fabric: 'Black crepe + embroidery',price: 1850, deposit: 900, due: 'May 28', stage: 'cut',       notify: false },
    { id: 'O-1139', cust: 'Layla Al-Marri',    garment: 'abaya',  fabric: 'Charcoal crepe',          price: 1200, deposit: 600, due: 'May 18', stage: 'ready',     notify: true  },
    { id: 'O-1138', cust: 'Mariam Al-Thani',   garment: 'alteration', fabric: 'Customer fabric',     price: 180,  deposit: 0,   due: 'May 11', stage: 'confirmed', notify: true  },
    { id: 'O-1137', cust: 'Hassan Al-Khater',  garment: 'thobe',  fabric: 'Cotton, off-white',       price: 540,  deposit: 270, due: 'May 16', stage: 'ready',     notify: true  },
    { id: 'O-1136', cust: 'Omar Al-Naimi',     garment: 'suit',   fabric: 'Navy wool',               price: 2400, deposit: 1200,due: 'Jun 2',  stage: 'confirmed', notify: true  },
    { id: 'O-1133', cust: 'Salem Al-Mohannadi', garment: 'thobe', fabric: 'Cotton, beige',          price: 460,  deposit: 460, due: 'May 8',  stage: 'picked_up', notify: false },
  ],
};

const STAGES = [
  { id: 'confirmed', label: 'Confirmed', notify: true },
  { id: 'cut',       label: 'Cut',       notify: false },
  { id: 'stitched',  label: 'Stitched',  notify: false },
  { id: 'fitting',   label: 'Fitting',   notify: true },
  { id: 'ready',     label: 'Ready',     notify: true },
  { id: 'picked_up', label: 'Picked up', notify: false },
];
const stageIdx = (id) => STAGES.findIndex(s => s.id === id);

// ─── Stage tracker ──────────────────────────────────────
const StageTracker = ({ current, compact: tight }) => {
  const ci = stageIdx(current);
  return (
    <div className="stages" style={{ gap: tight ? 4 : 6 }}>
      {STAGES.map((s, i) => {
        const cls = i < ci ? 'done' : i === ci ? 'current' : '';
        return (
          <div key={s.id} className={'stage-step ' + cls}>
            <div className="stage-bar" />
            {!tight && <div className="stage-label">{s.label}</div>}
          </div>
        );
      })}
    </div>
  );
};

// ─── Sidebar / nav ──────────────────────────────────────
const Sidebar = ({ active = 'today', shop, leadsCount = 4, ordersCount = 7 }) => (
  <div className="sidebar">
    <div style={{ padding: '4px 8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Logo />
      <span className="meta mono">v1</span>
    </div>
    <div className="sidebar-section">Workspace</div>
    <SideItem icon={I.home}    label="Today"     active={active === 'today'} />
    <SideItem icon={I.inbox}   label="Leads"     count={leadsCount}  active={active === 'leads'} />
    <SideItem icon={I.user}    label="Customers" active={active === 'customers'} />
    <SideItem icon={I.scissor} label="Orders"    count={ordersCount} active={active === 'orders'} />
    <div className="sidebar-section">Shop</div>
    <SideItem icon={I.bot}      label="Bot · ON"  active={active === 'bot'} dot />
    <SideItem icon={I.settings} label="Settings"  active={active === 'settings'} />
    <div style={{ flex: 1 }} />
    <div style={{ padding: '8px 6px 0', borderTop: '1px solid var(--mm-border)' }}>
      <div className="row gap-2" style={{ padding: '8px 4px' }}>
        <Avatar name={shop || SAMPLE.shop} size="sm" tone="accent" />
        <div className="grow truncate" style={{ fontSize: 12, fontWeight: 500 }}>{shop || SAMPLE.shop}</div>
      </div>
    </div>
  </div>
);
const SideItem = ({ icon, label, active, count, dot }) => (
  <div className={'sidebar-item' + (active ? ' active' : '')}>
    <span style={{ display: 'inline-flex', width: 14, color: 'var(--mm-fg-3)' }}>{icon}</span>
    <span className="grow truncate">{label}</span>
    {dot && <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--mm-success)' }} />}
    {count != null && <span className="meta mono num" style={{ fontSize: 11 }}>{count}</span>}
  </div>
);

// ─── Mobile bottom nav ──────────────────────────────────
const BotNav = ({ active }) => (
  <div className="botnav">
    {[
      { id: 'today',    label: 'Today',     icon: I.home   },
      { id: 'leads',    label: 'Leads',     icon: I.inbox  },
      { id: 'orders',   label: 'Orders',    icon: I.scissor},
      { id: 'customers',label: 'Customers', icon: I.user   },
    ].map(it => (
      <div key={it.id} className={'botnav-item' + (active === it.id ? ' active' : '')}>
        <span style={{ width: 16, height: 16, display: 'inline-flex' }}>{it.icon}</span>
        <span>{it.label}</span>
      </div>
    ))}
  </div>
);

// ─── Mobile topbar ──────────────────────────────────────
const Topbar = ({ title, back, right, sub }) => (
  <div className="topbar">
    {back && <button className="btn btn-ghost btn-icon" style={{ marginLeft: -8 }}>{I.back}</button>}
    <div className="grow col" style={{ gap: 0 }}>
      <div style={{ fontWeight: 600, fontSize: 'var(--mm-fs-md)', letterSpacing: '-0.005em' }}>{title}</div>
      {sub && <div className="meta truncate">{sub}</div>}
    </div>
    {right}
  </div>
);

Object.assign(window, {
  I, Logo, Avatar, Pill, StageChip, StageTracker, Sidebar, BotNav, Topbar,
  SAMPLE, STAGES, stageIdx,
});
