import { create } from 'zustand'

/**
 * Estado de la UI
 */
export type UIState = {
  // Estados de drawers/modals
  isCartDrawerOpen: boolean
  isFiltersDrawerOpen: boolean
  isSearchOpen: boolean

  // Acciones
  openCartDrawer: () => void
  closeCartDrawer: () => void
  toggleCartDrawer: () => void

  openFiltersDrawer: () => void
  closeFiltersDrawer: () => void
  toggleFiltersDrawer: () => void

  openSearch: () => void
  closeSearch: () => void
  toggleSearch: () => void
}

/**
 * Store de UI con Zustand
 * Gestiona estado de drawers y modals
 */
export const useUIStore = create<UIState>((set) => ({
  isCartDrawerOpen: false,
  isFiltersDrawerOpen: false,
  isSearchOpen: false,

  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),

  openFiltersDrawer: () => set({ isFiltersDrawerOpen: true }),
  closeFiltersDrawer: () => set({ isFiltersDrawerOpen: false }),
  toggleFiltersDrawer: () => set((state) => ({ isFiltersDrawerOpen: !state.isFiltersDrawerOpen })),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
}))
