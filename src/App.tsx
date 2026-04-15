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
import { LocalizationTab } from './components/localization/LocalizationTab';
import { LocalizationTutorialDialog } from './components/localization/LocalizationTutorialDialog';
import { FeatureNotesDialog } from './components/localization/FeatureNotesDialog';
import { TileMapImportButton } from './components/TileMapImportButton';
import { BuiltinMapButton } from './components/BuiltinMapSelector';
import { ModInstaller } from './components/ModInstaller';
import { BUILDING_BLUEPRINTS } from './data/buildingBlueprints';
import { useMapStore } from './store/mapStore';
import { useUIStore } from './store/uiStore';
import { useXMLMode } from './hooks/useXMLMode';
import { XMLEditorModal } from './components/XMLEditor/XMLEditorModal';
import { weaponSchema } from './types/XMLSchemas';
import { saveMapAsTileMap, saveBuildings } from './lib/mapXmlExporter';
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
  FileCode,
  Languages,
} from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from './components/ui/tooltip';
import type { SidebarTab, FeatureTab } from './types/map';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useCallback } from 'react';
import { LanguageSwitcher } from './components/ui/LanguageSwitcher';

// ============================================================================
// Header Component
// ============================================================================

interface HeaderProps {
  onOpenXMLEditor?: () => void;
}

function Header({ onOpenXMLEditor }: HeaderProps) {
  const { t } = useTranslation('common');
  const addToast = useUIStore((state) => state.addToast);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportAll = useCallback(async () => {
    const { exportAllStoresToZip } = await import('./lib/state-import-export');
    try {
      await exportAllStoresToZip();
      addToast({
        title: t('nav.exportSuccess'),
        description: t('nav.exportSuccessDesc'),
        type: 'success',
      });
    } catch (e) {
      addToast({
        title: t('nav.exportFailed'),
        description: (e as Error).message,
        type: 'error',
      });
    }
  }, [addToast, t]);

  const handleImportFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const { importStateFromZip } = await import('./lib/state-import-export');
      const report = await importStateFromZip(file);

      if (report.success) {
        addToast({
          title: t('nav.importSuccess'),
          description: t('nav.importSuccessDesc', { count: report.storesImported.length }),
          type: 'success',
        });
        window.location.reload();
      } else {
        addToast({
          title: t('nav.importFailed'),
          description: report.errors[0] ?? t('nav.importFailedDesc'),
          type: 'error',
        });
      }
    } catch (e) {
      addToast({
        title: t('nav.importFailed'),
        description: (e as Error).message,
        type: 'error',
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [addToast, t]);

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-4 h-full">
        <div className="flex items-center gap-2 h-full">
          <MapIcon className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold whitespace-nowrap">{t('nav.title')}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenXMLEditor}
          title={t('nav.openXmlEditor')}
        >
          <FileCode className="h-4 w-4 mr-2" />
          {t('nav.xmlEditor')}
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportAll}
          title={t('nav.exportStateTooltip')}
        >
          <Save className="h-4 w-4 mr-1" />
          {t('nav.saveState')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          title={t('nav.importStateTooltip')}
        >
          <FolderOpen className="h-4 w-4 mr-1" />
          {isImporting ? t('nav.loading') : t('nav.loadState')}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleImportFile}
          className="hidden"
        />
        <div className="w-px h-6 bg-border mx-1" />
        <FeatureNotesDialog />
        <LocalizationTutorialDialog />
        <div className="w-px h-6 bg-border mx-1" />
        <ModInstaller />
        <LanguageSwitcher />
      </div>
    </header>
  );
}

// ============================================================================
// Feature Tabs Component
// ============================================================================

const featureTabsConfig: { id: FeatureTab; icon: React.ElementType }[] = [
  { id: 'mapEditor', icon: MapIcon },
   { id: 'gameConfig', icon: Settings },
   { id: 'localization', icon: Languages },
   { id: 'weaponSkill', icon: Sword },
];

const featureTabLabels: Record<FeatureTab, string> = {
  mapEditor: 'tabs.mapEditor',
  gameConfig: 'tabs.gameConfig',
  localization: 'tabs.localization',
  weaponSkill: 'tabs.weaponSkill',
};

function FeatureTabs() {
  const { t } = useTranslation('common');
  const { activeFeatureTab, setActiveFeatureTab } = useUIStore();
  return (
    <div className="h-12 border-b border-border bg-background flex items-center px-4 gap-2 sticky top-14 z-40">
      {featureTabsConfig.map((tab) => (
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
          {t(featureTabLabels[tab.id])}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Sidebar Component
// ============================================================================

const sidebarTabsConfig: { id: SidebarTab; icon: React.ElementType }[] = [
  { id: 'terrain', icon: Mountain },
  { id: 'building', icon: Building2 },
  { id: 'flag', icon: Flag },
  { id: 'config', icon: Settings },
];

const sidebarTabLabels: Record<SidebarTab, string> = {
  terrain: 'sidebar.terrain',
  building: 'sidebar.buildings',
  flag: 'sidebar.flags',
  config: 'sidebar.config',
  map: 'sidebar.tools',
};

function Sidebar() {
  const { t } = useTranslation('common');
  const { activeTab, setActiveTab } = useUIStore();
  const { 
    brushSize, 
    setBrushSize, 
    layerVisibility, 
    setLayerVisibility, 
    width, 
    height,
    mapName,
    setMapName,
    mapData,
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
  const { addToast } = useUIStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Map File Operation Handlers
  const handleNewMap = () => {
    addToast({
      title: t('config.newMap'),
      description: t('config.newMapDesc'),
      type: 'info',
    });
  };

  const handleSaveMap = () => {
    if (!mapData) {
      addToast({
        title: t('config.cannotSave'),
        description: t('config.cannotSaveDesc'),
        type: 'warning',
      });
      return;
    }

    saveMapAsTileMap(
      width,
      height,
      mapData.terrain,
      mapData.flags,
      mapName
    );

    addToast({
      title: t('config.saveSuccess'),
      description: t('config.saveSuccessDesc', { name: mapName, flags: mapData.flags.size, terrain: mapData.terrain.size }),
      type: 'success',
      duration: 3000,
    });
  };

  const handleExportBuildings = () => {
    if (!mapData || mapData.buildings.length === 0) {
      addToast({
        title: t('config.noBuildings'),
        description: t('config.noBuildingsDesc'),
        type: 'warning',
      });
      return;
    }

    saveBuildings(mapData.buildings, mapName);

    addToast({
      title: t('config.exportBuildingsSuccess'),
      description: t('config.exportBuildingsSuccessDesc', { name: mapName, count: mapData.buildings.length }),
      type: 'success',
      duration: 3000,
    });
  };

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
        {sidebarTabsConfig.map((tab) => (
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
    <aside className="w-72 border-r border-border bg-card flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-3">
        <span className="font-medium">{t('sidebar.tools')}</span>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {sidebarTabsConfig.map((tab) => (
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
            <span>{t(sidebarTabLabels[tab.id])}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'terrain' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">{t('toolbar.brushSize')}</h3>
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
              <h3 className="text-sm font-medium mb-2">{t('sidebar.terrain')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['Dirt', 'Stone', 'Crater', 'Empty'] as const).map((terrain) => (
                  <Tooltip key={terrain}>
                    <TooltipTrigger asChild>
                      <Button
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
                        {t(`terrain.${terrain.toLowerCase()}`)}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{t(`terrain.${terrain.toLowerCase()}Desc`)}</p>
                    </TooltipContent>
                  </Tooltip>
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
            {/* Map File Operations */}
            <div>
              <h3 className="text-sm font-medium mb-2">{t('config.mapFileOps')}</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleNewMap}
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  {t('config.newMap')}
                </Button>
                <TileMapImportButton className="w-full" />
                <BuiltinMapButton className="w-full" />
                <Button
                  variant="default"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleSaveMap}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t('config.saveMap')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleExportBuildings}
                  title={t('config.exportBuildingsTooltip')}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  {t('config.exportBuildings')}
                </Button>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-medium mb-2">{t('config.mapName')}</h3>
              <input
                type="text"
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                placeholder={t('config.mapNamePlaceholder')}
                className="w-full h-9 rounded-md border border-input px-3 bg-background text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('config.filenameHint', { name: mapName })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">{t('config.mapSettings')}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm w-16">{t('config.width')}:</span>
                  <input
                    type="number"
                    value={width}
                    readOnly
                    className="flex-1 h-9 rounded-md border border-input px-3"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm w-16">{t('config.height')}:</span>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">{t('layers.title')}</span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">{t('layers.tooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </h3>
        <div className="space-y-2">
          {[
            { key: 'grid' as const, label: 'layers.grid', desc: 'layers.gridDesc' },
            { key: 'zones' as const, label: 'layers.zones', desc: 'layers.zonesDesc' },
            { key: 'buildings' as const, label: 'layers.buildings', desc: 'layers.buildingsDesc' },
            { key: 'flags' as const, label: 'layers.flags', desc: 'layers.flagsDesc' },
          ].map(({ key, label, desc }) => (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layerVisibility[key as keyof typeof layerVisibility]}
                    onChange={(e) =>
                      setLayerVisibility(key as keyof typeof layerVisibility, e.target.checked)
                    }
                    className="rounded border-border"
                  />
                  {t(label)}
                </label>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">{t(desc)}</p>
              </TooltipContent>
            </Tooltip>
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
  const { t } = useTranslation('common');
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
      <span className="text-sm tabular-nums min-w-[8ch] text-center font-mono">
        {viewport.zoom.toFixed(2)}x
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
        title={t('toolbar.resetView')}
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
  const { t } = useTranslation('common');
  return (
    <div className="flex-1 flex overflow-hidden h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full">
        <div className="relative flex-1 overflow-hidden">
          <MapCanvas />
          
          {/* Toolbar - Canvas Overlay (Top Right) */}
          <Toolbar />
          
          {/* Operation Hints - Canvas Overlay (Bottom Right) */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 rounded-lg border bg-card p-3 text-xs shadow-lg backdrop-blur-sm bg-card/95">
            <h4 className="font-medium text-foreground text-center mb-1">{t('hints.title')}</h4>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 justify-center whitespace-nowrap">
                <kbd className="rounded bg-muted px-2 py-0.5 font-mono text-foreground shrink-0">{t('hints.middleClick')}</kbd>
                <span className="text-muted-foreground">{t('hints.panCanvas')}</span>
              </div>
              <div className="flex items-center gap-2 justify-center whitespace-nowrap">
                <kbd className="rounded bg-muted px-2 py-0.5 font-mono text-foreground shrink-0">{t('hints.scroll')}</kbd>
                <span className="text-muted-foreground">{t('hints.zoomView')}</span>
              </div>
              <div className="flex items-center gap-2 justify-center whitespace-nowrap">
                <kbd className="rounded bg-muted px-2 py-0.5 font-mono text-foreground shrink-0">{t('hints.rightClick')}</kbd>
                <span className="text-muted-foreground">{t('hints.viewTile')}</span>
              </div>
            </div>
          </div>
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

function LocalizationContent() {
  return <LocalizationTab />;
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
      case 'localization':
        return <LocalizationContent />;
      case 'weaponSkill':
        return <WeaponSkillContent />;
      default:
        return <MapEditorContent />;
    }
  };

  return (
    <div className="flex-1 overflow-hidden h-full">
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
  const { t } = useTranslation('common');
  // Test data for XML Editor
  const [testWeapon, setTestWeapon] = useState({
    id: 1,
    name: 'Test Sword',
    damage: 15,
    rare: false,
  });

  // XML Mode hook for the editor
  const {
    isXMLMode,
    openXMLMode,
    closeXMLMode,
    handleApply,
    xmlContent,
  } = useXMLMode({
    gameObject: testWeapon,
    schema: weaponSchema,
    onApply: (updatedWeapon) => {
      setTestWeapon(updatedWeapon);
    },
  });

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <Header onOpenXMLEditor={openXMLMode} />
        <FeatureTabs />
        <div className="flex-1 overflow-hidden">
          <MainContent />
        </div>
        <ToastDisplay />
        <XMLEditorModal
          isOpen={isXMLMode}
          onClose={closeXMLMode}
          value={xmlContent}
          onApply={handleApply}
          language="xml"
          title={t('xmlEditor.title')}
        />
      </div>
    </TooltipProvider>
  );
}

export default App;
