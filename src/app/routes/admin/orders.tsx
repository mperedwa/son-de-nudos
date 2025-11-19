/**
 * Admin Orders Page
 * Fase 11: Panel de Administración - Gestión de Pedidos
 *
 * Página para visualizar, filtrar y gestionar todos los pedidos
 */

import { useEffect, useState, useMemo } from 'react'
import { supabase, type Database } from '@/lib/supabase'
import { OrderStatusBadge, type OrderStatus } from '@/components/admin/OrderStatusBadge'
import { OrderDetailModal } from '@/components/admin/OrderDetailModal'

// ============================================================================
// TYPES
// ============================================================================

type Order = Database['public']['Tables']['orders']['Row']

type SortField = 'created_at' | 'total' | 'status' | 'customer_email'
type SortDirection = 'asc' | 'desc'

interface Filters {
  search: string
  status: OrderStatus | 'all'
  dateFrom: string
  dateTo: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMoney(amount: number): string {
  return `$${Number(amount).toFixed(2)}`
}

function getItemsCount(items: Record<string, any>): number {
  if (Array.isArray(items)) {
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0)
  }
  return 0
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminOrders() {
  // State
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & Search
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
  })

  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setOrders(data || [])
    } catch (err) {
      console.error('Error loading orders:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================================
  // FILTERING & SORTING
  // ==========================================================================

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders]

    // Search filter (email or name)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (o) =>
          o.customer_email.toLowerCase().includes(searchLower) ||
          (o.customer_name && o.customer_name.toLowerCase().includes(searchLower)) ||
          o.id.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((o) => o.status === filters.status)
    }

    // Date from filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      result = result.filter((o) => new Date(o.created_at) >= fromDate)
    }

    // Date to filter
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999) // End of day
      result = result.filter((o) => new Date(o.created_at) <= toDate)
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'total':
          comparison = Number(a.total) - Number(b.total)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'customer_email':
          comparison = a.customer_email.localeCompare(b.customer_email)
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [orders, filters, sortField, sortDirection])

  // Pagination
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSortedOrders.slice(start, start + itemsPerPage)
  }, [filteredAndSortedOrders, currentPage])

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFilters((prev) => ({ ...prev, search: e.target.value }))
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilters((prev) => ({ ...prev, status: e.target.value as OrderStatus | 'all' }))
  }

  function handleDateFromChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
  }

  function handleDateToChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
  }

  function clearFilters() {
    setFilters({ search: '', status: 'all', dateFrom: '', dateTo: '' })
  }

  function handleOpenDetail(order: Order) {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }

  function handleCloseDetail() {
    setIsDetailModalOpen(false)
    setSelectedOrder(null)
  }

  function handleStatusChangeFromModal(orderId: string, newStatus: OrderStatus) {
    // Update local state
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )
    // Update selected order if still viewing
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
  }

  // ==========================================================================
  // STATS
  // ==========================================================================

  const stats = useMemo(() => {
    const totalOrders = orders.length
    const pendingOrders = orders.filter((o) => o.status === 'pending').length
    const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'processing').length
    const completedOrders = orders.filter((o) => o.status === 'delivered').length
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length
    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled' && o.status !== 'pending')
      .reduce((sum, o) => sum + Number(o.total), 0)

    return { totalOrders, pendingOrders, paidOrders, completedOrders, cancelledOrders, totalRevenue }
  }, [orders])

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  function renderSortIcon(field: SortField) {
    if (sortField !== field) {
      return <span className="text-white/30">⇅</span>
    }
    return sortDirection === 'asc' ? (
      <span className="text-white">↑</span>
    ) : (
      <span className="text-white">↓</span>
    )
  }

  const hasFilters = filters.search || filters.status !== 'all' || filters.dateFrom || filters.dateTo

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#8B6F47]">Gestión de Pedidos</h1>
        <p className="text-[#6B5844]/70 mt-1">Visualiza y gestiona todos los pedidos de la tienda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border-2 border-[#D4A574]/30 p-4">
          <p className="text-sm text-[#6B5844]/70">Total</p>
          <p className="text-2xl font-bold text-[#8B6F47] mt-1">{stats.totalOrders}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg border-2 border-yellow-200 p-4">
          <p className="text-sm text-yellow-700">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.pendingOrders}</p>
        </div>
        <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-4">
          <p className="text-sm text-blue-700">Pagados</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{stats.paidOrders}</p>
        </div>
        <div className="bg-green-50 rounded-lg border-2 border-green-200 p-4">
          <p className="text-sm text-green-700">Entregados</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{stats.completedOrders}</p>
        </div>
        <div className="bg-red-50 rounded-lg border-2 border-red-200 p-4">
          <p className="text-sm text-red-700">Cancelados</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{stats.cancelledOrders}</p>
        </div>
        <div className="bg-gradient-to-r from-[#8B6F47]/10 to-[#D4A574]/10 rounded-lg border-2 border-[#D4A574]/30 p-4">
          <p className="text-sm text-[#6B5844]/70">Ingresos</p>
          <p className="text-2xl font-bold text-[#8B6F47] mt-1">{formatMoney(stats.totalRevenue)}</p>
        </div>
      </div>

      {/* Pending Orders Alert */}
      {stats.pendingOrders > 0 && (
        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-medium text-yellow-800">
              Tienes {stats.pendingOrders} pedido{stats.pendingOrders !== 1 ? 's' : ''} pendiente{stats.pendingOrders !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-yellow-700">
              Revisa y procesa los pedidos pendientes lo antes posible
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border-2 border-[#D4A574]/30 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-[#6B5844] mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Email, nombre o ID..."
              className="w-full px-3 py-2 border border-[#D4A574]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47]"
            />
          </div>

          {/* Status Filter */}
          <div>
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
              <option value="pending">⏳ Pendiente</option>
              <option value="paid">💳 Pagado</option>
              <option value="processing">📦 Procesando</option>
              <option value="shipped">🚚 Enviado</option>
              <option value="delivered">✅ Entregado</option>
              <option value="cancelled">❌ Cancelado</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-[#6B5844] mb-1">
              Desde
            </label>
            <input
              type="date"
              id="dateFrom"
              value={filters.dateFrom}
              onChange={handleDateFromChange}
              className="w-full px-3 py-2 border border-[#D4A574]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47]"
            />
          </div>

          {/* Date To */}
          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-[#6B5844] mb-1">
              Hasta
            </label>
            <input
              type="date"
              id="dateTo"
              value={filters.dateTo}
              onChange={handleDateToChange}
              className="w-full px-3 py-2 border border-[#D4A574]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47]"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <div className="mt-4 pt-4 border-t border-[#D4A574]/20 flex justify-end">
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
            onClick={loadOrders}
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
                  <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#6B5844]/20"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-2">
                      Fecha {renderSortIcon('created_at')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#6B5844]/20"
                    onClick={() => handleSort('customer_email')}
                  >
                    <div className="flex items-center gap-2">
                      Cliente {renderSortIcon('customer_email')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Items</th>
                  <th
                    className="px-4 py-3 text-right text-sm font-semibold cursor-pointer hover:bg-[#6B5844]/20"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Total {renderSortIcon('total')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-center text-sm font-semibold cursor-pointer hover:bg-[#6B5844]/20"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Estado {renderSortIcon('status')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4A574]/20">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#6B5844]/50">
                      {hasFilters
                        ? 'No se encontraron pedidos con los filtros aplicados'
                        : 'No hay pedidos registrados'}
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[#F5E6D3]/30 transition-colors cursor-pointer"
                      onClick={() => handleOpenDetail(order)}
                    >
                      {/* ID */}
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-[#8B6F47] bg-[#F5E6D3] px-2 py-1 rounded">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </code>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <p className="text-sm text-[#6B5844]">{formatDate(order.created_at)}</p>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-[#8B6F47]">
                            {order.customer_name || 'Sin nombre'}
                          </p>
                          <p className="text-xs text-[#6B5844]/70">{order.customer_email}</p>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-[#8B6F47] bg-[#F5E6D3] rounded-full">
                          {getItemsCount(order.items)}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-bold text-[#8B6F47]">
                          {formatMoney(order.total)}
                        </p>
                        {order.discount > 0 && (
                          <p className="text-xs text-green-600">
                            -{formatMoney(order.discount)}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <OrderStatusBadge status={order.status} size="sm" />
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenDetail(order)
                          }}
                          className="px-3 py-1 text-sm font-medium text-[#8B6F47] bg-[#F5E6D3] rounded-lg hover:bg-[#D4A574]/30 transition-colors"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-[#F5E6D3]/50 border-t border-[#D4A574]/20 flex items-center justify-between">
              <p className="text-sm text-[#6B5844]">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} -{' '}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedOrders.length)} de{' '}
                {filteredAndSortedOrders.length} pedidos
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium text-[#8B6F47] bg-white border border-[#D4A574]/30 rounded-lg hover:bg-[#F5E6D3] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>

                <span className="text-sm text-[#6B5844]">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium text-[#8B6F47] bg-white border border-[#D4A574]/30 rounded-lg hover:bg-[#F5E6D3] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* Results Count (when no pagination) */}
          {totalPages <= 1 && filteredAndSortedOrders.length > 0 && (
            <div className="px-4 py-3 bg-[#F5E6D3]/50 border-t border-[#D4A574]/20 text-sm text-[#6B5844]">
              {filteredAndSortedOrders.length} pedido{filteredAndSortedOrders.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        onStatusChange={handleStatusChangeFromModal}
      />
    </div>
  )
}
