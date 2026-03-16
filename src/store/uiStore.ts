/**
 * UI Store - Zustand store for UI state management
 * Handles sidebar tabs, dialogs, toasts, and UI interactions
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { SidebarTab, FeatureTab } from '../types/map';

// ============================================================================
// Types
// ============================================================================

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface DialogState {
  isOpen: boolean;
  title: string;
  content?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export interface FileOperation {
  type: 'new' | 'open' | 'save' | 'saveAs';
  isLoading: boolean;
  error?: string;
}

export interface PanelState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  bottomPanelOpen: boolean;
  bottomPanelHeight: number;
}

// ============================================================================
// State Interface
// ============================================================================

interface UIState {
  // Sidebar
  activeTab: SidebarTab;
  sidebarOpen: boolean;

  // Feature tabs - for switching between different sections
  activeFeatureTab: FeatureTab;

  // Panels
  panelState: PanelState;

  // Toasts
  toasts: Toast[];

  // Dialogs
  activeDialog: DialogState | null;

  // File Operations
  fileOperation: FileOperation | null;

  // Global UI State
  isLoading: boolean;
  loadingMessage: string;
  shortcutsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';

  // Actions
  setActiveTab: (tab: SidebarTab) => void;
  setActiveFeatureTab: (tab: FeatureTab) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Panel Actions
  setPanelState: (state: Partial<PanelState>) => void;
  toggleBottomPanel: () => void;

  // Toast Actions
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Dialog Actions
  openDialog: (dialog: Omit<DialogState, 'isOpen'>) => void;
  closeDialog: () => void;
  confirmDialog: () => void;
  cancelDialog: () => void;

  // File Operation Actions
  startFileOperation: (operation: Omit<FileOperation, 'isLoading'>) => void;
  endFileOperation: (error?: string) => void;
  clearFileOperation: () => void;

  // Loading Actions
  setLoading: (loading: boolean, message?: string) => void;

  // Settings Actions
  setShortcutsEnabled: (enabled: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

// ============================================================================
// Default State
// ============================================================================

const defaultPanelState: PanelState = {
  sidebarOpen: true,
  sidebarWidth: 280,
  bottomPanelOpen: false,
  bottomPanelHeight: 200,
};

const defaultDialogState: DialogState = {
  isOpen: false,
  title: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
};

// ============================================================================
// Helper Functions
// ============================================================================

let toastIdCounter = 0;

const generateToastId = (): string => {
  return `toast-${++toastIdCounter}-${Date.now()}`;
};

// ============================================================================
// Store Creation
// ============================================================================

export const useUIStore = create<UIState>()(
  immer((set, get) => ({
    // Initial State
    activeTab: 'terrain',
    activeFeatureTab: 'mapEditor',
    sidebarOpen: true,
    panelState: defaultPanelState,
    toasts: [],
    activeDialog: null,
    fileOperation: null,
    isLoading: false,
    loadingMessage: '',
    shortcutsEnabled: true,
    theme: 'system',

    // Sidebar Actions
    setActiveTab: (tab) => {
      set((state) => {
        state.activeTab = tab;
      });
    },

    setActiveFeatureTab: (tab) => {
      set((state) => {
        state.activeFeatureTab = tab;
      });
    },

    toggleSidebar: () => {
      set((state) => {
        state.sidebarOpen = !state.sidebarOpen;
        state.panelState.sidebarOpen = state.sidebarOpen;
      });
    },

    setSidebarOpen: (open) => {
      set((state) => {
        state.sidebarOpen = open;
        state.panelState.sidebarOpen = open;
      });
    },

    // Panel Actions
    setPanelState: (panelState) => {
      set((state) => {
        state.panelState = { ...state.panelState, ...panelState };
      });
    },

    toggleBottomPanel: () => {
      set((state) => {
        state.panelState.bottomPanelOpen = !state.panelState.bottomPanelOpen;
      });
    },

    // Toast Actions
    addToast: (toast) => {
      const id = generateToastId();
      set((state) => {
        state.toasts.push({
          ...toast,
          id,
          duration: toast.duration ?? 5000,
        });
      });

      // Auto-remove toast after duration
      if (toast.duration !== 0) {
        setTimeout(() => {
          get().removeToast(id);
        }, toast.duration ?? 5000);
      }

      return id;
    },

    removeToast: (id) => {
      set((state) => {
        state.toasts = state.toasts.filter((t) => t.id !== id);
      });
    },

    clearToasts: () => {
      set((state) => {
        state.toasts = [];
      });
    },

    // Dialog Actions
    openDialog: (dialog) => {
      set((state) => {
        state.activeDialog = {
          ...defaultDialogState,
          ...dialog,
          isOpen: true,
        };
      });
    },

    closeDialog: () => {
      set((state) => {
        if (state.activeDialog) {
          state.activeDialog.isOpen = false;
        }
        state.activeDialog = null;
      });
    },

    confirmDialog: () => {
      const { activeDialog } = get();
      if (activeDialog?.onConfirm) {
        activeDialog.onConfirm();
      }
      get().closeDialog();
    },

    cancelDialog: () => {
      const { activeDialog } = get();
      if (activeDialog?.onCancel) {
        activeDialog.onCancel();
      }
      get().closeDialog();
    },

    // File Operation Actions
    startFileOperation: (operation) => {
      set((state) => {
        state.fileOperation = {
          ...operation,
          isLoading: true,
        };
        state.isLoading = true;
        state.loadingMessage = `${operation.type}...`;
      });
    },

    endFileOperation: (error) => {
      set((state) => {
        if (state.fileOperation) {
          state.fileOperation.isLoading = false;
          state.fileOperation.error = error;
        }
        state.isLoading = false;
        state.loadingMessage = '';
      });
    },

    clearFileOperation: () => {
      set((state) => {
        state.fileOperation = null;
      });
    },

    // Loading Actions
    setLoading: (loading, message) => {
      set((state) => {
        state.isLoading = loading;
        state.loadingMessage = message ?? '';
      });
    },

    // Settings Actions
    setShortcutsEnabled: (enabled) => {
      set((state) => {
        state.shortcutsEnabled = enabled;
      });
    },

    setTheme: (theme) => {
      set((state) => {
        state.theme = theme;
      });
    },
  }))
);

// ============================================================================
// Selectors
// ============================================================================

export const selectIsToastActive = (id: string) => {
  return (state: UIState) => state.toasts.some((t) => t.id === id);
};

export const selectHasUnsavedChanges = () => {
  return (_state: UIState) => {
    // This would be connected to map store in real implementation
    return false;
  };
};
