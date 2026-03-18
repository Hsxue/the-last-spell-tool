import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';

interface BuildingBlueprint {
  id: string;
  name: string;
  category: string;
}

interface BuildingSidebarProps {
  buildingBlueprints: BuildingBlueprint[]; // BUILDING_BLUEPRINTS from data file
  selectedBuilding: string | null;
  setSelectedBuilding: (id: string | null) => void;
  buildingHealth: number;
  setBuildingHealth: (health: number) => void;
  removeMode: boolean;
  setRemoveMode: (enabled: boolean) => void;
  setIsRemoving: (removing: boolean) => void;
}

const CATEGORIES = [
  'All',
  'House',
  'Resource',
  'Defense',
  'Utility',
  'Industrial',
  'Storage',
  'Infrastructure',
  'Military',
  'Research',
  'Special',
  'Decorative'
];

const CATEGORY_COLORS: Record<string, string> = {
  House: '#FF6B6B',
  Resource: '#4ECDC4',
  Defense: '#FFA07A',
  Utility: '#98D8C8',
  Industrial: '#F7DC6F',
  Storage: '#BB8FCE',
  Infrastructure: '#85C1E9',
  Military: '#F1948A',
  Research: '#85C1E9',
  Special: '#F7DC6F',
  Decorative: '#FAD7A0',
  All: '#95A5A6'
};

const BuildingSidebar: React.FC<BuildingSidebarProps> = ({
  buildingBlueprints,
  selectedBuilding,
  setSelectedBuilding,
  buildingHealth,
  setBuildingHealth,
  setIsRemoving,
  removeMode,
  setRemoveMode
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Group buildings by category
  const buildingsByCategory = useMemo(() => {
    const grouped: Record<string, BuildingBlueprint[]> = {};
    
    // Initialize with all categories
    CATEGORIES.forEach(cat => {
      if (cat !== 'All') {
        grouped[cat] = [];
      }
    });
    
    // Categorize buildings
    buildingBlueprints.forEach(building => {
      if (!grouped[building.category]) {
        grouped[building.category] = [];
      }
      grouped[building.category].push(building);
    });
    
    return grouped;
  }, [buildingBlueprints]);

  // Filter buildings based on selected category
  const filteredBuildings = useMemo(() => {
    if (selectedCategory === 'All') {
      return buildingBlueprints;
    }
    return buildingsByCategory[selectedCategory] || [];
  }, [buildingBlueprints, buildingsByCategory, selectedCategory]);

  // Calculate building counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(buildingsByCategory).forEach(([category, buildings]) => {
      counts[category] = buildings.length;
    });
    // Count for 'All' category
    counts.All = buildingBlueprints.length;
    return counts;
  }, [buildingsByCategory, buildingBlueprints]);

  // Handle health input change
  const handleHealthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      const clampedValue = Math.min(Math.max(1, value), 999);
      setBuildingHealth(clampedValue);
    }
  };

  // Toggle remove mode
  const toggleRemoveMode = () => {
    setRemoveMode(!removeMode);
    setIsRemoving(!removeMode);
  };

  return (
    <div className="w-64 h-full bg-gray-800 text-white flex flex-col">
      {/* Header with Title */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Buildings</h2>
        
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
        
        {/* Health Input */}
        <div className="mt-4">
          <label className="block text-sm mb-1">Health:</label>
          <Input
            type="number"
            min="1"
            max="999"
            value={buildingHealth}
            onChange={handleHealthChange}
            className="bg-gray-700 text-white w-full"
          />
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
      
      {/* Scrollable Building List */}
      <div className="flex-1 overflow-y-auto p-2">
        {CATEGORIES.filter(cat => cat !== 'All').map(category => {
          const buildingsInCat = buildingsByCategory[category] || [];
          
          // Only show categories that have buildings and either we're in "All" view or this is the selected category
          const shouldShow = (selectedCategory === 'All' || selectedCategory === category) && buildingsInCat.length > 0;
          
          return shouldShow && (
            <div key={category} className="mb-4">
              <div className="flex items-center justify-between mb-2 px-2 py-1">
                <div className="flex items-center">
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: CATEGORY_COLORS[category] }}
                  ></span>
                  <h3 className="text-sm font-medium">{category} ({buildingsInCat.length})</h3>
                </div>
              </div>
              
              {buildingsInCat.map(building => (
                <div
                  key={building.id}
                  className={`p-2 mb-1 rounded cursor-pointer flex items-center ${
                    selectedBuilding === building.id
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedBuilding(building.id === selectedBuilding ? null : building.id)}
                >
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: CATEGORY_COLORS[category] }}
                  ></span>
                  <span className="text-sm">{building.name}</span>
                </div>
              ))}
            </div>
          );
        })}
        
        {/* Show "All" view if it's the selected category */
        selectedCategory === 'All' && (
          <>
            {filteredBuildings.map(building => {
              // Find the category of this building to get the right color
              const buildingCategory = building.category;
              const categoryColor = CATEGORY_COLORS[buildingCategory] || '#95A5A6';
              
              return (
                <div
                  key={building.id}
                  className={`p-2 mb-1 rounded cursor-pointer flex items-center ${
                    selectedBuilding === building.id
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedBuilding(building.id === selectedBuilding ? null : building.id)}
                >
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: categoryColor }}
                  ></span>
                  <span className="text-sm">{building.name}</span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default BuildingSidebar;