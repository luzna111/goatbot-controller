import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FiPower, FiMap, FiSettings, FiBattery, 
  FiWifi, FiNavigation, FiPlus, FiTrash2, FiPlay, 
  FiHome, FiRotateCcw, FiScissors, FiActivity,
  FiCheckCircle, FiClock, FiCalendar, FiBluetooth,
  FiThermometer, FiRefreshCw, FiAlertTriangle, FiInfo,
  FiChevronRight, FiSmartphone, FiGlobe, FiLock,
  FiServer, FiCpu, FiCloud
} from 'react-icons/fi';
import { 
  RiRobot2Line, RiSpeedLine
} from 'react-icons/ri';
import { format } from 'date-fns';

interface MapData {
  id: string;
  name: string;
  area: number;
  createdAt: Date;
  lastUsed: Date;
  isActive: boolean;
  progress: number;
  thumbnail: string;
}

interface MowerStatus {
  isConnected: boolean;
  batteryLevel: number;
  isRunning: boolean;
  isCutting: boolean;
  currentSpeed: number;
  bladeSpeed: number;
  temperature: number;
  signalStrength: number;
  currentMapId: string | null;
  position: { x: number; y: number };
  totalCuttingTime: number;
  grassCut: number;
  connectionType: 'bluetooth' | 'wifi' | 'cloud' | null;
  protocol: string;
  cloudServer: string;
  cloudProvider: string;
}

const INITIAL_MAPS: MapData[] = [
  { id: '1', name: 'Front Lawn', area: 450, createdAt: new Date('2024-01-15'), lastUsed: new Date(), isActive: true, progress: 100, thumbnail: '🌿' },
  { id: '2', name: 'Backyard', area: 680, createdAt: new Date('2024-02-01'), lastUsed: new Date('2024-11-20'), isActive: false, progress: 100, thumbnail: '🌳' },
  { id: '3', name: 'Side Garden', area: 220, createdAt: new Date('2024-03-10'), lastUsed: new Date('2024-11-15'), isActive: false, progress: 75, thumbnail: '🌱' },
  { id: '4', name: 'Pool Area', area: 180, createdAt: new Date('2024-04-05'), isActive: false, progress: 100, thumbnail: '🏊', lastUsed: new Date('2024-11-10') },
  { id: '5', name: 'Driveway Edge', area: 120, createdAt: new Date('2024-05-20'), isActive: false, progress: 60, thumbnail: '🚗', lastUsed: new Date('2024-11-05') },
];

interface JoystickProps {
  onMove: (x: number, y: number) => void;
  onStop: () => void;
  disabled?: boolean;
}

const VirtualJoystick: React.FC<JoystickProps> = ({ onMove, onStop, disabled }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const maxRadius = 60;

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (disabled) return;
    setIsDragging(true);
    handleMove(clientX, clientY);
  }, [disabled]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !isDragging || disabled) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > maxRadius) {
      const ratio = maxRadius / distance;
      deltaX *= ratio;
      deltaY *= ratio;
    }
    
    setPosition({ x: deltaX, y: deltaY });
    onMove(deltaX / maxRadius, -deltaY / maxRadius);
  }, [isDragging, onMove, disabled]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onStop();
  }, [onStop]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleMouseUp = () => handleEnd();
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-48 h-48 rounded-full border-2 touch-none select-none transition-all ${
        disabled 
          ? 'bg-slate-800/30 border-slate-700/30 cursor-not-allowed' 
          : 'bg-slate-800/50 border-slate-600/50 cursor-pointer'
      }`}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onTouchStart={(e) => {
        e.preventDefault();
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`w-full h-px ${disabled ? 'bg-slate-700/20' : 'bg-slate-600/30'}`} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`w-px h-full ${disabled ? 'bg-slate-700/20' : 'bg-slate-600/30'}`} />
      </div>
      
      <div 
        className={`absolute w-16 h-16 rounded-full shadow-lg transition-transform duration-75 ease-out flex items-center justify-center ${
          disabled 
            ? 'bg-slate-700 shadow-slate-900/30' 
            : 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30'
        }`}
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        }}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${disabled ? 'bg-slate-600/30' : 'bg-emerald-300/30'}`}>
          <FiNavigation className={`w-6 h-6 ${disabled ? 'text-slate-500' : 'text-white'}`} />
        </div>
      </div>
      
      <span className={`absolute top-2 left-1/2 -translate-x-1/2 text-xs font-medium ${disabled ? 'text-slate-600' : 'text-slate-400'}`}>FWD</span>
      <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium ${disabled ? 'text-slate-600' : 'text-slate-400'}`}>REV</span>
      <span className={`absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium ${disabled ? 'text-slate-600' : 'text-slate-400'}`}>L</span>
      <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium ${disabled ? 'text-slate-600' : 'text-slate-400'}`}>R</span>
    </div>
  );
};

export default function GoatBotApp() {
  const [activeTab, setActiveTab] = useState<'control' | 'maps' | 'schedule' | 'settings'>('control');
  const [maps, setMaps] = useState<MapData[]>(INITIAL_MAPS);
  const [mowerStatus, setMowerStatus] = useState<MowerStatus>({
    isConnected: false,
    batteryLevel: 78,
    isRunning: false,
    isCutting: false,
    currentSpeed: 0,
    bladeSpeed: 0,
    temperature: 42,
    signalStrength: 85,
    currentMapId: '1',
    position: { x: 50, y: 50 },
    totalCuttingTime: 1247,
    grassCut: 15280,
    connectionType: null,
    protocol: 'MQTT over TLS',
    cloudServer: 'mqtt.goatbot.io',
    cloudProvider: 'Alibaba Cloud IoT (Aliyun)',
  });
  const [showPairing, setShowPairing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const [showAddMap, setShowAddMap] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);

  const connectToMower = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setMowerStatus(prev => ({
        ...prev,
        isConnected: true,
        connectionType: 'cloud',
      }));
      setIsConnecting(false);
    }, 2000);
  };

  const disconnectMower = () => {
    setMowerStatus(prev => ({
      ...prev,
      isConnected: false,
      isRunning: false,
      isCutting: false,
      currentSpeed: 0,
      bladeSpeed: 0,
      connectionType: null,
    }));
  };

  const handlePairingComplete = () => {
    setShowPairing(false);
    connectToMower();
  };

  const handleJoystickMove = useCallback((x: number, y: number) => {
    if (!mowerStatus.isConnected) return;
    setMowerStatus(prev => ({
      ...prev,
      isRunning: true,
      currentSpeed: Math.round(Math.abs(y) * 100),
      position: {
        x: Math.max(0, Math.min(100, prev.position.x + x * 2)),
        y: Math.max(0, Math.min(100, prev.position.y + y * 2)),
      }
    }));
  }, [mowerStatus.isConnected]);

  const handleJoystickStop = useCallback(() => {
    setMowerStatus(prev => ({
      ...prev,
      isRunning: false,
      currentSpeed: 0,
    }));
  }, []);

  const toggleCutting = () => {
    if (!mowerStatus.isConnected) return;
    setMowerStatus(prev => ({
      ...prev,
      isCutting: !prev.isCutting,
      bladeSpeed: !prev.isCutting ? 2800 : 0,
    }));
  };

  const returnToBase = () => {
    if (!mowerStatus.isConnected) return;
    setMowerStatus(prev => ({
      ...prev,
      isRunning: true,
      currentSpeed: 50,
      position: { x: 10, y: 10 },
    }));
    setTimeout(() => {
      setMowerStatus(prev => ({
        ...prev,
        isRunning: false,
        currentSpeed: 0,
        isCutting: false,
        bladeSpeed: 0,
      }));
    }, 3000);
  };

  const addMap = () => {
    if (!newMapName.trim() || maps.length >= 10) return;
    
    const newMap: MapData = {
      id: Date.now().toString(),
      name: newMapName,
      area: Math.floor(Math.random() * 500) + 100,
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: false,
      progress: 0,
      thumbnail: ['🌿', '🌳', '🌱', '🏡', '🌾', '🍃', '🌲', '🌷'][maps.length % 8],
    };
    
    setMaps([...maps, newMap]);
    setNewMapName('');
    setShowAddMap(false);
  };

  const deleteMap = (id: string) => {
    setMaps(maps.filter(m => m.id !== id));
  };

  const activateMap = (id: string) => {
    setMaps(maps.map(m => ({ ...m, isActive: m.id === id })));
    setMowerStatus(prev => ({ ...prev, currentMapId: id }));
  };

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {!mowerStatus.isConnected && !showPairing && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <RiRobot2Line className="w-10 h-10 text-slate-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Mower Disconnected</h2>
            <p className="text-slate-400 mb-6">
              Connect to your GoatBot Unicut H1 via E-KANG Cloud.
            </p>
            
            {isConnecting ? (
              <div className="py-4">
                <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-400">Connecting via Alibaba Cloud IoT...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setShowPairing(true)}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FiPlus className="w-5 h-5" />
                  Setup New Mower
                </button>
                <button
                  onClick={connectToMower}
                  className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiRefreshCw className="w-5 h-5" />
                  Reconnect
                </button>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-xs text-slate-500">
                Made by E-KANG Intelligent Technology (移康智能科技)
              </p>
            </div>
          </div>
        </div>
      )}

      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <RiRobot2Line className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">GoatBot Unicut H1</h1>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${mowerStatus.isConnected ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  {mowerStatus.isConnected ? <FiCloud className="w-4 h-4 text-emerald-400" /> : <FiAlertTriangle className="w-4 h-4 text-red-400" />}
                  <span className={`text-sm font-medium ${mowerStatus.isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                    {mowerStatus.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-slate-300">
                <FiBattery className={`w-4 h-4 ${mowerStatus.batteryLevel < 20 ? 'text-red-400' : 'text-emerald-400'}`} />
                <span>{mowerStatus.batteryLevel}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <FiWifi className="w-4 h-4 text-blue-400" />
                <span>{mowerStatus.signalStrength}%</span>
              </div>
            </div>
            
            <button 
              onClick={mowerStatus.isConnected ? disconnectMower : () => setShowPairing(true)}
              className={`p-2.5 rounded-xl transition-all ${mowerStatus.isConnected ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}
            >
              <FiPower className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2">
            {[
              { id: 'control', icon: FiNavigation, label: 'Control' },
              { id: 'maps', icon: FiMap, label: 'Maps' },
              { id: 'schedule', icon: FiCalendar, label: 'Schedule' },
              { id: 'settings', icon: FiSettings, label: 'Settings' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => mowerStatus.isConnected && setActiveTab(tab.id as any)}
                disabled={!mowerStatus.isConnected}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-emerald-500/10 text-emerald-400' : mowerStatus.isConnected ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-600 cursor-not-allowed'}`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline\">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'control' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
                <h2 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                  <FiGlobe className="w-4 h-4" />
                  Connection Path
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                      <FiBluetooth className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-xs text-slate-500">BLE</span>
                  </div>
                  <div className="flex-1 h-px bg-emerald-500/50 mx-2" />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <FiWifi className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-xs text-slate-500">WiFi</span>
                  </div>
                  <div className="flex-1 h-px bg-emerald-500/50 mx-2" />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <FiCloud className="w-5 h-5 text-orange-400" />
                    </div>
                    <span className="text-xs text-slate-500">Aliyun</span>
                  </div>
                  <div className="flex-1 h-px bg-emerald-500/50 mx-2" />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <FiSmartphone className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-xs text-slate-500">You</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <RiSpeedLine className="w-4 h-4" />
                    Speed
                  </div>
                  <div className="text-2xl font-bold text-white">{mowerStatus.currentSpeed}<span className="text-sm font-normal text-slate-500">%</span></div>
                </div>
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <FiScissors className="w-4 h-4" />
                    Blade
                  </div>
                  <div className={`text-2xl font-bold ${mowerStatus.isCutting ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {mowerStatus.bladeSpeed > 0 ? `${mowerStatus.bladeSpeed}` : 'OFF'}
                    {mowerStatus.bladeSpeed > 0 && <span className="text-sm font-normal text-slate-500">RPM</span>}
                  </div>
                </div>
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <FiClock className="w-4 h-4" />
                    Runtime
                  </div>
                  <div className="text-2xl font-bold text-white">{formatTime(mowerStatus.totalCuttingTime)}</div>
                </div>
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <FiActivity className="w-4 h-4" />
                    Grass Cut
                  </div>
                  <div className="text-2xl font-bold text-white">{(mowerStatus.grassCut / 1000).toFixed(1)}<span className="text-sm font-normal text-slate-500">k m²</span></div>
                </div>
              </div>
            </div>

            < className="space-y-4">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <FiNavigation className="w-5 h-5 text-emerald-400" />
                  Manual Control
                </h2>
                
                <div className="flex flex-col items-center gap-6">
                  <VirtualJoystick 
                    onMove={handleJoystickMove}
                    onStop={handleJoystickStop}
                    disabled={!mowerStatus.isConnected}
                  />
                  
                  <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                    <button disabled={!mowerStatus.isConnected} className="p-4 rounded-xl bg-slate-800 text-slate-300 transition-colors flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                      <FiRotateCcw className="w-5 h-5" />
                      <span className="text-xs">Turn L</span>
                    </button>
                    <button
                      onClick={toggleCutting}
                      disabled={!mowerStatus.isConnected}
                      className={`p-4 rounded-xl transition-colors flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${mowerStatus.isCutting ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}
                    >
                      <FiScissors className="w-5 h-5" />
                      <span className="text-xs\">{mowerStatus.isCutting ? 'Stop' : 'Cut'}</span>
                    </button>
                    <button disabled={!mowerStatus.isConnected} className="p-4 rounded-xl bg-slate-800 text-slate-300 transition-colors flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                      <FiRotateCcw className="w-5 h-5 rotate-180" />
                      <span className="text-xs">Turn R</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={returnToBase}
                    disabled={!mowerStatus.isConnected}
                    className="w-full max-w-xs py-3 rounded-xl bg-slate-800 text-slate-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiHome className="w-5 h-5" />
                    Return to Base
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maps' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Lawn Maps</h2>
                <p className="text-slate-400 text-sm">Manage up to 10 different lawn areas</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white\">{maps.length}<span className="text-slate-500 text-lg\">/10</span></p>
              </div>
            </div>

            {maps.length < 10 && (
              <button onClick={() => setShowAddMap(true)} className="w-full py-4 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2">
                <FiPlus className="w-5 h-5" />
                Create New Map
              </button>
            )}

            {showAddMap && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 w-full max-w-md">
                  <h3 className="text-lg font-bold text-white mb-4\">Create New Map</h3>
                  <input
                    type="text"
                    value={newMapName}
                    onChange={(e) => setNewMapName(e.target.value)}
                    placeholder="Enter map name..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 mb-4"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setShowAddMap(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">Cancel</button>
                    <button onClick={addMap} disabled={!newMapName.trim()} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50\">Create Map</button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {maps.map(map => (
                <div key={map.id} className={`relative bg-slate-900 rounded-2xl border-2 p-4 transition-all ${map.isActive ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'border-slate-800 hover:border-slate-700'}`}>
                  {map.isActive && <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"><FiCheckCircle className="w-4 h-4 text-white" /></div>}
                  <div className="aspect-video rounded-xl bg-slate-800 flex items-center justify-center text-4xl mb-3\">{map.thumbnail}</div>
                  <h3 className="font-semibold text-white truncate\">{map.name}</h3>
                  <p className="text-sm text-slate-400\">{map.area} m²</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500\">{format(map.lastUsed, 'MMM d')}</span>
                    <div className="flex gap-1">
                      {!map.isActive && <button onClick={() => activateMap(map.id)} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors\"><FiPlay className="w-4 h-4" /></button>}
                      <button onClick={() => deleteMap(map.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors\"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white\">Cutting Schedule</h2>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className={`rounded-xl border p-4 text-center ${i < 5 ? 'bg-slate-900 border-slate-800' : 'bg-slate-900/50 border-slate-800/50'}`}>
                  <p className={`text-sm font-medium ${i < 5 ? 'text-white' : 'text-slate-500'}`}>{day}</p>
                  {i < 3 && <div className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs mt-2\">09:00</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-xl font-bold text-white\">Settings</h2>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h3 className="font-semibold text-white mb-4\">About</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400\">Model</span><span className="text-white\">GoatBot Unicut H1</span></div>
                <div className="flex justify-between"><span className="text-slate-400\">Manufacturer</span><span className="text-white\">E-KANG Intelligent Technology</span></div>
                <div className="flex justify-between"><span className="text-slate-400\">Manufacturer (CN)</span><span className="text-white\">移康智能科技</span></div>
                <div className="flex justify-between\"><span className="text-slate-400\">Firmware</span><span className="text-white\">v2.4.1</span></div>
                <div className="flex justify-between\"><span className="text-slate-400\">Serial Number</span><span className="text-white font-mono\">GB-H1-78432</span></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
