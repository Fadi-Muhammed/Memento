// screens-mobile.jsx — Memento mobile-first screens
// Each export is a fixed-size artboard component (390×780).

const MW = 390, MH = 780;

// ─── Mobile · Login ─────────────────────────────────────
const MobileLogin = () => (
  <div className="screen" style={{ width: MW, height: MH, padding: '60px 28px 28px', justifyContent: 'space-between' }}>
    <div className="col gap-6">
      <div style={{ paddingTop: 80 }}>
        <Logo size={20} />
      </div>
      <div className="col gap-2">
        <div className="h1">Sign in</div>
        <div className="hint">A magic link will arrive in your inbox.</div>
      </div>
      <div className="col gap-2">
        <div className="label">Email</div>
        <input className="field" style={{ height: 44 }} defaultValue="yousef@al-khayyat.qa" />
        <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 8 }}>Send magic link</button>
        <div className="hint" style={{ textAlign: 'center', marginTop: 4 }}>Single sign-on for the shop owner.</div>
      </div>
    </div>
    <div className="col gap-2" style={{ alignItems: 'center' }}>
      <div className="meta">Memento · v1.0</div>
      <div className="meta">© Al-Khayyat Tailoring · Doha</div>
    </div>
  </div>
);

// ─── Mobile · Today ─────────────────────────────────────
const MobileToday = () => (
  <div className="screen" style={{ width: MW, height: MH }}>
    <Topbar
      title="Today"
      sub="Friday, May 9 · 9:42 AM"
      right={<button className="btn btn-ghost btn-icon">{I.bell}</button>}
    />
    <div className="scroll">
      {/* Bot status */}
      <div style={{ padding: '14px 20px 6px' }}>
        <div className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--mm-success)' }} />
          <div className="grow col" style={{ gap: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 'var(--mm-fs-base)' }}>Bot is on</div>
            <div className="meta">Replying to inbound WhatsApp leads</div>
          </div>
          <button className="btn">Pause</button>
        </div>
      </div>

      {/* Metrics — 3 stat cards */}
      <div style={{ padding: '6px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <Stat label="New leads" value="4" sub="last 24h" tone="accent" />
        <Stat label="Due this wk" value="6" sub="orders" />
        <Stat label="Ready" value="2" sub="for pickup" tone="success" />
      </div>

      {/* New leads */}
      <SectionHead title="New leads" right={<RightLink>View all</RightLink>} />
      <div>
        {SAMPLE.leads.slice(0, 3).map(l => <LeadRow key={l.id} l={l} />)}
      </div>

      {/* Due this week */}
      <SectionHead title="Due this week" right={<RightLink>Pipeline</RightLink>} />
      <div>
        {SAMPLE.orders.filter(o => ['fitting', 'ready', 'confirmed'].includes(o.stage)).slice(0, 3).map(o => <OrderRow key={o.id} o={o} />)}
      </div>

      <div style={{ height: 20 }} />
    </div>
    <BotNav active="today" />
  </div>
);

const Stat = ({ label, value, sub, tone }) => (
  <div className="card" style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
    <div className="label" style={{ fontSize: 10 }}>{label}</div>
    <div className="num-xl" style={{
      fontSize: 30,
      color: tone === 'accent' ? 'var(--mm-accent-strong)' : tone === 'success' ? 'var(--mm-success)' : 'var(--mm-fg)',
    }}>{value}</div>
    <div className="meta">{sub}</div>
  </div>
);

const SectionHead = ({ title, right }) => (
  <div className="row between" style={{ padding: '20px 20px 8px' }}>
    <div className="label">{title}</div>
    {right}
  </div>
);
const RightLink = ({ children }) => (
  <div className="row gap-1" style={{ fontSize: 12, color: 'var(--mm-fg-2)', fontWeight: 500 }}>{children} {I.chev_r}</div>
);

// ─── Mobile · Leads list ────────────────────────────────
const MobileLeads = () => (
  <div className="screen" style={{ width: MW, height: MH }}>
    <Topbar
      title="Leads"
      sub="48 total · 4 new"
      right={<button className="btn btn-ghost btn-icon">{I.search}</button>}
    />
    {/* Filter chips */}
    <div className="row gap-2" style={{ padding: '10px 20px', overflowX: 'auto', borderBottom: '1px solid var(--mm-border)' }}>
      <FilterChip active>All <span className="meta mono">48</span></FilterChip>
      <FilterChip>New <span className="meta mono">4</span></FilterChip>
      <FilterChip>Qualified <span className="meta mono">12</span></FilterChip>
      <FilterChip>Converted <span className="meta mono">28</span></FilterChip>
      <FilterChip>Lost <span className="meta mono">4</span></FilterChip>
    </div>
    <div className="scroll">
      {SAMPLE.leads.map(l => <LeadRow key={l.id} l={l} expanded />)}
    </div>
    <BotNav active="leads" />
  </div>
);

const FilterChip = ({ active, children }) => (
  <button className="btn" style={{
    height: 28, padding: '0 10px', fontSize: 12,
    background: active ? 'var(--mm-fg)' : 'var(--mm-surface)',
    color: active ? 'var(--mm-bg)' : 'var(--mm-fg-2)',
    borderColor: active ? 'var(--mm-fg)' : 'var(--mm-border-strong)',
    flexShrink: 0,
  }}>{children}</button>
);

const LeadRow = ({ l, expanded }) => (
  <div className="list-row">
    <Avatar name={l.name.match(/^\+/) ? '?' : l.name} tone={l.status === 'qualified' ? 'accent' : l.status === 'converted' ? 'success' : 'neutral'} />
    <div className="grow col" style={{ gap: 2, minWidth: 0 }}>
      <div className="row between gap-2">
        <div className="truncate" style={{ fontWeight: 500, fontSize: 'var(--mm-fs-base)' }}>{l.name}</div>
        <div className="meta mono shrink-0">{l.ago}</div>
      </div>
      <div className="row gap-2 between" style={{ minWidth: 0 }}>
        <div className="truncate" style={{ fontSize: 12, color: 'var(--mm-fg-3)' }}>
          <span style={{ color: 'var(--mm-fg-2)' }}>{l.garment}</span>
          {expanded && <> · {l.fabric} · due <span className="mono">{l.deadline}</span></>}
        </div>
        <Pill kind={l.status}><span className="pill-dot" />{l.status}</Pill>
      </div>
    </div>
  </div>
);

const OrderRow = ({ o }) => (
  <div className="list-row">
    <Avatar name={o.cust} size="sm" />
    <div className="grow col" style={{ gap: 2, minWidth: 0 }}>
      <div className="row between gap-2">
        <div className="truncate" style={{ fontWeight: 500, fontSize: 'var(--mm-fs-base)' }}>{o.cust}</div>
        <div className="mono shrink-0" style={{ fontSize: 12, color: 'var(--mm-fg-2)' }}>QAR {o.price.toLocaleString()}</div>
      </div>
      <div className="row gap-2 between" style={{ minWidth: 0 }}>
        <div className="truncate" style={{ fontSize: 12, color: 'var(--mm-fg-3)' }}>
          <span className="mono" style={{ color: 'var(--mm-fg-2)' }}>{o.id}</span> · {o.garment} · due <span className="mono">{o.due}</span>
        </div>
        <StageChip stage={o.stage} />
      </div>
    </div>
  </div>
);

// ─── Mobile · Lead detail ───────────────────────────────
const MobileLeadDetail = () => {
  const l = SAMPLE.leads[0];
  return (
    <div className="screen" style={{ width: MW, height: MH }}>
      <Topbar back title={l.name} sub={l.phone} right={
        <div className="row gap-1">
          <button className="btn btn-ghost btn-icon">{I.whatsapp}</button>
          <button className="btn btn-ghost btn-icon">{I.more}</button>
        </div>
      } />
      <div className="scroll">
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--mm-border)' }}>
          <Pill kind="qualified"><span className="pill-dot" />Qualified</Pill>
          <span className="meta">14 min ago · <span className="mono">{l.id}</span></span>
        </div>

        {/* Qualification summary */}
        <div style={{ padding: '14px 20px' }}>
          <div className="label" style={{ marginBottom: 8 }}>Qualification</div>
          <div className="card" style={{ padding: '4px 0' }}>
            <KV k="Garment"   v={<span style={{ fontWeight: 500 }}>{l.garment}</span>} />
            <KV k="Fabric"    v={l.fabric} />
            <KV k="Deadline"  v={<span className="mono">{l.deadline}</span>} />
            <KV k="Returning" v={l.returning ? 'Yes — 3 prior orders' : 'No'} last />
          </div>
        </div>

        {/* WhatsApp transcript preview */}
        <div style={{ padding: '4px 20px 14px' }}>
          <div className="row between" style={{ marginBottom: 8 }}>
            <div className="label">Transcript</div>
            <div className="meta row gap-1">{I.whatsapp} via WhatsApp</div>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="wa">
              <div className="wa-day">Today, 09:14</div>
              <div className="wa-msg wa-in">As-salaamu alaikum, I want a thobe before next Thursday <span className="wa-time">09:14</span></div>
              <div className="wa-msg wa-out">Hi! Thanks for reaching out to Al-Khayyat Tailoring. I'll grab a few quick details so we can help you fast. What kind of garment are you looking for? <span className="wa-time">09:14</span></div>
              <div className="wa-msg wa-in">A thobe please <span className="wa-time">09:15</span></div>
              <div className="wa-msg wa-out">Got it — thobe. Any fabric preference, or should we suggest options? <span className="wa-time">09:15</span></div>
              <div className="wa-msg wa-in">Cotton, white <span className="wa-time">09:16</span></div>
              <div className="wa-msg wa-out">Noted. When do you need it by? <span className="wa-time">09:16</span></div>
              <div className="wa-msg wa-in">Next Thursday <span className="wa-time">09:18</span></div>
              <div className="wa-msg wa-out">Last one — have you ordered with us before? <span className="wa-time">09:18</span></div>
              <div className="wa-msg wa-in">Yes <span className="wa-time">09:19</span></div>
              <div className="wa-msg wa-out">Thanks! Yousef will get back to you shortly with pricing and next steps. <span className="wa-time">09:19</span></div>
            </div>
          </div>
        </div>

        {/* Follow-up state */}
        <div style={{ padding: '0 20px 14px' }}>
          <div className="label" style={{ marginBottom: 8 }}>Follow-up sequence</div>
          <div className="card" style={{ padding: '12px 14px' }}>
            <FollowupRow label="2h check-in"  state="sent"    when="11:14"  free />
            <FollowupRow label="24h template" state="pending" when="tomorrow 09:14"  template="memento_followup_24h" />
            <FollowupRow label="72h template" state="pending" when="Mon 09:14" template="memento_followup_72h" last />
            <button className="btn btn-block" style={{ marginTop: 10 }}>{I.pause} Pause sequence</button>
          </div>
        </div>

        <div style={{ height: 96 }} />
      </div>
      {/* Sticky action bar */}
      <div style={{ padding: '10px 20px 14px', borderTop: '1px solid var(--mm-border)', background: 'var(--mm-bg)', display: 'flex', gap: 8 }}>
        <button className="btn btn-lg" style={{ flex: 1 }}>Mark lost</button>
        <button className="btn btn-accent btn-lg" style={{ flex: 2 }}>Convert to order {I.arrow_r}</button>
      </div>
    </div>
  );
};

const KV = ({ k, v, last }) => (
  <div className="row between" style={{ padding: '10px 14px', borderBottom: last ? '0' : '1px solid var(--mm-border)' }}>
    <div className="meta" style={{ minWidth: 100 }}>{k}</div>
    <div style={{ fontSize: 'var(--mm-fs-base)', color: 'var(--mm-fg)', textAlign: 'right' }}>{v}</div>
  </div>
);

const FollowupRow = ({ label, state, when, free, template, last }) => (
  <div className="row gap-3" style={{ padding: '8px 0', borderBottom: last ? 0 : '1px solid var(--mm-border)' }}>
    <span className={'tick ' + (state === 'sent' ? '' : 'muted')}>{state === 'sent' ? I.check : null}</span>
    <div className="grow col" style={{ gap: 1, minWidth: 0 }}>
      <div className="row between gap-2">
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        <div className="meta mono shrink-0">{when}</div>
      </div>
      <div className="meta truncate">
        {free ? 'Free-form · sent inside 24h window' : <>Template · <span className="mono">{template}</span></>}
      </div>
    </div>
  </div>
);

// ─── Mobile · Customers list ────────────────────────────
const MobileCustomers = () => (
  <div className="screen" style={{ width: MW, height: MH }}>
    <Topbar title="Customers" sub="1,247 total" right={<button className="btn btn-ghost btn-icon">{I.plus}</button>} />
    <div style={{ padding: '10px 20px 12px', borderBottom: '1px solid var(--mm-border)' }}>
      <div className="row gap-2 focus-ring" style={{ background: 'var(--mm-surface)', border: '1px solid var(--mm-border-strong)', borderRadius: 8, padding: '0 12px', height: 40 }}>
        <span style={{ color: 'var(--mm-muted)' }}>{I.search}</span>
        <input className="grow" style={{ background: 'transparent', border: 0, outline: 0, fontSize: 14 }} defaultValue="5512" />
        <span className="meta mono">3 results</span>
      </div>
      <div className="meta" style={{ marginTop: 6 }}>Search by phone, name or order ID.</div>
    </div>
    <div className="scroll">
      <div className="label" style={{ padding: '14px 20px 6px' }}>Recent contact</div>
      {SAMPLE.customers.map(c => (
        <div key={c.id} className="list-row">
          <Avatar name={c.name} />
          <div className="grow col" style={{ gap: 2, minWidth: 0 }}>
            <div className="row between gap-2">
              <div className="truncate" style={{ fontWeight: 500 }}>{c.name}</div>
              <div className="meta mono shrink-0">{c.last}</div>
            </div>
            <div className="row between gap-2">
              <div className="meta mono truncate">{c.phone}</div>
              <div className="mono shrink-0" style={{ fontSize: 12, color: 'var(--mm-fg-2)' }}>
                {c.ltv > 0 ? <>QAR {c.ltv.toLocaleString()}</> : <span style={{ color: 'var(--mm-muted)' }}>—</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    <BotNav active="customers" />
  </div>
);

// ─── Mobile · Customer profile ──────────────────────────
const MobileCustomerProfile = () => {
  const c = SAMPLE.customers[2]; // Khalid bin Hamad — returning
  return (
    <div className="screen" style={{ width: MW, height: MH }}>
      <Topbar back title="Profile" right={<button className="btn btn-ghost btn-icon">{I.edit}</button>} />
      <div className="scroll">
        {/* Header */}
        <div style={{ padding: '16px 20px 14px', display: 'flex', gap: 14, alignItems: 'center', borderBottom: '1px solid var(--mm-border)' }}>
          <Avatar name={c.name} size="lg" tone="accent" />
          <div className="grow col" style={{ gap: 2, minWidth: 0 }}>
            <div className="row gap-2" style={{ alignItems: 'center' }}>
              <div className="h2 truncate">{c.name}</div>
              <span style={{ color: 'var(--mm-warn)' }}>{I.star}</span>
            </div>
            <div className="meta mono">{c.phone}</div>
            <div className="meta">khalid.h@gmail.com</div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ padding: '12px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <MiniStat label="Orders" value="8" />
          <MiniStat label="LTV" value="QAR 12.4k" />
          <MiniStat label="Since" value="2023" />
        </div>

        {/* Measurements */}
        <Section title="Measurements" right="Edit">
          <div className="card" style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 18px' }}>
            <Measure k="Chest"    v="42" />
            <Measure k="Waist"    v="36" />
            <Measure k="Shoulder" v="18.5" />
            <Measure k="Sleeve"   v="25" />
            <Measure k="Length"   v="56" />
            <Measure k="Neck"     v="16.5" />
          </div>
          <div style={{ marginTop: 8 }}>
            <div className="label" style={{ marginBottom: 4 }}>Fabric preferences</div>
            <div style={{ fontSize: 13, color: 'var(--mm-fg-2)', lineHeight: 1.5 }}>
              Egyptian cotton or linen blends · prefers off-white / cream · double cuff
            </div>
          </div>
        </Section>

        {/* Past orders */}
        <Section title="Past orders" right="View all (8)">
          <div className="card" style={{ overflow: 'hidden' }}>
            {SAMPLE.orders.filter(o => o.cust.startsWith('Khalid') || o.id === 'O-1141').slice(0, 3).map((o, i, arr) => (
              <div key={o.id} className="row gap-3" style={{ padding: '10px 14px', borderBottom: i === arr.length - 1 ? 0 : '1px solid var(--mm-border)' }}>
                <StageChip stage={o.stage} />
                <div className="grow col" style={{ minWidth: 0, gap: 1 }}>
                  <div className="row between">
                    <span className="mono" style={{ fontSize: 12, color: 'var(--mm-fg)' }}>{o.id}</span>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--mm-fg-2)' }}>QAR {o.price.toLocaleString()}</span>
                  </div>
                  <div className="meta truncate">{o.garment} · {o.fabric}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Message history */}
        <Section title="Recent messages">
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="wa" style={{ maxHeight: 200, overflow: 'hidden' }}>
              <div className="wa-msg wa-in">Eid Mubarak Yousef. Need 3 thobes by next Friday. <span className="wa-time">May 6, 14:22</span></div>
              <div className="wa-msg wa-out">Mubarak alaykum! Same fabric as last time? <span className="wa-time">May 6, 14:25</span></div>
              <div className="wa-msg wa-in">Yes please <span className="wa-time">May 6, 14:26</span></div>
            </div>
          </div>
        </Section>
        <div style={{ height: 28 }} />
      </div>
    </div>
  );
};

const Section = ({ title, right, children }) => (
  <div style={{ padding: '14px 20px 4px' }}>
    <div className="row between" style={{ marginBottom: 8 }}>
      <div className="label">{title}</div>
      {right && <button className="btn btn-ghost" style={{ height: 22, padding: '0 6px', fontSize: 12 }}>{right}</button>}
    </div>
    {children}
  </div>
);
const MiniStat = ({ label, value }) => (
  <div style={{ background: 'var(--mm-surface-2)', borderRadius: 8, padding: '8px 10px' }}>
    <div className="meta" style={{ fontSize: 10 }}>{label}</div>
    <div style={{ fontFamily: 'var(--mm-font-mono)', fontSize: 15, fontWeight: 500, color: 'var(--mm-fg)' }}>{value}</div>
  </div>
);
const Measure = ({ k, v }) => (
  <div className="row between">
    <span className="meta">{k}</span>
    <span className="mono" style={{ fontSize: 13, color: 'var(--mm-fg)' }}>{v}<span style={{ color: 'var(--mm-muted)', marginLeft: 2 }}>"</span></span>
  </div>
);

// ─── Mobile · Orders pipeline (swipeable list) ──────────
const MobileOrders = () => (
  <div className="screen" style={{ width: MW, height: MH }}>
    <Topbar title="Orders" sub="14 active · 6 due this week" right={
      <div className="row gap-1">
        <button className="btn btn-ghost btn-icon">{I.filter}</button>
        <button className="btn btn-ghost btn-icon">{I.search}</button>
      </div>
    } />
    {/* Stage tabs */}
    <div className="row gap-1" style={{ padding: '8px 12px', overflowX: 'auto', borderBottom: '1px solid var(--mm-border)' }}>
      {STAGES.map((s, i) => (
        <button key={s.id} className="btn" style={{
          height: 28, padding: '0 10px', fontSize: 12, flexShrink: 0,
          background: i === 3 ? 'var(--mm-fg)' : 'transparent',
          color: i === 3 ? 'var(--mm-bg)' : 'var(--mm-fg-2)',
          borderColor: i === 3 ? 'var(--mm-fg)' : 'transparent',
        }}>
          {s.label} <span className="mono" style={{ opacity: .7, marginLeft: 2 }}>{[3, 2, 4, 2, 2, 1][i]}</span>
        </button>
      ))}
    </div>
    <div className="scroll">
      <div className="label" style={{ padding: '14px 20px 8px' }}>Fitting · 2 orders</div>
      {SAMPLE.orders.filter(o => o.stage === 'fitting').map(o => <OrderCard key={o.id} o={o} />)}
      <div className="label" style={{ padding: '14px 20px 8px' }}>Ready · 2 orders</div>
      {SAMPLE.orders.filter(o => o.stage === 'ready').map(o => <OrderCard key={o.id} o={o} />)}
      <div className="label" style={{ padding: '14px 20px 8px' }}>Confirmed · 3 orders</div>
      {SAMPLE.orders.filter(o => o.stage === 'confirmed').map(o => <OrderCard key={o.id} o={o} />)}
      <div style={{ height: 20 }} />
    </div>
    <BotNav active="orders" />
  </div>
);

const OrderCard = ({ o }) => (
  <div style={{ padding: '0 20px 8px' }}>
    <div className="card" style={{ padding: '12px 14px' }}>
      <div className="row between">
        <div className="row gap-2">
          <span className="mono" style={{ fontSize: 11, color: 'var(--mm-fg-3)' }}>{o.id}</span>
          {o.notify && <Pill kind="warn"><span className="pill-dot" />notify</Pill>}
        </div>
        <span className="mono" style={{ fontSize: 12, color: 'var(--mm-fg-2)' }}>QAR {o.price.toLocaleString()}</span>
      </div>
      <div className="row between" style={{ marginTop: 4 }}>
        <div className="col" style={{ gap: 1, minWidth: 0 }}>
          <div className="truncate" style={{ fontWeight: 500, fontSize: 14 }}>{o.cust}</div>
          <div className="meta truncate">{o.garment} · {o.fabric}</div>
        </div>
        <div className="col" style={{ alignItems: 'flex-end', gap: 1, flexShrink: 0, marginLeft: 12 }}>
          <div className="meta">due</div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{o.due}</div>
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <StageTracker current={o.stage} compact />
      </div>
    </div>
  </div>
);

// ─── Mobile · Order detail ──────────────────────────────
const MobileOrderDetail = () => {
  const o = SAMPLE.orders[0]; // Ahmed's thobe @ fitting
  const ci = stageIdx(o.stage);
  const next = STAGES[ci + 1];
  return (
    <div className="screen" style={{ width: MW, height: MH }}>
      <Topbar back title={<span className="mono">{o.id}</span>} sub={o.cust} right={<button className="btn btn-ghost btn-icon">{I.more}</button>} />
      <div className="scroll">
        <div style={{ padding: '14px 20px 16px' }}>
          <StageTracker current={o.stage} />
          <div className="row gap-2" style={{ marginTop: 12, alignItems: 'baseline' }}>
            <span className="h2">Fitting</span>
            <span className="meta">step 4 of 6</span>
          </div>
          <div className="hint" style={{ marginTop: 4 }}>Customer was notified on entry. Next: Ready for pickup.</div>
        </div>

        <div style={{ padding: '0 20px 14px' }}>
          <div className="label" style={{ marginBottom: 8 }}>Order</div>
          <div className="card" style={{ padding: 0 }}>
            <KV k="Customer"   v={<a style={{ color: 'var(--mm-accent-strong)', fontWeight: 500 }}>{o.cust} {I.external}</a>} />
            <KV k="Garment"    v={o.garment} />
            <KV k="Fabric"     v={o.fabric} />
            <KV k="Agreed"     v={<span className="mono">QAR {o.price.toLocaleString()}</span>} />
            <KV k="Deposit"    v={<span className="mono">QAR {o.deposit} <span style={{ color: 'var(--mm-success)' }}>· paid</span></span>} />
            <KV k="Promised"   v={<span className="mono">{o.due}</span>} last />
          </div>
        </div>

        <div style={{ padding: '0 20px 14px' }}>
          <div className="label" style={{ marginBottom: 8 }}>History</div>
          <div className="card" style={{ padding: '6px 14px' }}>
            <Hist when="May 9, 09:14" what="Confirmed" notify />
            <Hist when="May 10, 14:22" what="Cut" />
            <Hist when="May 13, 10:08" what="Stitched" />
            <Hist when="Today, 08:30" what="Fitting" notify last />
          </div>
        </div>

        <div style={{ height: 110 }} />
      </div>

      <div style={{ padding: '10px 20px 14px', borderTop: '1px solid var(--mm-border)', background: 'var(--mm-bg)' }}>
        <div className="row gap-2" style={{ marginBottom: 8 }}>
          <button className="btn" style={{ flex: 0 }}>{I.arrow_l}</button>
          <button className="btn btn-accent btn-lg grow">
            Advance to {next.label}
            {next.notify && <span style={{ opacity: .85, marginLeft: 6, fontSize: 11 }}>· notifies customer</span>}
          </button>
        </div>
        <div className="row between meta">
          <span>{I.whatsapp ? null : null}WhatsApp window open · 23h 12m</span>
          <span className="mono">last contact · 14m ago</span>
        </div>
      </div>
    </div>
  );
};

const Hist = ({ when, what, notify, last }) => (
  <div className="row gap-3" style={{ padding: '8px 0', borderBottom: last ? 0 : '1px solid var(--mm-border)' }}>
    <span className={'tick ' + (notify ? 'accent' : '')}>{I.check}</span>
    <div className="grow row between gap-2">
      <div style={{ fontSize: 13, fontWeight: 500 }}>{what}</div>
      <div className="meta mono">{when}</div>
    </div>
    {notify && <span style={{ color: 'var(--mm-accent-strong)' }}>{I.whatsapp}</span>}
  </div>
);

Object.assign(window, {
  MW, MH,
  MobileLogin, MobileToday, MobileLeads, MobileLeadDetail,
  MobileCustomers, MobileCustomerProfile, MobileOrders, MobileOrderDetail,
});
