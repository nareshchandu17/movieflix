'use client';

import React, { useEffect } from 'react';
import Head from 'next/head';

export default function TasteDNAPage() {
  useEffect(() => {
    // Run the provided vanilla JS
    /* CURSOR */
    const cursor = document.getElementById('cursor');
    const ring   = document.getElementById('cursor-ring');
    let mx=0,my=0,rx=0,ry=0;
    
    const onMouseMove = (e: MouseEvent) => { 
      mx=e.clientX; 
      my=e.clientY; 
      if(cursor) {
        cursor.style.left=mx+'px'; 
        cursor.style.top=my+'px'; 
      }
    };
    document.addEventListener('mousemove', onMouseMove);
    
    let animationFrameId: number;
    const loop = () => { 
      rx+=(mx-rx)*0.12; 
      ry+=(my-ry)*0.12; 
      if(ring) {
        ring.style.left=rx+'px'; 
        ring.style.top=ry+'px'; 
      }
      animationFrameId = requestAnimationFrame(loop); 
    };
    loop();
    
    document.querySelectorAll('button,a,.stat-card,.taste-tag').forEach(el => {
      el.addEventListener('mouseenter', () => { 
        if(cursor && ring) {
          cursor.style.width='20px'; cursor.style.height='20px'; 
          ring.style.width='54px'; ring.style.height='54px'; 
          ring.style.borderColor='rgba(255,31,61,0.7)'; 
        }
      });
      el.addEventListener('mouseleave', () => { 
        if(cursor && ring) {
          cursor.style.width='10px'; cursor.style.height='10px'; 
          ring.style.width='34px'; ring.style.height='34px'; 
          ring.style.borderColor='rgba(255,31,61,0.4)'; 
        }
      });
    });

    /* SCROLL PROGRESS */
    const prog = document.getElementById('scroll-progress');
    const onScrollProg = () => {
      if(prog) {
        prog.style.transform = `scaleX(${window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)})`;
      }
    };
    window.addEventListener('scroll', onScrollProg, {passive:true});

    /* PARALLAX BGs */
    const onScrollParallax = () => {
      document.querySelectorAll('.portrait-bg').forEach(bg => {
        const sec  = bg.closest('section');
        if(!sec) return;
        const rect = sec.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const off = (window.innerHeight/2 - rect.top - rect.height/2) * 0.10;
          (bg as HTMLElement).style.transform = `translateY(${off}px) scale(1.08)`;
        }
      });
    };
    window.addEventListener('scroll', onScrollParallax, {passive:true});

    /* REVEAL OBSERVER */
    const revObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
    }, {threshold:0.18});
    document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => revObs.observe(el));

    /* MOOD BARS */
    const moodObs = new IntersectionObserver(entries => {
      if(entries[0].isIntersecting){
        document.querySelectorAll('.mood-entry').forEach((e,i) => {
          setTimeout(() => { 
            e.classList.add('visible'); 
            const fill = e.querySelector('.mood-fill') as HTMLElement;
            if(fill) fill.style.transform='scaleX(1)'; 
          }, i*145);
        });
        moodObs.disconnect();
      }
    },{threshold:0.25});
    const radarSec = document.getElementById('radar-section');
    if(radarSec) moodObs.observe(radarSec);

    /* GENRE BARS */
    const genreObs = new IntersectionObserver(entries => {
      if(entries[0].isIntersecting){
        document.querySelectorAll('.genre-bar-fill').forEach((b,i) => setTimeout(()=>(b as HTMLElement).style.transform='scaleX(1)',i*130));
        genreObs.disconnect();
      }
    },{threshold:0.25});
    const genreSec = document.getElementById('genre-section');
    if(genreSec) genreObs.observe(genreSec);

    /* DONUT */
    const circ=2*Math.PI*120;
    const segs=[{id:'seg1',pct:.28},{id:'seg2',pct:.24},{id:'seg3',pct:.22},{id:'seg4',pct:.26}];
    const donutObs=new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting){
        let off=0;
        segs.forEach((g,i)=>{
          const el=document.getElementById(g.id);
          if(!el) return;
          const dash=g.pct*circ, gap=circ-dash, rot=-90+off*360;
          setTimeout(()=>{ 
            el.style.transition='stroke-dasharray 1.3s cubic-bezier(.4,0,.2,1)'; 
            el.setAttribute('stroke-dasharray',`${dash} ${gap}`); 
            el.setAttribute('transform',`rotate(${rot} 160 160)`); 
          },i*90);
          off+=g.pct;
        });
        donutObs.disconnect();
      }
    },{threshold:0.3});
    if(genreSec) donutObs.observe(genreSec);

    /* RADAR */
    const radarObs=new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting){ 
        setTimeout(()=>{
          const shape = document.getElementById('radarShape');
          if(shape) shape.style.opacity='1';
        },200); 
        radarObs.disconnect(); 
      }
    },{threshold:0.25});
    if(radarSec) radarObs.observe(radarSec);

    /* SCORE COUNTER */
    const scoreEl=document.getElementById('scoreNum');
    function countUp(target: number){ 
      let v=0; 
      const step=()=>{ 
        v=Math.min(v+2,target); 
        if(scoreEl) scoreEl.textContent=v.toString(); 
        if(v<target) requestAnimationFrame(step); 
      }; 
      setTimeout(step,1500); 
    }
    countUp(85);

    /* TAGS STAGGER */
    setTimeout(()=>{
      document.querySelectorAll('.taste-tag').forEach((t,i)=>{
        setTimeout(()=>{ 
          const el = t as HTMLElement;
          el.style.opacity='1'; 
          el.style.transform='translateY(0)'; 
          el.style.transition='opacity .5s, transform .5s, border-color .2s, color .2s, box-shadow .2s'; 
        },1000+i*100);
      });
    },200);

    /* TYPING CURSOR HIDE */
    setTimeout(()=>{ 
      const tc=document.querySelector('.ai-typing-cursor') as HTMLElement; 
      if(tc) tc.style.display='none'; 
    },6000);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScrollProg);
      window.removeEventListener('scroll', onScrollParallax);
      cancelAnimationFrame(animationFrameId);
      revObs.disconnect();
      moodObs.disconnect();
      genreObs.disconnect();
      donutObs.disconnect();
      radarObs.disconnect();
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg: #080406;
          --surface: rgba(255,255,255,0.04);
          --surface2: rgba(255,255,255,0.07);
          --border: rgba(255,255,255,0.09);
          --red1: #ff1f3d;
          --red2: #ff5a2c;
          --red3: #aa0018;
          --red-glow: rgba(255,31,61,0.55);
          --red-soft: rgba(255,31,61,0.16);
          --red-faint: rgba(255,31,61,0.07);
          --accent: var(--red1);
          --accent2: var(--red2);
          --text: #f3efed;
          --muted: rgba(243,239,237,0.42);
          --gold: #ffb347;
        }
        .taste-dna-container { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; overflow-x:hidden; cursor:none; }
        .taste-dna-container *, .taste-dna-container *::before, .taste-dna-container *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; scroll-snap-type:y mandatory; }

        /* CURSOR */
        #cursor {
          position:fixed; z-index:9999; width:10px; height:10px;
          background:var(--red1); border-radius:50%; pointer-events:none;
          transform:translate(-50%,-50%);
          transition:width .2s, height .2s;
          box-shadow:0 0 18px var(--red-glow), 0 0 50px rgba(255,31,61,0.25);
          mix-blend-mode:screen;
        }
        #cursor-ring {
          position:fixed; z-index:9998; width:34px; height:34px;
          border:1px solid rgba(255,31,61,0.4); border-radius:50%; pointer-events:none;
          transform:translate(-50%,-50%);
          transition:width .3s, height .3s, border-color .3s;
        }

        /* SCROLL PROGRESS */
        #scroll-progress {
          position:fixed; top:0; left:0; right:0; z-index:2000; height:2px;
          background:linear-gradient(90deg, var(--red3), var(--red1), var(--red2), #ff9060);
          transform-origin:left; transform:scaleX(0);
        }

        /* NAV */
        .taste-dna-nav {
          position:fixed; top:0; left:0; right:0; z-index:1000;
          padding:22px 52px;
          display:flex; align-items:center; justify-content:space-between;
          background:linear-gradient(to bottom, rgba(8,4,6,0.90) 0%, transparent 100%);
        }
        .nav-logo { font-family:'Space Mono',monospace; font-size:12px; letter-spacing:0.28em; color:var(--red1); text-transform:uppercase; text-shadow:0 0 22px var(--red-glow); }
        .nav-links { display:flex; gap:38px; }
        .nav-links a { font-size:12px; letter-spacing:0.1em; color:var(--muted); text-decoration:none; text-transform:uppercase; transition:color .2s; }
        .nav-links a:hover { color:var(--text); }
        .nav-cta {
          display:flex; align-items:center; gap:8px;
          padding:10px 24px; border-radius:100px;
          background:linear-gradient(135deg, var(--red1), var(--red2));
          color:#fff; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase;
          border:none; cursor:none;
          box-shadow:0 4px 30px var(--red-glow);
          transition:transform .2s, box-shadow .2s;
        }
        .nav-cta:hover { transform:scale(1.04); box-shadow:0 6px 50px rgba(255,31,61,0.7); }

        /* DNA STRAND */
        .dna-strand {
          position:absolute; left:38px; top:120px; bottom:60px;
          display:flex; flex-direction:column; gap:9px;
          align-items:center; z-index:10; pointer-events:none;
        }
        .strand-bar { width:3px; border-radius:2px; animation:strandPulse 3s ease-in-out infinite; }
        @keyframes strandPulse { 0%,100%{opacity:0.35;transform:scaleX(1)} 50%{opacity:1;transform:scaleX(2.2)} }

        /* HELIX RIGHT */
        .helix-side {
          position:absolute; right:34px; top:0; bottom:0;
          display:flex; flex-direction:column; justify-content:center;
          gap:8px; z-index:5; opacity:0.4; pointer-events:none;
        }
        .helix-tick { width:1px; background:var(--red1); animation:helixAnim 2.6s ease-in-out infinite; }
        @keyframes helixAnim {
          0%,100%{transform:scaleX(1) translateX(0);opacity:0.4}
          25%{transform:scaleX(4.5) translateX(5px);opacity:0.9}
          75%{transform:scaleX(4.5) translateX(-5px);opacity:0.9}
        }

        /* SECTIONS */
        .taste-dna-section { position:relative; min-height:100vh; scroll-snap-align:start; overflow:hidden; display:flex; align-items:center; }

        /* PORTRAIT BG */
        .portrait-bg {
          position:absolute; inset:0;
          background-size:cover; background-position:center center; background-repeat:no-repeat;
          transform:scale(1.06);
          will-change:transform;
        }

        /* LAYERED CINEMATIC OVERLAYS */
        .ov-dark {
          position:absolute; inset:0;
          background:linear-gradient(to right, rgba(8,3,4,0.94) 0%, rgba(8,3,4,0.65) 45%, rgba(8,3,4,0.28) 100%);
        }
        .ov-vignette {
          position:absolute; inset:0;
          background:
            radial-gradient(ellipse 80% 55% at 50% 105%, rgba(8,3,4,0.75) 0%, transparent 65%),
            radial-gradient(ellipse 60% 40% at 50% -5%,  rgba(8,3,4,0.55) 0%, transparent 60%);
        }
        .ov-red {
          position:absolute; inset:0;
          background:radial-gradient(ellipse 55% 70% at 75% 50%, rgba(200,15,35,0.20) 0%, transparent 68%);
          mix-blend-mode:screen;
        }
        .grain {
          position:absolute; inset:0; opacity:0.042; pointer-events:none;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:180px;
        }
        .scanlines {
          position:absolute; inset:0; pointer-events:none;
          background:repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.038) 2px, rgba(0,0,0,0.038) 4px);
        }

        /* HERO CONTENT */
        .hero-content { position:relative; z-index:5; padding:0 0 0 130px; max-width:680px; }
        .hero-eyebrow {
          font-family:'Space Mono',monospace; font-size:10px; letter-spacing:0.38em;
          color:var(--red1); text-transform:uppercase; margin-bottom:22px;
          display:flex; align-items:center; gap:12px;
          text-shadow:0 0 24px var(--red-glow);
          opacity:0; transform:translateY(18px);
          animation:fadeUp 0.7s 0.3s forwards;
        }
        .hero-eyebrow::before { content:''; width:22px; height:1px; background:var(--red1); box-shadow:0 0 8px var(--red-glow); }
        .hero-title {
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(76px, 10vw, 148px); line-height:0.88; letter-spacing:0.01em; margin-bottom:26px;
          opacity:0; transform:translateY(28px); animation:fadeUp 0.85s 0.5s forwards;
        }
        .hero-title span { display:block; }
        .accent-word {
          background:linear-gradient(90deg, var(--red1) 0%, var(--red2) 55%, #ff9060 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          filter:drop-shadow(0 0 32px rgba(255,31,61,0.6));
        }
        .hero-subtitle {
          font-size:15px; font-weight:300; color:var(--muted); line-height:1.72; max-width:420px; margin-bottom:40px;
          opacity:0; transform:translateY(18px); animation:fadeUp 0.7s 0.7s forwards;
        }
        .hero-actions { display:flex; gap:14px; align-items:center; opacity:0; transform:translateY(18px); animation:fadeUp 0.7s 0.9s forwards; }

        /* BUTTONS */
        .btn-primary {
          display:flex; align-items:center; gap:10px;
          padding:14px 32px; border-radius:100px;
          background:linear-gradient(135deg, var(--red1) 0%, var(--red2) 100%);
          color:#fff; font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;
          border:none; cursor:none;
          box-shadow:0 6px 36px rgba(255,31,61,0.5), 0 2px 8px rgba(0,0,0,0.4);
          transition:transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s;
          position:relative; overflow:hidden;
        }
        .btn-primary::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.24), transparent); transform:translateX(-100%); transition:transform 0.5s; }
        .btn-primary:hover::after { transform:translateX(100%); }
        .btn-primary:hover { transform:scale(1.05); box-shadow:0 10px 50px rgba(255,31,61,0.7); }

        .btn-secondary {
          display:flex; align-items:center; gap:8px;
          padding:14px 28px; border-radius:100px;
          background:rgba(255,255,255,0.05); color:var(--text);
          font-size:12px; font-weight:500; letter-spacing:0.07em; text-transform:uppercase; cursor:none;
          border:1px solid rgba(255,255,255,0.12); backdrop-filter:blur(10px);
          transition:border-color .2s, background .2s;
        }
        .btn-secondary:hover { border-color:rgba(255,31,61,0.5); background:rgba(255,31,61,0.07); }

        .btn-ghost {
          display:flex; align-items:center; gap:8px;
          padding:11px 22px; border-radius:100px;
          background:rgba(255,255,255,0.04); color:var(--text);
          font-size:11px; font-weight:500; letter-spacing:0.09em; text-transform:uppercase; cursor:none;
          border:1px solid var(--border); backdrop-filter:blur(8px);
          transition:all .22s;
        }
        .btn-ghost:hover { border-color:rgba(255,31,61,0.5); color:var(--red1); background:var(--red-faint); }
        .btn-ghost.red { color:var(--red1); border-color:rgba(255,31,61,0.35); }
        .btn-ghost.red:hover { background:rgba(255,31,61,0.10); box-shadow:0 0 22px rgba(255,31,61,0.2); }

        /* SCORE RING */
        .hero-score { position:absolute; right:7%; top:50%; transform:translateY(-50%); z-index:5; text-align:center; opacity:0; animation:fadeIn 1s 1.1s forwards; }
        .score-ring-wrapper { position:relative; width:186px; height:186px; margin:0 auto 18px; }
        .score-ring-svg { transform:rotate(-90deg); filter:drop-shadow(0 0 26px rgba(255,31,61,0.55)); }
        .score-ring-bg { fill:none; stroke:rgba(255,255,255,0.06); stroke-width:8; }
        .score-ring-fill { fill:none; stroke:url(#ringGrad); stroke-width:8; stroke-linecap:round; stroke-dasharray:502; stroke-dashoffset:502; animation:ringFill 1.6s 1.4s cubic-bezier(.4,0,.2,1) forwards; }
        @keyframes ringFill { to { stroke-dashoffset:76; } }
        .score-center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .score-number { font-family:'Bebas Neue',sans-serif; font-size:54px; line-height:1; background:linear-gradient(180deg,#fff 0%,var(--red1) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .score-label { font-size:9px; letter-spacing:0.22em; color:var(--muted); text-transform:uppercase; }
        .score-badge { font-family:'Space Mono',monospace; font-size:10px; letter-spacing:0.12em; color:var(--red1); background:rgba(255,31,61,0.1); border:1px solid rgba(255,31,61,0.35); padding:7px 16px; border-radius:100px; text-transform:uppercase; box-shadow:0 0 20px rgba(255,31,61,0.2); }

        /* TAGS */
        .tags-row { display:flex; flex-wrap:wrap; gap:10px; margin-top:30px; }
        .taste-tag {
          padding:7px 16px; border-radius:100px; border:1px solid rgba(255,255,255,0.1);
          font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted);
          background:rgba(255,255,255,0.04); backdrop-filter:blur(6px);
          opacity:0; transform:translateY(10px);
          transition:border-color .2s, color .2s, box-shadow .2s;
          animation:tagFloat 5s ease-in-out infinite;
        }
        .taste-tag:hover { border-color:var(--red1); color:#fff; box-shadow:0 0 18px rgba(255,31,61,0.3); }
        .taste-tag.r1 { border-color:rgba(255,31,61,0.5); color:var(--red1); box-shadow:0 0 14px rgba(255,31,61,0.18); }
        .taste-tag.r2 { border-color:rgba(255,90,44,0.5); color:var(--red2); }
        .taste-tag.gold { border-color:rgba(255,179,71,0.4); color:var(--gold); }
        @keyframes tagFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

        /* TICKER */
        .ticker-wrap { position:absolute; bottom:36px; left:0; right:0; overflow:hidden; z-index:5; opacity:0.26; }
        .ticker-track { display:flex; gap:56px; white-space:nowrap; animation:ticker 22s linear infinite; }
        .ticker-item { font-family:'Bebas Neue',sans-serif; font-size:11px; letter-spacing:0.32em; color:rgba(255,255,255,0.6); text-transform:uppercase; display:flex; align-items:center; gap:18px; }
        .ticker-item::after { content:'·'; color:var(--red1); }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* SECTION LAYOUT */
        .section-inner { position:relative; z-index:5; width:100%; padding:80px 130px; display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; }

        .section-eyebrow { font-family:'Space Mono',monospace; font-size:9px; letter-spacing:0.32em; color:var(--red1); text-transform:uppercase; margin-bottom:14px; display:flex; align-items:center; gap:10px; text-shadow:0 0 20px var(--red-glow); }
        .section-eyebrow::before { content:''; width:18px; height:1px; background:var(--red1); box-shadow:0 0 8px var(--red-glow); }
        .section-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(60px,8vw,108px); line-height:0.9; letter-spacing:0.01em; margin-bottom:20px; }
        .section-desc { font-size:14px; font-weight:300; color:var(--muted); line-height:1.75; margin-bottom:32px; }

        /* DONUT */
        .donut-wrapper { display:flex; align-items:center; justify-content:center; position:relative; }
        .donut-center { position:absolute; text-align:center; }
        .donut-num { font-family:'Bebas Neue',sans-serif; font-size:52px; line-height:1; color:var(--text); }
        .donut-sub { font-size:9px; letter-spacing:0.22em; color:var(--muted); text-transform:uppercase; }
        .genre-legend { display:flex; flex-direction:column; gap:12px; margin-top:28px; }
        .genre-item { display:flex; align-items:center; gap:10px; font-size:12px; color:var(--muted); }
        .genre-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
        .genre-name { flex:1; }
        .genre-pct { font-family:'Space Mono',monospace; font-size:10px; color:var(--text); }
        .genre-bar-track { width:72px; height:2px; background:rgba(255,255,255,0.07); border-radius:2px; overflow:hidden; }
        .genre-bar-fill { height:100%; border-radius:2px; transform-origin:left; transform:scaleX(0); transition:transform 1.3s cubic-bezier(.4,0,.2,1); }

        /* RADAR */
        .radar-wrapper { display:flex; align-items:center; justify-content:center; position:relative; }
        .radar-grid { fill:none; stroke:rgba(255,255,255,0.07); stroke-width:1; }
        .radar-axis { stroke:rgba(255,255,255,0.10); stroke-width:1; }
        .radar-shape { fill:rgba(255,31,61,0.12); stroke:url(#radarGrad); stroke-width:2; filter:drop-shadow(0 0 18px rgba(255,31,61,0.5)); opacity:0; transition:opacity 1.2s 0.4s; }
        .radar-label { font-family:'Space Mono',monospace; font-size:9px; fill:var(--muted); text-anchor:middle; letter-spacing:0.1em; }
        .radar-dot { fill:var(--red1); filter:drop-shadow(0 0 8px rgba(255,31,61,0.9)); animation:radarPulse 2.2s ease-in-out infinite; }
        @keyframes radarPulse { 0%,100%{r:4;opacity:1} 50%{r:8;opacity:0.35} }

        /* MOOD BARS */
        .mood-row { margin-top:36px; display:flex; flex-direction:column; gap:16px; }
        .mood-entry { opacity:0; transform:translateY(12px); transition:opacity .7s, transform .7s; }
        .mood-entry.visible { opacity:1; transform:translateY(0); }
        .mood-header { display:flex; justify-content:space-between; margin-bottom:7px; }
        .mood-name { font-size:11px; color:var(--muted); letter-spacing:0.14em; text-transform:uppercase; }
        .mood-val { font-family:'Space Mono',monospace; font-size:10px; }
        .mood-track { height:3px; background:rgba(255,255,255,0.07); border-radius:3px; overflow:hidden; }
        .mood-fill { height:100%; border-radius:3px; transform-origin:left; transform:scaleX(0); transition:transform 1.3s cubic-bezier(.4,0,.2,1); }

        /* AI CARD */
        .ai-card {
          background:rgba(10,4,5,0.78); border:1px solid rgba(255,31,61,0.20); border-radius:20px;
          padding:48px 52px; position:relative; overflow:hidden; backdrop-filter:blur(24px);
          box-shadow:0 0 80px rgba(255,31,61,0.07), inset 0 0 60px rgba(255,31,61,0.04);
        }
        .ai-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg, transparent, var(--red1), var(--red2), transparent); }
        .ai-card::after { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,31,61,0.05), transparent); pointer-events:none; }
        .ai-quote { font-size:clamp(16px,2vw,21px); font-weight:300; line-height:1.72; color:var(--text); position:relative; z-index:1; margin-bottom:36px; }
        .ai-quote strong { font-weight:500; color:var(--red1); text-shadow:0 0 22px rgba(255,31,61,0.4); }
        .ai-actions { display:flex; gap:12px; position:relative; z-index:1; }
        .ai-typing-cursor { display:inline-block; width:2px; height:1.1em; background:var(--red1); margin-left:3px; vertical-align:middle; animation:blink 0.9s step-end infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* STATS */
        .share-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:36px; }
        .stat-card { background:rgba(10,4,5,0.72); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px 26px; backdrop-filter:blur(12px); transition:border-color .25s, transform .3s, box-shadow .3s; cursor:none; }
        .stat-card:hover { border-color:rgba(255,31,61,0.4); transform:translateY(-4px); box-shadow:0 8px 40px rgba(255,31,61,0.14); }
        .stat-label { font-size:9px; letter-spacing:0.22em; color:var(--muted); text-transform:uppercase; margin-bottom:10px; }
        .stat-value { font-family:'Bebas Neue',sans-serif; font-size:44px; line-height:1; background:linear-gradient(135deg,var(--text),var(--muted)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .stat-value.red { background:linear-gradient(135deg,var(--red1),var(--red2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; filter:drop-shadow(0 0 12px rgba(255,31,61,0.5)); }
        .stat-sub { font-size:11px; color:var(--muted); margin-top:6px; }

        /* FOOTER */
        .page-footer { padding:24px 48px; text-align:center; font-family:'Space Mono',monospace; font-size:10px; color:rgba(255,255,255,0.18); letter-spacing:0.12em; background:var(--bg); border-top:1px solid rgba(255,255,255,0.05); scroll-snap-align:start; }

        /* REVEAL ANIMS */
        @keyframes fadeUp { to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { to { opacity:1; } }
        .reveal        { opacity:0; transform:translateY(36px); transition:opacity .85s cubic-bezier(.4,0,.2,1), transform .85s cubic-bezier(.4,0,.2,1); }
        .reveal-left   { opacity:0; transform:translateX(-36px); transition:opacity .85s .1s cubic-bezier(.4,0,.2,1), transform .85s .1s cubic-bezier(.4,0,.2,1); }
        .reveal-right  { opacity:0; transform:translateX(36px);  transition:opacity .85s .15s cubic-bezier(.4,0,.2,1), transform .85s .15s cubic-bezier(.4,0,.2,1); }
        .reveal.visible, .reveal-left.visible, .reveal-right.visible { opacity:1; transform:translate(0,0); }
        .d1{transition-delay:.05s} .d2{transition-delay:.12s} .d3{transition-delay:.19s}
        .d4{transition-delay:.26s} .d5{transition-delay:.33s} .d6{transition-delay:.40s}

        @media(max-width:768px){
          .section-inner{grid-template-columns:1fr;padding:100px 20px 60px;gap:40px}
          .hero-content{padding:0 20px}
          .hero-score,.helix-side,.ticker-wrap{display:none}
          .dna-strand{left:14px}
          .taste-dna-nav{padding:16px 20px}
          .nav-links{display:none}
          .share-grid{grid-template-columns:1fr}
        }
      `}} />

      <div className="taste-dna-container">
        <div id="cursor"></div>
        <div id="cursor-ring"></div>
        <div id="scroll-progress"></div>

        <nav className="taste-dna-nav">
          <div className="nav-logo">Taste DNA</div>
          <div className="nav-links">
            <a href="#hero">Dashboard</a>
            <a href="#genre-section">Discover</a>
            <a href="#share-section">Profile</a>
          </div>
          <button className="nav-cta">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share DNA
          </button>
        </nav>

        {/* ═══ HERO ═══ */}
        <section id="hero" className="taste-dna-section">
          <div className="portrait-bg" id="bgHero" style={{backgroundImage: "url('https://eoelu63cs5y7e.ok.kimi.link/hero_portrait.jpg')", backgroundPosition: "center 22%"}}></div>
          <div className="ov-dark"></div>
          <div className="ov-vignette"></div>
          <div className="ov-red"></div>
          <div className="grain"></div><div className="scanlines"></div>

          <div className="dna-strand">
            <div className="strand-bar" style={{height:"30px", background:"var(--red1)", animationDelay:"0s"}}></div>
            <div className="strand-bar" style={{height:"18px", background:"var(--red2)", animationDelay:"0.14s"}}></div>
            <div className="strand-bar" style={{height:"34px", background:"var(--red1)", animationDelay:"0.28s"}}></div>
            <div className="strand-bar" style={{height:"14px", background:"var(--gold)", animationDelay:"0.42s"}}></div>
            <div className="strand-bar" style={{height:"28px", background:"var(--red1)", animationDelay:"0.56s"}}></div>
            <div className="strand-bar" style={{height:"20px", background:"var(--red2)", animationDelay:"0.70s"}}></div>
            <div className="strand-bar" style={{height:"36px", background:"var(--red1)", animationDelay:"0.84s"}}></div>
            <div className="strand-bar" style={{height:"16px", background:"var(--red2)", animationDelay:"0.98s"}}></div>
            <div className="strand-bar" style={{height:"26px", background:"var(--red1)", animationDelay:"1.12s"}}></div>
            <div className="strand-bar" style={{height:"32px", background:"var(--gold)", animationDelay:"1.26s"}}></div>
            <div className="strand-bar" style={{height:"18px", background:"var(--red1)", animationDelay:"1.40s"}}></div>
            <div className="strand-bar" style={{height:"28px", background:"var(--red2)", animationDelay:"1.54s"}}></div>
            <div className="strand-bar" style={{height:"22px", background:"var(--red1)", animationDelay:"1.68s"}}></div>
            <div className="strand-bar" style={{height:"12px", background:"var(--red2)", animationDelay:"1.82s"}}></div>
            <div className="strand-bar" style={{height:"30px", background:"var(--red1)", animationDelay:"1.96s"}}></div>
            <div className="strand-bar" style={{height:"20px", background:"var(--gold)", animationDelay:"2.10s"}}></div>
          </div>

          <div className="hero-content">
            <div className="hero-eyebrow">Your Taste DNA</div>
            <h1 className="hero-title">
              <span>YOUR TASTE</span>
              <span className="accent-word">YOUR DNA</span>
            </h1>
            <p className="hero-subtitle">A living profile built from what you watch—and how you feel. Algorithmically precise, emotionally yours.</p>
            <div className="hero-actions">
              <button className="btn-primary">
                Explore Your Profile
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              <button className="btn-secondary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.65"/></svg>
                Retake Quiz
              </button>
            </div>
            <div className="tags-row">
              <span className="taste-tag r1">Night Owl</span>
              <span className="taste-tag r2">High Intensity</span>
              <span className="taste-tag gold">Slow Burn</span>
              <span className="taste-tag r1">Plot-Driven</span>
              <span className="taste-tag">Cerebral</span>
              <span className="taste-tag r2">Morally Complex</span>
            </div>
          </div>

          <div className="hero-score">
            <div className="score-ring-wrapper">
              <svg className="score-ring-svg" width="186" height="186" viewBox="0 0 186 186">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor:"#aa0018"}}/>
                    <stop offset="45%" style={{stopColor:"#ff1f3d"}}/>
                    <stop offset="100%" style={{stopColor:"#ff5a2c"}}/>
                  </linearGradient>
                </defs>
                <circle className="score-ring-bg" cx="93" cy="93" r="80"/>
                <circle className="score-ring-fill" cx="93" cy="93" r="80"/>
              </svg>
              <div className="score-center">
                <span className="score-number" id="scoreNum">0</span>
                <span className="score-label">Match Score</span>
              </div>
            </div>
            <div className="score-badge">Sci-Fi Visionary</div>
          </div>

          <div className="ticker-wrap">
            <div className="ticker-track">
              <span className="ticker-item">Thriller</span><span className="ticker-item">Sci-Fi</span>
              <span className="ticker-item">Drama</span><span className="ticker-item">Comedy</span>
              <span className="ticker-item">Night Owl</span><span className="ticker-item">Slow Burn</span>
              <span className="ticker-item">Intensity: 84</span><span className="ticker-item">Suspense: 90</span>
              <span className="ticker-item">Thriller</span><span className="ticker-item">Sci-Fi</span>
              <span className="ticker-item">Drama</span><span className="ticker-item">Comedy</span>
              <span className="ticker-item">Night Owl</span><span className="ticker-item">Slow Burn</span>
              <span className="ticker-item">Intensity: 84</span><span className="ticker-item">Suspense: 90</span>
            </div>
          </div>
        </section>

        {/* ═══ GENRE MAP ═══ */}
        <section id="genre-section" className="taste-dna-section">
          <div className="portrait-bg" id="bgGenre" style={{backgroundImage: "url('https://eoelu63cs5y7e.ok.kimi.link/genre_bg.jpg')", backgroundPosition: "center center"}}></div>
          <div className="ov-dark" style={{background: "linear-gradient(to right,rgba(8,3,4,0.95) 0%,rgba(8,3,4,0.62) 52%,rgba(8,3,4,0.22) 100%)"}}></div>
          <div className="ov-vignette"></div>
          <div className="ov-red" style={{background: "radial-gradient(ellipse 50% 60% at 80% 50%,rgba(180,10,25,0.18) 0%,transparent 70%)"}}></div>
          <div className="grain"></div><div className="scanlines"></div>

          <div className="dna-strand">
            <div className="strand-bar" style={{height:"26px", background:"var(--red2)", animationDelay:"0s"}}></div>
            <div className="strand-bar" style={{height:"18px", background:"var(--red1)", animationDelay:"0.2s"}}></div>
            <div className="strand-bar" style={{height:"32px", background:"var(--red2)", animationDelay:"0.4s"}}></div>
            <div className="strand-bar" style={{height:"14px", background:"var(--red1)", animationDelay:"0.6s"}}></div>
            <div className="strand-bar" style={{height:"28px", background:"var(--gold)", animationDelay:"0.8s"}}></div>
            <div className="strand-bar" style={{height:"20px", background:"var(--red2)", animationDelay:"1.0s"}}></div>
            <div className="strand-bar" style={{height:"34px", background:"var(--red1)", animationDelay:"1.2s"}}></div>
            <div className="strand-bar" style={{height:"16px", background:"var(--red2)", animationDelay:"1.4s"}}></div>
          </div>

          <div className="section-inner">
            <div className="reveal-left">
              <div className="section-eyebrow">Genre Profile</div>
              <h2 className="section-title">GENRE<br/>MAP</h2>
              <p className="section-desc">Where your time goes—frame by frame. Your watch history decoded into cinematic signatures.</p>
              <div className="genre-legend">
                <div className="genre-item reveal d1">
                  <div className="genre-dot" style={{background:"#ff1f3d", boxShadow:"0 0 8px rgba(255,31,61,0.6)"}}></div>
                  <span className="genre-name">Thriller</span>
                  <div className="genre-bar-track"><div className="genre-bar-fill" style={{background:"linear-gradient(90deg,#ff1f3d,#ff6060)", width:"28%"}}></div></div>
                  <span className="genre-pct">28%</span>
                </div>
                <div className="genre-item reveal d2">
                  <div className="genre-dot" style={{background:"#ff5a2c", boxShadow:"0 0 8px rgba(255,90,44,0.5)"}}></div>
                  <span className="genre-name">Sci-Fi</span>
                  <div className="genre-bar-track"><div className="genre-bar-fill" style={{background:"linear-gradient(90deg,#ff5a2c,#ffa060)", width:"24%"}}></div></div>
                  <span className="genre-pct">24%</span>
                </div>
                <div className="genre-item reveal d3">
                  <div className="genre-dot" style={{background:"#ffb347", boxShadow:"0 0 8px rgba(255,179,71,0.5)"}}></div>
                  <span className="genre-name">Drama</span>
                  <div className="genre-bar-track"><div className="genre-bar-fill" style={{background:"linear-gradient(90deg,#ffb347,#ffd080)", width:"22%"}}></div></div>
                  <span className="genre-pct">22%</span>
                </div>
                <div className="genre-item reveal d4">
                  <div className="genre-dot" style={{background:"#aa0018", boxShadow:"0 0 8px rgba(170,0,24,0.5)"}}></div>
                  <span className="genre-name">Comedy</span>
                  <div className="genre-bar-track"><div className="genre-bar-fill" style={{background:"linear-gradient(90deg,#aa0018,#ff1f3d)", width:"26%"}}></div></div>
                  <span className="genre-pct">26%</span>
                </div>
              </div>
              <button className="btn-ghost red" style={{marginTop:"30px"}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                Refine Preferences
              </button>
            </div>

            <div className="reveal-right donut-wrapper">
              <svg width="320" height="320" viewBox="0 0 320 320" style={{filter:"drop-shadow(0 0 40px rgba(0,0,0,0.8))"}}>
                <defs><filter id="gD"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                <circle cx="160" cy="160" r="120" fill="none" stroke="rgba(28,6,8,0.95)" strokeWidth="46"/>
                <circle id="seg1" cx="160" cy="160" r="120" fill="none" stroke="#ff1f3d" strokeWidth="46" strokeDasharray="0 754" strokeLinecap="butt" transform="rotate(-90 160 160)" filter="url(#gD)"/>
                <circle id="seg2" cx="160" cy="160" r="120" fill="none" stroke="#ff5a2c" strokeWidth="46" strokeDasharray="0 754" strokeLinecap="butt" transform="rotate(-90 160 160)"/>
                <circle id="seg3" cx="160" cy="160" r="120" fill="none" stroke="#ffb347" strokeWidth="46" strokeDasharray="0 754" strokeLinecap="butt" transform="rotate(-90 160 160)"/>
                <circle id="seg4" cx="160" cy="160" r="120" fill="none" stroke="#aa0018" strokeWidth="46" strokeDasharray="0 754" strokeLinecap="butt" transform="rotate(-90 160 160)"/>
                <circle cx="160" cy="160" r="93"  fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                <circle cx="160" cy="160" r="142" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
              </svg>
              <div className="donut-center"><div className="donut-num">4</div><div className="donut-sub">Genres</div></div>
            </div>
          </div>
        </section>

        {/* ═══ MOOD RADAR ═══ */}
        <section id="radar-section" className="taste-dna-section">
          <div className="portrait-bg" id="bgMood" style={{backgroundImage: "url('https://eoelu63cs5y7e.ok.kimi.link/mood_bg.jpg')", backgroundPosition: "center 30%"}}></div>
          <div className="ov-dark" style={{background: "linear-gradient(to right,rgba(8,3,4,0.94) 0%,rgba(8,3,4,0.56) 50%,rgba(8,3,4,0.24) 100%)"}}></div>
          <div className="ov-vignette"></div>
          <div className="ov-red"></div>
          <div className="grain"></div><div className="scanlines"></div>

          <div className="dna-strand">
            <div className="strand-bar" style={{height:"28px", background:"var(--red1)", animationDelay:"0s"}}></div>
            <div className="strand-bar" style={{height:"20px", background:"var(--red1)", animationDelay:"0.18s"}}></div>
            <div className="strand-bar" style={{height:"36px", background:"var(--red1)", animationDelay:"0.36s"}}></div>
            <div className="strand-bar" style={{height:"14px", background:"var(--red1)", animationDelay:"0.54s"}}></div>
            <div className="strand-bar" style={{height:"30px", background:"var(--red1)", animationDelay:"0.72s"}}></div>
            <div className="strand-bar" style={{height:"22px", background:"var(--red1)", animationDelay:"0.90s"}}></div>
            <div className="strand-bar" style={{height:"32px", background:"var(--red1)", animationDelay:"1.08s"}}></div>
            <div className="strand-bar" style={{height:"18px", background:"var(--red1)", animationDelay:"1.26s"}}></div>
            <div className="strand-bar" style={{height:"26px", background:"var(--red1)", animationDelay:"1.44s"}}></div>
            <div className="strand-bar" style={{height:"34px", background:"var(--red1)", animationDelay:"1.62s"}}></div>
          </div>

          <div className="helix-side">
            <div className="helix-tick" style={{height:"20px", animationDelay:"0s"}}></div>
            <div className="helix-tick" style={{height:"12px", animationDelay:"0.25s"}}></div>
            <div className="helix-tick" style={{height:"30px", animationDelay:"0.5s"}}></div>
            <div className="helix-tick" style={{height:"16px", animationDelay:"0.75s"}}></div>
            <div className="helix-tick" style={{height:"24px", animationDelay:"1.0s"}}></div>
            <div className="helix-tick" style={{height:"10px", animationDelay:"1.25s"}}></div>
            <div className="helix-tick" style={{height:"28px", animationDelay:"1.5s"}}></div>
            <div className="helix-tick" style={{height:"18px", animationDelay:"1.75s"}}></div>
            <div className="helix-tick" style={{height:"22px", animationDelay:"2.0s"}}></div>
            <div className="helix-tick" style={{height:"14px", animationDelay:"2.25s"}}></div>
          </div>

          <div className="section-inner">
            <div className="reveal-left">
              <div className="section-eyebrow">Mood Profile</div>
              <h2 className="section-title">MOOD<br/>RADAR</h2>
              <p className="section-desc">The emotional fingerprint of your viewing—plotted in real time from 847 data points.</p>
              <button className="btn-ghost red">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/></svg>
                Adjust Mood Weights
              </button>
              <div className="mood-row" id="moodBars">
                <div className="mood-entry d1">
                  <div className="mood-header"><span className="mood-name">Suspense</span><span className="mood-val" style={{color:"var(--red1)"}}>90</span></div>
                  <div className="mood-track"><div className="mood-fill" style={{width:"90%", background:"linear-gradient(90deg,var(--red1),rgba(255,31,61,0.25))"}}></div></div>
                </div>
                <div className="mood-entry d2">
                  <div className="mood-header"><span className="mood-name">Intensity</span><span className="mood-val" style={{color:"var(--red2)"}}>84</span></div>
                  <div className="mood-track"><div className="mood-fill" style={{width:"84%", background:"linear-gradient(90deg,var(--red2),rgba(255,90,44,0.25))"}}></div></div>
                </div>
                <div className="mood-entry d3">
                  <div className="mood-header"><span className="mood-name">Complexity</span><span className="mood-val" style={{color:"var(--gold)"}}>78</span></div>
                  <div className="mood-track"><div className="mood-fill" style={{width:"78%", background:"linear-gradient(90deg,#ffb347,rgba(255,179,71,0.25))"}}></div></div>
                </div>
                <div className="mood-entry d4">
                  <div className="mood-header"><span className="mood-name">Emotion</span><span className="mood-val" style={{color:"var(--muted)"}}>62</span></div>
                  <div className="mood-track"><div className="mood-fill" style={{width:"62%", background:"linear-gradient(90deg,rgba(255,255,255,0.4),rgba(255,255,255,0.08))"}}></div></div>
                </div>
                <div className="mood-entry d5">
                  <div className="mood-header"><span className="mood-name">Humor</span><span className="mood-val" style={{color:"var(--muted)"}}>35</span></div>
                  <div className="mood-track"><div className="mood-fill" style={{width:"35%", background:"linear-gradient(90deg,rgba(255,200,100,0.5),rgba(255,200,100,0.08))"}}></div></div>
                </div>
              </div>
            </div>

            <div className="reveal-right radar-wrapper">
              <svg width="340" height="340" viewBox="-20 -20 380 380" overflow="visible">
                <defs>
                  <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:"#ff1f3d", stopOpacity:1}}/>
                    <stop offset="100%" style={{stopColor:"#ff5a2c", stopOpacity:1}}/>
                  </linearGradient>
                  <filter id="radarGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <polygon className="radar-grid" points="170,48 291,119 291,221 170,292 49,221 49,119" opacity="0.45"/>
                <polygon className="radar-grid" points="170,83 261,143 261,197 170,257 79,197 79,143" opacity="0.38"/>
                <polygon className="radar-grid" points="170,118 231,163 231,177 170,222 109,177 109,163" opacity="0.30"/>
                <line className="radar-axis" x1="170" y1="48" x2="170" y2="292"/>
                <line className="radar-axis" x1="49" y1="119" x2="291" y2="221"/>
                <line className="radar-axis" x1="291" y1="119" x2="49" y2="221"/>
                <polygon id="radarShape" className="radar-shape" points="170,68 267,145 252,198 170,250 82,198 74,145" style={{opacity:0, transition:"opacity 1.2s 0.3s"}}/>
                <circle className="radar-dot" cx="170" cy="170" r="4" filter="url(#radarGlow)"/>
                <text className="radar-label" x="170" y="32">Suspense</text>
                <text className="radar-label" x="312" y="114">Humor</text>
                <text className="radar-label" x="312" y="232">Emotion</text>
                <text className="radar-label" x="170" y="314">Intensity</text>
                <text className="radar-label" x="24"  y="232">Complexity</text>
                <text className="radar-label" x="24"  y="114">Focus</text>
              </svg>
            </div>
          </div>
        </section>

        {/* ═══ AI SUMMARY ═══ */}
        <section id="ai-section" className="taste-dna-section">
          <div className="portrait-bg" id="bgSummary" style={{backgroundImage: "url('https://eoelu63cs5y7e.ok.kimi.link/summary_bg.jpg')", backgroundPosition: "center 40%"}}></div>
          <div className="ov-dark" style={{background: "linear-gradient(to right,rgba(8,3,4,0.90) 0%,rgba(8,3,4,0.72) 55%,rgba(8,3,4,0.50) 100%)"}}></div>
          <div className="ov-vignette"></div>
          <div className="ov-red" style={{background: "radial-gradient(ellipse 60% 60% at 65% 38%,rgba(175,10,28,0.22) 0%,transparent 70%)"}}></div>
          <div className="grain"></div><div className="scanlines"></div>

          <div className="dna-strand">
            <div className="strand-bar" style={{height:"22px", background:"var(--red1)", animationDelay:"0.1s"}}></div>
            <div className="strand-bar" style={{height:"32px", background:"var(--red2)", animationDelay:"0.3s"}}></div>
            <div className="strand-bar" style={{height:"18px", background:"var(--red1)", animationDelay:"0.5s"}}></div>
            <div className="strand-bar" style={{height:"36px", background:"var(--gold)", animationDelay:"0.7s"}}></div>
            <div className="strand-bar" style={{height:"24px", background:"var(--red2)", animationDelay:"0.9s"}}></div>
            <div className="strand-bar" style={{height:"28px", background:"var(--red1)", animationDelay:"1.1s"}}></div>
            <div className="strand-bar" style={{height:"16px", background:"var(--red2)", animationDelay:"1.3s"}}></div>
            <div className="strand-bar" style={{height:"30px", background:"var(--red1)", animationDelay:"1.5s"}}></div>
          </div>

          <div className="helix-side">
            <div className="helix-tick" style={{height:"18px", animationDelay:"0s"}}></div>
            <div className="helix-tick" style={{height:"28px", animationDelay:"0.3s"}}></div>
            <div className="helix-tick" style={{height:"14px", animationDelay:"0.6s"}}></div>
            <div className="helix-tick" style={{height:"24px", animationDelay:"0.9s"}}></div>
            <div className="helix-tick" style={{height:"10px", animationDelay:"1.2s"}}></div>
            <div className="helix-tick" style={{height:"30px", animationDelay:"1.5s"}}></div>
            <div className="helix-tick" style={{height:"20px", animationDelay:"1.8s"}}></div>
            <div className="helix-tick" style={{height:"16px", animationDelay:"2.1s"}}></div>
            <div className="helix-tick" style={{height:"26px", animationDelay:"2.4s"}}></div>
          </div>

          <div style={{position:"relative", zIndex:5, width:"100%", padding:"80px 130px"}}>
            <div className="section-eyebrow reveal">AI Personality Summary</div>
            <h2 className="section-title reveal" style={{marginBottom:"36px"}}>AI<br/>SUMMARY</h2>
            <div className="ai-card reveal" style={{maxWidth:"800px"}}>
              <p className="ai-quote">
                You chase <strong>cerebral tension</strong>—stories that build atmosphere into explosive payoff.
                You favor <strong>morally complex leads</strong>, slow-burn structure, and soundtracks that feel like
                characters. You don't just watch. You <strong>experience architecture</strong>.<span className="ai-typing-cursor"></span>
              </p>
              <div className="ai-actions">
                <button className="btn-ghost red">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.65"/></svg>
                  Update Preferences
                </button>
                <button className="btn-ghost">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copy Summary
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SHARE YOUR DNA ═══ */}
        <section id="share-section" className="taste-dna-section">
          <div className="portrait-bg" id="bgClosing" style={{backgroundImage: "url('https://eoelu63cs5y7e.ok.kimi.link/closing_bg.jpg')", backgroundPosition: "center 18%"}}></div>
          <div className="ov-dark" style={{background: "linear-gradient(to right,rgba(8,3,4,0.96) 0%,rgba(8,3,4,0.70) 50%,rgba(8,3,4,0.33) 100%)"}}></div>
          <div className="ov-vignette"></div>
          <div className="ov-red" style={{background: "radial-gradient(ellipse 55% 70% at 68% 50%,rgba(190,0,26,0.22) 0%,transparent 70%)"}}></div>
          <div className="grain"></div><div className="scanlines"></div>

          <div className="dna-strand">
            <div className="strand-bar" style={{height:"24px", background:"var(--red1)", animationDelay:"0s"}}></div>
            <div className="strand-bar" style={{height:"16px", background:"var(--red2)", animationDelay:"0.2s"}}></div>
            <div className="strand-bar" style={{height:"34px", background:"var(--red1)", animationDelay:"0.4s"}}></div>
            <div className="strand-bar" style={{height:"20px", background:"var(--gold)", animationDelay:"0.6s"}}></div>
            <div className="strand-bar" style={{height:"30px", background:"var(--red2)", animationDelay:"0.8s"}}></div>
            <div className="strand-bar" style={{height:"14px", background:"var(--red1)", animationDelay:"1.0s"}}></div>
            <div className="strand-bar" style={{height:"28px", background:"var(--red2)", animationDelay:"1.2s"}}></div>
            <div className="strand-bar" style={{height:"22px", background:"var(--red1)", animationDelay:"1.4s"}}></div>
            <div className="strand-bar" style={{height:"36px", background:"var(--red1)", animationDelay:"1.6s"}}></div>
            <div className="strand-bar" style={{height:"12px", background:"var(--red2)", animationDelay:"1.8s"}}></div>
          </div>

          <div style={{position:"relative", zIndex:5, width:"100%", padding:"80px 130px"}}>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"80px", alignItems:"center"}}>
              <div>
                <div className="section-eyebrow reveal">Social Identity</div>
                <h2 className="section-title reveal" style={{fontSize:"clamp(64px,9.5vw,128px)", lineHeight:0.88}}>SHARE<br/>YOUR DNA</h2>
                <p className="section-desc reveal">Export a card. Start a conversation. Find your next obsession.</p>
                <div style={{display:"flex", gap:"14px", flexWrap:"wrap"}} className="reveal">
                  <button className="btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export Card
                  </button>
                  <button className="btn-secondary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    Back to Dashboard
                  </button>
                </div>
              </div>

              <div>
                <div className="share-grid reveal">
                  <div className="stat-card"><div className="stat-label">Total Watch Time</div><div className="stat-value">847h</div><div className="stat-sub">This year</div></div>
                  <div className="stat-card"><div className="stat-label">Titles Watched</div><div className="stat-value">312</div><div className="stat-sub">Films &amp; series</div></div>
                  <div className="stat-card"><div className="stat-label">Top Director</div><div className="stat-value" style={{fontSize:"26px"}}>Nolan</div><div className="stat-sub">8 titles watched</div></div>
                  <div className="stat-card"><div className="stat-label">DNA Score</div><div className="stat-value red">85%</div><div className="stat-sub">Sci-Fi Visionary</div></div>
                </div>
                <div style={{marginTop:"18px", display:"flex", gap:"10px", flexWrap:"wrap"}} className="reveal">
                  <button className="btn-ghost">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Privacy Settings
                  </button>
                  <button className="btn-ghost">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    Reset DNA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="page-footer">© 2026 Taste DNA. All rights reserved. &nbsp;·&nbsp; Your cinematic signature.</footer>
      </div>
    </>
  );
}
