import { create } from 'zustand';
import type { Owner, ModalState, ViewState, DialerStatus } from '../types';

interface AppState {
  // Navigation
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;

  // Selected Owner
  selectedOwner: Owner | null;
  setSelectedOwner: (owner: Owner | null) => void;

  // Modal State
  modalState: ModalState;
  openModal: (state: ModalState) => void;
  closeModal: () => void;

  // Dialer State
  dialerStatus: DialerStatus;
  setDialerStatus: (status: DialerStatus) => void;
  currentCallId: string | null;
  setCurrentCallId: (id: string | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'DASHBOARD',
  setCurrentView: (view) => set({ currentView: view }),

  // Selected Owner
  selectedOwner: null,
  setSelectedOwner: (owner) => set({ selectedOwner: owner }),

  // Modal State
  modalState: { type: null },
  openModal: (state) => set({ modalState: state }),
  closeModal: () => set({ modalState: { type: null } }),

  // Dialer State
  dialerStatus: 'idle',
  setDialerStatus: (status) => set({ dialerStatus: status }),
  currentCallId: null,
  setCurrentCallId: (id) => set({ currentCallId: id }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));

// Selectors for optimized re-renders
export const useCurrentView = () => useAppStore((state) => state.currentView);
export const useSelectedOwner = () => useAppStore((state) => state.selectedOwner);
export const useModalState = () => useAppStore((state) => state.modalState);
export const useDialerStatus = () => useAppStore((state) => state.dialerStatus);
export const useSearchQuery = () => useAppStore((state) => state.searchQuery);
export const useSidebarCollapsed = () => useAppStore((state) => state.sidebarCollapsed);
