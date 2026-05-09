// screens-desktop.jsx — Memento desktop screens (1280×800)

const DW = 1280, DH = 800;

// Shell — sidebar + content
const Shell = ({ active, title, sub, actions, children, footerless }) => (
  <div className="screen" style={{ width: DW, height: DH, flexDirection: 'row' }}>
    <Sidebar active={active} />
    <div className="grow col" style={{ minWidth: 0 }}>
      <div className="row between" style={{ padding: '14px 24px', borderBottom: '1px solid var(--mm-border)', minHeight: 60 }}>
        <div className="col" style={{ gap: 2 }}>
          <div className="h2">{title}</div>
          {sub && <div className="meta">{sub}</div>}
        </div>
        <div className="row gap-2">{actions}</div>
      </div>
      <div className="grow col" style={{ minHeight: 0 }}>{children}</div>
    </div>
  </div>
);

// ─── Desktop · Login ────────────────────────────────────
const DesktopLogin = () => (
  <div className="screen" style={{ width: DW, height: DH, flexDirection: 'row' }}>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 56px' }}>
      <Logo size={16} />
      <div className="col gap-6" style={{ maxWidth: 360 }}>
        <div className="col gap-2">
          <div className="h1">Welcome back</div>
          <div className="hint">A magic link will arrive in your inbox. One sign-in per shop.</div>
        </div>
        <div className="col gap-2">
          <div className="label">Work email</div>
          <input className="field" style={{ height: 40 }} defaultValue="yousef@al-khayyat.qa" />
          <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 6 }}>Send magic link {I.arrow_r}</button>
        </div>
        <div className="hint">
          Trouble signing in? Reach Memento support at <span className="mono">help@memento.app</span>
        </div>
      </div>
      <div className="meta">© Memento · v1.0 · single-tenant build for Al-Khayyat Tailoring</div>
    </div>
    <div style={{ flex: 1, background: 'var(--mm-surface-2)', borderLeft: '1px solid var(--mm-border)', display: 'flex', flexDirection: 'column', padding: '40px 56px', justifyContent: 'space-between' }}>
      <div />
      <div className="col gap-4" style={{ maxWidth: 480 }}>
        <div className="label">In the last 24 hours</div>
        <div className="col gap-3">
          <Stat2 v="4"  l="new leads from WhatsApp ads" />
          <Stat2 v="2"  l="orders ready for pickup" />
          <Stat2 v="6"  l="orders due this week" />
          <Stat2 v="QAR 8,940" l="confirmed pipeline value" />
        </div>
        <div className="hint" style={{ borderTop: '1px solid var(--mm-border)', paddingTop: 16, marginTop: 8 }}>
          Last sync · <span className="mono">just now</span> · Bot replied to 14 messages overnight.
        </div>
      </div>
      <div className="meta">A WhatsApp-first lead and order system for tailoring shops.</div>
    </div>
  </div>
);

const Stat2 = ({ v, l }) => (
  <div className="row gap-3" style={{ alignItems: 'baseline' }}>
    <div style={{ fontFamily: 'var(--mm-font-mono)', fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', minWidth: 100 }}>{v}</div>
    <div style={{ fontSize: 13, color: 'var(--mm-fg-2)' }}>{l}</div>
  </div>
);

// ─── Desktop · Today ────────────────────────────────────
const DesktopToday = () => (
  <Shell active="today" title="Today" sub="Friday, May 9 · 9:42 AM · Doha"
    actions={<>
      <div className="row gap-2 card" style={{ padding: '0 12px', height: 32 }}>
        <span style={{ width: 7, height: 7, borderRadius: 4, background: 'var(--mm-success)' }} />
        <span style={{ fontSize: 12, fontWeight: 500 }}>Bot is on</span>
        <span className="meta">·</span>
        <button className="btn btn-ghost" style={{ height: 22, padding: '0 6px', fontSize: 11 }}>Pause</button>
      </div>
      <button className="btn">{I.bell}</button>
      <button className="btn btn-primary">{I.plus} New order</button>
    </>}>
    <div className="grow scroll" style={{ padding: '20px 24px' }}>
      {/* metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <BigStat label="New leads · 24h"     value="4"   delta="+2 vs yest" tone="accent" />
        <BigStat label="Qualified · awaiting" value="3" delta="oldest 38m"   tone="warn" />
        <BigStat label="Orders due · this week" value="6" delta="2 ready"   />
        <BigStat label="Pipeline value"       value="QAR 8,940" delta="14 active orders" mono />
      </div>

      {/* two-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }}>
        {/* New leads */}
        <Panel title="New leads" right={<button className="btn btn-ghost" style={{ height: 24, padding: '0 8px', fontSize: 12 }}>View all {I.chev_r}</button>}>
          {SAMPLE.leads.slice(0, 4).map(l => <LeadRow key={l.id} l={l} expanded />)}
        </Panel>
        {/* Today's pipeline */}
        <Panel title="Due this week" right={<button className="btn btn-ghost" style={{ height: 24, padding: '0 8px', fontSize: 12 }}>Pipeline {I.chev_r}</button>}>
          {SAMPLE.orders.filter(o => ['confirmed','fitting','ready'].includes(o.stage)).slice(0, 4).map(o => <OrderRow key={o.id} o={o} />)}
        </Panel>
      </div>

      {/* Activity */}
      <div style={{ marginTop: 18 }}>
        <Panel title="Recent activity" right={<span className="meta">last 24 h</span>}>
          <Activity time="09:19" who="Bot" verb="qualified" what={<>lead <span className="mono">L-2841</span> from Ahmed Al-Mansoori</>} />
          <Activity time="09:14" who="Ahmed Al-Mansoori" verb="started" what="a new WhatsApp conversation" />
          <Activity time="08:30" who="You" verb="advanced" what={<><span className="mono">O-1142</span> to <StageChip stage="fitting" /></>} />
          <Activity time="08:28" who="Memento" verb="sent" what={<><span className="mono">memento_followup_24h</span> to Omar Al-Naimi</>} />
          <Activity time="Yesterday" who="You" verb="converted" what={<>lead <span className="mono">L-2836</span> → <span className="mono">O-1141</span> · QAR 1,620</>} last />
        </Panel>
      </div>
    </div>
  </Shell>
);

const Panel = ({ title, right, children }) => (
  <div className="card" style={{ overflow: 'hidden' }}>
    <div className="row between" style={{ padding: '12px 16px', borderBottom: '1px solid var(--mm-border)' }}>
      <div className="h3">{title}</div>
      {right}
    </div>
    <div>{children}</div>
  </div>
);
const BigStat = ({ label, value, delta, tone, mono }) => (
  <div className="card" style={{ padding: '14px 16px' }}>
    <div className="label">{label}</div>
    <div style={{
      fontFamily: mono ? 'var(--mm-font-mono)' : 'var(--mm-font-sans)',
      fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', marginTop: 6,
      color: tone === 'accent' ? 'var(--mm-accent-strong)' : tone === 'warn' ? 'var(--mm-warn)' : 'var(--mm-fg)',
    }}>{value}</div>
    <div className="meta" style={{ marginTop: 4 }}>{delta}</div>
  </div>
);
const Activity = ({ time, who, verb, what, last }) => (
  <div className="row gap-3" style={{ padding: '10px 16px', borderBottom: last ? 0 : '1px solid var(--mm-border)', alignItems: 'baseline' }}>
    <div className="meta mono" style={{ width: 80, flexShrink: 0 }}>{time}</div>
    <div className="grow" style={{ fontSize: 13, color: 'var(--mm-fg-2)' }}>
      <span style={{ color: 'var(--mm-fg)', fontWeight: 500 }}>{who}</span> {verb} {what}
    </div>
  </div>
);

// ─── Desktop · Leads list ───────────────────────────────
const DesktopLeads = () => (
  <Shell active="leads" title="Leads" sub="48 total · 4 new in the last 24h"
    actions={<>
      <div className="row gap-1" style={{ padding: '0 10px', height: 32, border: '1px solid var(--mm-border-strong)', borderRadius: 6, background: 'var(--mm-surface)', minWidth: 240 }}>
        <span style={{ color: 'var(--mm-muted)' }}>{I.search}</span>
        <input style={{ background: 'transparent', border: 0, outline: 0, fontSize: 13, flex: 1 }} placeholder="Search leads…" />
        <span className="kbd">⌘K</span>
      </div>
      <button className="btn">{I.filter} Filter</button>
      <button className="btn btn-primary">{I.plus} Add lead</button>
    </>}>
    {/* Status tabs */}
    <div className="row gap-3" style={{ padding: '0 24px', borderBottom: '1px solid var(--mm-border)' }}>
      {[
        { l: 'All',       n: 48, a: false },
        { l: 'New',       n: 4,  a: false },
        { l: 'Qualified', n: 12, a: true  },
        { l: 'Converted', n: 28, a: false },
        { l: 'Lost',      n: 4,  a: false },
      ].map(t => (
        <div key={t.l} style={{
          padding: '10px 0', borderBottom: t.a ? '2px solid var(--mm-fg)' : '2px solid transparent',
          color: t.a ? 'var(--mm-fg)' : 'var(--mm-fg-3)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500,
        }}>
          {t.l} <span className="mono meta">{t.n}</span>
        </div>
      ))}
    </div>
    {/* Table */}
    <div className="grow scroll">
      <div className="row" style={{
        padding: '8px 24px', borderBottom: '1px solid var(--mm-border)',
        fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
        color: 'var(--mm-muted)', fontWeight: 500, background: 'var(--mm-surface-2)',
      }}>
        <div style={{ width: 80 }}>Lead</div>
        <div style={{ flex: 1.6 }}>Customer</div>
        <div style={{ flex: 1 }}>Garment</div>
        <div style={{ flex: 1 }}>Fabric</div>
        <div style={{ flex: 0.8 }}>Deadline</div>
        <div style={{ flex: 0.7 }}>Status</div>
        <div style={{ flex: 0.7 }}>Follow-up</div>
        <div style={{ width: 70, textAlign: 'right' }}>Age</div>
      </div>
      {SAMPLE.leads.map((l, i) => (
        <div key={l.id} className="row" style={{
          padding: '12px 24px', borderBottom: '1px solid var(--mm-border)',
          background: i === 0 ? 'var(--mm-accent-soft)' : 'transparent', cursor: 'pointer',
        }}>
          <div style={{ width: 80 }}><span className="mono" style={{ fontSize: 12, color: 'var(--mm-fg-2)' }}>{l.id}</span></div>
          <div style={{ flex: 1.6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={l.name.match(/^\+/) ? '?' : l.name} size="sm" tone={l.status === 'qualified' ? 'accent' : l.status === 'converted' ? 'success' : 'neutral'} />
            <div className="col" style={{ minWidth: 0 }}>
              <div className="truncate" style={{ fontWeight: 500, fontSize: 13 }}>{l.name}</div>
              <div className="meta mono">{l.phone}</div>
            </div>
          </div>
          <div style={{ flex: 1, fontSize: 13 }}>{l.garment}</div>
          <div style={{ flex: 1, fontSize: 13, color: 'var(--mm-fg-2)' }} className="truncate">{l.fabric}</div>
          <div style={{ flex: 0.8, fontSize: 13 }} className="mono">{l.deadline}</div>
          <div style={{ flex: 0.7 }}>
            <Pill kind={l.status}><span className="pill-dot" />{l.status}</Pill>
          </div>
          <div style={{ flex: 0.7, fontSize: 12, color: 'var(--mm-fg-3)' }} className="mono">
            {l.followup === 'none' ? '—' : l.followup === 'done' ? 'done' : l.followup.replace('sent_', '✓ ')}
          </div>
          <div style={{ width: 70, textAlign: 'right' }} className="mono meta">{l.ago}</div>
        </div>
      ))}
    </div>
  </Shell>
);

// ─── Desktop · Lead detail (3-col) ──────────────────────
const DesktopLeadDetail = () => {
  const l = SAMPLE.leads[0];
  return (
    <Shell active="leads" title={<span className="row gap-2"><span className="mono" style={{ color: 'var(--mm-fg-3)' }}>{l.id}</span> · {l.name}</span>}
      sub={<>{l.phone} · qualified 14m ago via Meta ad</>}
      actions={<>
        <button className="btn">{I.whatsapp} Open chat</button>
        <button className="btn">Mark lost</button>
        <button className="btn btn-accent">Convert to order {I.arrow_r}</button>
      </>}>
      <div className="row" style={{ flex: 1, minHeight: 0 }}>
        {/* Left — qualification + follow-up */}
        <div style={{ flex: 1.1, padding: 24, borderRight: '1px solid var(--mm-border)', overflow: 'auto' }}>
          <div className="row gap-2" style={{ marginBottom: 16 }}>
            <Pill kind="qualified"><span className="pill-dot" />Qualified</Pill>
            <Pill kind="default"><span className="pill-dot" />Returning customer</Pill>
            <Pill kind="default">Source · meta_ad</Pill>
          </div>

          <div className="label" style={{ marginBottom: 8 }}>Qualification</div>
          <div className="card" style={{ padding: 0, marginBottom: 18 }}>
            <KV k="Garment"        v={<span style={{ fontWeight: 500 }}>thobe</span>} />
            <KV k="Fabric"         v="cotton, white" />
            <KV k="Deadline"       v={<span className="mono">next Thursday</span>} />
            <KV k="Returning"      v="Yes — 3 prior orders · QAR 12,400 LTV" />
            <KV k="Bot confidence" v={<span className="mono">0.94</span>} last />
          </div>

          <div className="label" style={{ marginBottom: 8 }}>Follow-up sequence</div>
          <div className="card" style={{ padding: 14 }}>
            <FollowupRow label="2h check-in"   state="sent"    when="11:14"          free />
            <FollowupRow label="24h template"  state="pending" when="tomorrow 09:14" template="memento_followup_24h" />
            <FollowupRow label="72h template"  state="pending" when="Mon 09:14"      template="memento_followup_72h" last />
            <div className="row gap-2" style={{ marginTop: 12 }}>
              <button className="btn">{I.pause} Pause sequence</button>
              <span className="meta" style={{ alignSelf: 'center' }}>Owner reply auto-pauses follow-ups.</span>
            </div>
          </div>
        </div>

        {/* Middle — WhatsApp transcript */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className="row between" style={{ padding: '12px 20px', borderBottom: '1px solid var(--mm-border)' }}>
            <div className="row gap-2"><span style={{ color: 'var(--mm-success)' }}>{I.whatsapp}</span><div className="h3">Transcript</div></div>
            <div className="meta">Window open · 23h 12m</div>
          </div>
          <div className="grow" style={{ overflow: 'auto', background: 'var(--mm-wa-bg)' }}>
            <div className="wa" style={{ padding: '14px 16px' }}>
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
              <div className="wa-day">2 hours later</div>
              <div className="wa-msg wa-out">Hi Ahmed! Just checking in — would you like to come by for measurements, or should we send pricing for the thobe? <span className="wa-time">11:14</span></div>
            </div>
          </div>
          <div className="row gap-2" style={{ padding: '10px 16px', borderTop: '1px solid var(--mm-border)', background: 'var(--mm-bg)' }}>
            <input className="field grow" placeholder="Reply as owner — pauses bot follow-ups" />
            <button className="btn btn-primary">{I.send}</button>
          </div>
        </div>

        {/* Right — customer card */}
        <div style={{ width: 300, padding: 20, borderLeft: '1px solid var(--mm-border)', overflow: 'auto' }}>
          <div className="col" style={{ alignItems: 'center', gap: 10, paddingBottom: 16, borderBottom: '1px solid var(--mm-border)' }}>
            <Avatar name={l.name} size="lg" tone="accent" />
            <div className="col" style={{ alignItems: 'center', gap: 1 }}>
              <div className="h3">{l.name}</div>
              <div className="meta mono">{l.phone}</div>
            </div>
            <div className="row gap-1">
              <button className="btn">{I.phone}</button>
              <button className="btn">{I.whatsapp}</button>
              <button className="btn">{I.copy}</button>
            </div>
          </div>
          <div className="col gap-3" style={{ padding: '16px 0', borderBottom: '1px solid var(--mm-border)' }}>
            <KVMini k="Total orders" v="3" mono />
            <KVMini k="Lifetime"     v="QAR 12,400" mono />
            <KVMini k="First seen"   v="Mar 2024" />
            <KVMini k="Last contact" v="2m ago" />
          </div>
          <div style={{ padding: '16px 0' }}>
            <div className="label" style={{ marginBottom: 8 }}>Past orders</div>
            <div className="col gap-2">
              {[
                { id: 'O-1141', g: 'thobe ×3', d: 'May 24', s: 'stitched' },
                { id: 'O-0982', g: 'thobe',    d: 'done', s: 'picked_up' },
                { id: 'O-0871', g: 'thobe',    d: 'done', s: 'picked_up' },
              ].map(o => (
                <div key={o.id} className="row between" style={{ fontSize: 12 }}>
                  <span className="mono" style={{ color: 'var(--mm-fg-2)' }}>{o.id}</span>
                  <span className="grow" style={{ marginLeft: 8 }}>{o.g}</span>
                  <StageChip stage={o.s} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
};
const KVMini = ({ k, v, mono }) => (
  <div className="row between"><span className="meta">{k}</span><span className={mono ? 'mono' : ''} style={{ fontSize: 12 }}>{v}</span></div>
);

// ─── Desktop · Customers list ───────────────────────────
const DesktopCustomers = () => (
  <Shell active="customers" title="Customers" sub="1,247 total · search by phone, name or order ID"
    actions={<>
      <div className="row gap-1" style={{ padding: '0 10px', height: 32, border: '1px solid var(--mm-fg)', borderRadius: 6, background: 'var(--mm-surface)', minWidth: 320 }}>
        <span style={{ color: 'var(--mm-fg)' }}>{I.search}</span>
        <input style={{ background: 'transparent', border: 0, outline: 0, fontSize: 13, flex: 1 }} defaultValue="5512" />
        <span className="meta mono">3 results</span>
      </div>
      <button className="btn btn-primary">{I.plus} New customer</button>
    </>}>
    <div className="grow scroll">
      <div className="row" style={{
        padding: '8px 24px', borderBottom: '1px solid var(--mm-border)',
        fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
        color: 'var(--mm-muted)', fontWeight: 500, background: 'var(--mm-surface-2)',
      }}>
        <div style={{ flex: 1.4 }}>Customer</div>
        <div style={{ flex: 1 }}>Phone</div>
        <div style={{ flex: 1 }}>Last contact</div>
        <div style={{ flex: 0.8 }}>Orders</div>
        <div style={{ flex: 0.8 }}>Lifetime</div>
        <div style={{ width: 100, textAlign: 'right' }}>Status</div>
      </div>
      {SAMPLE.customers.map(c => (
        <div key={c.id} className="row" style={{ padding: '11px 24px', borderBottom: '1px solid var(--mm-border)', cursor: 'pointer' }}>
          <div style={{ flex: 1.4, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={c.name} size="sm" />
            <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div>
          </div>
          <div style={{ flex: 1 }} className="mono" >{c.phone}</div>
          <div style={{ flex: 1, fontSize: 13, color: 'var(--mm-fg-2)' }}>{c.last}</div>
          <div style={{ flex: 0.8 }} className="mono">{c.ltv > 0 ? Math.ceil(c.ltv / 1500) : 0}</div>
          <div style={{ flex: 0.8 }} className="mono">{c.ltv > 0 ? <>QAR {c.ltv.toLocaleString()}</> : <span style={{ color: 'var(--mm-muted)' }}>—</span>}</div>
          <div style={{ width: 100, textAlign: 'right' }}>
            {c.ltv >= 10000 ? <Pill kind="qualified"><span className="pill-dot" />VIP</Pill> :
             c.ltv === 0    ? <Pill kind="new">prospect</Pill> :
                              <Pill kind="default">customer</Pill>}
          </div>
        </div>
      ))}
    </div>
  </Shell>
);

// ─── Desktop · Customer profile ─────────────────────────
const DesktopCustomerProfile = () => {
  const c = SAMPLE.customers[2];
  return (
    <Shell active="customers" title={<span className="row gap-2">{c.name} <span style={{ color: 'var(--mm-warn)' }}>{I.star}</span></span>}
      sub={<><span className="mono">{c.phone}</span> · khalid.h@gmail.com · since Mar 2023</>}
      actions={<>
        <button className="btn">{I.whatsapp} Message</button>
        <button className="btn">{I.edit} Edit profile</button>
        <button className="btn btn-primary">{I.plus} New order</button>
      </>}>
      <div className="row" style={{ flex: 1, minHeight: 0 }}>
        {/* Left column — measurements + preferences */}
        <div style={{ flex: 1.1, padding: 24, borderRight: '1px solid var(--mm-border)', overflow: 'auto' }}>
          <div className="row gap-2" style={{ marginBottom: 18 }}>
            <BigStat label="Orders"       value="8"           tone="" />
            <BigStat label="Lifetime"     value="QAR 12,400"  mono />
            <BigStat label="Avg order"    value="QAR 1,550"   mono />
          </div>
          <div className="label" style={{ marginBottom: 8 }}>Measurements <span className="meta" style={{ marginLeft: 8, textTransform: 'none' }}>· last updated Apr 2025</span></div>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 16px' }}>
              {[
                ['Chest', '42'], ['Waist', '36'], ['Hip', '40'],
                ['Shoulder', '18.5'], ['Sleeve', '25'], ['Neck', '16.5'],
                ['Length', '56'], ['Cuff', '9'], ['Bicep', '14'],
              ].map(([k, v]) => (
                <div key={k} className="col" style={{ gap: 2 }}>
                  <div className="meta" style={{ fontSize: 10 }}>{k.toUpperCase()}</div>
                  <div className="row gap-1" style={{ alignItems: 'baseline' }}>
                    <span className="mono" style={{ fontSize: 18, fontWeight: 500 }}>{v}</span>
                    <span className="meta">in</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="label" style={{ marginTop: 18, marginBottom: 8 }}>Fabric preferences</div>
          <div className="card" style={{ padding: 14, fontSize: 13, color: 'var(--mm-fg-2)', lineHeight: 1.55 }}>
            Egyptian cotton or linen blends · prefers off-white / cream · double cuff · stand collar
          </div>
          <div className="label" style={{ marginTop: 18, marginBottom: 8 }}>Notes</div>
          <div className="card" style={{ padding: 14, fontSize: 13, color: 'var(--mm-fg-2)', lineHeight: 1.55 }}>
            Always orders 3 thobes before Eid. Pays full deposit. Brings own buttons sometimes — ask first.
          </div>
        </div>

        {/* Middle — past orders */}
        <div style={{ flex: 1.2, padding: 24, borderRight: '1px solid var(--mm-border)', overflow: 'auto' }}>
          <div className="row between" style={{ marginBottom: 12 }}>
            <div className="h3">Past orders <span className="meta mono" style={{ marginLeft: 6 }}>8</span></div>
            <button className="btn">{I.filter} All time</button>
          </div>
          {[
            { id: 'O-1141', g: 'thobe ×3', f: 'Egyptian cotton', p: 1620, s: 'stitched',  d: 'May 24, 2025' },
            { id: 'O-0982', g: 'thobe',    f: 'Cotton blend',     p: 540,  s: 'picked_up', d: 'Mar 12, 2025' },
            { id: 'O-0871', g: 'thobe',    f: 'Cotton, off-white',p: 480,  s: 'picked_up', d: 'Jan 04, 2025' },
            { id: 'O-0712', g: 'thobe ×2', f: 'Linen blend',      p: 1080, s: 'picked_up', d: 'Sep 22, 2024' },
            { id: 'O-0598', g: 'thobe',    f: 'Cotton',           p: 460,  s: 'picked_up', d: 'Jun 09, 2024' },
            { id: 'O-0455', g: 'thobe ×3', f: 'Cotton',           p: 1380, s: 'picked_up', d: 'Apr 02, 2024' },
          ].map(o => (
            <div key={o.id} className="row gap-3" style={{ padding: '12px 0', borderBottom: '1px solid var(--mm-border)' }}>
              <StageChip stage={o.s} />
              <div className="grow col" style={{ gap: 2, minWidth: 0 }}>
                <div className="row between">
                  <div className="row gap-2"><span className="mono" style={{ fontSize: 12, color: 'var(--mm-fg-2)' }}>{o.id}</span><span style={{ fontSize: 13 }}>{o.g}</span></div>
                  <span className="mono" style={{ fontSize: 13 }}>QAR {o.p.toLocaleString()}</span>
                </div>
                <div className="meta">{o.f} · {o.d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right — message history */}
        <div style={{ width: 360, display: 'flex', flexDirection: 'column' }}>
          <div className="row between" style={{ padding: '12px 16px', borderBottom: '1px solid var(--mm-border)' }}>
            <div className="h3">Messages</div>
            <span className="meta">218 total</span>
          </div>
          <div className="grow" style={{ overflow: 'auto', background: 'var(--mm-wa-bg)' }}>
            <div className="wa" style={{ padding: '12px 14px' }}>
              <div className="wa-day">May 6, 2025</div>
              <div className="wa-msg wa-in">Eid Mubarak Yousef. Need 3 thobes by next Friday. <span className="wa-time">14:22</span></div>
              <div className="wa-msg wa-out">Mubarak alaykum! Same fabric as last time? <span className="wa-time">14:25</span></div>
              <div className="wa-msg wa-in">Yes please <span className="wa-time">14:26</span></div>
              <div className="wa-msg wa-out">Got it. We'll have measurements set, no need to come in. <span className="wa-time">14:27</span></div>
              <div className="wa-day">May 7, 2025</div>
              <div className="wa-msg wa-out">Your order is confirmed. We'll keep you updated. <span className="wa-time">10:02</span></div>
              <div className="wa-msg wa-in">Shukran <span className="wa-time">10:03</span></div>
              <div className="wa-day">Today</div>
              <div className="wa-msg wa-out">Cut — moving to stitching this afternoon. <span className="wa-time">09:18</span></div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
};

// ─── Desktop · Orders pipeline (Kanban) ─────────────────
const DesktopOrders = () => (
  <Shell active="orders" title="Orders" sub="14 active · 6 due this week"
    actions={<>
      <div className="row gap-1" style={{ padding: '2px', height: 32, background: 'var(--mm-surface-2)', borderRadius: 7 }}>
        <button className="btn" style={{ height: 26, padding: '0 10px', fontSize: 12, background: 'var(--mm-surface)', borderColor: 'transparent' }}>Kanban</button>
        <button className="btn btn-ghost" style={{ height: 26, padding: '0 10px', fontSize: 12 }}>List</button>
      </div>
      <button className="btn">{I.filter} All</button>
      <button className="btn btn-primary">{I.plus} New order</button>
    </>}>
    <div className="kanban" style={{ padding: '14px 24px' }}>
      {STAGES.map((s, i) => {
        const cards = SAMPLE.orders.filter(o => o.stage === s.id);
        return (
          <div key={s.id} className="kanban-col" style={{ flex: '0 0 200px' }}>
            <div className="kanban-col-h">
              <div className="row gap-2">
                <span style={{ width: 7, height: 7, borderRadius: 4, background: i === 5 ? 'var(--mm-muted)' : i >= 3 ? 'var(--mm-accent)' : 'var(--mm-fg-3)' }} />
                <span style={{ textTransform: 'uppercase', fontSize: 10.5, letterSpacing: '0.06em' }}>{s.label}</span>
                <span className="mono meta">{[3, 2, 4, 2, 2, 1][i]}</span>
              </div>
              <button className="btn btn-ghost btn-icon" style={{ height: 18, width: 18 }}>{I.plus}</button>
            </div>
            {cards.map(o => (
              <div key={o.id} className="kanban-card">
                <div className="row between">
                  <span className="mono" style={{ fontSize: 11, color: 'var(--mm-fg-3)' }}>{o.id}</span>
                  {o.notify && s.notify && <span style={{ color: 'var(--mm-warn)' }} title="Notifies on entry">{I.bell}</span>}
                </div>
                <div style={{ fontWeight: 500, fontSize: 13 }} className="truncate">{o.cust}</div>
                <div className="meta truncate">{o.garment} · {o.fabric}</div>
                <div className="row between" style={{ marginTop: 4 }}>
                  <span className="mono" style={{ fontSize: 12 }}>QAR {o.price.toLocaleString()}</span>
                  <span className="mono meta">{o.due}</span>
                </div>
              </div>
            ))}
            {cards.length === 0 && (
              <div className="card" style={{ padding: '14px 12px', borderStyle: 'dashed', color: 'var(--mm-muted)', fontSize: 12, textAlign: 'center' }}>none</div>
            )}
          </div>
        );
      })}
    </div>
  </Shell>
);

// ─── Desktop · Order detail ─────────────────────────────
const DesktopOrderDetail = () => {
  const o = SAMPLE.orders[0]; // O-1142, fitting
  const next = STAGES[stageIdx(o.stage) + 1];
  return (
    <Shell active="orders" title={<span className="row gap-2"><span className="mono" style={{ color: 'var(--mm-fg-3)' }}>{o.id}</span> · {o.cust}</span>}
      sub={<>{o.garment} · due {o.due} · last contact 14m ago</>}
      actions={<>
        <button className="btn">{I.arrow_l} Revert</button>
        <button className="btn btn-accent">Advance to {next.label} {I.arrow_r}</button>
        <button className="btn">{I.more}</button>
      </>}>
      <div className="grow scroll" style={{ padding: 24 }}>
        {/* Stage tracker */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: 18 }}>
          <div className="row between" style={{ marginBottom: 14 }}>
            <div className="row gap-3" style={{ alignItems: 'baseline' }}>
              <div className="h2">Fitting</div>
              <div className="meta">step 4 of 6 · entered today, 08:30</div>
            </div>
            <div className="row gap-2">
              <Pill kind="warn"><span className="pill-dot" />customer notified</Pill>
              <span className="meta">WhatsApp window · 23h 12m</span>
            </div>
          </div>
          <StageTracker current={o.stage} />
          <div className="hint" style={{ marginTop: 14 }}>
            On entry to <b style={{ color: 'var(--mm-fg)' }}>fitting</b> Memento auto-sent: "Your garment is ready for fitting. When can you come in?"
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          {/* Left — Order details */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="row between" style={{ padding: '12px 18px', borderBottom: '1px solid var(--mm-border)' }}>
              <div className="h3">Order details</div>
              <button className="btn btn-ghost" style={{ height: 22, padding: '0 6px', fontSize: 12 }}>{I.edit} Edit</button>
            </div>
            <KV k="Customer"     v={<a style={{ color: 'var(--mm-accent-strong)', fontWeight: 500 }}>{o.cust} {I.external}</a>} />
            <KV k="Lead"         v={<a style={{ color: 'var(--mm-accent-strong)' }}>L-2715 {I.external}</a>} />
            <KV k="Garment"      v={<span style={{ fontWeight: 500 }}>thobe</span>} />
            <KV k="Fabric"       v={o.fabric} />
            <KV k="Agreed price" v={<span className="mono">QAR {o.price.toLocaleString()}</span>} />
            <KV k="Deposit"      v={<span className="mono">QAR {o.deposit} <span style={{ color: 'var(--mm-success)' }}>· paid May 7</span></span>} />
            <KV k="Promised"     v={<span className="mono">{o.due}, 2025</span>} />
            <KV k="Notes"        v={<span style={{ color: 'var(--mm-fg-2)' }}>Customer requested longer cuff. Re-check sleeve length at fitting.</span>} last />
          </div>

          {/* Right — Stage history */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="row between" style={{ padding: '12px 18px', borderBottom: '1px solid var(--mm-border)' }}>
              <div className="h3">Stage history</div>
              <span className="meta">5 events</span>
            </div>
            <div style={{ padding: '10px 18px' }}>
              <Hist when="May 9, 09:14"  what="Confirmed · Memento sent confirmation message" notify />
              <Hist when="May 10, 14:22" what="Cut by Yousef" />
              <Hist when="May 13, 10:08" what="Stitched" />
              <Hist when="Today, 08:30"  what="Fitting · Memento sent fitting prompt" notify last />
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
};

// ─── Desktop · Orders pipeline (List variant) ──────────
const DesktopOrdersList = () => (
  <Shell active="orders" title="Orders" sub="14 active · 6 due this week"
    actions={<>
      <div className="row gap-1" style={{ padding: '2px', height: 32, background: 'var(--mm-surface-2)', borderRadius: 7 }}>
        <button className="btn btn-ghost" style={{ height: 26, padding: '0 10px', fontSize: 12 }}>Kanban</button>
        <button className="btn" style={{ height: 26, padding: '0 10px', fontSize: 12, background: 'var(--mm-surface)', borderColor: 'transparent' }}>List</button>
      </div>
      <button className="btn">{I.filter} All</button>
      <button className="btn btn-primary">{I.plus} New order</button>
    </>}>
    <div className="grow scroll">
      <div className="row" style={{
        padding: '8px 24px', borderBottom: '1px solid var(--mm-border)',
        fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
        color: 'var(--mm-muted)', fontWeight: 500, background: 'var(--mm-surface-2)',
      }}>
        <div style={{ width: 80 }}>Order</div>
        <div style={{ flex: 1.4 }}>Customer</div>
        <div style={{ flex: 1 }}>Garment</div>
        <div style={{ flex: 1.4 }}>Fabric</div>
        <div style={{ width: 110 }}>Stage</div>
        <div style={{ width: 100, textAlign: 'right' }}>Price</div>
        <div style={{ width: 90, textAlign: 'right' }}>Due</div>
      </div>
      {SAMPLE.orders.map(o => (
        <div key={o.id} className="row" style={{ padding: '11px 24px', borderBottom: '1px solid var(--mm-border)', cursor: 'pointer' }}>
          <div style={{ width: 80 }}><span className="mono" style={{ fontSize: 12, color: 'var(--mm-fg-2)' }}>{o.id}</span></div>
          <div style={{ flex: 1.4, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={o.cust} size="sm" />
            <div style={{ fontWeight: 500, fontSize: 13 }}>{o.cust}</div>
          </div>
          <div style={{ flex: 1, fontSize: 13 }}>{o.garment}</div>
          <div style={{ flex: 1.4, fontSize: 13, color: 'var(--mm-fg-2)' }} className="truncate">{o.fabric}</div>
          <div style={{ width: 110 }}><StageChip stage={o.stage} /></div>
          <div style={{ width: 100, textAlign: 'right' }} className="mono">QAR {o.price.toLocaleString()}</div>
          <div style={{ width: 90, textAlign: 'right' }} className="mono meta">{o.due}</div>
        </div>
      ))}
    </div>
  </Shell>
);

Object.assign(window, {
  DW, DH,
  DesktopLogin, DesktopToday, DesktopLeads, DesktopLeadDetail,
  DesktopCustomers, DesktopCustomerProfile, DesktopOrders, DesktopOrderDetail,
  DesktopOrdersList,
});
