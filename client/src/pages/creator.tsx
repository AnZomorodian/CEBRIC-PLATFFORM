
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Download, Trash2, Undo2, MousePointer2, RotateCcw,
  Link2, Link2Off, Grid3x3, Sticker, Palette, Flag, X,
  ChevronRight, Settings2, Pencil, Sparkles,
  Activity, Route, Hash, Layers, Play, Square,
  Magnet, Save, FolderOpen, Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode  = "build" | "tune" | "decorate";
type Theme = "night" | "asphalt" | "grass" | "desert" | "snow" | "tropical";
interface WP     { id: string; x: number; y: number; }
interface Dec    { id: string; emoji: string; label: string; x: number; y: number; size: number; }
interface Corner { idx: number; x: number; y: number; num: number; tight: boolean; }
interface SaveSlot { name: string; waypoints: WP[]; theme: Theme; tColor: string; tWidth: number; closed: boolean; ts: number; }

const CW = 1440, CH = 840, GRID = 60;
let eid = 0;
const uid = () => `e${Date.now()}${eid++}`;
const SAVE_KEY = "cebric-creator-v2";

// ─── Themes ───────────────────────────────────────────────────────────────────
const THEMES: Record<Theme, {
  bg:string; track:string; surface:string; kerb1:string; kerb2:string;
  label:string; node:string; grid:string; accent:string; edgeLine:string;
}> = {
  night:    { bg:"#050510", track:"#1c1c2e", surface:"#222234", kerb1:"#e53935", kerb2:"#f0f0f0", label:"Night Circuit",    node:"#00d4ff", grid:"rgba(255,255,255,0.025)", accent:"#00d4ff", edgeLine:"rgba(255,255,255,0.5)"  },
  asphalt:  { bg:"#111a0a", track:"#242424", surface:"#2e2e2e", kerb1:"#e53935", kerb2:"#f0f0f0", label:"Classic Asphalt", node:"#76ff03", grid:"rgba(255,255,255,0.028)", accent:"#76ff03", edgeLine:"rgba(255,255,255,0.45)" },
  grass:    { bg:"#0a2306", track:"#333333", surface:"#3d3d3d", kerb1:"#e53935", kerb2:"#ffd600", label:"Grass & Tarmac", node:"#ffd600", grid:"rgba(200,255,130,0.03)",  accent:"#ffd600", edgeLine:"rgba(255,215,0,0.65)"   },
  desert:   { bg:"#1a0d03", track:"#3d2e1a", surface:"#4a3820", kerb1:"#ff6f00", kerb2:"#f0f0f0", label:"Desert Circuit",  node:"#ffab40", grid:"rgba(255,195,70,0.025)", accent:"#ffab40", edgeLine:"rgba(255,160,55,0.55)"  },
  snow:     { bg:"#a8bece", track:"#6a7e90", surface:"#7c8fa0", kerb1:"#c62828", kerb2:"#f0f0f0", label:"Ice Circuit",     node:"#1565c0", grid:"rgba(0,20,80,0.04)",     accent:"#1565c0", edgeLine:"rgba(255,255,255,0.75)" },
  tropical: { bg:"#031824", track:"#142a1e", surface:"#1c3828", kerb1:"#00bcd4", kerb2:"#f0f0f0", label:"Tropical Coast",  node:"#00e5ff", grid:"rgba(0,220,175,0.025)", accent:"#00e5ff", edgeLine:"rgba(0,210,195,0.55)"   },
};
const TRACK_COLORS = [
  {l:"Asphalt",c:"#252525"},{l:"Light",c:"#565656"},{l:"Red",c:"#b71c1c"},{l:"Blue",c:"#0d47a1"},
  {l:"Green",c:"#1b5e20"},{l:"Gold",c:"#7a6800"},{l:"White",c:"#c8c8c8"},{l:"Purple",c:"#4a148c"},
];
const STICKER_GROUPS = [
  { label:"Racing", items:[{e:"🏎️",l:"Kart"},{e:"🏁",l:"Flag"},{e:"🚦",l:"Lights"},{e:"🏆",l:"Trophy"},{e:"🥇",l:"Medal"},{e:"🔥",l:"Fire"},{e:"💨",l:"Speed"},{e:"⚡",l:"Turbo"},{e:"🚧",l:"Barrier"},{e:"🛞",l:"Tyre"},{e:"🔧",l:"Wrench"},{e:"⛽",l:"Fuel"}]},
  { label:"Scenery", items:[{e:"🌳",l:"Tree"},{e:"🌲",l:"Pine"},{e:"🌴",l:"Palm"},{e:"🌵",l:"Cactus"},{e:"⛰️",l:"Hills"},{e:"🌊",l:"Water"},{e:"🌿",l:"Grass"},{e:"🌅",l:"Sunset"},{e:"☁️",l:"Cloud"},{e:"🌙",l:"Night"},{e:"⭐",l:"Star"},{e:"❄️",l:"Snow"}]},
  { label:"Venue", items:[{e:"🏟️",l:"Stand"},{e:"🎪",l:"Tent"},{e:"📷",l:"Camera"},{e:"🎥",l:"Film"},{e:"📡",l:"Antenna"},{e:"🚁",l:"Copter"},{e:"👥",l:"Crowd"},{e:"🤵",l:"Staff"},{e:"🎺",l:"Band"},{e:"🏗️",l:"Tower"},{e:"🚩",l:"Marker"},{e:"🎯",l:"Target"}]},
];
const PRESETS = {
  simple:  { label:"SIMPLE",     sub:"Clean slate — you design it",   emoji:"✏️", color:"#888", pts:[] as [number,number][] },
  classic: { label:"CLASSIC GP", sub:"Technical multi-corner layout", emoji:"🏁", color:"#00d4ff", pts:[[.15,.25],[.85,.25],[.85,.55],[.6,.55],[.6,.7],[.85,.7],[.85,.8],[.15,.8],[.15,.55],[.38,.55],[.38,.38],[.15,.38]] as [number,number][] },
  street:  { label:"STREET",     sub:"Tight urban street circuit",    emoji:"🏙️", color:"#ffab40", pts:[[.2,.15],[.8,.15],[.8,.38],[.55,.38],[.55,.62],[.8,.62],[.8,.85],[.2,.85],[.2,.62],[.42,.62],[.42,.38],[.2,.38]] as [number,number][] },
};
const SECTOR_COLORS = ["#e91e63","#4caf50","#ffd740"];

// ─── Math ─────────────────────────────────────────────────────────────────────
function catmullRom(pts: [number,number][], closed: boolean, segs=52): [number,number][] {
  if (pts.length < 2) return pts;
  const n=pts.length, res:[number,number][]=[], count=closed?n:n-1;
  for (let i=0;i<count;i++) {
    const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
    for (let t=0;t<1;t+=1/segs){const t2=t*t,t3=t2*t;res.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);}
  }
  if (closed && res.length) res.push(res[0]);
  return res;
}
function normals(pts:[number,number][]): [number,number][] {
  return pts.map((_,i)=>{
    let nx=0,ny=0,c=0;
    if(i>0){const dx=pts[i][0]-pts[i-1][0],dy=pts[i][1]-pts[i-1][1],l=Math.sqrt(dx*dx+dy*dy);if(l>0){nx+=-dy/l;ny+=dx/l;c++;}}
    if(i<pts.length-1){const dx=pts[i+1][0]-pts[i][0],dy=pts[i+1][1]-pts[i][1],l=Math.sqrt(dx*dx+dy*dy);if(l>0){nx+=-dy/l;ny+=dx/l;c++;}}
    if(!c)return[0,1] as [number,number];const nl=Math.sqrt(nx*nx+ny*ny);return nl>0?[nx/nl,ny/nl] as [number,number]:[0,1] as [number,number];
  });
}
function curvature(pts:[number,number][]): number[] {
  return pts.map((_,i)=>{
    if(i===0||i>=pts.length-1)return 0;
    const [x0,y0]=pts[i-1],[x1,y1]=pts[i],[x2,y2]=pts[i+1];
    const d1x=x1-x0,d1y=y1-y0,d2x=x2-x1,d2y=y2-y1;
    const cross=d1x*d2y-d1y*d2x,denom=Math.sqrt(d1x*d1x+d1y*d1y)*Math.sqrt(d2x*d2x+d2y*d2y);
    return denom>0?cross/denom:0;
  });
}
function smooth(arr:number[],w=5): number[] {
  return arr.map((_,i)=>{let s=0,c=0;for(let j=Math.max(0,i-w);j<=Math.min(arr.length-1,i+w);j++){s+=arr[j];c++;}return c?s/c:0;});
}
function pathLen(pts:[number,number][]): number {
  let l=0;for(let i=1;i<pts.length;i++){const dx=pts[i][0]-pts[i-1][0],dy=pts[i][1]-pts[i-1][1];l+=Math.sqrt(dx*dx+dy*dy);}return l;
}
function svgPath(pts:[number,number][],vw:number,vh:number): string {
  if(pts.length<2)return"";
  const sp=catmullRom(pts.map(([x,y])=>[x*vw,y*vh] as [number,number]),true,18);
  return"M"+sp.map(([x,y])=>`${x.toFixed(1)} ${y.toFixed(1)}`).join("L")+"Z";
}
function detectCorners(pts:[number,number][],curvs:number[]): Corner[] {
  const abs=curvs.map(Math.abs),maxK=Math.max(...abs,0.001),thresh=maxK*.28;
  const corners:Corner[]=[];let inC=false,pk=-1,pv=0;
  for(let i=1;i<abs.length-1;i++){
    if(abs[i]>thresh){if(abs[i]>=pv){pv=abs[i];pk=i;}inC=true;}
    else if(inC){if(pk>=0)corners.push({idx:pk,x:pts[pk][0],y:pts[pk][1],num:corners.length+1,tight:pv>maxK*.6});inC=false;pk=-1;pv=0;}
  }
  return corners.slice(0,20);
}
function detectDRS(spline:[number,number][],curvs:number[]): {s:number;e:number}[] {
  if(!spline.length||!curvs.length)return[];
  const abs=curvs.map(Math.abs),maxK=Math.max(...abs,0.001),thresh=maxK*.12;
  const zones:{s:number;e:number}[]=[];let inZ=false,zs=0;
  for(let i=0;i<abs.length;i++){
    if(abs[i]<thresh){if(!inZ){inZ=true;zs=i;}}
    else if(inZ){let len=0;for(let j=zs+1;j<=i;j++){const dx=spline[j][0]-spline[j-1][0],dy=spline[j][1]-spline[j-1][1];len+=Math.sqrt(dx*dx+dy*dy);}if(len>110)zones.push({s:zs,e:i});inZ=false;}
  }
  return zones.slice(0,3);
}

// ─── Canvas Drawing ───────────────────────────────────────────────────────────
function drawBg(ctx:CanvasRenderingContext2D,theme:Theme,grid:boolean){
  ctx.fillStyle=THEMES[theme].bg;ctx.fillRect(0,0,CW,CH);
  const g=ctx.createRadialGradient(CW/2,CH/2,0,CW/2,CH/2,Math.max(CW,CH)*.7);
  g.addColorStop(0,"rgba(255,255,255,0.022)");g.addColorStop(1,"rgba(0,0,0,0.25)");
  ctx.fillStyle=g;ctx.fillRect(0,0,CW,CH);
  if(!grid)return;
  ctx.save();ctx.strokeStyle=THEMES[theme].grid;ctx.lineWidth=1;
  for(let x=0;x<CW;x+=GRID){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CH);ctx.stroke();}
  for(let y=0;y<CH;y+=GRID){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CW,y);ctx.stroke();}
  ctx.restore();
}
function drawKerbs(ctx:CanvasRenderingContext2D,pts:[number,number][],nrm:[number,number][],hw:number,kw:number,c1:string,c2:string,sl=20){
  let d=0;
  for(let i=1;i<pts.length;i++){
    const[x1,y1]=pts[i-1],[x2,y2]=pts[i],[nx1,ny1]=nrm[i-1],[nx2,ny2]=nrm[i];
    const dx=x2-x1,dy=y2-y1,l=Math.sqrt(dx*dx+dy*dy);if(l<0.01){d+=l;continue;}
    const col=Math.floor(d/sl)%2===0?c1:c2;
    ctx.save();ctx.fillStyle=col;
    ctx.beginPath();ctx.moveTo(x1+nx1*hw,y1+ny1*hw);ctx.lineTo(x2+nx2*hw,y2+ny2*hw);ctx.lineTo(x2+nx2*(hw+kw),y2+ny2*(hw+kw));ctx.lineTo(x1+nx1*(hw+kw),y1+ny1*(hw+kw));ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(x1-nx1*hw,y1-ny1*hw);ctx.lineTo(x2-nx2*hw,y2-ny2*hw);ctx.lineTo(x2-nx2*(hw+kw),y2-ny2*(hw+kw));ctx.lineTo(x1-nx1*(hw+kw),y1-ny1*(hw+kw));ctx.closePath();ctx.fill();
    ctx.restore();d+=l;
  }
}
function drawTrack(ctx:CanvasRenderingContext2D,pts:[number,number][],nrm:[number,number][],w:number,color:string,theme:Theme){
  if(pts.length<2)return;
  const{kerb1,kerb2,track,surface,edgeLine}=THEMES[theme],hw=w/2,kw=Math.max(10,w*.44);
  const paint=(sc:string,lw:number,dash:number[]=[],cap:CanvasLineCap="round")=>{
    ctx.save();ctx.strokeStyle=sc;ctx.lineWidth=lw;ctx.lineCap=cap;ctx.lineJoin="round";ctx.setLineDash(dash);
    ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.stroke();ctx.restore();
  };
  const paintOff=(off:number,sc:string,lw:number,dash:number[]=[])=>{
    ctx.save();ctx.strokeStyle=sc;ctx.lineWidth=lw;ctx.lineCap="round";ctx.lineJoin="round";ctx.setLineDash(dash);
    ctx.beginPath();pts.forEach(([x,y],i)=>{const[nx,ny]=nrm[i];i===0?ctx.moveTo(x+nx*off,y+ny*off):ctx.lineTo(x+nx*off,y+ny*off);});ctx.stroke();
    ctx.beginPath();pts.forEach(([x,y],i)=>{const[nx,ny]=nrm[i];i===0?ctx.moveTo(x-nx*off,y-ny*off):ctx.lineTo(x-nx*off,y-ny*off);});ctx.stroke();
    ctx.restore();
  };
  paint("rgba(0,0,0,0.5)",w+kw*2+10);
  drawKerbs(ctx,pts,nrm,hw+1,kw,kerb1,kerb2,20);
  paint(track,w+6);
  ctx.save();ctx.shadowBlur=12;ctx.shadowColor=color+"40";paint(color,w+4);ctx.restore();
  paint(surface,w);
  paintOff(hw-1.5,edgeLine,1.5);
  paint("rgba(255,255,255,0.07)",1.5,[24,24]);
}
function drawSpeedMap(ctx:CanvasRenderingContext2D,pts:[number,number][],nrm:[number,number][],curvs:number[],w:number,theme:Theme){
  const{kerb1,kerb2,edgeLine}=THEMES[theme],hw=w/2,kw=Math.max(10,w*.44);
  drawKerbs(ctx,pts,nrm,hw+1,kw,kerb1,kerb2,20);
  const abs=curvs.map(Math.abs),maxK=Math.max(...abs,0.001);
  for(let i=1;i<pts.length;i++){
    const k=(abs[i-1]+abs[i])/2,t=Math.min(k/(maxK*.65),1);
    const r=Math.round(220*(1-t)+30*t),g=Math.round(80*(1-t)+80*t),b=Math.round(20*(1-t)+220*t);
    ctx.save();ctx.strokeStyle=`rgb(${r},${g},${b})`;ctx.lineWidth=w;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(pts[i-1][0],pts[i-1][1]);ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke();ctx.restore();
  }
  const paintOff=(off:number,sc:string,lw:number)=>{
    ctx.save();ctx.strokeStyle=sc;ctx.lineWidth=lw;ctx.lineCap="round";ctx.lineJoin="round";
    ctx.beginPath();pts.forEach(([x,y],i)=>{const[nx,ny]=nrm[i];i===0?ctx.moveTo(x+nx*off,y+ny*off):ctx.lineTo(x+nx*off,y+ny*off);});ctx.stroke();
    ctx.beginPath();pts.forEach(([x,y],i)=>{const[nx,ny]=nrm[i];i===0?ctx.moveTo(x-nx*off,y-ny*off):ctx.lineTo(x-nx*off,y-ny*off);});ctx.stroke();
    ctx.restore();
  };
  paintOff(hw-1.5,edgeLine,1.5);
  // Legend
  const lx=CW-130,ly=CH-70,lw2=110,lh=14;
  const grad=ctx.createLinearGradient(lx,0,lx+lw2,0);
  grad.addColorStop(0,"rgb(220,80,20)");grad.addColorStop(0.5,"rgb(150,80,80)");grad.addColorStop(1,"rgb(30,80,220)");
  ctx.save();ctx.fillStyle="rgba(0,0,0,0.55)";ctx.beginPath();ctx.roundRect(lx-8,ly-8,lw2+16,lh+30,6);ctx.fill();
  ctx.fillStyle=grad;ctx.fillRect(lx,ly,lw2,lh);
  ctx.fillStyle="rgba(255,255,255,0.7)";ctx.font="9px monospace";ctx.textAlign="left";ctx.fillText("FAST",lx,ly+lh+10);
  ctx.textAlign="right";ctx.fillText("SLOW",lx+lw2,ly+lh+10);ctx.restore();
}
function drawRacingLine(ctx:CanvasRenderingContext2D,pts:[number,number][],nrm:[number,number][],curvs:number[],hw:number){
  const sc=smooth(curvs,6),maxK=Math.max(...sc.map(Math.abs),0.001);
  const rl=pts.map(([x,y],i)=>{const[nx,ny]=nrm[i],k=sc[i],off=-(k/maxK)*hw*.42;return[x+nx*off,y+ny*off];});
  ctx.save();ctx.strokeStyle="#ffff00";ctx.lineWidth=2.5;ctx.setLineDash([10,7]);ctx.lineCap="round";ctx.globalAlpha=0.72;
  ctx.shadowBlur=6;ctx.shadowColor="#ffff0088";ctx.beginPath();ctx.moveTo(rl[0][0],rl[0][1]);rl.slice(1).forEach(([x,y])=>ctx.lineTo(x,y));ctx.stroke();ctx.restore();
}
function drawSectors(ctx:CanvasRenderingContext2D,pts:[number,number][],w:number){
  const third=Math.floor(pts.length/3);
  SECTOR_COLORS.forEach((color,s)=>{
    const start=s*third,end=s===2?pts.length:(s+1)*third;
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=w+10;ctx.globalAlpha=.27;ctx.lineCap="round";ctx.lineJoin="round";
    ctx.beginPath();ctx.moveTo(pts[start][0],pts[start][1]);for(let i=start+1;i<end;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke();ctx.restore();
  });
  [0,third,2*third].forEach((pi,si)=>{
    const pt=pts[Math.min(pi,pts.length-1)];
    ctx.save();ctx.fillStyle="rgba(0,0,0,0.72)";ctx.beginPath();ctx.roundRect(pt[0]-16,pt[1]-10,32,20,5);ctx.fill();
    ctx.fillStyle=SECTOR_COLORS[si];ctx.font="bold 11px monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(["S1","S2","S3"][si],pt[0],pt[1]);ctx.restore();
  });
}
function drawCornerNumbers(ctx:CanvasRenderingContext2D,corners:Corner[]){
  corners.forEach(c=>{
    ctx.save();ctx.beginPath();ctx.arc(c.x,c.y,c.tight?18:15,0,Math.PI*2);
    ctx.fillStyle=c.tight?"rgba(229,57,53,0.92)":"rgba(30,30,50,0.88)";ctx.strokeStyle=c.tight?"#ef9a9a":"rgba(255,255,255,0.35)";ctx.lineWidth=1.5;ctx.fill();ctx.stroke();
    ctx.fillStyle="#fff";ctx.font=`bold ${c.tight?11:10}px monospace`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(c.num),c.x,c.y);ctx.restore();
  });
}
function drawDRS(ctx:CanvasRenderingContext2D,spline:[number,number][],nrm:[number,number][],zones:{s:number;e:number}[],w:number){
  zones.forEach((z,zi)=>{
    const pts=spline.slice(z.s,z.e+1),ns=nrm.slice(z.s,z.e+1);
    ctx.save();ctx.strokeStyle="rgba(150,0,255,0.38)";ctx.lineWidth=w+20;ctx.lineCap="round";ctx.lineJoin="round";
    ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.stroke();ctx.restore();
    // DRS label
    const mid=pts[Math.floor(pts.length/2)],nm=ns[Math.floor(ns.length/2)];
    const lx=mid[0]+nm[0]*(w/2+22),ly=mid[1]+nm[1]*(w/2+22);
    ctx.save();ctx.fillStyle="rgba(0,0,0,0.78)";ctx.beginPath();ctx.roundRect(lx-24,ly-10,48,20,4);ctx.fill();
    ctx.fillStyle="#bb86fc";ctx.font="bold 9px monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(`DRS ${zi+1}`,lx,ly);ctx.restore();
  });
}
function drawStartLine(ctx:CanvasRenderingContext2D,pts:[number,number][],nrm:[number,number][],w:number){
  if(pts.length<8)return;
  const idx=Math.min(5,pts.length-1),[cx,cy]=pts[idx],[nx,ny]=nrm[idx],tx=-ny,ty=nx;
  const hw=(w/2)+14,sq=10,sqW=(hw*2)/sq;
  ctx.save();
  for(let i=0;i<sq;i++){for(let row=0;row<2;row++){ctx.fillStyle=(i+row)%2===0?"#fff":"#111";const t=-hw+i*sqW+sqW*.5,r=(row-.5)*12,bx=cx+tx*t+nx*r,by=cy+ty*t+ny*r;ctx.save();ctx.translate(bx,by);ctx.rotate(Math.atan2(ty,tx));ctx.fillRect(-sqW/2,-6,sqW,12);ctx.restore();}}
  ctx.restore();
}
function drawWPs(ctx:CanvasRenderingContext2D,wps:WP[],sel:string|null,theme:Theme,mode:Mode){
  if(mode==="decorate")return;
  const{node,accent}=THEMES[theme];
  wps.forEach((wp,i)=>{
    const isStart=i===0,isSel=wp.id===sel,r=isSel?14:10;
    ctx.save();if(isSel){ctx.shadowBlur=20;ctx.shadowColor=node;}
    ctx.beginPath();ctx.arc(wp.x,wp.y,r+3,0,Math.PI*2);ctx.strokeStyle=isSel?accent:isStart?"rgba(229,57,53,0.6)":"rgba(255,255,255,0.18)";ctx.lineWidth=1.5;ctx.stroke();
    ctx.beginPath();ctx.arc(wp.x,wp.y,r,0,Math.PI*2);
    const g=ctx.createRadialGradient(wp.x-r*.3,wp.y-r*.3,0,wp.x,wp.y,r);
    g.addColorStop(0,isStart?"#ff6659":isSel?accent:"#ddd");g.addColorStop(1,isStart?"#b71c1c":isSel?node+"aa":"rgba(130,130,130,0.85)");
    ctx.fillStyle=g;ctx.fill();ctx.strokeStyle="rgba(0,0,0,0.4)";ctx.lineWidth=1.5;ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle=isStart?"#fff":"#111";ctx.font=`bold ${isSel?10:8}px monospace`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(isStart?"S":String(i+1),wp.x,wp.y);ctx.restore();
  });
}
function drawDecs(ctx:CanvasRenderingContext2D,decs:Dec[],sel:string|null){
  decs.forEach(d=>{
    ctx.save();ctx.font=`${d.size}px serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.shadowBlur=10;ctx.shadowColor="rgba(0,0,0,0.55)";ctx.fillText(d.emoji,d.x,d.y);
    if(d.id===sel){ctx.shadowBlur=0;ctx.strokeStyle="#00aaff";ctx.lineWidth=2;ctx.setLineDash([5,3]);ctx.strokeRect(d.x-d.size*.63,d.y-d.size*.61,d.size*1.26,d.size*1.22);}ctx.restore();
  });
}

// ─── Kart + HUD Drawing ───────────────────────────────────────────────────────
function drawKart(ctx:CanvasRenderingContext2D,x:number,y:number,angle:number,speedPct:number){
  const r=Math.round(30+220*speedPct),b=Math.round(220-190*speedPct);
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  // Glow
  ctx.shadowBlur=18+speedPct*20;ctx.shadowColor=`rgba(${r},120,${b},0.8)`;
  // Body
  ctx.fillStyle=`rgb(${r},120,${b})`;ctx.beginPath();ctx.roundRect(-12,-5,24,10,3);ctx.fill();
  // Nose
  ctx.fillStyle=`rgb(${Math.round(r*.8)},80,${Math.round(b*.8)})`;ctx.beginPath();ctx.moveTo(10,-3.5);ctx.lineTo(16,0);ctx.lineTo(10,3.5);ctx.closePath();ctx.fill();
  // Cockpit highlight
  ctx.fillStyle="rgba(255,255,255,0.28)";ctx.beginPath();ctx.roundRect(-9,-4,14,5,2);ctx.fill();
  // 4 wheels
  ctx.fillStyle="#111";[[-10,-6],[2,-6],[-10,6],[2,6]].forEach(([wx,wy])=>{ctx.save();ctx.translate(wx,wy);ctx.beginPath();ctx.roundRect(-3,-2,6,4,1.5);ctx.fill();ctx.restore();});
  ctx.restore();
}
function drawTrail(ctx:CanvasRenderingContext2D,trail:[number,number][],theme:Theme){
  const ac=THEMES[theme].accent;
  trail.forEach(([x,y],i)=>{
    const a=i/trail.length;
    ctx.save();ctx.globalAlpha=a*0.55;ctx.fillStyle=ac;ctx.shadowBlur=4;ctx.shadowColor=ac;
    const r=1.5+a*2;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();
  });
}
function drawHUD(ctx:CanvasRenderingContext2D,speedKmh:number,lapCount:number,lapMs:number,sectorIdx:number,theme:Theme){
  const ac=THEMES[theme].accent;
  const panX=18,panY=CH-130,panW=170,panH=110;
  ctx.save();ctx.fillStyle="rgba(0,0,0,0.72)";ctx.beginPath();ctx.roundRect(panX,panY,panW,panH,10);ctx.fill();
  ctx.strokeStyle=ac+"55";ctx.lineWidth=1;ctx.stroke();
  // Speed
  ctx.fillStyle=ac;ctx.font="bold 36px monospace";ctx.textAlign="right";ctx.textBaseline="top";ctx.fillText(String(Math.round(speedKmh)),panX+panW-8,panY+8);
  ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font="bold 11px monospace";ctx.textAlign="right";ctx.fillText("KM/H",panX+panW-8,panY+50);
  // Laps
  ctx.fillStyle="rgba(255,255,255,0.6)";ctx.font="bold 11px monospace";ctx.textAlign="left";ctx.textBaseline="top";ctx.fillText(`LAP ${lapCount}`,panX+8,panY+10);
  // Time
  const sec=(lapMs/1000).toFixed(3);
  ctx.fillStyle="#fff";ctx.font="bold 14px monospace";ctx.fillText(sec,panX+8,panY+30);
  // Sector indicators
  SECTOR_COLORS.forEach((sc,si)=>{
    const filled=si<sectorIdx;
    ctx.save();ctx.fillStyle=filled?sc:"rgba(255,255,255,0.15)";ctx.beginPath();ctx.roundRect(panX+8+si*48,panY+panH-24,40,14,3);ctx.fill();
    ctx.fillStyle=filled?"#000":"rgba(255,255,255,0.4)";ctx.font="bold 9px monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(`S${si+1}`,panX+8+si*48+20,panY+panH-17);ctx.restore();
  });
  ctx.restore();
}

// ─── LocalStorage Save/Load ───────────────────────────────────────────────────
function getSaves(): (SaveSlot|null)[] {
  try{const r=localStorage.getItem(SAVE_KEY);if(!r)return[null,null,null];const a=JSON.parse(r);return[0,1,2].map(i=>a[i]||null);}catch{return[null,null,null];}
}
function writeSave(slot:number,data:SaveSlot){
  const saves=getSaves();saves[slot]=data;localStorage.setItem(SAVE_KEY,JSON.stringify(saves));
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Creator() {
  const canvasRef=useRef<HTMLCanvasElement>(null);

  const[waypoints,setWaypoints]=useState<WP[]>([]);
  const[decs,setDecs]          =useState<Dec[]>([]);
  const[closed,setClosed]      =useState(false);
  const[mode,setMode]          =useState<Mode>("build");
  const[theme,setTheme]        =useState<Theme>("night");
  const[tColor,setTColor]      =useState("#252525");
  const[tWidth,setTWidth]      =useState(34);
  const[showGrid,setShowGrid]  =useState(true);
  const[snapGrid,setSnapGrid]  =useState(false);
  const[selWp,setSelWp]        =useState<string|null>(null);
  const[selDec,setSelDec]      =useState<string|null>(null);
  const[panelOpen,setPanelOpen]=useState(false);
  const[panelTab,setPanelTab]  =useState<"stickers"|"style"|"analyze"|"saves">("stickers");
  const[stickerG,setStickerG]  =useState(0);
  const[pending,setPending]    =useState<{e:string;l:string}|null>(null);
  const[trackName,setTrackName]=useState("MY CIRCUIT");
  const[saves,setSaves]        =useState<(SaveSlot|null)[]>([null,null,null]);

  // Overlays
  const[showSpeedMap,  setShowSpeedMap]  =useState(false);
  const[showRacingLine,setShowRacingLine]=useState(false);
  const[showCornerNums,setShowCornerNums]=useState(false);
  const[showSectors,   setShowSectors]   =useState(false);
  const[showDRS,       setShowDRS]       =useState(false);

  // Simulation
  const[isSimulating, setIsSimulating]=useState(false);
  const[simSpeed,     setSimSpeed]    =useState(0);
  const[simLapMs,     setSimLapMs]    =useState(0);
  const[simLapCount,  setSimLapCount] =useState(0);
  const[simSector,    setSimSector]   =useState(0);
  const animRef   =useRef<number>(0);
  const animIdx   =useRef(0);
  const prevFrac  =useRef(0);
  const animTrail =useRef<[number,number][]>([]);
  const lapStartTs=useRef(0);
  const lapCountR =useRef(0);

  // Refs for animation loop (always fresh data)
  const splineRef =useRef<[number,number][]>([]);
  const normalsRef=useRef<[number,number][]>([]);
  const curvsRef  =useRef<number[]>([]);
  const decsRef   =useRef<Dec[]>([]);
  const themeRef  =useRef<Theme>("night");
  const tColorRef =useRef("#252525");
  const tWidthRef =useRef(34);
  const showGridRef=useRef(true);
  const showSMRef =useRef(false);
  const showRLRef =useRef(false);
  const showCNRef =useRef(false);
  const showSecRef=useRef(false);
  const showDRSRef=useRef(false);
  const cornersRef=useRef<Corner[]>([]);
  const drsRef    =useRef<{s:number;e:number}[]>([]);
  const waypRef   =useRef<WP[]>([]);
  const selWpRef  =useRef<string|null>(null);
  const selDecRef =useRef<string|null>(null);
  const modeRef   =useRef<Mode>("build");
  const closedRef =useRef(false);
  const trackNameRef=useRef("MY CIRCUIT");

  const[wpHist,setWpHist]=useState<WP[][]>([[]]);
  const[histIdx,setHistIdx]=useState(0);
  const dragging=useRef<{type:"wp"|"dec";id:string;ox:number;oy:number}|null>(null);

  // ─ Derived
  const spline  = useMemo(()=>waypoints.length>=2?catmullRom(waypoints.map(w=>[w.x,w.y] as [number,number]),closed,56):[]                    ,[waypoints,closed]);
  const nrm     = useMemo(()=>spline.length>0?normals(spline):[]                                                                              ,[spline]);
  const rawCurvs= useMemo(()=>spline.length>0?curvature(spline):[]                                                                            ,[spline]);
  const curvs   = useMemo(()=>rawCurvs.length>0?smooth(rawCurvs,4):[]                                                                         ,[rawCurvs]);
  const corners = useMemo(()=>spline.length>0&&closed?detectCorners(spline,curvs):[]                                                           ,[spline,curvs,closed]);
  const drsZones= useMemo(()=>closed&&spline.length>0?detectDRS(spline,curvs):[]                                                               ,[spline,curvs,closed]);
  const lenM    = Math.round(pathLen(spline)*.34);
  const lapSec  = lenM>0?Math.round(lenM/14):0;
  const maxSpeed= lenM>0?Math.round(65+waypoints.length*1.5):0;
  const hasTrack= waypoints.length>=2;

  // Update refs
  useEffect(()=>{splineRef.current=spline;},[spline]);
  useEffect(()=>{normalsRef.current=nrm;},[nrm]);
  useEffect(()=>{curvsRef.current=curvs;},[curvs]);
  useEffect(()=>{decsRef.current=decs;},[decs]);
  useEffect(()=>{themeRef.current=theme;},[theme]);
  useEffect(()=>{tColorRef.current=tColor;},[tColor]);
  useEffect(()=>{tWidthRef.current=tWidth;},[tWidth]);
  useEffect(()=>{showGridRef.current=showGrid;},[showGrid]);
  useEffect(()=>{showSMRef.current=showSpeedMap;},[showSpeedMap]);
  useEffect(()=>{showRLRef.current=showRacingLine;},[showRacingLine]);
  useEffect(()=>{showCNRef.current=showCornerNums;},[showCornerNums]);
  useEffect(()=>{showSecRef.current=showSectors;},[showSectors]);
  useEffect(()=>{showDRSRef.current=showDRS;},[showDRS]);
  useEffect(()=>{cornersRef.current=corners;},[corners]);
  useEffect(()=>{drsRef.current=drsZones;},[drsZones]);
  useEffect(()=>{waypRef.current=waypoints;},[waypoints]);
  useEffect(()=>{selWpRef.current=selWp;},[selWp]);
  useEffect(()=>{selDecRef.current=selDec;},[selDec]);
  useEffect(()=>{modeRef.current=mode;},[mode]);
  useEffect(()=>{closedRef.current=closed;},[closed]);
  useEffect(()=>{trackNameRef.current=trackName;},[trackName]);

  // Load saves on mount
  useEffect(()=>{setSaves(getSaves());},[]);

  // ─ Main render function (also used by simulation loop)
  const renderCanvas=useCallback((animData?:{pos:[number,number];angle:number;speedPct:number;trail:[number,number][];lapMs:number;lapCount:number;sector:number})=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d")!;
    const sp=splineRef.current,nrmr=normalsRef.current,cv=curvsRef.current;
    const th=themeRef.current,tc=tColorRef.current,tw=tWidthRef.current;
    ctx.clearRect(0,0,CW,CH);
    drawBg(ctx,th,showGridRef.current);
    if(sp.length>=2){
      if(showSecRef.current&&closedRef.current)drawSectors(ctx,sp,tw);
      if(showDRSRef.current&&closedRef.current)drawDRS(ctx,sp,nrmr,drsRef.current,tw);
      if(showSMRef.current)drawSpeedMap(ctx,sp,nrmr,cv,tw,th);
      else drawTrack(ctx,sp,nrmr,tw,tc,th);
      if(closedRef.current){
        drawStartLine(ctx,sp,nrmr,tw);
        if(showRLRef.current)drawRacingLine(ctx,sp,nrmr,cv,tw/2);
        if(showCNRef.current&&cornersRef.current.length)drawCornerNumbers(ctx,cornersRef.current);
      }
    }
    drawDecs(ctx,decsRef.current,selDecRef.current);
    if(!animData)drawWPs(ctx,waypRef.current,selWpRef.current,th,modeRef.current);
    if(animData){
      drawTrail(ctx,animData.trail,th);
      drawKart(ctx,animData.pos[0],animData.pos[1],animData.angle,animData.speedPct);
      drawHUD(ctx,animData.speedPct*140,animData.lapCount,animData.lapMs,animData.sector,th);
    }
    if(waypRef.current.length>=3){ctx.save();ctx.font="bold 15px Arial";ctx.fillStyle="rgba(255,255,255,0.14)";ctx.textAlign="left";ctx.textBaseline="bottom";ctx.fillText(trackNameRef.current,20,CH-14);ctx.restore();}
    const vig=ctx.createRadialGradient(CW/2,CH/2,CH*.38,CW/2,CH/2,CH*.84);vig.addColorStop(0,"transparent");vig.addColorStop(1,"rgba(0,0,0,0.4)");ctx.fillStyle=vig;ctx.fillRect(0,0,CW,CH);
  },[]);

  // ─ Normal render on state change
  useEffect(()=>{if(!isSimulating)renderCanvas();},[waypoints,decs,closed,theme,tColor,tWidth,showGrid,selWp,selDec,spline,nrm,curvs,corners,drsZones,mode,pending,trackName,showSpeedMap,showRacingLine,showCornerNums,showSectors,showDRS,isSimulating,renderCanvas]);

  // ─ Simulation loop
  const startSimulation=useCallback(()=>{
    if(splineRef.current.length<4||!closedRef.current)return;
    animIdx.current=0;prevFrac.current=0;animTrail.current=[];lapStartTs.current=0;lapCountR.current=0;
    setSimLapCount(0);setSimLapMs(0);setSimSpeed(0);setSimSector(0);
    setIsSimulating(true);
    let lastTs=performance.now();lapStartTs.current=lastTs;
    const loop=(ts:number)=>{
      const dt=Math.min((ts-lastTs)/1000,0.06);lastTs=ts;
      const sp=splineRef.current,cv=curvsRef.current;
      if(!sp.length){animRef.current=requestAnimationFrame(loop);return;}
      const totalLen=pathLen(sp);
      const abs=cv.map(Math.abs),maxK=Math.max(...abs,0.001);
      const idx=Math.round(animIdx.current)%sp.length;
      const curv=abs[Math.min(idx,abs.length-1)]||0;
      const speedPct=Math.max(0.18,1-curv/maxK*.78);
      const pixPerSec=60+speedPct*380;
      animIdx.current=(animIdx.current+pixPerSec*dt/(totalLen/sp.length))%sp.length;
      // Lap detection
      const frac=animIdx.current/sp.length;
      if(prevFrac.current>0.85&&frac<0.15){lapCountR.current++;lapStartTs.current=ts;}
      prevFrac.current=frac;
      // Trail
      const pos=sp[Math.round(animIdx.current)%sp.length];
      animTrail.current.push(pos);if(animTrail.current.length>55)animTrail.current.shift();
      // Angle
      const next=sp[(Math.round(animIdx.current)+1)%sp.length];
      const angle=Math.atan2(next[1]-pos[1],next[0]-pos[0]);
      // Sector
      const secIdx=Math.floor(frac*3);
      // React state updates (throttled via rAF)
      setSimSpeed(Math.round(speedPct*140));
      setSimLapMs(ts-lapStartTs.current);
      setSimLapCount(lapCountR.current);
      setSimSector(secIdx);
      renderCanvas({pos,angle,speedPct,trail:[...animTrail.current],lapMs:ts-lapStartTs.current,lapCount:lapCountR.current,sector:secIdx});
      animRef.current=requestAnimationFrame(loop);
    };
    animRef.current=requestAnimationFrame(loop);
  },[renderCanvas]);

  const stopSimulation=useCallback(()=>{
    cancelAnimationFrame(animRef.current);setIsSimulating(false);renderCanvas();
  },[renderCanvas]);

  useEffect(()=>{return()=>cancelAnimationFrame(animRef.current);},[]);

  // ─ History
  const pushHistory=useCallback((wps:WP[])=>{setWpHist(h=>{const n=h.slice(0,histIdx+1);n.push([...wps]);return n;});setHistIdx(i=>i+1);},[histIdx]);
  const undo=()=>{if(histIdx<=0)return;setWaypoints([...wpHist[histIdx-1]]);setHistIdx(i=>i-1);setSelWp(null);};
  const redo=()=>{if(histIdx>=wpHist.length-1)return;setWaypoints([...wpHist[histIdx+1]]);setHistIdx(i=>i+1);setSelWp(null);};

  // ─ Pointer
  const snap=([x,y]:[number,number]):[number,number]=>{
    if(!snapGrid)return[x,y];return[Math.round(x/GRID)*GRID,Math.round(y/GRID)*GRID];
  };
  const getPos=(e:React.MouseEvent|React.TouchEvent):[number,number]=>{
    const r=canvasRef.current!.getBoundingClientRect(),sx=CW/r.width,sy=CH/r.height;
    if("touches" in e){const t=(e as React.TouchEvent).touches[0];return snap([(t.clientX-r.left)*sx,(t.clientY-r.top)*sy]);}
    const m=e as React.MouseEvent;return snap([(m.clientX-r.left)*sx,(m.clientY-r.top)*sy]);
  };
  const hitWp =([mx,my]:[number,number])=>waypoints.slice().reverse().find(w=>Math.hypot(w.x-mx,w.y-my)<22)??null;
  const hitDec=([mx,my]:[number,number])=>decs.slice().reverse().find(d=>Math.abs(d.x-mx)<d.size*.65&&Math.abs(d.y-my)<d.size*.65)??null;

  const onDown=(e:React.MouseEvent|React.TouchEvent)=>{
    if(isSimulating)return;e.preventDefault();const pos=getPos(e);
    if(pending){const nd:Dec={id:uid(),emoji:pending.e,label:pending.l,x:pos[0],y:pos[1],size:52};setDecs(d=>[...d,nd]);setSelDec(nd.id);setPending(null);return;}
    if(mode==="build"){
      const hit=hitWp(pos);if(hit){setSelWp(hit.id);setMode("tune");return;}
      const nw:WP={id:uid(),x:pos[0],y:pos[1]};const u=[...waypoints,nw];setWaypoints(u);pushHistory(u);setSelWp(nw.id);return;
    }
    if(mode==="tune"){
      const wp=hitWp(pos);if(wp){setSelWp(wp.id);setSelDec(null);dragging.current={type:"wp",id:wp.id,ox:pos[0]-wp.x,oy:pos[1]-wp.y};return;}
      const dc=hitDec(pos);if(dc){setSelDec(dc.id);setSelWp(null);dragging.current={type:"dec",id:dc.id,ox:pos[0]-dc.x,oy:pos[1]-dc.y};return;}
      setSelWp(null);setSelDec(null);return;
    }
    if(mode==="decorate"){
      const dc=hitDec(pos);if(dc){setSelDec(dc.id);setSelWp(null);dragging.current={type:"dec",id:dc.id,ox:pos[0]-dc.x,oy:pos[1]-dc.y};}else setSelDec(null);
    }
  };
  const onMove=(e:React.MouseEvent|React.TouchEvent)=>{
    if(!dragging.current)return;e.preventDefault();const[mx,my]=getPos(e);
    if(dragging.current.type==="wp"){const id=dragging.current.id;setWaypoints(w=>w.map(p=>p.id===id?{...p,x:mx-dragging.current!.ox,y:my-dragging.current!.oy}:p));}
    else{const id=dragging.current.id;setDecs(d=>d.map(p=>p.id===id?{...p,x:mx-dragging.current!.ox,y:my-dragging.current!.oy}:p));}
  };
  const onUp=()=>{if(dragging.current?.type==="wp")pushHistory([...waypoints]);dragging.current=null;};

  const delSelWp=()=>{if(!selWp)return;const u=waypoints.filter(w=>w.id!==selWp);setWaypoints(u);pushHistory(u);setSelWp(null);};
  const delSelDec=()=>{if(!selDec)return;setDecs(d=>d.filter(x=>x.id!==selDec));setSelDec(null);};
  const clearAll=()=>{if(isSimulating)stopSimulation();setWaypoints([]);setDecs([]);setClosed(false);pushHistory([]);setSelWp(null);setSelDec(null);};

  const loadPreset=(key:string)=>{
    const p=PRESETS[key as keyof typeof PRESETS];if(!p)return;
    if(p.pts.length===0){clearAll();setMode("build");setTrackName("MY CIRCUIT");return;}
    const wps=p.pts.map(([x,y])=>({id:uid(),x:x*CW,y:y*CH}) as WP);
    setWaypoints(wps);pushHistory(wps);setClosed(true);setSelWp(null);setMode("tune");setTrackName(p.label+" CIRCUIT");
  };
  const saveSlot=(slot:number)=>{
    const s:SaveSlot={name:trackName,waypoints:[...waypoints],theme,tColor,tWidth,closed,ts:Date.now()};
    writeSave(slot,s);setSaves(getSaves());
  };
  const loadSlot=(slot:number)=>{
    const s=saves[slot];if(!s)return;
    setWaypoints(s.waypoints);pushHistory(s.waypoints);setTheme(s.theme);setTColor(s.tColor);setTWidth(s.tWidth);setClosed(s.closed);setTrackName(s.name);setSelWp(null);setMode("tune");
  };

  const download=()=>{
    const canvas=canvasRef.current!,ctx=canvas.getContext("2d")!;
    ctx.clearRect(0,0,CW,CH);drawBg(ctx,theme,false);
    if(spline.length>=2){if(showSectors&&closed)drawSectors(ctx,spline,tWidth);if(showDRS&&closed)drawDRS(ctx,spline,nrm,drsZones,tWidth);if(showSpeedMap)drawSpeedMap(ctx,spline,nrm,curvs,tWidth,theme);else drawTrack(ctx,spline,nrm,tWidth,tColor,theme);if(closed){drawStartLine(ctx,spline,nrm,tWidth);if(showRacingLine)drawRacingLine(ctx,spline,nrm,curvs,tWidth/2);if(showCornerNums&&corners.length)drawCornerNumbers(ctx,corners);}}
    drawDecs(ctx,decs,null);
    if(waypoints.length>=3){ctx.font="bold 15px Arial";ctx.fillStyle="rgba(255,255,255,0.16)";ctx.textAlign="left";ctx.textBaseline="bottom";ctx.fillText(trackName,20,CH-14);}
    ctx.font="bold 13px sans-serif";ctx.fillStyle="rgba(255,255,255,0.1)";ctx.textAlign="right";ctx.textBaseline="bottom";ctx.fillText("CEBRIC CREATOR",CW-14,CH-12);
    const a=document.createElement("a");a.download="circuit.png";a.href=canvas.toDataURL();a.click();
  };

  useEffect(()=>{
    const k=(e:KeyboardEvent)=>{
      if(e.key==="Delete"||e.key==="Backspace"){if(document.activeElement?.tagName==="INPUT")return;if(selWp)delSelWp();else if(selDec)delSelDec();}
      if((e.metaKey||e.ctrlKey)&&e.key==="z"&&!e.shiftKey)undo();
      if((e.metaKey||e.ctrlKey)&&e.key==="z"&&e.shiftKey)redo();
      if(e.code==="Space"&&!["INPUT","TEXTAREA"].includes((e.target as HTMLElement)?.tagName)){e.preventDefault();if(isSimulating)stopSimulation();else if(closed&&spline.length>=4)startSimulation();}
    };
    window.addEventListener("keydown",k);return()=>window.removeEventListener("keydown",k);
  },[selWp,selDec,waypoints,decs,isSimulating,closed,spline]);

  const ac=THEMES[theme].accent;
  const MODES=[{id:"build",Icon:Pencil,label:"Build",tip:"Click to place waypoints"},{id:"tune",Icon:MousePointer2,label:"Tune",tip:"Drag nodes to reshape"},{id:"decorate",Icon:Sparkles,label:"Decorate",tip:"Place & move stickers"}] as const;
  const OVERLAYS=[
    {id:"speedmap",Icon:Activity,label:"Speed Map",active:showSpeedMap,set:()=>setShowSpeedMap(v=>!v),disabled:!closed,tip:"Curvature heatmap"},
    {id:"racingline",Icon:Route,label:"Racing Line",active:showRacingLine,set:()=>setShowRacingLine(v=>!v),disabled:!closed,tip:"Optimal racing line"},
    {id:"corners",Icon:Hash,label:"Corners",active:showCornerNums,set:()=>setShowCornerNums(v=>!v),disabled:!closed,tip:"Number each corner"},
    {id:"sectors",Icon:Layers,label:"Sectors",active:showSectors,set:()=>setShowSectors(v=>!v),disabled:!closed,tip:"S1/S2/S3 colors"},
    {id:"drs",Icon:Zap,label:"DRS Zones",active:showDRS,set:()=>setShowDRS(v=>!v),disabled:!closed||drsZones.length===0,tip:`${drsZones.length} DRS zone${drsZones.length!==1?"s":""} detected`},
  ];

  return (
    <div className="relative flex flex-col overflow-hidden select-none" style={{height:"calc(100vh - 4rem)",background:THEMES[theme].bg}}>

      {/* ══ Top Bar (2 rows) ═══════════════════════════════════════════════ */}
      <div className="absolute top-0 left-0 right-0 z-30 border-b border-white/5" style={{background:"rgba(0,0,0,0.58)",backdropFilter:"blur(18px)"}}>

        {/* Row 1 */}
        <div className="flex items-center gap-2 px-3 py-2">
          {/* Modes */}
          <div className="flex items-center bg-white/5 rounded-xl p-1 gap-0.5 shrink-0">
            {MODES.map(({id,Icon,label,tip})=>(
              <button key={id} onClick={()=>{if(isSimulating)return;setMode(id as Mode);if(id==="decorate"){setPanelOpen(true);setPanelTab("stickers");}}} title={tip} disabled={isSimulating}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode===id&&!pending&&!isSimulating?"bg-primary text-primary-foreground shadow":"text-muted-foreground hover:text-foreground"} disabled:opacity-40`}
              ><Icon className="w-3.5 h-3.5"/>{label}</button>
            ))}
          </div>

          <input value={trackName} onChange={e=>setTrackName(e.target.value.toUpperCase())} disabled={isSimulating}
            className="w-36 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-widest text-foreground outline-none focus:border-primary/60 transition-all shrink-0 disabled:opacity-40"/>

          {pending&&<div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/20 border border-secondary/40 text-secondary text-xs font-bold animate-pulse shrink-0">{pending.e} Click canvas to place<button onClick={()=>setPending(null)}><X className="w-3 h-3 ml-1"/></button></div>}

          <div className="w-px h-6 bg-white/10 shrink-0"/>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Width</span>
            <div className="w-20"><Slider min={12} max={64} step={2} value={[tWidth]} onValueChange={([v])=>setTWidth(v)} disabled={isSimulating}/></div>
            <span className="text-xs font-black w-5 tabular-nums">{tWidth}</span>
          </div>

          <button onClick={()=>setClosed(c=>!c)} disabled={waypoints.length<3||isSimulating}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${closed?"text-secondary border-secondary/50 bg-secondary/10":"text-muted-foreground border-white/10 hover:text-foreground"} disabled:opacity-20`}
          >{closed?<Link2 className="w-3.5 h-3.5"/>:<Link2Off className="w-3.5 h-3.5"/>}{closed?"Looped":"Loop"}</button>

          {(selWp||selDec)&&!isSimulating&&<button onClick={selWp?delSelWp:delSelDec} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-destructive/15 text-destructive hover:bg-destructive hover:text-white text-xs font-bold transition-all shrink-0"><Trash2 className="w-3 h-3"/>Del {selWp?"Pt":"Item"}</button>}

          <div className="flex-1"/>

          {/* Simulation HUD badge */}
          {isSimulating&&(
            <div className="flex items-center gap-4 shrink-0 mr-2 px-3 py-1 rounded-xl border border-secondary/40 bg-secondary/10">
              <div className="text-right"><p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Speed</p><p className="text-sm font-black tabular-nums text-secondary">{simSpeed} km/h</p></div>
              <div className="text-right"><p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Lap {simLapCount}</p><p className="text-sm font-black tabular-nums text-foreground">{(simLapMs/1000).toFixed(2)}s</p></div>
            </div>
          )}

          {/* Stats */}
          {lenM>0&&!isSimulating&&(
            <div className="flex items-center gap-3 shrink-0 mr-1">
              <div className="text-right"><p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Length</p><p className="text-sm font-black tabular-nums" style={{color:ac}}>{lenM}m</p></div>
              <div className="text-right"><p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Lap~</p><p className="text-sm font-black tabular-nums text-secondary">{lapSec}s</p></div>
              {closed&&corners.length>0&&<div className="text-right"><p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Corners</p><p className="text-sm font-black tabular-nums">{corners.length}</p></div>}
            </div>
          )}

          <div className="w-px h-6 bg-white/10 shrink-0"/>

          {/* Simulate button */}
          {closed&&spline.length>=4&&(
            <button onClick={isSimulating?stopSimulation:startSimulation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${isSimulating?"bg-secondary text-secondary-foreground hover:bg-secondary/80":"bg-green-600/20 text-green-400 border border-green-600/40 hover:bg-green-600 hover:text-white"}`}
            >{isSimulating?<><Square className="w-3.5 h-3.5"/>Stop</>:<><Play className="w-3.5 h-3.5"/>Simulate</>}</button>
          )}

          <button onClick={undo} disabled={histIdx<=0||isSimulating} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all"><Undo2 className="w-3.5 h-3.5"/></button>
          <button onClick={redo} disabled={histIdx>=wpHist.length-1||isSimulating} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all"><RotateCcw className="w-3.5 h-3.5 scale-x-[-1]"/></button>
          <button onClick={()=>setShowGrid(g=>!g)} className={`p-1.5 rounded-lg transition-all ${showGrid?"text-primary bg-primary/10":"text-muted-foreground hover:bg-white/10"}`}><Grid3x3 className="w-3.5 h-3.5"/></button>
          <button onClick={()=>setSnapGrid(s=>!s)} title="Snap to grid" className={`p-1.5 rounded-lg transition-all ${snapGrid?"text-secondary bg-secondary/10":"text-muted-foreground hover:bg-white/10"}`}><Magnet className="w-3.5 h-3.5"/></button>
          <div className="w-px h-6 bg-white/10 shrink-0"/>
          <button onClick={clearAll} disabled={!hasTrack&&!decs.length} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/10 text-muted-foreground hover:border-destructive/60 hover:text-destructive disabled:opacity-20 text-xs font-bold transition-all shrink-0"><Trash2 className="w-3 h-3"/>Clear</button>
          <button onClick={download} disabled={!hasTrack||isSimulating} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-20 text-xs font-bold transition-all shrink-0"><Download className="w-3 h-3"/>Save PNG</button>
        </div>

        {/* Row 2: Overlays */}
        <div className="flex items-center gap-2 px-3 pb-2 flex-wrap">
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold shrink-0">Overlays</span>
          {OVERLAYS.map(({id,Icon,label,active,set,disabled,tip})=>(
            <button key={id} onClick={set} disabled={disabled} title={tip}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${active?"border-secondary/60 bg-secondary/15 text-secondary":"border-white/8 text-muted-foreground hover:text-foreground hover:border-white/20"} disabled:opacity-25 disabled:cursor-not-allowed`}
            ><Icon className="w-3 h-3"/>{label}{active&&<span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0"/>}</button>
          ))}
          {snapGrid&&<div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-secondary/40 bg-secondary/10 text-secondary text-[10px] font-bold"><Magnet className="w-3 h-3"/>Snap ON</div>}
          {!closed&&hasTrack&&<span className="text-[9px] text-muted-foreground/50 ml-2">— Close the loop to unlock overlays & simulate</span>}
        </div>
      </div>

      {/* ══ Canvas ══════════════════════════════════════════════════════════ */}
      <div className="flex-1 relative overflow-hidden" style={{marginTop:92}}>
        <canvas ref={canvasRef} width={CW} height={CH}
          data-testid="canvas-creator"
          className="absolute inset-0 w-full h-full"
          style={{touchAction:"none",cursor:isSimulating?"none":pending?"copy":mode==="build"?"crosshair":"default"}}
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
          onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
        />

        {/* Hero preset selector */}
        {!hasTrack&&!pending&&!isSimulating&&(
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 z-10 pointer-events-none">
            <div className="text-center">
              <p className="text-4xl font-black tracking-tighter italic text-white/90 mb-1 drop-shadow-2xl">CREATE YOUR CIRCUIT</p>
              <p className="text-sm text-muted-foreground">Pick a template, or use <strong className="text-white/80">Build</strong> mode to design from scratch</p>
            </div>
            <div className="flex gap-6 pointer-events-auto">
              {Object.entries(PRESETS).map(([key,p])=>(
                <button key={key} onClick={()=>loadPreset(key)}
                  className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-200 hover:scale-105 hover:shadow-2xl"
                  style={{width:212,background:"rgba(255,255,255,0.04)",backdropFilter:"blur(16px)"}}
                >
                  <div className="relative h-36 w-full overflow-hidden flex items-center justify-center">
                    {key==="simple"?(
                      <div className="flex flex-col items-center gap-3 opacity-50 group-hover:opacity-80 transition-opacity">
                        <Pencil className="w-12 h-12" style={{color:p.color}}/><span className="text-xs text-muted-foreground">Click to start building</span>
                      </div>
                    ):(
                      <svg viewBox="0 0 212 136" className="w-full h-full p-3">
                        <path d={svgPath(p.pts,212,136)} fill="none" stroke="rgba(0,0,0,0.7)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d={svgPath(p.pts,212,136)} fill="none" stroke="#e53935" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="13 13"/>
                        <path d={svgPath(p.pts,212,136)} fill="none" stroke="#f0f0f0" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="13 13" strokeDashoffset="13"/>
                        <path d={svgPath(p.pts,212,136)} fill="none" stroke={p.color} strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d={svgPath(p.pts,212,136)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8"/>
                      </svg>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"/>
                  </div>
                  <div className="px-4 py-3 border-t border-white/8" style={{background:"rgba(0,0,0,0.35)"}}>
                    <p className="text-[11px] font-black tracking-widest" style={{color:p.color}}>{p.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{p.sub}</p>
                  </div>
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{boxShadow:`inset 0 0 0 1px ${p.color}44`}}/>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tools panel tab */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20">
          <button onClick={()=>setPanelOpen(p=>!p)} className={`flex flex-col items-center gap-1.5 py-5 px-2 rounded-l-xl border-l border-y border-white/10 backdrop-blur-md transition-all ${panelOpen?"bg-primary/10 border-primary/30 text-primary":"bg-black/40 text-muted-foreground hover:text-foreground"}`}>
            <Settings2 className="w-4 h-4"/>
            <span className="text-[8px] font-bold uppercase tracking-widest" style={{writingMode:"vertical-rl",transform:"rotate(180deg)"}}>{panelOpen?"CLOSE":"TOOLS"}</span>
            <ChevronRight className={`w-3 h-3 transition-transform ${panelOpen?"rotate-180":""}`}/>
          </button>
        </div>

        {/* Sliding panel */}
        <div className={`absolute top-0 right-0 bottom-0 z-20 flex flex-col border-l border-white/8 transition-all duration-300 overflow-hidden`}
          style={{width:panelOpen?234:0,background:"rgba(4,4,14,0.92)",backdropFilter:"blur(24px)"}}>
          {panelOpen&&(
            <>
              <div className="flex border-b border-white/8 shrink-0">
                {([["stickers",Sticker,"Items"],["style",Palette,"Style"],["analyze",Activity,"Analyze"],["saves",FolderOpen,"Saves"]] as const).map(([id,Icon,label])=>(
                  <button key={id} onClick={()=>setPanelTab(id)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[9px] font-bold uppercase tracking-wider transition-all ${panelTab===id?"text-primary border-b-2 border-primary":"text-muted-foreground hover:text-foreground"}`}
                  ><Icon className="w-3.5 h-3.5"/>{label}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">

                {panelTab==="stickers"&&(
                  <>
                    <p className="text-[9px] text-muted-foreground leading-relaxed">Pick a sticker → click canvas to place → drag in <strong className="text-white">Tune</strong> mode.</p>
                    {pending&&<div className="p-2 rounded-xl bg-secondary/10 border border-secondary/30 text-[10px] text-secondary font-bold text-center animate-pulse">Click canvas → place {pending.e}<button className="ml-2 opacity-60 hover:opacity-100" onClick={()=>setPending(null)}>✕</button></div>}
                    <div className="flex gap-1">{STICKER_GROUPS.map((g,i)=><button key={i} onClick={()=>setStickerG(i)} className={`flex-1 text-[9px] py-1 rounded-md font-bold transition-all ${stickerG===i?"bg-primary text-primary-foreground":"bg-white/5 text-muted-foreground hover:text-foreground"}`}>{g.label}</button>)}</div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {STICKER_GROUPS[stickerG].items.map(({e,l})=>(
                        <button key={e} onClick={()=>setPending({e,l})} title={l} className={`flex flex-col items-center gap-0.5 p-2 rounded-xl border transition-all group ${pending?.e===e?"bg-primary/20 border-primary/60":"bg-white/5 hover:bg-primary/15 border-white/5 hover:border-primary/40"}`}>
                          <span className="text-2xl group-hover:scale-110 transition-transform">{e}</span><span className="text-[8px] text-muted-foreground">{l}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {panelTab==="style"&&(
                  <>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Environment</p>
                    <div className="space-y-1.5">
                      {(Object.entries(THEMES) as [Theme,typeof THEMES[Theme]][]).map(([k,v])=>(
                        <button key={k} onClick={()=>setTheme(k)} className={`w-full flex items-center gap-2.5 p-2 rounded-xl border transition-all ${theme===k?"border-primary ring-1 ring-primary bg-primary/5":"border-white/8 hover:border-white/20"}`}>
                          <div className="w-8 h-6 rounded-md overflow-hidden flex shrink-0 border border-white/10"><div className="flex-1" style={{background:v.bg}}/><div className="w-2.5" style={{background:v.surface}}/></div>
                          <span className="text-[10px] font-bold text-left flex-1">{v.label}</span>
                          {theme===k&&<div className="w-2 h-2 rounded-full shrink-0" style={{background:v.accent}}/>}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground pt-1">Track Color</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {TRACK_COLORS.map(({l,c})=><button key={c} onClick={()=>setTColor(c)} className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${tColor===c?"border-primary ring-1 ring-primary":"border-white/8 hover:border-white/20"}`}><div className="w-5 h-5 rounded-md shrink-0 border border-white/10" style={{background:c}}/><span className="text-[10px] font-bold">{l}</span></button>)}
                    </div>
                    <input type="color" value={tColor} onChange={e=>setTColor(e.target.value)} className="w-full h-9 rounded-xl border border-white/10 cursor-pointer bg-transparent"/>
                  </>
                )}

                {panelTab==="analyze"&&(
                  <>
                    {!closed?(
                      <div className="flex flex-col items-center gap-3 py-8 text-center opacity-60"><Flag className="w-8 h-8 text-muted-foreground"/><p className="text-xs text-muted-foreground">Close the loop to<br/>unlock circuit analysis</p></div>
                    ):(
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          {[{l:"Length",v:`${lenM}m`,c:ac},{l:"Lap Time ~",v:`${lapSec}s`,c:"#e91e63"},{l:"Waypoints",v:String(waypoints.length),c:"#fff"},{l:"Corners",v:String(corners.length),c:"#ff9800"},{l:"Tight",v:String(corners.filter(c=>c.tight).length),c:"#e53935"},{l:"DRS Zones",v:String(drsZones.length),c:"#bb86fc"},{l:"Est. Top",v:`${maxSpeed}km/h`,c:"#76ff03"},{l:"Theme",v:THEMES[theme].label.split(" ")[0],c:"#fff"},].map(({l,v,c})=>(
                            <div key={l} className="p-2.5 rounded-xl bg-white/5 border border-white/8"><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">{l}</p><p className="text-sm font-black tabular-nums truncate" style={{color:c}}>{v}</p></div>
                          ))}
                        </div>
                        {corners.length>0&&<>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Corners</p>
                          <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                            {corners.map(c=>(
                              <div key={c.num} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${c.tight?"bg-destructive/10 border border-destructive/20":"bg-white/5"}`}>
                                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black" style={{background:c.tight?"#e53935":"#333"}}>{c.num}</div>
                                <span className="text-[10px] text-muted-foreground flex-1">{c.tight?"Tight hairpin":"Medium corner"}</span>
                                {c.tight&&<span className="text-[9px] text-destructive font-bold">⚠</span>}
                              </div>
                            ))}
                          </div>
                        </>}
                        <div className="flex gap-2 pt-1">{["S1","S2","S3"].map((s,i)=><div key={s} className="flex-1 flex items-center gap-1.5 p-2 rounded-lg bg-white/5"><div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:SECTOR_COLORS[i]}}/><span className="text-[10px] font-bold" style={{color:SECTOR_COLORS[i]}}>{s}</span></div>)}</div>
                      </>
                    )}
                  </>
                )}

                {panelTab==="saves"&&(
                  <>
                    <p className="text-[9px] text-muted-foreground leading-relaxed">Save up to 3 circuits locally. They persist between sessions.</p>
                    <div className="space-y-3">
                      {[0,1,2].map(slot=>(
                        <div key={slot} className="rounded-xl border border-white/10 overflow-hidden">
                          <div className="flex items-center gap-2 px-3 py-2 bg-white/5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Slot {slot+1}</span>
                            <div className="flex-1"/>
                            {saves[slot]&&<button onClick={()=>loadSlot(slot)} className="flex items-center gap-1 text-[9px] font-bold text-primary hover:underline"><FolderOpen className="w-3 h-3"/>Load</button>}
                            <button onClick={()=>saveSlot(slot)} disabled={!hasTrack} className="flex items-center gap-1 text-[9px] font-bold text-secondary hover:underline disabled:opacity-30"><Save className="w-3 h-3"/>Save</button>
                          </div>
                          {saves[slot]?(
                            <div className="px-3 pb-2.5 pt-1">
                              <p className="text-[10px] font-black text-white truncate">{saves[slot]!.name}</p>
                              <p className="text-[9px] text-muted-foreground">{saves[slot]!.waypoints.length} pts · {saves[slot]!.closed?"Closed loop":"Open"} · {THEMES[saves[slot]!.theme].label}</p>
                              <p className="text-[9px] text-muted-foreground/50">{new Date(saves[slot]!.ts).toLocaleDateString()}</p>
                            </div>
                          ):(
                            <div className="px-3 pb-2.5 pt-1 text-[9px] text-muted-foreground/40 italic">Empty slot</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══ Bottom status ════════════════════════════════════════════════== */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-1.5 border-t border-white/5 z-30" style={{background:"rgba(0,0,0,0.45)",backdropFilter:"blur(12px)"}}>
        <Flag className="w-3 h-3 text-muted-foreground shrink-0"/>
        <span className="text-[10px] text-muted-foreground truncate">
          {isSimulating&&`🏎️ Simulating — Lap ${simLapCount} — ${(simLapMs/1000).toFixed(2)}s — Space to stop`}
          {!isSimulating&&!hasTrack&&"Choose a layout or switch to Build mode — click to place waypoints, track draws itself"}
          {!isSimulating&&hasTrack&&!closed&&waypoints.length>=3&&"Enable Loop to close the circuit — then unlock Speed Map, Racing Line, DRS Zones & Simulation"}
          {!isSimulating&&hasTrack&&closed&&`${corners.filter(c=>c.tight).length} tight corners · ${drsZones.length} DRS zone${drsZones.length!==1?"s":""} · Press Space or hit Simulate to race`}
        </span>
        <div className="flex-1"/>
        <span className="text-[9px] text-muted-foreground/35 hidden sm:block">Space = simulate · Del · Ctrl+Z</span>
      </div>
    </div>
  );
}
