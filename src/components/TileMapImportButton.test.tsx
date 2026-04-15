import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TileMapImportButton } from './TileMapImportButton';
import { useMapStore } from '@/store/mapStore';
import { useUIStore } from '@/store/uiStore';
import { parseTileMap, parseBuildings } from '@/lib/mapXmlImporter';
import type { MapData, Building } from '@/types/map';

// Mock the stores and parser
vi.mock('@/store/mapStore', () => ({
  useMapStore: vi.fn(),
}));

vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

vi.mock('@/lib/mapXmlImporter', () => ({
  parseTileMap: vi.fn(),
  parseBuildings: vi.fn(),
}));

describe('TileMapImportButton', () => {
  const mockSetMapData = vi.fn();
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock store implementations
    (useMapStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = { setMapData: mockSetMapData };
      return selector ? selector(state) : state;
    });
    
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = { addToast: mockAddToast };
      return selector ? selector(state) : state;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render button with "Load Map" text', () => {
    render(<TileMapImportButton />);
    
    const button = screen.getByRole('button', { name: /load map/i });
    expect(button).toBeInTheDocument();
  });

  it('should render with FolderOpen icon', () => {
    render(<TileMapImportButton />);
    
    const button = screen.getByRole('button', { name: /load map/i });
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have hidden file input', () => {
    render(<TileMapImportButton />);
    
    const fileInput = screen.getByLabelText(/select tilemap and buildings xml files/i);
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveClass('hidden');
  });

  it('should accept multiple files', () => {
    render(<TileMapImportButton />);
    
    const fileInput = screen.getByLabelText(/select tilemap and buildings xml files/i);
    expect(fileInput).toHaveAttribute('multiple');
  });

  it('should accept .xml files', () => {
    render(<TileMapImportButton />);
    
    const fileInput = screen.getByLabelText(/select tilemap and buildings xml files/i);
    expect(fileInput).toHaveAttribute('accept', '.xml');
  });

  it('should show loading state while parsing', async () => {
    // Delay the parse to check loading state
    (parseTileMap as ReturnType<typeof vi.fn>).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            width: 51,
            height: 51,
            terrain: new Map(),
            buildings: [],
            flags: new Map(),
          } as MapData);
        }, 100);
      });
    });

    render(<TileMapImportButton />);
    
    const fileInput = screen.getByLabelText(/select tilemap and buildings xml files/i);
    const file = new File(['<TileMap><Width>51</Width><Height>51</Height></TileMap>'], 'TileMap.xml', { type: 'application/xml' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Check loading state is shown
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /loading/i })).toBeInTheDocument();
    });
  });

  it('should call setMapData when TileMap is parsed successfully', async () => {
    const mockMapData: MapData = {
      width: 51,
      height: 51,
      terrain: new Map([['0,0', 'Dirt']]),
      buildings: [],
      flags: new Map(),
    };

    (parseTileMap as ReturnType<typeof vi.fn>).mockReturnValue(mockMapData);
    (parseBuildings as ReturnType<typeof vi.fn>).mockReturnValue([]);

    render(<TileMapImportButton />);
    
    const fileInput = screen.getByLabelText(/select tilemap and buildings xml files/i);
    const file = new File(['<TileMap><Width>51</Width><Height>51</Height></TileMap>'], 'TileMap.xml', { type: 'application/xml' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockSetMapData).toHaveBeenCalledWith(mockMapData);
    });
  });

  it('should show success toast when parsing succeeds', async () => {
    const mockMapData: MapData = {
      width: 51,
      height: 51,
      terrain: new Map(),
      buildings: [],
      flags: new Map(),
    };

    (parseTileMap as ReturnType<typeof vi.fn>).mockReturnValue(mockMapData);
    (parseBuildings as ReturnType<typeof vi.fn>).mockReturnValue([]);

    render(<TileMapImportButton />);
    
    const fileInput = screen.getByLabelText(/select tilemap and buildings xml files/i);
    const file = new File(['<TileMap><Width>51</Width><Height>51</Height></TileMap>'], 'TileMap.xml', { type: 'application/xml' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        title: 'Map Loaded',
        description: 'Successfully loaded map with buildings',
        type: 'success',
        duration: 3000,
      });
    });
  });

  it('should show error toast when parsing fails', async () => {
    (parseTileMap as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Invalid XML format');
    });

    render(<TileMapImportButton />);
    
    const fileInput = screen.getByLabelText(/select tilemap and buildings xml files/i);
    const file = new File(['invalid xml'], 'TileMap.xml', { type: 'application/xml' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        title: 'Failed to Load Map',
        description: 'Invalid XML format',
        type: 'error',
        duration: 5000,
      });
    });
  });

  it('should parse both TileMap and Buildings files when selected together', async () => {
    const mockMapData: MapData = {
      width: 51,
      height: 51,
      terrain: new Map(),
      buildings: [],
      flags: new Map(),
    };

    const mockBuildings: Building[] = [
      { id: 'MagicCircle', x: 10, y: 10 },
    ];

    (parseTileMap as ReturnType<typeof vi.fn>).mockReturnValue(mockMapData);
    (parseBuildings as ReturnType<typeof vi.fn>).mockReturnValue(mockBuildings);

    render(<TileMapImportButton />);
    
    const fileInput = screen.getByLabelText(/select tilemap and buildings xml files/i);
    const tileMapFile = new File(['<TileMap><Width>51</Width><Height>51</Height></TileMap>'], 'TileMap.xml', { type: 'application/xml' });
    const buildingsFile = new File(['<Buildings></Buildings>'], 'Buildings.xml', { type: 'application/xml' });
    
    fireEvent.change(fileInput, { target: { files: [tileMapFile, buildingsFile] } });
    
    await waitFor(() => {
      expect(parseTileMap).toHaveBeenCalled();
      expect(parseBuildings).toHaveBeenCalled();
      expect(mockSetMapData).toHaveBeenCalledWith({
        ...mockMapData,
        buildings: mockBuildings,
      });
    });
  });

  it('should clear file input after processing', async () => {
    const mockMapData: MapData = {
      width: 51,
      height: 51,
      terrain: new Map(),
      buildings: [],
      flags: new Map(),
    };

    (parseTileMap as ReturnType<typeof vi.fn>).mockReturnValue(mockMapData);

    render(<TileMapImportButton />);
    
    const fileInput = screen.getByLabelText(/select tilemap and buildings xml files/i);
    const file = new File(['<TileMap><Width>51</Width><Height>51</Height></TileMap>'], 'TileMap.xml', { type: 'application/xml' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(fileInput).toHaveValue('');
    });
  });

  it('should show error when only Buildings file is selected without TileMap', async () => {
    (parseBuildings as ReturnType<typeof vi.fn>).mockReturnValue([]);

    render(<TileMapImportButton />);
    
    const fileInput = screen.getByLabelText(/select tilemap and buildings xml files/i);
    const file = new File(['<Buildings></Buildings>'], 'Buildings.xml', { type: 'application/xml' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        title: 'Failed to Load Map',
        description: 'No valid TileMap file found.',
        type: 'error',
        duration: 5000,
      });
    });
  });

  it('should disable button while loading', async () => {
    (parseTileMap as ReturnType<typeof vi.fn>).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            width: 51,
            height: 51,
            terrain: new Map(),
            buildings: [],
            flags: new Map(),
          } as MapData);
        }, 100);
      });
    });

    render(<TileMapImportButton />);
    
    const fileInput = screen.getByLabelText(/select tilemap and buildings xml files/i);
    const file = new File(['<TileMap><Width>51</Width><Height>51</Height></TileMap>'], 'TileMap.xml', { type: 'application/xml' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /loading/i });
      expect(button).toBeDisabled();
    });
  });
});
