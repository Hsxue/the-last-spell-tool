/**
 * App Component
 * Main application layout with Header, FeatureTabs, and Main content area
 */

import { Button } from './components/ui/button';
import { MapCanvas } from './components/canvas';
import { MapStatusBar } from './components/MapStatusBar';
import BuildingSidebar from './components/sidebar/BuildingSidebar';
import FlagSidebar from './components/sidebar/FlagSidebar';
import { ConfigTabs } from './components/config';
import { WeaponSkillTab } from './components/weapon-skill/WeaponSkillTab';
import { BUILDING_BLUEPRINTS } from './data/buildingBlueprints';
import { useMapStore } from './store/mapStore';
import { useUIStore } from './store/uiStore';
import {
  Menu,
  Map as MapIcon,
  Mountain,
  Building2,
  Flag,
  Settings,
  ZoomIn,
  ZoomOut,
  Layers,
  Save,
  FolderOpen,
  FilePlus,
  X,
  Sword,
} from 'lucide-react';
import type { SidebarTab, FeatureTab } from './types/map';
import { useState } from 'react';

// ============================================================================
// Header Component
// ============================================================================

function Header() {
  const { addToast } = useUIStore();

  const handleNewMap = () => {
    addToast({
      title: 'New Map',
      description: 'Creating new map...',
      type: 'info',
    });
  };

  const handleOpenMap = () => {
    addToast({
      title: 'Open Map',
      description: 'Opening file dialog...',
      type: 'info',
    });
  };

  const handleSaveMap = () => {
    addToast({
      title: 'Save Map',
      description: 'Map saved successfully!',
      type: 'success',
    });
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <MapIcon className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">TileMap Editor</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleNewMap}
        >
          <FilePlus className="h-4 w-4 mr-2" />
          New
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenMap}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Open
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleSaveMap}
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </header>
  );
}

// ============================================================================
// Feature Tabs Component
// ============================================================================

const featureTabs: { id: FeatureTab; label: string; icon: React.ElementType }[] = [
  { id: 'mapEditor', label: '地图编辑器', icon: MapIcon },
  { id: 'gameConfig', label: '游戏配置', icon: Settings },
  { id: 'weaponSkill', label: '武器与技能', icon: Sword },
];

function FeatureTabs() {
  const { activeFeatureTab, setActiveFeatureTab } = useUIStore();
  return (
    <div className="h-12 border-b border-border bg-background flex items-center px-4 gap-2 sticky top-14 z-40">
      {featureTabs.map((tab) => (
        <button 
          key={tab.id} 
          onClick={() => setActiveFeatureTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
            activeFeatureTab === tab.id 
              ? 'bg-card text-primary border border-b-border border-t-2 border-t-primary' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Sidebar Component
// ============================================================================

const tabs: { id: SidebarTab; label: string; icon: React.ElementType }[] = [
  { id: 'terrain', label: 'Terrain', icon: Mountain },
  { id: 'building', label: 'Buildings', icon: Building2 },
  { id: 'flag', label: 'Flags', icon: Flag },
  { id: 'config', label: 'Config', icon: Settings },
];

function Sidebar() {
  const { activeTab, setActiveTab } = useUIStore();
  const { 
    brushSize, 
    setBrushSize, 
    layerVisibility, 
    setLayerVisibility, 
    width, 
    height,
    selectedTerrain,
    setSelectedTerrain,
    setEditorMode,
    selectedBuilding,
    setSelectedBuilding,
    selectedFlag,
    setSelectedFlag,
    buildingHealth,
    setBuildingHealth,
    setIsRemoving,
    removeMode,
    setRemoveMode
  } = useMapStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!sidebarOpen) {
    return (
      <div className="w-12 border-r border-border bg-card flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="mb-4"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setActiveTab(tab.id)}
            className="mb-2"
          >
            <tab.icon className="h-5 w-5" />
          </Button>
        ))}
      </div>
    );
  }

  return (
    <aside className="w-72 border-r border-border bg-card flex flex-col h-screen">
      {/* Sidebar Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-3">
        <span className="font-medium">Tools</span>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              // Set appropriate mode when switching between tabs
              if (tab.id === 'terrain') {
                setEditorMode('terrain');
              } else if (tab.id === 'building') {
                setEditorMode('building');
              } else if (tab.id === 'flag') {
                setEditorMode('flag');
              } else {
                setEditorMode('building'); // Default for other tabs
              }
            }}
            className={`flex-1 py-2 px-2 text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'terrain' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Brush Size</h3>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm w-8">{brushSize}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Terrain Types</h3>
              <div className="grid grid-cols-2 gap-2">
                {['Dirt', 'Stone', 'Crater', 'Empty'].map((terrain) => (
                  <Button
                    key={terrain}
                    variant={selectedTerrain === terrain ? "default" : "outline"}
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      setSelectedTerrain(terrain as 'Dirt' | 'Stone' | 'Crater' | 'Empty');
                      setEditorMode('terrain');
                    }}
                  >
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor:
                          terrain === 'Dirt'
                            ? '#228B22'
                            : terrain === 'Stone'
                            ? '#808080'
                            : terrain === 'Crater'
                            ? '#8B4513'
                            : 'transparent',
                        border:
                          terrain === 'Empty' ? '1px solid currentColor' : 'none',
                      }}
                    />
                    {terrain}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'building' && (
          <div className="h-full overflow-hidden">
            <BuildingSidebar 
              buildingBlueprints={BUILDING_BLUEPRINTS.map(bp => ({ 
                id: bp.id, 
                name: bp.id.replace(/([A-Z])/g, ' $1').trim(),
                category: bp.category 
              }))} 
              selectedBuilding={selectedBuilding} 
              setSelectedBuilding={setSelectedBuilding} 
              buildingHealth={buildingHealth ?? 100}
              setBuildingHealth={setBuildingHealth}
              removeMode={removeMode === 'building'}
              setRemoveMode={(enabled) => setRemoveMode(enabled ? 'building' : null)}
              setIsRemoving={setIsRemoving}
            />
          </div>
        )}

        {activeTab === 'flag' && (
          <div className="h-full overflow-hidden">
            <FlagSidebar
              selectedFlag={selectedFlag}
              setSelectedFlag={setSelectedFlag}
              flagLayerVisible={layerVisibility.flags}
              zoneLayerVisible={layerVisibility.zones}
              setFlagLayerVisible={(visible) => setLayerVisibility('flags', visible)}
              setZoneLayerVisible={(visible) => setLayerVisibility('zones', visible)}
              removeMode={removeMode === 'flag'}
              setRemoveMode={(enabled) => setRemoveMode(enabled ? 'flag' : null)}
              setIsRemoving={setIsRemoving}
            />
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Map Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm w-16">Width:</span>
                  <input
                    type="number"
                    value={width}
                    readOnly
                    className="flex-1 h-9 rounded-md border border-input px-3"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm w-16">Height:</span>
                  <input
                    type="number"
                    value={height}
                    readOnly
                    className="flex-1 h-9 rounded-md border border-input px-3"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Layer Visibility */}
      <div className="border-t border-border p-4">
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Layers
        </h3>
        <div className="space-y-2">
          {[
            { key: 'grid', label: 'Grid' },
            { key: 'zones', label: 'Zones' },
            { key: 'buildings', label: 'Buildings' },
            { key: 'flags', label: 'Flags' },
            { key: 'occupied', label: 'Occupied' },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={layerVisibility[key as keyof typeof layerVisibility]}
                onChange={(e) =>
                  setLayerVisibility(key as keyof typeof layerVisibility, e.target.checked)
                }
                className="rounded border-border"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ============================================================================
// Toolbar Component
// ============================================================================

function Toolbar() {
  const { viewport, setViewport } = useMapStore();

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 bg-card border border-border rounded-lg p-2 shadow-lg">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setViewport({ zoom: Math.min(viewport.zoom + 2, 32) })}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <span className="text-sm tabular-nums min-w-[3ch] text-center">
        {viewport.zoom}px
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setViewport({ zoom: Math.max(viewport.zoom - 2, 8) })}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setViewport({ offsetX: 0, offsetY: 0 })}
        title="Reset View"
      >
        <MapIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ============================================================================
// Content Components
// ============================================================================

function MapEditorContent() {
  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 relative flex flex-col">
        <Toolbar />
        <div className="flex-1 relative">
          <MapCanvas />
        </div>
        <MapStatusBar />
      </div>
    </div>
  );
}

function GameConfigContent() {
  return <ConfigTabs />;
}

function WeaponSkillContent() {
  return <WeaponSkillTab />;
}

// ============================================================================
// Main Content Area
// ============================================================================

function MainContent() {
  const { activeFeatureTab } = useUIStore();
  
  const renderContent = () => {
    switch (activeFeatureTab) {
      case 'mapEditor':
        return <MapEditorContent />;
      case 'gameConfig':
        return <GameConfigContent />;
      case 'weaponSkill':
        return <WeaponSkillContent />;
      default:
        return <MapEditorContent />;
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      {renderContent()}
    </div>
  );
}

// ============================================================================
// Toast Display
// ============================================================================

function ToastDisplay() {
  const { toasts, removeToast } = useUIStore();
  
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 min-w-[200px] ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
              ? 'bg-destructive text-destructive-foreground'
              : toast.type === 'warning'
              ? 'bg-yellow-500 text-white'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.description && (
              <p className="text-xs opacity-90">{toast.description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => removeToast(toast.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main App Component
// ============================================================================

function App() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header />
      <FeatureTabs />
      <div className="flex-1 overflow-hidden min-h-0">
        <MainContent />
      </div>
      <ToastDisplay />
    </div>
  );
}

export default App;
