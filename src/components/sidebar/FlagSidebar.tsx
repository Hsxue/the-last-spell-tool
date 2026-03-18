import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';

interface FlagConfig {
  marker: string;
  color: string;
  size: number;
}

// Define the flags using the exact same structure from existing constants
export const FLAG_CONFIG: Record<string, FlagConfig> = {
  EnemyMagnet: { marker: '★', color: '#FF4444', size: 10 },
  FogSpawner: { marker: '●', color: '#9400D3', size: 10 },
  NessieBoss1: { marker: 'B1', color: '#FF6347', size: 9 },
  NessieBoss2: { marker: 'B2', color: '#FF4500', size: 9 },
  NessieBoss3: { marker: 'B3', color: '#DC143C', size: 9 },
  NessieEgg: { marker: '◆', color: '#00CED1', size: 10 },
  Altar: { marker: '✝', color: '#FFD700', size: 10 },
  MagicCircle: { marker: '●', color: '#9400D3', size: 12 },
};

export const ZONE_FLAGSARRAY = [
  // Base directions
  'Zone_N',
  'Zone_S',
  'Zone_E',
  'Zone_W',
  // Diagonal directions
  'Zone_NW',
  'Zone_SW',
  'Zone_SE',
  'Zone_NE',
  // Composite directions
  'Zone_E_SE',
  'Zone_N_NW',
  'Zone_S_SE',
  'Zone_S_SW',
  'Zone_W_NW',
  'Zone_W_SW',
];

export const ZONE_COLORS: Record<string, string> = {
  // Base directions - Pink
  'Zone_N': '#FFB6C1',
  'Zone_S': '#FFB6C1',
  'Zone_E': '#FFB6C1',
  'Zone_W': '#FFB6C1',
  // Diagonal directions - Light Blue
  'Zone_NW': '#ADD8E6',
  'Zone_SW': '#ADD8E6',
  'Zone_SE': '#ADD8E6',
  'Zone_NE': '#ADD8E6',
  // Composite directions - Light Green / Purple
  'Zone_E_SE': '#98FB98',
  'Zone_N_NW': '#98FB98',
  'Zone_S_SE': '#DDA0DD',
  'Zone_S_SW': '#98FB98',
  'Zone_W_NW': '#DDA0DD',
  'Zone_W_SW': '#98FB98',
};

const CATEGORY_COLORS: Record<string, string> = {
  Special: '#FF4444',
  Zones: '#ADD8E6',
  All: '#95A5A6'
};

const CATEGORIES = [
  'All',
  'Special',
  'Zones'
];

interface FlagSidebarProps {
  selectedFlag: string | null;
  setSelectedFlag: (id: string | null) => void;
  flagLayerVisible: boolean;
  zoneLayerVisible: boolean;
  setFlagLayerVisible: (visible: boolean) => void;
  setZoneLayerVisible: (visible: boolean) => void;
  removeMode: boolean;
  setRemoveMode: (enabled: boolean) => void;
  setIsRemoving: (removing: boolean) => void;
}

const FlagSidebar: React.FC<FlagSidebarProps> = ({
  selectedFlag,
  setSelectedFlag,
  flagLayerVisible,
  zoneLayerVisible,
  setFlagLayerVisible,
  setZoneLayerVisible,
  setIsRemoving,
  removeMode,
  setRemoveMode
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Group flags by category
  const flagsByCategory = useMemo(() => {
    const grouped: Record<string, Array<{ id: string; name: string; category: string }>> = {};
    
    // Initialize with all categories
    CATEGORIES.forEach(cat => {
      if (cat !== 'All') {
        grouped[cat] = [];
      }
    });
    
    // Add special flags
    Object.keys(FLAG_CONFIG).forEach(flagId => {
      grouped.Special.push({
        id: flagId,
        name: flagId,
        category: 'Special'
      });
    });
    
    // Add zone flags
    ZONE_FLAGSARRAY.forEach(flagId => {
      grouped.Zones.push({
        id: flagId,
        name: flagId,
        category: 'Zones'
      });
    });
    
    return grouped;
  }, []);

  // Filter flags based on selected category
  const filteredFlags = useMemo(() => {
    if (selectedCategory === 'All') {
      return [
        ...Object.keys(FLAG_CONFIG).map(id => ({ id, name: id, category: 'Special' })),
        ...ZONE_FLAGSARRAY.map(id => ({ id, name: id, category: 'Zones' }))
      ];
    }
    return flagsByCategory[selectedCategory] || [];
  }, [flagsByCategory, selectedCategory]);

  // Calculate flag counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(flagsByCategory).forEach(([category, flags]) => {
      counts[category] = flags.length;
    });
    // Count for 'All' category
    counts.All = Object.keys(FLAG_CONFIG).length + ZONE_FLAGSARRAY.length;
    return counts;
  }, [flagsByCategory]);

  // Toggle remove mode
  const toggleRemoveMode = () => {
    setRemoveMode(!removeMode);
    setIsRemoving(!removeMode);
  };

  // Toggle visibility for flag category
  const toggleCategoryVisibility = (category: string) => {
    if (category === 'Special') {
      setFlagLayerVisible(!flagLayerVisible);
    } else if (category === 'Zones') {
      setZoneLayerVisible(!zoneLayerVisible);
    }
  };

  // Get visibility status for a category
  const getCategoryVisibility = (category: string) => {
    if (category === 'Special') {
      return flagLayerVisible;
    } else if (category === 'Zones') {
      return zoneLayerVisible;
    }
    return false; // For 'All', we don't have direct visibility control
  };

  return (
    <div className="w-64 h-full bg-gray-800 text-white flex flex-col">
      {/* Header with Title */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Flags</h2>
        
        {/* Category Filter Dropdown */}
        <div className="mt-2">
          <ShadcnSelect value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-gray-700 text-white w-full">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white">
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category} className="focus:bg-gray-600">
                  {category} {categoryCounts[category] !== undefined ? `(${categoryCounts[category]})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </ShadcnSelect>
        </div>
        
        {/* Remove Mode Toggle Button */}
        <div className="mt-4">
          <Button
            onClick={toggleRemoveMode}
            variant={removeMode ? "destructive" : "secondary"}
            className={`w-full ${removeMode ? "bg-red-700 hover:bg-red-600" : ""}`}
          >
            {removeMode ? "Remove Mode ON" : "Remove Mode OFF"}
          </Button>
        </div>
      </div>
      
      {/* Scrollable Flag List */}
      <div className="flex-1 overflow-y-auto p-2">
        {CATEGORIES.filter(cat => cat !== 'All').map(category => {
          const flagsInCat = flagsByCategory[category] || [];
          
          // Only show categories that have flags and either we're in "All" view or this is the selected category
          const shouldShow = (selectedCategory === 'All' || selectedCategory === category) && flagsInCat.length > 0;
          
          return shouldShow && (
            <div key={category} className="mb-4">
              <div className="flex items-center justify-between mb-2 px-2 py-1">
                <div className="flex items-center">
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: CATEGORY_COLORS[category] }}
                  ></span>
                  <h3 className="text-sm font-medium">{category} ({flagsInCat.length})</h3>
                </div>
                <input
                  type="checkbox"
                  checked={getCategoryVisibility(category)}
                  onChange={() => toggleCategoryVisibility(category)}
                  className="rounded h-4 w-4"
                />
              </div>
              
              {flagsInCat.map(flag => {
                // Get the color for the specific flag
                const flagColor = flag.category === 'Special' 
                  ? FLAG_CONFIG[flag.id as keyof typeof FLAG_CONFIG]?.color 
                  : ZONE_COLORS[flag.id] || '#999';
                
                return (
                <div
                  key={flag.id}
                  className={`p-2 mb-1 rounded cursor-pointer flex items-center ${
                    selectedFlag === flag.id
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedFlag(flag.id === selectedFlag ? null : flag.id)}
                >
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: flagColor }}
                  ></span>
                  <span className="text-sm">{flag.name}</span>
                </div>
              )})}
            </div>
          );
        })}
        
        {/* Show "All" view if it's the selected category and not showing individual categories */}
        {selectedCategory === 'All' && CATEGORIES.filter(cat => cat !== 'All').every(cat => 
          !((selectedCategory === 'All' || selectedCategory === cat) && (flagsByCategory[cat] || []).length > 0)) && (
          <>
            {filteredFlags.map(flag => {
              // Get the color for the specific flag
              const flagColor = flag.category === 'Special' 
                ? FLAG_CONFIG[flag.id as keyof typeof FLAG_CONFIG]?.color 
                : ZONE_COLORS[flag.id] || '#999';
              
              return (
                <div
                  key={flag.id}
                  className={`p-2 mb-1 rounded cursor-pointer flex items-center ${
                    selectedFlag === flag.id
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedFlag(flag.id === selectedFlag ? null : flag.id)}
                >
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: flagColor }}
                  ></span>
                  <span className="text-sm">{flag.name}</span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default FlagSidebar;