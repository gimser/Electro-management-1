
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Client, NetworkDevice } from '../types';
import { 
  Activity, Server, Router, Wifi, AlertTriangle, 
  CheckCircle2, XCircle, Terminal, 
  Cpu, Thermometer, Zap, Signal, Globe, 
  Maximize2, Share2, ShieldCheck,
  Radio, HardDrive, MapPin, Crosshair,
  AlertOctagon, Eye
} from 'lucide-react';

interface NetworkMapProps {
  state: AppState;
}

// Data structures for the Threat Map visualization
interface MapNode {
  id: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  type: 'Client' | 'Hub';
  status: 'Online' | 'Offline' | 'Warning' | 'Attack';
  data?: Client;
  deviceCount?: number;
}

interface AttackLine {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  progress: number; // 0 to 100
  speed: number;
}

const NetworkMap: React.FC<NetworkMapProps> = ({ state }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [mapNodes, setMapNodes] = useState<MapNode[]>([]);
  const [attackLines, setAttackLines] = useState<AttackLine[]>([]);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  
  // Center Hub Coordinates
  const HUB_X = 50;
  const HUB_Y = 50;

  // --- 1. INITIALIZE MAP NODES (CLIENTS) ---
  useEffect(() => {
    // Distribute clients in a circle/random pattern around the center
    const nodes: MapNode[] = state.clients.map((client, index) => {
      const angle = (index / state.clients.length) * 2 * Math.PI;
      const radius = 35; // Distance from center
      const x = HUB_X + radius * Math.cos(angle);
      const y = HUB_Y + radius * Math.sin(angle);
      
      const devices = state.networkDevices.filter(d => d.clientId === client.id);
      const hasCritical = devices.some(d => d.status === 'Offline');
      const hasWarning = devices.some(d => d.status === 'Warning');

      return {
        id: client.id,
        x,
        y,
        type: 'Client',
        status: hasCritical ? 'Offline' : hasWarning ? 'Warning' : 'Online',
        data: client,
        deviceCount: devices.length
      };
    });

    // Add Central Hub
    nodes.push({ id: 'GIM-HUB', x: HUB_X, y: HUB_Y, type: 'Hub', status: 'Online' });
    setMapNodes(nodes);
  }, [state.clients, state.networkDevices]);

  // --- 2. SIMULATE TRAFFIC / ATTACKS ---
  useEffect(() => {
    const interval = setInterval(() => {
      const sourceNode = mapNodes.find(n => n.type === 'Hub');
      if (!sourceNode) return;

      // Random target
      const targets = mapNodes.filter(n => n.type === 'Client');
      if (targets.length === 0) return;
      const target = targets[Math.floor(Math.random() * targets.length)];

      const isAttack = Math.random() > 0.8; // 20% chance of "red" packet
      
      const newLine: AttackLine = {
        id: Math.random().toString(36),
        fromX: sourceNode.x,
        fromY: sourceNode.y,
        toX: target.x,
        toY: target.y,
        color: isAttack ? '#ef4444' : target.status === 'Offline' ? '#ef4444' : '#10b981', // Red or Green
        progress: 0,
        speed: Math.random() * 1.5 + 0.5
      };

      setAttackLines(prev => [...prev, newLine]);

      // Add to logs
      const logTypes = ['DDoS Attempt', 'Port Scan', 'Data Sync', 'Heartbeat', 'Firmware Upd', 'SSH Login'];
      const action = isAttack ? 'THREAT BLOCKED' : logTypes[Math.floor(Math.random() * logTypes.length)];
      const colorClass = isAttack ? 'text-red-500' : 'text-blue-400';
      
      setLiveLogs(prev => [
        `<span class="text-slate-500 font-mono">${new Date().toLocaleTimeString('en-US', {hour12:false})}</span> <span class="${colorClass} font-bold">[${action}]</span> ${sourceNode.id} >> ${target.data?.name}`,
        ...prev.slice(0, 19)
      ]);

    }, 800);

    return () => clearInterval(interval);
  }, [mapNodes]);

  // --- 3. ANIMATION LOOP ---
  useEffect(() => {
    const loop = requestAnimationFrame(() => {
      setAttackLines(prev => prev.map(line => ({
        ...line,
        progress: line.progress + line.speed
      })).filter(line => line.progress < 100)); // Remove finished lines
    });
    return () => cancelAnimationFrame(loop);
  }); // Run on every frame

  // --- HELPER: SVG CURVED PATH ---
  const getCurvedPath = (line: AttackLine) => {
    // Calculate control point for curve (higher than both points to create arc)
    const midX = (line.fromX + line.toX) / 2;
    const midY = (line.fromY + line.toY) / 2;
    // Arch height depends on distance
    const dist = Math.sqrt(Math.pow(line.toX - line.fromX, 2) + Math.pow(line.toY - line.fromY, 2));
    const controlX = midX;
    const controlY = midY - (dist * 0.5); // Arc upwards

    return `M ${line.fromX} ${line.fromY} Q ${controlX} ${controlY} ${line.toX} ${line.toY}`;
  };

  // Get point on quadratic bezier curve at t (0-1)
  const getPointOnCurve = (p0x: number, p0y: number, p1x: number, p1y: number, p2x: number, p2y: number, t: number) => {
    const x = (1 - t) * (1 - t) * p0x + 2 * (1 - t) * t * p1x + t * t * p2x;
    const y = (1 - t) * (1 - t) * p0y + 2 * (1 - t) * t * p1y + t * t * p2y;
    return { x, y };
  };

  const clientDevices = useMemo(() => {
      if(!selectedClient) return [];
      return state.networkDevices.filter(d => d.clientId === selectedClient.id);
  }, [selectedClient, state.networkDevices]);

  return (
    <div className="h-[calc(100vh-80px)] bg-black text-slate-200 font-mono relative overflow-hidden flex flex-col" dir="ltr">
      
      {/* --- WORLD MAP BACKGROUND (Styled) --- */}
      <div className="absolute inset-0 bg-[#020617]">
         {/* Grid */}
         <div className="absolute inset-0 opacity-20" 
              style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
         </div>
         {/* Radial Glow */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,rgba(0,0,0,0.8)_70%)]"></div>
      </div>

      {/* --- VISUALIZATION LAYER (SVG) --- */}
      <div className="absolute inset-0 z-10">
        <svg className="w-full h-full">
           <defs>
              <filter id="glow">
                 <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                 <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                 </feMerge>
              </filter>
           </defs>

           {/* Static Connections (Faint) */}
           {mapNodes.filter(n => n.type === 'Client').map(node => (
              <path 
                 key={'static-' + node.id}
                 d={`M ${HUB_X}% ${HUB_Y}% L ${node.x}% ${node.y}%`}
                 stroke="#1e293b"
                 strokeWidth="1"
                 fill="none"
              />
           ))}

           {/* Active Attack Lines (Arcs) */}
           {attackLines.map(line => {
              const midX = (line.fromX + line.toX) / 2;
              const midY = (line.fromY + line.toY) / 2;
              const dist = Math.sqrt(Math.pow(line.toX - line.fromX, 2) + Math.pow(line.toY - line.fromY, 2));
              const controlY = midY - (dist * 0.5);
              
              // Calculate current projectile position
              const t = line.progress / 100;
              const pos = getPointOnCurve(line.fromX, line.fromY, midX, controlY, line.toX, line.toY, t);

              return (
                 <g key={line.id}>
                    {/* The Path Trail */}
                    <path 
                       d={getCurvedPath(line)}
                       stroke={line.color}
                       strokeWidth="1"
                       fill="none"
                       strokeOpacity="0.3"
                    />
                    {/* The Projectile Head */}
                    <circle cx={`${pos.x}%`} cy={`${pos.y}%`} r="3" fill="white" filter="url(#glow)">
                        <animate attributeName="r" values="2;4;2" dur="0.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={`${pos.x}%`} cy={`${pos.y}%`} r="8" fill={line.color} opacity="0.3">
                    </circle>
                 </g>
              );
           })}
        </svg>

        {/* --- HTML NODES OVERLAY --- */}
        {mapNodes.map(node => (
           <div 
              key={node.id}
              onClick={() => node.type === 'Client' && setSelectedClient(node.data!)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
           >
              {node.type === 'Hub' ? (
                 <div className="relative flex items-center justify-center">
                    <div className="w-24 h-24 border border-blue-500/30 rounded-full animate-spin-slow absolute"></div>
                    <div className="w-20 h-20 border border-dashed border-cyan-500/50 rounded-full animate-spin-reverse-slower absolute"></div>
                    <Globe size={40} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                    <div className="absolute top-12 pt-2 text-center w-40">
                       <span className="text-[10px] font-black text-cyan-500 bg-black/80 px-2 py-1 rounded border border-cyan-900">GIM HQ</span>
                    </div>
                 </div>
              ) : (
                 <div className="flex flex-col items-center">
                    {/* Status Ring */}
                    <div className={`w-4 h-4 rounded-full ${
                       node.status === 'Online' ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 
                       node.status === 'Offline' ? 'bg-red-600 shadow-[0_0_20px_#dc2626] animate-ping' : 
                       'bg-amber-500 shadow-[0_0_15px_#f59e0b]'
                    }`}></div>
                    
                    {/* Label */}
                    <div className="mt-2 opacity-60 group-hover:opacity-100 transition-opacity text-center">
                       <p className={`text-[10px] font-bold uppercase whitespace-nowrap bg-black/80 px-2 py-0.5 border-l-2 ${
                          node.status === 'Online' ? 'text-emerald-400 border-emerald-500' : 
                          node.status === 'Offline' ? 'text-red-500 border-red-500' : 'text-amber-400 border-amber-500'
                       }`}>
                          {node.data?.name}
                       </p>
                       <p className="text-[8px] text-slate-500 font-mono">DEV: {node.deviceCount}</p>
                    </div>
                 </div>
              )}
           </div>
        ))}
      </div>

      {/* --- UI OVERLAYS (HUD) --- */}
      
      {/* 1. Top Header */}
      <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-start pointer-events-none">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3 drop-shadow-md">
               <ShieldCheck className="text-cyan-400" /> GLOBAL THREAT MAP
            </h1>
            <div className="flex gap-4 pointer-events-auto">
               <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-900/20 px-3 py-1 rounded border border-emerald-500/30">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> SYSTEM SECURE
               </div>
               <div className="flex items-center gap-2 text-[10px] text-blue-400 bg-blue-900/20 px-3 py-1 rounded border border-blue-500/30">
                  <Activity size={12} /> TRAFFIC: NORMAL
               </div>
            </div>
         </div>
         <div className="text-right">
            <p className="text-4xl font-mono font-black text-slate-700 opacity-20">GIM-OS v5</p>
         </div>
      </div>

      {/* 2. Live Logs (Bottom Left) */}
      <div className="absolute bottom-4 left-4 w-96 z-20 flex flex-col gap-2 pointer-events-auto">
         <div className="bg-black/80 border border-slate-800 p-2 flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
            <span>Live Event Stream</span>
            <Terminal size={12} />
         </div>
         <div className="h-48 overflow-hidden relative bg-gradient-to-b from-transparent to-black/90 mask-image-linear">
            <div className="absolute bottom-0 w-full flex flex-col-reverse gap-1 p-2">
               {liveLogs.map((log, i) => (
                  <div key={i} className="text-[10px] font-mono border-l-2 border-slate-800 pl-2 leading-tight" dangerouslySetInnerHTML={{ __html: log }} />
               ))}
            </div>
         </div>
      </div>

      {/* 3. Stats & Legend (Bottom Center) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-8 pointer-events-none">
         <div className="text-center">
            <p className="text-3xl font-black text-white">{state.clients.length}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Zones</p>
         </div>
         <div className="text-center">
            <p className="text-3xl font-black text-cyan-400">{attackLines.length}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Live Packets</p>
         </div>
         <div className="text-center">
            <p className="text-3xl font-black text-red-500">{state.networkDevices.filter(d => d.status === 'Offline').length}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Critical Alerts</p>
         </div>
      </div>

      {/* 4. Client Inspector (Right Panel) */}
      <div className={`absolute top-0 right-0 h-full w-80 bg-[#0b1120]/95 border-l border-slate-800 z-30 transform transition-transform duration-500 ${selectedClient ? 'translate-x-0' : 'translate-x-full'}`}>
         {selectedClient && (
            <div className="flex flex-col h-full" dir="rtl">
               <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                  <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <MapPin size={18} className="text-cyan-500" /> {selectedClient.name}
                     </h2>
                     <button onClick={() => setSelectedClient(null)} className="text-slate-500 hover:text-white"><XCircle size={20}/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                     <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                        <p className="text-[9px] text-slate-400">Total Devices</p>
                        <p className="text-lg font-black text-white">{clientDevices.length}</p>
                     </div>
                     <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                        <p className="text-[9px] text-slate-400">City</p>
                        <p className="text-sm font-black text-white">{selectedClient.city}</p>
                     </div>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Network Assets</p>
                  {clientDevices.map(device => (
                     <div 
                        key={device.id} 
                        onClick={() => setSelectedDevice(device)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center group ${
                           selectedDevice?.id === device.id 
                           ? 'bg-cyan-900/20 border-cyan-500/50' 
                           : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                        }`}
                     >
                        <div className="flex items-center gap-3">
                           {device.type === 'IP-Camera' ? <Radio size={16} className="text-slate-400"/> : 
                            device.type === 'Server' ? <Server size={16} className="text-slate-400"/> :
                            <Wifi size={16} className="text-slate-400"/>}
                           <div>
                              <p className={`text-xs font-bold ${device.status === 'Online' ? 'text-white' : 'text-red-400'}`}>{device.name}</p>
                              <p className="text-[9px] text-slate-500 font-mono">{device.ip}</p>
                           </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${device.status === 'Online' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                     </div>
                  ))}
               </div>

               {/* Device Detail Footer */}
               {selectedDevice && (
                  <div className="p-4 border-t border-slate-800 bg-slate-900 text-left" dir="ltr">
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="font-black text-cyan-400 text-sm">{selectedDevice.name}</h4>
                        <span className="text-[9px] bg-slate-800 text-slate-300 px-2 rounded border border-slate-700">{selectedDevice.type}</span>
                     </div>
                     <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] font-mono text-slate-400">
                        <div className="flex justify-between"><span>Status:</span> <span className={selectedDevice.status === 'Online' ? 'text-emerald-400' : 'text-red-500'}>{selectedDevice.status}</span></div>
                        <div className="flex justify-between"><span>Latency:</span> <span className="text-white">{Math.floor(Math.random() * 50 + 5)}ms</span></div>
                        <div className="flex justify-between"><span>Temp:</span> <span className="text-white">{Math.floor(Math.random() * 20 + 35)}°C</span></div>
                        <div className="flex justify-between"><span>Uptime:</span> <span className="text-white">99.9%</span></div>
                     </div>
                     <button className="w-full mt-3 bg-red-900/30 text-red-400 border border-red-900/50 py-2 rounded text-[10px] font-black uppercase hover:bg-red-900/50 transition-all flex items-center justify-center gap-2">
                        <Terminal size={10} /> Remote Terminal
                     </button>
                  </div>
               )}
            </div>
         )}
      </div>

    </div>
  );
};

export default NetworkMap;
