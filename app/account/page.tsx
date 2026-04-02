"use client";

export default function AccountPage() {
  return (
    <div dangerouslySetInnerHTML={{
      __html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MovieFlix — Account Settings</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden}
:root{
  --bg:#141414;
  --surface:#1F1F1F;
  --surface2:#252525;
  --border:#2A2A2A;
  --red:#E50914;
  --text:#FFFFFF;
  --muted:#B3B3B3;
  --dim:#6B6B6B;
}

/* ── LAYOUT SHELL ── */
.mf-wrap{
  background:var(--bg);
  color:var(--text);
  font-family:'DM Sans',sans-serif;
  display:flex;
  flex-direction:column;
  width:100%;
  height:100vh;
}

/* ── HEADER ── */
.mf-header{
  background:#000;
  border-bottom:1px solid var(--border);
  padding:0 32px;
  height:54px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  flex-shrink:0;
  width:100%;
}
.mf-logo{
  font-family:'Bebas Neue',sans-serif;
  font-size:26px;
  color:var(--red);
  letter-spacing:3px;
  line-height:1;
}
.mf-header-nav{display:flex;align-items:center;gap:20px}
.mf-hn{font-size:13px;color:var(--muted);cursor:pointer;transition:color .15s}
.mf-hn:hover{color:#fff}
.mf-avatar-pill{display:flex;align-items:center;gap:8px;cursor:pointer}
.mf-av{
  width:30px;height:30px;border-radius:4px;
  background:var(--red);
  display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:700;color:#fff;
}

/* ── BODY ── */
.mf-body{display:flex;flex:1;width:100%;overflow:hidden;padding-top:54px}

/* ── SIDEBAR ── */
.mf-sidebar{
  width:210px;
  min-width:210px;
  background:#0a0a0a;
  border-right:1px solid var(--border);
  display:flex;
  flex-direction:column;
  overflow-y:auto;
  flex-shrink:0;
}
.mf-sidebar-top{padding:24px 0 8px}
.mf-slabel{
  font-size:10px;font-weight:600;letter-spacing:2px;
  color:var(--dim);padding:0 18px 8px;text-transform:uppercase;
}
.mf-ni{
  display:flex;align-items:center;gap:11px;
  padding:10px 18px;cursor:pointer;position:relative;
  transition:background .15s;font-size:13px;
  color:var(--muted);font-weight:400;user-select:none;
}
.mf-ni:hover{background:var(--surface);color:#fff}
.mf-ni:hover .ni-icon{opacity:1}
.mf-ni.active{color:#fff;font-weight:500;background:rgba(229,9,20,0.06)}
.mf-ni.active::before{
  content:'';position:absolute;left:0;top:0;bottom:0;
  width:3px;background:var(--red);border-radius:0 2px 2px 0;
}
.mf-ni.active .ni-icon{opacity:1}
.ni-icon{width:16px;height:16px;flex-shrink:0;opacity:0.5;transition:opacity .15s}
.mf-sdiv{border-top:1px solid var(--border);margin:10px 0}

/* ── MAIN CONTENT ── */
.mf-content{
  flex:1;
  min-width:0;
  overflow-y:auto;
  background:var(--bg);
  padding:36px 44px 60px;
}
.mf-sec{display:none;width:100%}
.mf-sec.active{display:block}
.pg-title{font-size:24px;font-weight:600;letter-spacing:-0.3px;margin-bottom:4px}
.pg-sub{font-size:13px;color:var(--muted);margin-bottom:32px}

/* ── GRID HELPERS ── */
.mf-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.mf-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-bottom:16px}
.mf-card-wide{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start;margin-bottom:14px}

/* ── CARDS ── */
.mf-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:6px;padding:22px;margin-bottom:14px;width:100%;
}
.card-t{font-size:15px;font-weight:500;margin-bottom:3px}
.card-s{font-size:12px;color:var(--muted);margin-bottom:18px}
.sec-h{
  font-size:14px;font-weight:600;
  padding-bottom:14px;border-bottom:1px solid var(--border);
  margin-bottom:18px;letter-spacing:0.2px;
}

/* ── FORM ELEMENTS ── */
.flabel{
  font-size:10px;font-weight:600;letter-spacing:1.5px;
  color:var(--dim);text-transform:uppercase;margin-bottom:7px;
}
.finput{
  width:100%;background:#0d0d0d;border:1px solid var(--border);
  border-radius:4px;color:#fff;font-family:'DM Sans',sans-serif;
  font-size:13px;padding:10px 13px;outline:none;transition:border-color .15s;
}
.finput:focus{border-color:#555}
.fselect{
  width:100%;background:#0d0d0d;border:1px solid var(--border);
  border-radius:4px;color:#fff;font-family:'DM Sans',sans-serif;
  font-size:13px;padding:10px 13px;outline:none;cursor:pointer;
  appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23555' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 12px center;
}
.fselect:focus{border-color:#555}
.frow{margin-bottom:16px}

/* ── BUTTONS ── */
.btn{
  display:inline-flex;align-items:center;gap:7px;
  padding:9px 18px;border-radius:4px;
  font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:500;
  cursor:pointer;transition:all .15s;border:none;line-height:1;
}
.btn-p{background:var(--red);color:#fff}
.btn-p:hover{background:#f40612}
.btn-g{background:transparent;color:#fff;border:1px solid #3a3a3a}
.btn-g:hover{background:var(--surface2);border-color:#555}
.btn-d{background:transparent;color:#ff5555;border:1px solid rgba(255,85,85,0.25)}
.btn-d:hover{background:rgba(255,85,85,0.07)}
.btn-sm{padding:6px 14px;font-size:12px}
.btn-row{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}

/* ── TOGGLES ── */
.trow{
  display:flex;align-items:center;justify-content:space-between;
  padding:13px 0;border-bottom:1px solid var(--border);
}
.trow:last-child{border-bottom:none}
.trow-info .tt{font-size:13.5px;color:#fff}
.trow-info .ts{font-size:12px;color:var(--muted);margin-top:3px}
.tog{
  width:40px;height:22px;background:#333;border-radius:11px;
  position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;
}
.tog.on{background:var(--red)}
.tog::after{
  content:'';position:absolute;top:3px;left:3px;
  width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s;
}
.tog.on::after{transform:translateX(18px)}

/* ── PROFILE HERO ── */
.profile-hero{
  display:flex;align-items:center;gap:18px;padding:20px;
  background:var(--surface);border:1px solid var(--border);
  border-radius:6px;margin-bottom:14px;width:100%;
}
.p-av{
  width:66px;height:66px;border-radius:8px;background:var(--red);
  display:flex;align-items:center;justify-content:center;
  font-size:26px;font-weight:700;cursor:pointer;
  position:relative;overflow:hidden;flex-shrink:0;
}
.p-av-ov{
  position:absolute;inset:0;background:rgba(0,0,0,0.55);
  display:flex;align-items:center;justify-content:center;
  font-size:11px;opacity:0;transition:opacity .2s;
}
.p-av:hover .p-av-ov{opacity:1}
.p-name{font-size:19px;font-weight:600}
.p-email{font-size:13px;color:var(--muted);margin-top:3px}
.p-badge{
  display:inline-flex;align-items:center;gap:5px;
  background:rgba(229,9,20,0.12);border:1px solid rgba(229,9,20,0.28);
  color:#ff5555;font-size:10.5px;padding:3px 9px;
  border-radius:20px;margin-top:7px;font-weight:600;
}

/* ── QUALITY BUTTONS ── */
.qrow{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.qbtn{
  padding:8px 16px;border-radius:4px;background:var(--surface2);
  border:1px solid var(--border);color:var(--muted);font-size:12.5px;
  cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;
}
.qbtn.active{background:var(--red);border-color:var(--red);color:#fff}
.qbtn:hover:not(.active){border-color:#555;color:#fff}

/* ── DEVICE ROWS ── */
.dev-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 0;border-bottom:1px solid var(--border);
}
.dev-row:last-child{border-bottom:none}
.dev-ic{
  width:36px;height:36px;background:var(--surface2);border:1px solid var(--border);
  border-radius:5px;display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.dev-name{font-size:13.5px;font-weight:500}
.dev-meta{font-size:11.5px;color:var(--muted);margin-top:3px}
.cur-tag{
  display:inline-flex;align-items:center;
  background:rgba(229,9,20,0.12);color:#ff5555;
  font-size:9.5px;font-weight:700;padding:2px 7px;
  border-radius:10px;margin-left:7px;letter-spacing:0.5px;
}

/* ── STATS GRID ── */
.stat-grid{
  display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
  gap:12px;margin-bottom:14px;
}
.stat-card{
  background:#0d0d0d;border:1px solid var(--border);
  border-radius:6px;padding:16px;
}
.stat-label{
  font-size:10px;font-weight:600;letter-spacing:1.5px;
  text-transform:uppercase;color:var(--dim);margin-bottom:6px;
}
.stat-val{font-size:20px;font-weight:600}

/* ── PLAN CARD ── */
.plan-card{
  background:#0d0d0d;border:1px solid var(--border);
  border-radius:6px;padding:20px;position:relative;
  overflow:hidden;margin-bottom:14px;width:100%;
}
.plan-card::before{
  content:'';position:absolute;top:0;left:0;right:0;
  height:2px;background:var(--red);
}
.plan-name{
  font-size:11px;font-weight:700;letter-spacing:1.5px;
  text-transform:uppercase;color:var(--red);margin-bottom:5px;
}
.plan-price{font-size:30px;font-weight:700}
.plan-price em{font-size:14px;font-weight:400;color:var(--muted);font-style:normal}

/* ── BILLING ROWS ── */
.bill-row{
  display:flex;justify-content:space-between;align-items:center;
  padding:10px 0;border-bottom:1px solid var(--border);font-size:13px;
}
.bill-row:last-child{border-bottom:none}

/* ── HELP LINKS ── */
.help-link{
  display:flex;align-items:center;justify-content:space-between;
  padding:13px 0;border-bottom:1px solid var(--border);
  cursor:pointer;transition:color .15s;font-size:13.5px;color:var(--muted);
}
.help-link:hover{color:#fff}
.help-link:last-child{border-bottom:none}

/* ── ACTIVITY ROWS ── */
.act-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 0;border-bottom:1px solid var(--border);font-size:13px;
}
.act-row:last-child{border-bottom:none}
.dot-live{
  width:7px;height:7px;border-radius:50%;background:#22c55e;
  display:inline-block;margin-right:7px;
}

/* ── MISC ── */
.ch-arr{width:14px;height:14px;opacity:0.45;flex-shrink:0}
.mf-hr{border:none;border-top:1px solid var(--border);margin:10px 0}

/* ── SCROLLBAR ── */
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:10px}
::-webkit-scrollbar-thumb:hover{background:#3a3a3a}
</style>
</head>
<body>

<div class="mf-wrap">

  
  <!-- ═══════════════ BODY ═══════════════ -->
  <div class="mf-body">

    <!-- ─── SIDEBAR ─── -->
    <div class="mf-sidebar">
      <div class="mf-sidebar-top">

        <div class="mf-slabel">Account</div>

        <div class="mf-ni active" onclick="nav('profile',this)">
          <svg class="ni-icon" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          Profile
        </div>

        <div class="mf-ni" onclick="nav('playback',this)">
          <svg class="ni-icon" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Playback
        </div>

        <div class="mf-ni" onclick="nav('notifications',this)">
          <svg class="ni-icon" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          Notifications
        </div>

        <div class="mf-ni" onclick="nav('security',this)">
          <svg class="ni-icon" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Security
        </div>

        <div class="mf-ni" onclick="nav('devices',this)">
          <svg class="ni-icon" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>
          Devices
        </div>

        <div class="mf-sdiv"></div>
        <div class="mf-slabel">Subscription</div>

        <div class="mf-ni" onclick="nav('billing',this)">
          <svg class="ni-icon" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <rect x="1" y="4" width="22" height="16" rx="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          Billing
        </div>

        <div class="mf-sdiv"></div>
        <div class="mf-slabel">Support</div>

        <div class="mf-ni" onclick="nav('help',this)">
          <svg class="ni-icon" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2.5"/>
          </svg>
          Help Center
        </div>

      </div>
    </div><!-- /sidebar -->

    <!-- ─── MAIN CONTENT ─── -->
    <div class="mf-content">

      <!-- ══════════ PROFILE ══════════ -->
      <div class="mf-sec active" id="sec-profile">
        <div class="pg-title">Profile &amp; Account</div>
        <div class="pg-sub">Manage your MovieFlix identity and viewing preferences</div>

        <div class="profile-hero">
          <div class="p-av">
            A
            <div class="p-av-ov">Edit</div>
          </div>
          <div>
            <div class="p-name">Alex Mohan</div>
            <div class="p-email">alex.mohan@email.com</div>
            <div class="p-badge">
              <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Premium Member
            </div>
          </div>
          <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
            <button class="btn btn-g btn-sm">Watch History</button>
            <button class="btn btn-g btn-sm">My Ratings</button>
          </div>
        </div>

        <div class="mf-card-wide">
          <!-- Personal info card -->
          <div class="mf-card" style="margin-bottom:0">
            <div class="card-t">Personal Information</div>
            <div class="card-s">Update your name and contact details</div>
            <div class="mf-grid2" style="margin-bottom:0">
              <div class="frow"><div class="flabel">First Name</div><input class="finput" type="text" value="Alex"></div>
              <div class="frow"><div class="flabel">Last Name</div><input class="finput" type="text" value="Mohan"></div>
            </div>
            <div class="frow"><div class="flabel">Email Address</div><input class="finput" type="email" value="alex.mohan@email.com"></div>
            <div class="frow"><div class="flabel">Phone Number</div><input class="finput" type="tel" placeholder="+91 00000 00000"></div>
            <div class="btn-row">
              <button class="btn btn-p">Save Changes</button>
              <button class="btn btn-g">Cancel</button>
            </div>
          </div>

          <!-- Right column stacked cards -->
          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="mf-card" style="margin-bottom:0">
              <div class="card-t">Parental Controls</div>
              <div class="card-s">Set viewing restrictions with a PIN</div>
              <div class="frow">
                <div class="flabel">Maturity Rating</div>
                <select class="fselect">
                  <option>All Ratings</option><option>PG</option>
                  <option>PG-13</option><option>R</option><option>TV-MA</option>
                </select>
              </div>
              <button class="btn btn-g btn-sm">Change PIN</button>
            </div>
            <div class="mf-card" style="margin-bottom:0">
              <div class="card-t">Profile Language</div>
              <div class="card-s">Language and subtitle defaults</div>
              <div class="frow">
                <div class="flabel">Display Language</div>
                <select class="fselect">
                  <option>English</option><option>Hindi</option>
                  <option>Tamil</option><option>Telugu</option><option>Spanish</option>
                </select>
              </div>
              <div class="frow">
                <div class="flabel">Subtitle Language</div>
                <select class="fselect">
                  <option>Off</option><option>English</option><option>Hindi</option><option>Auto-detect</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="mf-card">
          <div class="sec-h">Autoplay &amp; Viewing</div>
          <div class="trow">
            <div class="trow-info">
              <div class="tt">Autoplay Next Episode</div>
              <div class="ts">Automatically play the next episode in a series</div>
            </div>
            <div class="tog on" onclick="this.classList.toggle('on')"></div>
          </div>
          <div class="trow">
            <div class="trow-info">
              <div class="tt">Autoplay Previews</div>
              <div class="ts">Play previews while browsing MovieFlix</div>
            </div>
            <div class="tog" onclick="this.classList.toggle('on')"></div>
          </div>
          <div class="trow">
            <div class="trow-info">
              <div class="tt">Skip Intros Automatically</div>
              <div class="ts">Skip show opening sequences when detected</div>
            </div>
            <div class="tog on" onclick="this.classList.toggle('on')"></div>
          </div>
        </div>
      </div><!-- /profile -->


      <!-- ══════════ PLAYBACK ══════════ -->
      <div class="mf-sec" id="sec-playback">
        <div class="pg-title">Playback Settings</div>
        <div class="pg-sub">Control video quality, behavior, and subtitle appearance across all devices</div>

        <div class="mf-card-wide">
          <div class="mf-card" style="margin-bottom:0">
            <div class="sec-h">Streaming Quality</div>
            <div class="flabel" style="margin-bottom:10px">Video Quality</div>
            <div class="qrow">
              <button class="qbtn" onclick="sq(this,'q1')">Auto</button>
              <button class="qbtn" onclick="sq(this,'q1')">Low</button>
              <button class="qbtn" onclick="sq(this,'q1')">Medium</button>
              <button class="qbtn" onclick="sq(this,'q1')">High</button>
              <button class="qbtn active" onclick="sq(this,'q1')">Ultra HD 4K</button>
            </div>
            <div style="font-size:11.5px;color:var(--dim);margin-bottom:20px">
              Ultra HD requires Premium plan and a compatible display
            </div>
            <div class="flabel" style="margin-bottom:10px">Download Quality</div>
            <div class="qrow">
              <button class="qbtn" onclick="sq(this,'q2')">Standard</button>
              <button class="qbtn active" onclick="sq(this,'q2')">High</button>
            </div>
          </div>

          <div class="mf-card" style="margin-bottom:0">
            <div class="sec-h">Playback Behavior</div>
            <div class="trow">
              <div class="trow-info">
                <div class="tt">Autoplay Next Episode</div>
                <div class="ts">Jump automatically after credits roll</div>
              </div>
              <div class="tog on" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="trow">
              <div class="trow-info">
                <div class="tt">Autoplay Trailers</div>
                <div class="ts">Play previews while browsing titles</div>
              </div>
              <div class="tog" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="trow">
              <div class="trow-info">
                <div class="tt">Skip Intros</div>
                <div class="ts">Auto-skip detected opening sequences</div>
              </div>
              <div class="tog on" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="trow">
              <div class="trow-info">
                <div class="tt">Smart Downloads</div>
                <div class="ts">Auto-download next episode on Wi-Fi</div>
              </div>
              <div class="tog on" onclick="this.classList.toggle('on')"></div>
            </div>
          </div>
        </div>

        <div class="mf-card">
          <div class="sec-h">Subtitle Appearance</div>
          <div class="mf-grid3">
            <div class="frow" style="margin-bottom:0">
              <div class="flabel">Font Size</div>
              <select class="fselect">
                <option>Small</option><option selected>Medium</option>
                <option>Large</option><option>Extra Large</option>
              </select>
            </div>
            <div class="frow" style="margin-bottom:0">
              <div class="flabel">Font Style</div>
              <select class="fselect">
                <option selected>Default</option><option>Bold</option>
                <option>Italic</option><option>Outlined</option>
              </select>
            </div>
            <div class="frow" style="margin-bottom:0">
              <div class="flabel">Text Color</div>
              <select class="fselect">
                <option selected>White</option><option>Yellow</option><option>Green</option><option>Cyan</option>
              </select>
            </div>
          </div>
          <div class="frow">
            <div class="flabel">Background Opacity</div>
            <input type="range" min="0" max="100" value="60" step="1"
              style="width:100%;accent-color:var(--red);margin-top:6px">
          </div>
          <button class="btn btn-p">Save Subtitle Preferences</button>
        </div>
      </div><!-- /playback -->


      <!-- ══════════ NOTIFICATIONS ══════════ -->
      <div class="mf-sec" id="sec-notifications">
        <div class="pg-title">Notifications</div>
        <div class="pg-sub">Choose how and when MovieFlix contacts you</div>

        <div class="mf-card-wide">
          <div class="mf-card" style="margin-bottom:0">
            <div class="sec-h">Email Notifications</div>
            <div class="trow">
              <div class="trow-info">
                <div class="tt">New Releases &amp; Picks</div>
                <div class="ts">Titles we think you'll love, personalised weekly</div>
              </div>
              <div class="tog on" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="trow">
              <div class="trow-info">
                <div class="tt">Continue Watching</div>
                <div class="ts">Reminders for shows you haven't finished</div>
              </div>
              <div class="tog on" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="trow">
              <div class="trow-info">
                <div class="tt">Billing &amp; Account Alerts</div>
                <div class="ts">Payment confirmations and security notices</div>
              </div>
              <div class="tog on" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="trow">
              <div class="trow-info">
                <div class="tt">Promotions &amp; Offers</div>
                <div class="ts">Special deals and MovieFlix news</div>
              </div>
              <div class="tog" onclick="this.classList.toggle('on')"></div>
            </div>
          </div>

          <div class="mf-card" style="margin-bottom:0">
            <div class="sec-h">Push Notifications</div>
            <div class="trow">
              <div class="trow-info">
                <div class="tt">New Episode Available</div>
                <div class="ts">When a followed show drops a new episode</div>
              </div>
              <div class="tog on" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="trow">
              <div class="trow-info">
                <div class="tt">Watchlist Updates</div>
                <div class="ts">Changes to items saved in your watchlist</div>
              </div>
              <div class="tog on" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="trow">
              <div class="trow-info">
                <div class="tt">Friend Activity</div>
                <div class="ts">See what your friends are watching</div>
              </div>
              <div class="tog on" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="trow">
              <div class="trow-info">
                <div class="tt">Download Complete</div>
                <div class="ts">Notify when an offline download finishes</div>
              </div>
              <div class="tog on" onclick="this.classList.toggle('on')"></div>
            </div>
          </div>
        </div>
      </div><!-- /notifications -->


      <!-- ══════════ SECURITY ══════════ -->
      <div class="mf-sec" id="sec-security">
        <div class="pg-title">Security</div>
        <div class="pg-sub">Manage your password, two-factor authentication, and active sessions</div>

        <div class="mf-card-wide">
          <div class="mf-card" style="margin-bottom:0">
            <div class="sec-h">Change Password</div>
            <div class="frow">
              <div class="flabel">Current Password</div>
              <input class="finput" type="password" placeholder="••••••••••••">
            </div>
            <div class="frow">
              <div class="flabel">New Password</div>
              <input class="finput" type="password" placeholder="Min 8 characters">
            </div>
            <div class="frow">
              <div class="flabel">Confirm New Password</div>
              <input class="finput" type="password" placeholder="Repeat new password">
            </div>
            <button class="btn btn-p">Update Password</button>
          </div>

          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="mf-card" style="margin-bottom:0">
              <div class="sec-h">Two-Factor Authentication</div>
              <div class="trow" style="border-bottom:none;padding:0">
                <div class="trow-info">
                  <div class="tt">Enable 2FA</div>
                  <div class="ts">SMS or authenticator app verification</div>
                </div>
                <div class="tog" onclick="this.classList.toggle('on')"></div>
              </div>
              <div style="font-size:11.5px;color:var(--dim);margin-top:12px;line-height:1.6">
                Adds a second verification step when signing in from a new device.
              </div>
              <button class="btn btn-g btn-sm" style="margin-top:14px">Setup Authenticator</button>
            </div>
            <div class="mf-card" style="margin-bottom:0;background:rgba(229,9,20,0.05);border-color:rgba(229,9,20,0.2)">
              <div style="font-size:13px;font-weight:500;margin-bottom:6px">Sign Out Everywhere</div>
              <div style="font-size:12px;color:var(--muted);margin-bottom:14px;line-height:1.6">
                Immediately revokes access on all devices except this one.
              </div>
              <button class="btn btn-d btn-sm">Sign Out of All Devices</button>
            </div>
          </div>
        </div>

        <div class="mf-card">
          <div class="sec-h">Recent Login Activity</div>
          <div class="act-row">
            <div>
              <div style="font-size:13.5px;font-weight:500">
                <span class="dot-live"></span>Hyderabad, India
              </div>
              <div style="font-size:12px;color:var(--muted);margin-top:3px">
                Chrome · Windows 11 · Active now
              </div>
            </div>
            <div style="background:rgba(34,197,94,0.1);color:#22c55e;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600">
              Current
            </div>
          </div>
          <div class="act-row">
            <div>
              <div style="font-size:13.5px">Mumbai, India</div>
              <div style="font-size:12px;color:var(--muted);margin-top:3px">
                Safari · iPhone 15 Pro · 2 days ago
              </div>
            </div>
            <button class="btn btn-g btn-sm">Sign Out</button>
          </div>
          <div class="act-row">
            <div>
              <div style="font-size:13.5px">Bengaluru, India</div>
              <div style="font-size:12px;color:var(--muted);margin-top:3px">
                MovieFlix App · Samsung Smart TV · 5 days ago
              </div>
            </div>
            <button class="btn btn-g btn-sm">Sign Out</button>
          </div>
        </div>
      </div><!-- /security -->


      <!-- ══════════ DEVICES ══════════ -->
      <div class="mf-sec" id="sec-devices">
        <div class="pg-title">Devices</div>
        <div class="pg-sub">Manage all devices currently signed into your MovieFlix account</div>

        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-label">Active Devices</div>
            <div class="stat-val">3</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Device Limit</div>
            <div class="stat-val">5</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Download Slots</div>
            <div class="stat-val">4 / 4</div>
          </div>
        </div>

        <div class="mf-card">
          <div class="sec-h">Active Devices</div>

          <div class="dev-row">
            <div style="display:flex;align-items:center;gap:14px">
              <div class="dev-ic">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="color:#6B6B6B">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <path d="M8 21h8M12 17v4"/>
                </svg>
              </div>
              <div>
                <div class="dev-name">Dell XPS 15<span class="cur-tag">CURRENT</span></div>
                <div class="dev-meta">Windows 11 · Chrome 123 · Hyderabad, IN</div>
                <div class="dev-meta" style="color:#22c55e;margin-top:2px">Active now</div>
              </div>
            </div>
            <button class="btn btn-g btn-sm" style="opacity:0.35;cursor:not-allowed" disabled>Remove</button>
          </div>

          <div class="dev-row">
            <div style="display:flex;align-items:center;gap:14px">
              <div class="dev-ic">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="color:#6B6B6B">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18" stroke-width="2.5"/>
                </svg>
              </div>
              <div>
                <div class="dev-name">iPhone 15 Pro</div>
                <div class="dev-meta">iOS 17 · Safari · Mumbai, IN</div>
                <div class="dev-meta">Last active 2 days ago</div>
              </div>
            </div>
            <button class="btn btn-d btn-sm" onclick="removeDevice(this)">Remove</button>
          </div>

          <div class="dev-row">
            <div style="display:flex;align-items:center;gap:14px">
              <div class="dev-ic">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="color:#6B6B6B">
                  <rect x="2" y="7" width="20" height="15" rx="2"/>
                  <polyline points="17 2 12 7 7 2"/>
                </svg>
              </div>
              <div>
                <div class="dev-name">Samsung QLED 55"</div>
                <div class="dev-meta">Smart TV · MovieFlix App · Bengaluru, IN</div>
                <div class="dev-meta">Last active 5 days ago</div>
              </div>
            </div>
            <button class="btn btn-d btn-sm" onclick="removeDevice(this)">Remove</button>
          </div>
        </div>

        <div class="mf-card" style="border-color:rgba(229,9,20,0.2);background:rgba(229,9,20,0.03)">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="font-size:13.5px;font-weight:500;margin-bottom:4px">Manage Download Devices</div>
              <div style="font-size:12px;color:var(--muted)">
                You can download on up to 4 devices with your Premium plan
              </div>
            </div>
            <button class="btn btn-g btn-sm">Manage</button>
          </div>
        </div>
      </div><!-- /devices -->


      <!-- ══════════ BILLING ══════════ -->
      <div class="mf-sec" id="sec-billing">
        <div class="pg-title">Billing &amp; Subscription</div>
        <div class="pg-sub">Manage your plan, payment method, and invoice history</div>

        <div class="plan-card">
          <div class="plan-name">Premium Plan</div>
          <div class="plan-price">₹649<em>/month</em></div>
          <div style="font-size:12px;color:var(--muted);margin:8px 0 18px">
            Ultra HD · 4 simultaneous screens · Unlimited downloads
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
            <button class="btn btn-p">Upgrade Plan</button>
            <button class="btn btn-g">Change Plan</button>
            <button class="btn btn-d" style="margin-left:auto">Cancel Subscription</button>
          </div>
        </div>

        <div class="mf-card-wide">
          <div class="mf-card" style="margin-bottom:0">
            <div class="sec-h">Billing Details</div>
            <div class="bill-row">
              <span style="color:var(--muted)">Current plan</span>
              <span style="font-weight:600">Premium</span>
            </div>
            <div class="bill-row">
              <span style="color:var(--muted)">Monthly charge</span>
              <span style="font-weight:600">₹649.00</span>
            </div>
            <div class="bill-row">
              <span style="color:var(--muted)">Next billing date</span>
              <span style="font-weight:600">May 1, 2026</span>
            </div>
            <div class="bill-row">
              <span style="color:var(--muted)">Member since</span>
              <span style="font-weight:600">March 2022</span>
            </div>
          </div>

          <div class="mf-card" style="margin-bottom:0">
            <div class="sec-h">Payment Method</div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
              <div style="display:flex;align-items:center;gap:13px">
                <div style="background:#0d0d2e;border:1px solid #2a2a4a;border-radius:5px;padding:7px 12px;font-size:12px;font-weight:700;color:#4f8ef7;letter-spacing:1px">
                  VISA
                </div>
                <div>
                  <div style="font-size:13.5px">•••• •••• •••• 4291</div>
                  <div style="font-size:12px;color:var(--muted);margin-top:3px">Expires 08/27</div>
                </div>
              </div>
              <button class="btn btn-g btn-sm">Update</button>
            </div>

            <div class="sec-h">Billing History</div>
            <div class="bill-row">
              <div>
                <div style="font-size:13px">Premium · Monthly</div>
                <div style="font-size:11px;color:var(--dim);margin-top:2px">Apr 1, 2026</div>
              </div>
              <div style="text-align:right">
                <div style="font-weight:500;font-size:13px">₹649.00</div>
                <div style="font-size:11px;color:#22c55e;margin-top:2px">Paid</div>
              </div>
            </div>
            <div class="bill-row">
              <div>
                <div style="font-size:13px">Premium · Monthly</div>
                <div style="font-size:11px;color:var(--dim);margin-top:2px">Mar 1, 2026</div>
              </div>
              <div style="text-align:right">
                <div style="font-weight:500;font-size:13px">₹649.00</div>
                <div style="font-size:11px;color:#22c55e;margin-top:2px">Paid</div>
              </div>
            </div>
            <div class="bill-row">
              <div>
                <div style="font-size:13px">Premium · Monthly</div>
                <div style="font-size:11px;color:var(--dim);margin-top:2px">Feb 1, 2026</div>
              </div>
              <div style="text-align:right">
                <div style="font-weight:500;font-size:13px">₹649.00</div>
                <div style="font-size:11px;color:#22c55e;margin-top:2px">Paid</div>
              </div>
            </div>
            <button class="btn btn-g btn-sm" style="margin-top:14px">Download All Invoices</button>
          </div>
        </div>
      </div><!-- /billing -->


      <!-- ══════════ HELP ══════════ -->
      <div class="mf-sec" id="sec-help">
        <div class="pg-title">Help Center</div>
        <div class="pg-sub">Get support, review our policies, or report an issue</div>

        <div class="mf-card-wide">
          <div class="mf-card" style="margin-bottom:0">
            <div class="sec-h">Support</div>
            <div class="help-link">
              <span>Help Center</span>
              <svg class="ch-arr" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div class="help-link">
              <span>Contact Support</span>
              <svg class="ch-arr" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div class="help-link">
              <span>Live Chat</span>
              <svg class="ch-arr" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div class="help-link">
              <span>Report a Problem</span>
              <svg class="ch-arr" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div class="help-link">
              <span>Speed Test</span>
              <svg class="ch-arr" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>

          <div class="mf-card" style="margin-bottom:0">
            <div class="sec-h">Legal</div>
            <div class="help-link">
              <span>Privacy Policy</span>
              <svg class="ch-arr" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div class="help-link">
              <span>Terms of Service</span>
              <svg class="ch-arr" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div class="help-link">
              <span>Cookie Preferences</span>
              <svg class="ch-arr" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div class="help-link">
              <span>Corporate Information</span>
              <svg class="ch-arr" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div class="help-link">
              <span>Accessibility</span>
              <svg class="ch-arr" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>

        <div class="mf-card" style="background:#0d0d0d">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--dim);margin-bottom:5px">
                App Version
              </div>
              <div style="font-size:13.5px;color:var(--muted)">
                MovieFlix Web v5.12.1 · Build 2026.04.01
              </div>
            </div>
            <div style="font-size:11px;color:var(--dim)">© 2026 MovieFlix, Inc.</div>
          </div>
        </div>
      </div><!-- /help -->

    </div><!-- /mf-content -->
  </div><!-- /mf-body -->
</div><!-- /mf-wrap -->

<script>
  function nav(id, el) {
    document.querySelectorAll('.mf-sec').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.mf-ni').forEach(n => n.classList.remove('active'));
    document.getElementById('sec-' + id).classList.add('active');
    el.classList.add('active');
    document.querySelector('.mf-content').scrollTop = 0;
  }

  function sq(btn, grp) {
    btn.closest('.qrow').querySelectorAll('.qbtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function removeDevice(btn) {
    var row = btn.closest('.dev-row');
    row.style.transition = 'opacity .3s, transform .3s';
    row.style.opacity = '0';
    row.style.transform = 'translateX(16px)';
    setTimeout(() => row.remove(), 300);
  }
</script>

</body>
</html>`
    }} />
  );
}