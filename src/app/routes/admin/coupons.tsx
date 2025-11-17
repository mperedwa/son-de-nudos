/**
 * Admin Coupons Page
 * Fase 11: Panel de Administración - Gestión de Cupones
 *
 * Página consolidada para CRUD de cupones de descuento
 */

import { useEffect, useState, useMemo } from 'react'
import { supabase, type Database } from '@/lib/supabase'
import { CouponStatusBadge, type CouponStatus } from '@/components/admin/CouponStatusBadge'
import { CouponFormModal } from '@/components/admin/CouponFormModal'

// ============================================================================
// TYPES
// ============================================================================

type Coupon = Database['public']['Tables']['coupons']['Row']

type SortField = 'code' | 'percent' | 'current_uses' | 'created_at'
type SortDirection = 'asc' | 'desc'

interface Filters {
  search: string
  status: CouponStatus | 'all'
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCouponStatus(coupon: Coupon): CouponStatus {
  // Check if exhausted
  if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
    return 'exhausted'
  }

  // Check if expired
  if (coupon.valid_until) {
    const now = new Date()
    const expiryDate = new Date(coupon.valid_until)
    if (now > expiryDate) {
      return 'expired'
    }
  }

  // Check active flag
  if (!coupon.active) {
    return 'inactive'
  }

  return 'active'
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminCoupons() {
  // State
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & Search
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
  })

  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================

  useEffect(() => {
    loadCoupons()
  }, [])

  async function loadCoupons() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setCoupons(data || [])
    } catch (err) {
      console.error('Error loading coupons:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar cupones')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================================
  // FILTERING & SORTING
  // ==========================================================================

  const filteredAndSortedCoupons = useMemo(() => {
    let result = [...coupons]

    // Search filter (code)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter((c) => c.code.toLowerCase().includes(searchLower))
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((c) => getCouponStatus(c) === filters.status)
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'code':
          comparison = a.code.localeCompare(b.code)
          break
        case 'percent':
          comparison = Number(a.percent) - Number(b.percent)
          break
        case 'current_uses':
          comparison = a.current_uses - b.current_uses
          break
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [coupons, filters, sortField, sortDirection])

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFilters((prev) => ({ ...prev, search: e.target.value }))
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilters((prev) => ({ ...prev, status: e.target.value as CouponStatus | 'all' }))
  }

  function clearFilters() {
    setFilters({ search: '', status: 'all' })
  }

  async function toggleCouponActive(couponId: string, currentActive: boolean) {
    try {
      const { error: updateError } = await supabase
        .from('coupons')
        // @ts-expect-error - Supabase types don't properly infer Update type for coupons table
        .update({ active: !currentActive })
        .eq('id', couponId)

      if (updateError) throw updateError

      // Update local state
      setCoupons((prev) =>
        prev.map((c) => (c.id === couponId ? { ...c, active: !currentActive } : c))
      )
    } catch (err) {
      console.error('Error toggling coupon:', err)
      alert('Error al cambiar estado del cupón')
    }
  }

  function handleOpenCreateModal() {
    setEditingCoupon(null)
    setIsFormModalOpen(true)
  }

  function handleOpenEditModal(coupon: Coupon) {
    setEditingCoupon(coupon)
    setIsFormModalOpen(true)
  }

  function handleCloseModal() {
    setIsFormModalOpen(false)
    setEditingCoupon(null)
  }

  function handleCouponSuccess(coupon: Coupon) {
    if (editingCoupon) {
      // Update existing coupon in list
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? coupon : c)))
    } else {
      // Add new coupon to list
      setCoupons((prev) => [coupon, ...prev])
    }
  }

  // ==========================================================================
  // STATS
  // ==========================================================================

  const stats = useMemo(() => {
    const totalCoupons = coupons.length
    const activeCoupons = coupons.filter((c) => getCouponStatus(c) === 'active').length
    const expiredCoupons = coupons.filter((c) => getCouponStatus(c) === 'expired').length
    const exhaustedCoupons = coupons.filter((c) => getCouponStatus(c) === 'exhausted').length
    const totalUses = coupons.reduce((sum, c) => sum + c.current_uses, 0)

    return { totalCoupons, activeCoupons, expiredCoupons, exhaustedCoupons, totalUses }
  }, [coupons])

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  function renderSortIcon(field: SortField) {
    if (sortField !== field) {
      return <span className="text-[#6B5844]/30">⇅</span>
    }
    return sortDirection === 'asc' ? (
      <span className="text-[#8B6F47]">↑</span>
    ) : (
      <span className="text-[#8B6F47]">↓</span>
    )
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8B6F47]">Gestión de Cupones</h1>
          <p className="text-[#6B5844]/70 mt-1">Control de cupones de descuento</p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-6 py-2.5 text-white bg-gradient-to-r from-[#8B6F47] to-[#D4A574] rounded-lg hover:from-[#6B5844] hover:to-[#8B6F47] transition-colors font-medium"
        >
          + Crear Cupón
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border-2 border-[#D4A574]/30 p-4">
          <p className="text-sm text-[#6B5844]/70">Total Cupones</p>
          <p className="text-2xl font-bold text-[#8B6F47] mt-1">{stats.totalCoupons}</p>
        </div>
        <div className="bg-green-50 rounded-lg border-2 border-green-200 p-4">
          <p className="text-sm text-green-700">Activos</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{stats.activeCoupons}</p>
        </div>
        <div className="bg-orange-50 rounded-lg border-2 border-orange-200 p-4">
          <p className="text-sm text-orange-700">Expirados</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{stats.expiredCoupons}</p>
        </div>
        <div className="bg-red-50 rounded-lg border-2 border-red-200 p-4">
          <p className="text-sm text-red-700">Agotados</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{stats.exhaustedCoupons}</p>
        </div>
        <div className="bg-white rounded-lg border-2 border-[#D4A574]/30 p-4">
          <p className="text-sm text-[#6B5844]/70">Total Usos</p>
          <p className="text-2xl font-bold text-[#8B6F47] mt-1">{stats.totalUses}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border-2 border-[#D4A574]/30 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-[#6B5844] mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Código de cupón..."
              className="w-full px-3 py-2 border border-[#D4A574]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47]"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-64">
            <label htmlFor="status" className="block text-sm font-medium text-[#6B5844] mb-1">
              Estado
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 border border-[#D4A574]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47]"
            >
              <option value="all">Todos</option>
              <option value="active">✅ Activos</option>
              <option value="inactive">⏸️ Inactivos</option>
              <option value="expired">⏰ Expirados</option>
              <option value="exhausted">🚫 Agotados</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(filters.search || filters.status !== 'all') && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-[#6B5844] hover:text-[#8B6F47] transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#8B6F47] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadCoupons}
            className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border-2 border-[#D4A574]/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#6B5844]/20"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center gap-2">
                      Código {renderSortIcon('code')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#6B5844]/20"
                    onClick={() => handleSort('percent')}
                  >
                    <div className="flex items-center gap-2">
                      Descuento {renderSortIcon('percent')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Validez</th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#6B5844]/20"
                    onClick={() => handleSort('current_uses')}
                  >
                    <div className="flex items-center gap-2">
                      Usos {renderSortIcon('current_uses')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Estado</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4A574]/20">
                {filteredAndSortedCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#6B5844]/50">
                      {filters.search || filters.status !== 'all'
                        ? 'No se encontraron cupones con los filtros aplicados'
                        : 'No hay cupones creados'}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-[#F5E6D3]/30 transition-colors">
                      {/* Code */}
                      <td className="px-4 py-3">
                        <code className="text-sm font-mono font-bold text-[#8B6F47]">
                          {coupon.code}
                        </code>
                        {coupon.min_amount && (
                          <p className="text-xs text-[#6B5844]/60 mt-1">
                            Mín: ${Number(coupon.min_amount).toFixed(2)}
                          </p>
                        )}
                      </td>

                      {/* Percent */}
                      <td className="px-4 py-3">
                        <p className="text-lg font-bold text-[#8B6F47]">
                          {Number(coupon.percent)}%
                        </p>
                      </td>

                      {/* Validity */}
                      <td className="px-4 py-3">
                        {coupon.valid_until ? (
                          <div className="text-sm">
                            <p className="text-[#6B5844]">Hasta:</p>
                            <p className="font-medium text-[#8B6F47]">
                              {formatDate(coupon.valid_until)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-[#6B5844]/60">Sin límite</p>
                        )}
                      </td>

                      {/* Uses */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-[#6B5844]">
                          {coupon.current_uses}
                          {coupon.max_uses !== null && ` / ${coupon.max_uses}`}
                        </p>
                        {coupon.max_uses !== null && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-[#8B6F47] h-1.5 rounded-full"
                              style={{
                                width: `${Math.min((coupon.current_uses / coupon.max_uses) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <CouponStatusBadge
                          active={coupon.active}
                          validUntil={coupon.valid_until}
                          maxUses={coupon.max_uses}
                          currentUses={coupon.current_uses}
                          size="sm"
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleCouponActive(coupon.id, coupon.active)}
                            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                              coupon.active
                                ? 'text-orange-700 bg-orange-50 hover:bg-orange-100'
                                : 'text-green-700 bg-green-50 hover:bg-green-100'
                            }`}
                            title={coupon.active ? 'Desactivar' : 'Activar'}
                          >
                            {coupon.active ? '⏸️ Pausar' : '▶️ Activar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(coupon)}
                            className="px-3 py-1 text-sm font-medium text-[#8B6F47] bg-[#F5E6D3] rounded-lg hover:bg-[#D4A574]/30 transition-colors"
                            title="Editar"
                          >
                            ✏️ Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Results Count */}
          {filteredAndSortedCoupons.length > 0 && (
            <div className="px-4 py-3 bg-[#F5E6D3]/50 border-t border-[#D4A574]/20 text-sm text-[#6B5844]">
              Mostrando {filteredAndSortedCoupons.length} de {coupons.length} cupón
              {coupons.length !== 1 ? 'es' : ''}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <CouponFormModal
        coupon={editingCoupon}
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleCouponSuccess}
      />
    </div>
  )
}
