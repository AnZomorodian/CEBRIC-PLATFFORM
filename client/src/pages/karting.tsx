
import { useRef, useState, useEffect, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Download, Trash2, Undo2, MousePointer2, Plus, RotateCcw,
  Link2, Link2Off, Grid3x3, Sticker, Palette, Flag, X,
  ChevronRight, Settings2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode  = "add" | "edit";
type Theme = "night" | "asphalt" | "grass" | "desert" | "snow" | "tropical";
interface WP  { id: string; x: number; y: number; }
interface Dec { id: string; emoji: string; label: string; x: number; y: number; size: number; }

const CW = 1440, CH = 840;
let eid = 0;
const uid = () => `e${Date.now()}${eid++}`;

// ─── Themes ───────────────────────────────────────────────────────────────────
const THEMES: Record<Theme, {
  bg: string; bgGrad: string; track: string;
  kerb1: string; kerb2: string; label: string;
  node: string; grid: string; accent: string;
  surface: string; edgeLine: string;
}> = {
  night:    { bg:"#050510", bgGrad:"radial-gradient(ellipse at 50% 50%, #0a0a22 0%, #050510 70%)", track:"#1c1c2e", surface:"#222234", kerb1:"#e53935", kerb2:"#f5f5f5", label:"Night Circuit",    node:"#00d4ff", grid:"rgba(255,255,255,0.025)", accent:"#00d4ff",  edgeLine:"rgba(255,255,255,0.55)" },
  asphalt:  { bg:"#111a0a", bgGrad:"radial-gradient(ellipse at 50% 50%, #182214 0%, #111a0a 70%)", track:"#242424", surface:"#2e2e2e", kerb1:"#e53935", kerb2:"#f5f5f5", label:"Classic Asphalt", node:"#76ff03", grid:"rgba(255,255,255,0.03)",  accent:"#76ff03",  edgeLine:"rgba(255,255,255,0.5)"  },
  grass:    { bg:"#0a2306", bgGrad:"radial-gradient(ellipse at 50% 50%, #122e0a 0%, #0a2306 70%)", track:"#333333", surface:"#3d3d3d", kerb1:"#e53935", kerb2:"#ffd600", label:"Grass & Tarmac", node:"#ffd600", grid:"rgba(220,255,150,0.03)", accent:"#ffd600",  edgeLine:"rgba(255,215,0,0.7)"   },
  desert:   { bg:"#1a0d03", bgGrad:"radial-gradient(ellipse at 50% 50%, #241406 0%, #1a0d03 70%)", track:"#3d2e1a", surface:"#4a3820", kerb1:"#ff6f00", kerb2:"#f5f5f5", label:"Desert Circuit",  node:"#ffab40", grid:"rgba(255,200,80,0.025)", accent:"#ffab40",  edgeLine:"rgba(255,165,60,0.6)"  },
  snow:     { bg:"#a8bece", bgGrad:"radial-gradient(ellipse at 50% 50%, #bdd0dc 0%, #a8bece 70%)", track:"#6a7e90", surface:"#7c8fa0", kerb1:"#c62828", kerb2:"#f5f5f5", label:"Ice Circuit",     node:"#1565c0", grid:"rgba(0,20,80,0.04)",    accent:"#1565c0",  edgeLine:"rgba(255,255,255,0.8)"  },
  tropical: { bg:"#031824", bgGrad:"radial-gradient(ellipse at 50% 50%, #062030 0%, #031824 70%)", track:"#142a1e", surface:"#1c3828", kerb1:"#00bcd4", kerb2:"#f5f5f5", label:"Tropical Coast",  node:"#00e5ff", grid:"rgba(0,220,180,0.025)", accent:"#00e5ff",  edgeLine:"rgba(0,220,200,0.6)"   },
};

const TRACK_COLORS = [
  { l:"Asphalt",  c:"#252525" }, { l:"Light",  c:"#565656" },
  { l:"Red",      c:"#b71c1c" }, { l:"Blue",   c:"#0d47a1" },
  { l:"Green",    c:"#1b5e20" }, { l:"Gold",   c:"#7a6800" },
  { l:"White",    c:"#c8c8c8" }, { l:"Purple", c:"#4a148c" },
];

const STICKER_GROUPS = [
  { label:"Racing", items:[
    {e:"🏎️",l:"Kart"},{e:"🏁",l:"Flag"},{e:"🚦",l:"Lights"},{e:"🏆",l:"Trophy"},
    {e:"🥇",l:"Medal"},{e:"🔥",l:"Fire"},{e:"💨",l:"Speed"},{e:"⚡",l:"Turbo"},
    {e:"🚧",l:"Barrier"},{e:"🛞",l:"Tyre"},{e:"🔧",l:"Wrench"},{e:"⛽",l:"Fuel"},
  ]},
  { label:"Scenery", items:[
    {e:"🌳",l:"Tree"},{e:"🌲",l:"Pine"},{e:"🌴",l:"Palm"},{e:"🌵",l:"Cactus"},
    {e:"⛰️",l:"Hills"},{e:"🌊",l:"Water"},{e:"🌿",l:"Grass"},{e:"🌅",l:"Sunset"},
    {e:"☁️",l:"Cloud"},{e:"🌙",l:"Night"},{e:"⭐",l:"Star"},{e:"❄️",l:"Snow"},
  ]},
  { label:"Venue", items:[
    {e:"🏟️",l:"Stand"},{e:"🎪",l:"Tent"},{e:"📷",l:"Camera"},{e:"🎥",l:"Film"},
    {e:"📡",l:"Antenna"},{e:"🚁",l:"Copter"},{e:"👥",l:"Crowd"},{e:"🤵",l:"Staff"},
    {e:"🎺",l:"Band"},{e:"🏗️",l:"Tower"},{e:"🚩",l:"Marker"},{e:"🎯",l:"Target"},
  ]},
];

const PRESETS = {
  simple:  { label:"SIMPLE",     sub:"Clean slate — you draw it",       emoji:"✏️", color:"#aaaaaa", pts:[] as [number,number][] },
  classic: { label:"CLASSIC GP", sub:"Technical multi-corner layout",   emoji:"🏁", color:"#00d4ff", pts:[[.15,.25],[.85,.25],[.85,.55],[.6,.55],[.6,.7],[.85,.7],[.85,.8],[.15,.8],[.15,.55],[.38,.55],[.38,.38],[.15,.38]] as [number,number][] },
  street:  { label:"STREET",     sub:"Tight urban street circuit",      emoji:"🏙️", color:"#ffab40", pts:[[.2,.15],[.8,.15],[.8,.38],[.55,.38],[.55,.62],[.8,.62],[.8,.85],[.2,.85],[.2,.62],[.42,.62],[.42,.38],[.2,.38]] as [number,number][] },
};

// ─── Spline (Catmull-Rom, more segments for smoother curves) ─────────────────
function catmullRom(rawPts: [number,number][], closed: boolean, segs = 48): [number,number][] {
  if (rawPts.length < 2) return rawPts;
  const n = rawPts.length;
  const res: [number,number][] = [];
  const count = closed ? n : n - 1;
  for (let i = 0; i < count; i++) {
    const p0=rawPts[(i-1+n)%n], p1=rawPts[i], p2=rawPts[(i+1)%n], p3=rawPts[(i+2)%n];
    for (let t = 0; t < 1; t += 1/segs) {
      const t2=t*t, t3=t2*t;
      res.push([
        .5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
        .5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3),
      ]);
    }
  }
  if (closed && res.length) res.push(res[0]);
  return res;
}

// Averaged normals for smooth kerb transitions
function computeNormals(pts: [number,number][]): [number,number][] {
  return pts.map((_,i) => {
    let nx=0, ny=0, cnt=0;
    if (i>0) { const dx=pts[i][0]-pts[i-1][0],dy=pts[i][1]-pts[i-1][1],l=Math.sqrt(dx*dx+dy*dy); if(l>0){nx+=-dy/l;ny+=dx/l;cnt++;} }
    if (i<pts.length-1) { const dx=pts[i+1][0]-pts[i][0],dy=pts[i+1][1]-pts[i][1],l=Math.sqrt(dx*dx+dy*dy); if(l>0){nx+=-dy/l;ny+=dx/l;cnt++;} }
    if (cnt===0) return [0,1] as [number,number];
    const nl=Math.sqrt(nx*nx+ny*ny);
    return nl>0 ? [nx/nl,ny/nl] as [number,number] : [0,1] as [number,number];
  });
}

function pathLen(pts: [number,number][]): number {
  let l=0; for(let i=1;i<pts.length;i++){const dx=pts[i][0]-pts[i-1][0],dy=pts[i][1]-pts[i-1][1];l+=Math.sqrt(dx*dx+dy*dy);} return l;
}

// SVG path for preset previews
function svgPath(pts: [number,number][], vw: number, vh: number): string {
  if (pts.length < 2) return "";
  const sp = catmullRom(pts.map(([x,y])=>[x*vw,y*vh] as [number,number]), true, 20);
  if (!sp.length) return "";
  return "M"+sp.map(([x,y])=>`${x.toFixed(1)} ${y.toFixed(1)}`).join("L")+"Z";
}

// ─── High-Quality Canvas Drawing ──────────────────────────────────────────────

function drawBg(ctx: CanvasRenderingContext2D, theme: Theme, grid: boolean) {
  const t = THEMES[theme];
  // Solid fill first
  ctx.fillStyle = t.bg; ctx.fillRect(0,0,CW,CH);
  // Subtle radial gradient overlay
  const grad = ctx.createRadialGradient(CW/2,CH/2,0,CW/2,CH/2,Math.max(CW,CH)*0.7);
  grad.addColorStop(0, "rgba(255,255,255,0.03)");
  grad.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle=grad; ctx.fillRect(0,0,CW,CH);
  if (!grid) return;
  ctx.save();
  ctx.strokeStyle=t.grid; ctx.lineWidth=1;
  for(let x=0;x<CW;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CH);ctx.stroke();}
  for(let y=0;y<CH;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CW,y);ctx.stroke();}
  ctx.restore();
}

// F1-quality kerb rendering: alternating colored quads perpendicular to track
function drawKerbs(
  ctx: CanvasRenderingContext2D,
  pts: [number,number][],
  normals: [number,number][],
  hw: number,  // half-track-width
  kerbW: number,
  c1: string, c2: string,
  stripeLen = 20
) {
  if (pts.length < 2) return;
  let cumDist = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x1,y1]=pts[i-1],[x2,y2]=pts[i];
    const [nx1,ny1]=normals[i-1],[nx2,ny2]=normals[i];
    const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
    if (len<0.01){cumDist+=len;continue;}
    const stripeIdx=Math.floor(cumDist/stripeLen);
    const color=stripeIdx%2===0?c1:c2;
    ctx.save(); ctx.fillStyle=color;
    // Left kerb
    ctx.beginPath();
    ctx.moveTo(x1+nx1*hw,       y1+ny1*hw);
    ctx.lineTo(x2+nx2*hw,       y2+ny2*hw);
    ctx.lineTo(x2+nx2*(hw+kerbW), y2+ny2*(hw+kerbW));
    ctx.lineTo(x1+nx1*(hw+kerbW), y1+ny1*(hw+kerbW));
    ctx.closePath(); ctx.fill();
    // Right kerb (opposite normal)
    ctx.beginPath();
    ctx.moveTo(x1-nx1*hw,       y1-ny1*hw);
    ctx.lineTo(x2-nx2*hw,       y2-ny2*hw);
    ctx.lineTo(x2-nx2*(hw+kerbW), y2-ny2*(hw+kerbW));
    ctx.lineTo(x1-nx1*(hw+kerbW), y1-ny1*(hw+kerbW));
    ctx.closePath(); ctx.fill();
    ctx.restore();
    cumDist+=len;
  }
}

function drawTrackFull(
  ctx: CanvasRenderingContext2D,
  pts: [number,number][],
  width: number,
  color: string,
  theme: Theme
) {
  if (pts.length < 2) return;
  const t = THEMES[theme];
  const hw = width / 2;
  const kerbW = Math.max(10, width * 0.45);
  const normals = computeNormals(pts);

  // 1 — Kerb base shadow (slightly wider, dark)
  const paintPath=(strokeStyle:string,lw:number,dash:number[]=[],cap:CanvasLineCap="round")=>{
    ctx.save(); ctx.strokeStyle=strokeStyle; ctx.lineWidth=lw; ctx.lineCap=cap; ctx.lineJoin="round";
    ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]); pts.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));
    ctx.stroke(); ctx.restore();
  };

  // Kerb outer shadow
  paintPath("rgba(0,0,0,0.45)", width+kerbW*2+8);

  // 2 — Actual kerb stripes (alternating quads)
  drawKerbs(ctx, pts, normals, hw+1, kerbW, t.kerb1, t.kerb2, 20);

  // 3 — Track surface drop shadow / glow
  ctx.save();
  ctx.shadowBlur = 14; ctx.shadowColor = color+"44";
  paintPath(t.track, width+5);
  ctx.restore();

  // 4 — Track asphalt surface
  paintPath(t.surface, width);

  // 5 — Thin edge lines (white lines at asphalt edge — like real circuits)
  paintPath(t.edgeLine, 1.5);           // full line == edge highlight trick
  paintPath(t.edgeLine, 1.5);           // we use the track edge via offset stroke trick below

  // Paint actual edge lines offset from center
  const paintOffset=(offset:number,strokeStyle:string,lw:number,dash:number[]=[])=>{
    ctx.save(); ctx.strokeStyle=strokeStyle; ctx.lineWidth=lw; ctx.lineCap="round"; ctx.lineJoin="round";
    ctx.setLineDash(dash);
    ctx.beginPath();
    pts.forEach(([x,y],i)=>{
      const [nx,ny]=normals[i];
      if(i===0)ctx.moveTo(x+nx*offset,y+ny*offset);
      else ctx.lineTo(x+nx*offset,y+ny*offset);
    });
    ctx.stroke();
    ctx.beginPath();
    pts.forEach(([x,y],i)=>{
      const [nx,ny]=normals[i];
      if(i===0)ctx.moveTo(x-nx*offset,y-ny*offset);
      else ctx.lineTo(x-nx*offset,y-ny*offset);
    });
    ctx.stroke();
    ctx.restore();
  };

  paintOffset(hw-2, t.edgeLine, 1.5);         // inner edge white lines

  // 6 — Center dashed line
  paintPath("rgba(255,255,255,0.08)", 1.5, [22,22]);
}

function drawStartLine(ctx: CanvasRenderingContext2D, pts: [number,number][], width: number, normals: [number,number][]) {
  if (pts.length < 6) return;
  const idx = Math.min(3, pts.length - 1);
  const [cx, cy] = pts[idx];
  const [nx, ny] = normals[idx];
  // Tangent direction (perpendicular to normal)
  const tx = -ny, ty = nx;
  const hw = (width / 2) + 14;
  const squares = 8;
  const sqW = (hw * 2) / squares;
  const sqH = 10;
  ctx.save();
  for (let i = 0; i < squares; i++) {
    for (let row = 0; row < 2; row++) {
      ctx.fillStyle = (i + row) % 2 === 0 ? "#ffffff" : "#111111";
      // Position along the start/finish line
      const t = -hw + i * sqW + sqW * 0.5;
      const r = (row - 0.5) * sqH;
      const bx = cx + tx * t + nx * r;
      const by = cy + ty * t + ny * r;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(Math.atan2(ty, tx));
      ctx.fillRect(-sqW / 2, -sqH / 2, sqW, sqH);
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawWPs(ctx: CanvasRenderingContext2D, wps: WP[], sel: string|null, theme: Theme) {
  const {node,accent} = THEMES[theme];
  wps.forEach((wp,i)=>{
    const isStart=i===0, isSel=wp.id===sel;
    const r=isSel?15:11;
    ctx.save();
    if(isSel){ctx.shadowBlur=24;ctx.shadowColor=node;}
    // Outer ring
    ctx.beginPath(); ctx.arc(wp.x,wp.y,r+3,0,Math.PI*2);
    ctx.strokeStyle=isSel?accent:isStart?"#e53935":"rgba(255,255,255,0.25)";
    ctx.lineWidth=1.5; ctx.stroke();
    // Fill
    ctx.beginPath(); ctx.arc(wp.x,wp.y,r,0,Math.PI*2);
    const g=ctx.createRadialGradient(wp.x-r*.3,wp.y-r*.3,0,wp.x,wp.y,r);
    g.addColorStop(0,isStart?"#ff6659":isSel?accent:"#e0e0e0");
    g.addColorStop(1,isStart?"#b71c1c":isSel?node+"99":"rgba(150,150,150,0.9)");
    ctx.fillStyle=g; ctx.fill();
    ctx.strokeStyle="rgba(0,0,0,0.4)"; ctx.lineWidth=1.5; ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle=isStart?"#fff":"#111";
    ctx.font=`bold ${isSel?11:9}px monospace`; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(isStart?"S":String(i+1),wp.x,wp.y);
    ctx.restore();
  });
}

function drawDecs(ctx: CanvasRenderingContext2D, decs: Dec[], sel: string|null) {
  decs.forEach(d=>{
    ctx.save();
    ctx.font=`${d.size}px serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.shadowBlur=8; ctx.shadowColor="rgba(0,0,0,0.5)";
    ctx.fillText(d.emoji,d.x,d.y);
    if(d.id===sel){ctx.shadowBlur=0;ctx.strokeStyle="#00aaff";ctx.lineWidth=2;ctx.setLineDash([5,3]);ctx.strokeRect(d.x-d.size*.62,d.y-d.size*.6,d.size*1.24,d.size*1.2);}
    ctx.restore();
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function KartingTrack() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [waypoints, setWaypoints] = useState<WP[]>([]);
  const [decs,      setDecs]      = useState<Dec[]>([]);
  const [closed,    setClosed]    = useState(false);
  const [mode,      setMode]      = useState<Mode>("add");
  const [theme,     setTheme]     = useState<Theme>("night");
  const [tColor,    setTColor]    = useState("#252525");
  const [tWidth,    setTWidth]    = useState(34);
  const [showGrid,  setShowGrid]  = useState(true);
  const [selWp,     setSelWp]     = useState<string|null>(null);
  const [selDec,    setSelDec]    = useState<string|null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab,  setPanelTab]  = useState<"stickers"|"style">("stickers");
  const [stickerG,  setStickerG]  = useState(0);
  const [pendingDec,setPendingDec]= useState<{e:string;l:string}|null>(null);
  const [trackName, setTrackName] = useState("MY CIRCUIT");

  const [wpHist, setWpHist] = useState<WP[][]>([[]]);
  const [histIdx,setHistIdx] = useState(0);
  const dragging = useRef<{type:"wp"|"dec";id:string;ox:number;oy:number}|null>(null);

  const spline = waypoints.length>=2
    ? catmullRom(waypoints.map(w=>[w.x,w.y] as [number,number]), closed, 56)
    : [];
  const splineNormals = spline.length>0 ? computeNormals(spline) : [];
  const lenM   = Math.round(pathLen(spline)*0.34);
  const lapSec = lenM>0 ? Math.round(lenM/14) : 0;

  // ─ Redraw
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas)return;
    const ctx=canvas.getContext("2d")!;
    ctx.clearRect(0,0,CW,CH);
    drawBg(ctx,theme,showGrid);
    if(spline.length>=2){
      drawTrackFull(ctx,spline,tWidth,tColor,theme);
      if(closed && splineNormals.length>0) drawStartLine(ctx,spline,tWidth,splineNormals);
    }
    drawDecs(ctx,decs,selDec);
    drawWPs(ctx,waypoints,selWp,theme);
    // circuit name
    if(waypoints.length>=3){
      ctx.save(); ctx.font="bold 16px 'Arial',sans-serif";
      ctx.fillStyle="rgba(255,255,255,0.16)"; ctx.textAlign="left"; ctx.textBaseline="bottom";
      ctx.fillText(trackName,22,CH-14); ctx.restore();
    }
    // Vignette
    const vig=ctx.createRadialGradient(CW/2,CH/2,CH*.35,CW/2,CH/2,CH*.8);
    vig.addColorStop(0,"transparent"); vig.addColorStop(1,"rgba(0,0,0,0.45)");
    ctx.fillStyle=vig; ctx.fillRect(0,0,CW,CH);
  },[waypoints,decs,closed,theme,tColor,tWidth,showGrid,selWp,selDec,spline,splineNormals,pendingDec,trackName]);

  // ─ History
  const pushHistory = useCallback((wps:WP[])=>{
    setWpHist(h=>{const n=h.slice(0,histIdx+1);n.push([...wps]);return n;});
    setHistIdx(i=>i+1);
  },[histIdx]);
  const undo=()=>{ if(histIdx<=0)return; setWaypoints([...wpHist[histIdx-1]]);setHistIdx(i=>i-1);setSelWp(null); };
  const redo=()=>{ if(histIdx>=wpHist.length-1)return; setWaypoints([...wpHist[histIdx+1]]);setHistIdx(i=>i+1);setSelWp(null); };

  // ─ Pointer
  const getPos=(e:React.MouseEvent|React.TouchEvent):[number,number]=>{
    const r=canvasRef.current!.getBoundingClientRect();
    const sx=CW/r.width,sy=CH/r.height;
    if("touches" in e){const t=(e as React.TouchEvent).touches[0];return[(t.clientX-r.left)*sx,(t.clientY-r.top)*sy];}
    const m=e as React.MouseEvent; return[(m.clientX-r.left)*sx,(m.clientY-r.top)*sy];
  };
  const hitWp=([mx,my]:[number,number])=>waypoints.slice().reverse().find(w=>Math.hypot(w.x-mx,w.y-my)<22)??null;
  const hitDec=([mx,my]:[number,number])=>decs.slice().reverse().find(d=>Math.abs(d.x-mx)<d.size*.65&&Math.abs(d.y-my)<d.size*.65)??null;

  const onDown=(e:React.MouseEvent|React.TouchEvent)=>{
    e.preventDefault(); const pos=getPos(e);
    if(pendingDec){
      const nd:Dec={id:uid(),emoji:pendingDec.e,label:pendingDec.l,x:pos[0],y:pos[1],size:52};
      setDecs(d=>[...d,nd]);setSelDec(nd.id);setPendingDec(null);setMode("edit");return;
    }
    if(mode==="add"){
      const hit=hitWp(pos);
      if(hit){setSelWp(hit.id);setMode("edit");return;}
      const nw:WP={id:uid(),x:pos[0],y:pos[1]};
      const u=[...waypoints,nw];setWaypoints(u);pushHistory(u);setSelWp(nw.id);return;
    }
    const wp=hitWp(pos);
    if(wp){setSelWp(wp.id);setSelDec(null);dragging.current={type:"wp",id:wp.id,ox:pos[0]-wp.x,oy:pos[1]-wp.y};return;}
    const dc=hitDec(pos);
    if(dc){setSelDec(dc.id);setSelWp(null);dragging.current={type:"dec",id:dc.id,ox:pos[0]-dc.x,oy:pos[1]-dc.y};return;}
    setSelWp(null);setSelDec(null);
  };
  const onMove=(e:React.MouseEvent|React.TouchEvent)=>{
    if(!dragging.current)return;e.preventDefault();
    const[mx,my]=getPos(e);
    if(dragging.current.type==="wp"){const id=dragging.current.id;setWaypoints(w=>w.map(p=>p.id===id?{...p,x:mx-dragging.current!.ox,y:my-dragging.current!.oy}:p));}
    else{const id=dragging.current.id;setDecs(d=>d.map(p=>p.id===id?{...p,x:mx-dragging.current!.ox,y:my-dragging.current!.oy}:p));}
  };
  const onUp=()=>{if(dragging.current?.type==="wp")pushHistory([...waypoints]);dragging.current=null;};

  const delSelWp=()=>{ if(!selWp)return;const u=waypoints.filter(w=>w.id!==selWp);setWaypoints(u);pushHistory(u);setSelWp(null); };
  const delSelDec=()=>{ if(!selDec)return;setDecs(d=>d.filter(x=>x.id!==selDec));setSelDec(null); };
  const clearAll=()=>{setWaypoints([]);setDecs([]);setClosed(false);pushHistory([]);setSelWp(null);setSelDec(null);};

  const loadPreset=(key:string)=>{
    const p=PRESETS[key as keyof typeof PRESETS]; if(!p)return;
    if(p.pts.length===0){
      // Simple: clean canvas, add-mode
      clearAll(); setMode("add"); setTrackName("MY CIRCUIT"); return;
    }
    const wps=p.pts.map(([x,y])=>({id:uid(),x:x*CW,y:y*CH}) as WP);
    setWaypoints(wps);pushHistory(wps);setClosed(true);setSelWp(null);setMode("edit");
    setTrackName(p.label+" CIRCUIT");
  };

  const addSticker=(e:string,l:string)=>{setPendingDec({e,l});};

  const download=()=>{
    const canvas=canvasRef.current!;const ctx=canvas.getContext("2d")!;
    ctx.clearRect(0,0,CW,CH); drawBg(ctx,theme,false);
    if(spline.length>=2){drawTrackFull(ctx,spline,tWidth,tColor,theme);if(closed&&splineNormals.length>0)drawStartLine(ctx,spline,tWidth,splineNormals);}
    drawDecs(ctx,decs,null);
    if(waypoints.length>=3){ctx.font="bold 16px Arial";ctx.fillStyle="rgba(255,255,255,0.18)";ctx.textAlign="left";ctx.textBaseline="bottom";ctx.fillText(trackName,22,CH-14);}
    ctx.font="bold 14px sans-serif";ctx.fillStyle="rgba(255,255,255,0.12)";ctx.textAlign="right";ctx.textBaseline="bottom";ctx.fillText("CEBRIC KARTING",CW-16,CH-12);
    const a=document.createElement("a");a.download="kart-track.png";a.href=canvas.toDataURL();a.click();
  };

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==="Delete"||e.key==="Backspace"){if(document.activeElement?.tagName==="INPUT")return;if(selWp)delSelWp();else if(selDec)delSelDec();}
      if((e.metaKey||e.ctrlKey)&&e.key==="z"&&!e.shiftKey)undo();
      if((e.metaKey||e.ctrlKey)&&e.key==="z"&&e.shiftKey)redo();
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[selWp,selDec,waypoints,decs]);

  const hasTrack=waypoints.length>=2;
  const ac=THEMES[theme].accent;

  return (
    <div className="relative flex flex-col overflow-hidden" style={{height:"calc(100vh - 4rem)",background:THEMES[theme].bg}}>

      {/* ══ Floating Top Bar ═══════════════════════════════════════════════ */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-lg border-b border-white/5" style={{height:50}}>
        {/* Mode buttons */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 shrink-0">
          {([["add",Plus,"Add Point"],["edit",MousePointer2,"Move"]] as const).map(([m,Icon,label])=>(
            <button key={m} onClick={()=>{setMode(m as Mode);setPendingDec(null);}}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode===m&&!pendingDec?"bg-primary text-primary-foreground shadow-md":"text-muted-foreground hover:text-foreground"}`}
            ><Icon className="w-3.5 h-3.5"/>{label}</button>
          ))}
        </div>

        <input value={trackName} onChange={e=>setTrackName(e.target.value.toUpperCase())}
          className="w-40 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-widest text-foreground outline-none focus:border-primary/60 transition-all shrink-0"/>

        {pendingDec && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/20 border border-secondary/40 text-secondary text-xs font-bold animate-pulse shrink-0">
            {pendingDec.e} Click canvas to place
            <button onClick={()=>setPendingDec(null)}><X className="w-3 h-3"/></button>
          </div>
        )}

        <div className="w-px h-6 bg-white/10 shrink-0"/>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Width</span>
          <div className="w-20"><Slider min={12} max={64} step={2} value={[tWidth]} onValueChange={([v])=>setTWidth(v)}/></div>
          <span className="text-xs font-black w-5 tabular-nums">{tWidth}</span>
        </div>

        <button onClick={()=>setClosed(c=>!c)} disabled={waypoints.length<3}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${closed?"text-secondary border-secondary/50 bg-secondary/10":"text-muted-foreground border-white/10 hover:text-foreground"} disabled:opacity-20`}
        >{closed?<Link2 className="w-3.5 h-3.5"/>:<Link2Off className="w-3.5 h-3.5"/>}{closed?"Looped":"Close"}</button>

        {(selWp||selDec)&&(
          <button onClick={selWp?delSelWp:delSelDec}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-destructive/15 text-destructive hover:bg-destructive hover:text-white text-xs font-bold transition-all shrink-0">
            <Trash2 className="w-3 h-3"/>Del {selWp?"Pt":"Item"}
          </button>
        )}

        <div className="flex-1"/>

        {/* Stats */}
        {lenM>0&&(
          <div className="flex items-center gap-4 shrink-0 mr-2">
            <div className="text-right"><p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Length</p><p className="text-sm font-black tabular-nums" style={{color:ac}}>{lenM}m</p></div>
            <div className="text-right"><p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Lap~</p><p className="text-sm font-black tabular-nums text-secondary">{lapSec}s</p></div>
            <div className="text-right"><p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Pts</p><p className="text-sm font-black tabular-nums">{waypoints.length}</p></div>
          </div>
        )}

        <div className="w-px h-6 bg-white/10 shrink-0"/>
        <button onClick={undo} disabled={histIdx<=0} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all"><Undo2 className="w-3.5 h-3.5"/></button>
        <button onClick={redo} disabled={histIdx>=wpHist.length-1} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all"><RotateCcw className="w-3.5 h-3.5 scale-x-[-1]"/></button>
        <button onClick={()=>setShowGrid(g=>!g)} className={`p-1.5 rounded-lg transition-all ${showGrid?"text-primary bg-primary/10":"text-muted-foreground hover:bg-white/10"}`}><Grid3x3 className="w-3.5 h-3.5"/></button>
        <div className="w-px h-6 bg-white/10 shrink-0"/>
        <button onClick={clearAll} disabled={!hasTrack&&!decs.length} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/10 text-muted-foreground hover:border-destructive/60 hover:text-destructive disabled:opacity-20 text-xs font-bold transition-all shrink-0"><Trash2 className="w-3 h-3"/>Clear</button>
        <button onClick={download} disabled={!hasTrack} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-20 text-xs font-bold transition-all shrink-0"><Download className="w-3 h-3"/>Save PNG</button>
      </div>

      {/* ══ Canvas fills everything ════════════════════════════════════════ */}
      <div className="flex-1 relative overflow-hidden" style={{marginTop:50}}>
        <canvas ref={canvasRef} width={CW} height={CH}
          data-testid="canvas-track"
          className="absolute inset-0 w-full h-full"
          style={{touchAction:"none",cursor:pendingDec?"copy":mode==="add"?"crosshair":"default"}}
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
          onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
        />

        {/* ── Hero preset selector (when canvas is empty) ───────────────── */}
        {!hasTrack && !pendingDec && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 z-10 pointer-events-none">
            <div className="text-center pointer-events-none">
              <p className="text-4xl font-black tracking-tighter italic text-white/90 mb-2 drop-shadow-2xl">
                BUILD YOUR CIRCUIT
              </p>
              <p className="text-muted-foreground text-sm font-medium">
                Choose a template below, or use <strong className="text-white/80">Add Point</strong> to design from scratch
              </p>
            </div>

            <div className="flex gap-6 pointer-events-auto">
              {Object.entries(PRESETS).map(([key,p])=>(
                <button key={key} onClick={()=>loadPreset(key)}
                  className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/10 hover:border-white/35 transition-all duration-200 hover:scale-105 hover:shadow-2xl"
                  style={{width:210, background:"rgba(255,255,255,0.04)", backdropFilter:"blur(16px)"}}
                >
                  {/* SVG preview area */}
                  <div className="relative h-36 w-full overflow-hidden flex items-center justify-center">
                    {key==="simple" ? (
                      <div className="flex flex-col items-center gap-3 opacity-60 group-hover:opacity-90 transition-opacity">
                        <Plus className="w-10 h-10" style={{color:p.color}}/>
                        <span className="text-xs text-muted-foreground font-medium">Start from scratch</span>
                      </div>
                    ):(
                      <svg viewBox="0 0 210 130" className="w-full h-full p-4">
                        {/* Shadow under track */}
                        <path d={svgPath(p.pts,210,130)} fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
                        {/* Kerb layer */}
                        <path d={svgPath(p.pts,210,130)} fill="none" stroke="#e53935" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="12 12"/>
                        <path d={svgPath(p.pts,210,130)} fill="none" stroke="#f5f5f5" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="12 12" strokeDashoffset="12"/>
                        {/* Asphalt */}
                        <path d={svgPath(p.pts,210,130)} fill="none" stroke={p.color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
                        {/* Center line */}
                        <path d={svgPath(p.pts,210,130)} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8"/>
                      </svg>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"/>
                  </div>
                  {/* Label */}
                  <div className="px-4 py-3" style={{background:"rgba(0,0,0,0.3)"}}>
                    <p className="text-[11px] font-black tracking-widest" style={{color:p.color}}>{p.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{p.sub}</p>
                  </div>
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                    style={{boxShadow:`inset 0 0 0 1px ${p.color}55, 0 0 30px ${p.color}22`}}/>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Tools tab (right edge) ────────────────────────────────────── */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20">
          <button onClick={()=>setPanelOpen(p=>!p)}
            className={`flex flex-col items-center gap-1.5 py-5 px-2 rounded-l-xl border-l border-y border-white/10 backdrop-blur-md transition-all ${panelOpen?"bg-primary/10 border-primary/30 text-primary":"bg-black/40 text-muted-foreground hover:text-foreground hover:border-white/25"}`}
          >
            <Settings2 className="w-4 h-4"/>
            <span className="text-[8px] font-bold uppercase tracking-widest" style={{writingMode:"vertical-rl",transform:"rotate(180deg)"}}>
              {panelOpen?"CLOSE":"TOOLS"}
            </span>
            <ChevronRight className={`w-3 h-3 transition-transform ${panelOpen?"rotate-180":""}`}/>
          </button>
        </div>

        {/* ── Sliding panel ─────────────────────────────────────────────── */}
        <div className={`absolute top-0 right-0 bottom-0 z-20 flex flex-col border-l border-white/8 transition-all duration-300 overflow-hidden ${panelOpen?"w-56":"w-0"}`}
          style={{background:"rgba(5,5,16,0.88)",backdropFilter:"blur(20px)"}}>
          {panelOpen&&(
            <>
              <div className="flex border-b border-white/8 shrink-0">
                {([["stickers",Sticker,"Items"],["style",Palette,"Style"]] as const).map(([id,Icon,label])=>(
                  <button key={id} onClick={()=>setPanelTab(id)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 text-[9px] font-bold uppercase tracking-wider transition-all ${panelTab===id?"text-primary border-b-2 border-primary":"text-muted-foreground hover:text-foreground"}`}
                  ><Icon className="w-4 h-4"/>{label}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {panelTab==="stickers"&&(
                  <>
                    {pendingDec&&<div className="p-2 rounded-xl bg-secondary/10 border border-secondary/30 text-[10px] text-secondary font-bold text-center animate-pulse">Click canvas → place {pendingDec.e}</div>}
                    <div className="flex gap-1">
                      {STICKER_GROUPS.map((g,i)=>(
                        <button key={i} onClick={()=>setStickerG(i)}
                          className={`flex-1 text-[9px] py-1 rounded-md font-bold transition-all ${stickerG===i?"bg-primary text-primary-foreground":"bg-white/5 text-muted-foreground hover:text-foreground"}`}
                        >{g.label}</button>
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {STICKER_GROUPS[stickerG].items.map(({e,l})=>(
                        <button key={e} onClick={()=>addSticker(e,l)} title={l}
                          className="flex flex-col items-center gap-0.5 p-2 rounded-xl bg-white/5 hover:bg-primary/15 border border-white/5 hover:border-primary/40 transition-all group"
                        ><span className="text-2xl group-hover:scale-110 transition-transform">{e}</span><span className="text-[8px] text-muted-foreground">{l}</span></button>
                      ))}
                    </div>
                  </>
                )}
                {panelTab==="style"&&(
                  <>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Environment</p>
                    <div className="space-y-1.5">
                      {(Object.entries(THEMES) as [Theme,typeof THEMES[Theme]][]).map(([k,v])=>(
                        <button key={k} onClick={()=>setTheme(k)}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-xl border transition-all ${theme===k?"border-primary ring-1 ring-primary bg-primary/5":"border-white/8 hover:border-white/20"}`}
                        >
                          <div className="w-8 h-6 rounded-md overflow-hidden flex shrink-0 border border-white/10">
                            <div className="flex-1" style={{background:v.bg}}/><div className="w-2.5" style={{background:v.surface}}/>
                          </div>
                          <span className="text-[10px] font-bold text-left flex-1">{v.label}</span>
                          {theme===k&&<div className="w-2 h-2 rounded-full shrink-0" style={{background:v.accent}}/>}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground pt-1">Track Color</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {TRACK_COLORS.map(({l,c})=>(
                        <button key={c} onClick={()=>setTColor(c)}
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${tColor===c?"border-primary ring-1 ring-primary":"border-white/8 hover:border-white/20"}`}
                        ><div className="w-5 h-5 rounded-md shrink-0 border border-white/10" style={{background:c}}/><span className="text-[10px] font-bold">{l}</span></button>
                      ))}
                    </div>
                    <input type="color" value={tColor} onChange={e=>setTColor(e.target.value)}
                      className="w-full h-9 rounded-xl border border-white/10 cursor-pointer bg-transparent"/>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══ Bottom status bar ═════════════════════════════════════════════ */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-t border-white/5 z-30" style={{background:"rgba(0,0,0,0.45)",backdropFilter:"blur(12px)",height:34}}>
        <Flag className="w-3 h-3 text-muted-foreground shrink-0"/>
        <span className="text-[10px] text-muted-foreground truncate">
          {!hasTrack&&"Choose a layout above, or switch to Add Point and click the canvas"}
          {hasTrack&&!closed&&waypoints.length>=3&&"💡 Enable Close Loop to complete your circuit — then download"}
          {hasTrack&&closed&&`${waypoints.length} waypoints · ${THEMES[theme].label} · width ${tWidth}px · ~${lapSec}s lap time`}
        </span>
        <div className="flex-1"/>
        <span className="text-[9px] text-muted-foreground/40 shrink-0 hidden sm:block">Del · Ctrl+Z · Ctrl+Shift+Z</span>
      </div>
    </div>
  );
}
