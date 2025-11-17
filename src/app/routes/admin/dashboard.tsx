import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, subscribeToStockChanges } from '@/lib/supabase'

// ============================================================================
// TIPOS
// ============================================================================

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  activeProducts: number
  lowStockVariants: number
  pendingOrders: number
}

interface RecentOrder {
  id: string
  customer_email: string
  total: number
  status: string
  created_at: string
}

// ============================================================================
// COMPONENTE DASHBOARD
// ============================================================================

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [variantIds, setVariantIds] = useState<string[]>([])

  // Cargar estadísticas y pedidos recientes
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)

        // Obtener estadísticas en paralelo
        const [
          { count: totalProducts },
          { count: activeProducts },
          { count: totalOrders },
          { data: orders },
          { data: variants },
          { data: allVariants },
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('available_for_sale', true),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase
            .from('orders')
            .select('total, status')
            .order('created_at', { ascending: false })
            .limit(100),
          supabase.from('variants').select('stock').lte('stock', 5),
          supabase.from('variants').select('id'),
        ])

        // Calcular totales
        const totalRevenue = (orders as any[])?.reduce((sum, order: any) => {
          return order.status === 'paid' || order.status === 'delivered'
            ? sum + Number(order.total)
            : sum
        }, 0) || 0

        const pendingOrders = (orders as any[])?.filter(
          (o: any) => o.status === 'pending' || o.status === 'paid'
        ).length || 0

        setStats({
          totalProducts: totalProducts || 0,
          totalOrders: totalOrders || 0,
          totalRevenue,
          activeProducts: activeProducts || 0,
          lowStockVariants: variants?.length || 0,
          pendingOrders,
        })

        // Store variant IDs for real-time subscriptions
        setVariantIds(allVariants?.map((v: any) => v.id) || [])

        // Obtener pedidos recientes
        const { data: recentOrdersData } = await supabase
          .from('orders')
          .select('id, customer_email, total, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5)

        setRecentOrders(recentOrdersData || [])
      } catch (err) {
        console.error('Error cargando dashboard:', err)
        setError('Error cargando datos del dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Real-time subscription to stock changes
  useEffect(() => {
    if (variantIds.length === 0) return

    // Subscribe to all variants to update low stock count
    const subscriptions = variantIds.map((variantId) =>
      subscribeToStockChanges(variantId, async (_newStock) => {
        // Re-fetch low stock count when any stock changes
        const { data } = await supabase.from('variants').select('stock').lte('stock', 5)

        setStats((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            lowStockVariants: data?.length || 0,
          }
        })
      })
    )

    // Cleanup subscriptions
    return () => {
      subscriptions.forEach((sub) => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe()
        }
      })
    }
  }, [variantIds.length])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#8B6F47] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B5844]">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-[#8B6F47]">Dashboard</h1>
        <p className="text-[#6B5844] mt-1">
          Resumen general de Son de Nudos
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Productos */}
        <StatCard
          title="Total Productos"
          value={stats?.totalProducts || 0}
          subtitle={`${stats?.activeProducts || 0} disponibles`}
          icon="📦"
          color="from-[#8B6F47] to-[#D4A574]"
        />

        {/* Total Pedidos */}
        <StatCard
          title="Total Pedidos"
          value={stats?.totalOrders || 0}
          subtitle={`${stats?.pendingOrders || 0} pendientes`}
          icon="🛒"
          color="from-[#D4A574] to-[#8B6F47]"
        />

        {/* Ingresos Totales */}
        <StatCard
          title="Ingresos Totales"
          value={`$${(stats?.totalRevenue || 0).toFixed(2)}`}
          subtitle="Ventas completadas"
          icon="💰"
          color="from-[#8B6F47] to-[#6B5844]"
        />
      </div>

      {/* Alertas */}
      {stats && stats.lowStockVariants > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-medium text-yellow-900">
              Stock bajo detectado
            </p>
            <p className="text-sm text-yellow-700">
              {stats.lowStockVariants} variantes tienen 5 unidades o menos.{' '}
              <Link
                to="/admin/inventory"
                className="underline hover:text-yellow-900"
              >
                Ver inventario
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Pedidos Recientes */}
      <div className="bg-white rounded-xl shadow-md border border-[#D4A574]/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#D4A574]/20 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#8B6F47]">
            Pedidos Recientes
          </h2>
          <Link
            to="/admin/orders"
            className="text-sm text-[#D4A574] hover:text-[#8B6F47] font-medium"
          >
            Ver todos →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#6B5844]/60">No hay pedidos recientes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5E6D3]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8B6F47] uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8B6F47] uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8B6F47] uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8B6F47] uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4A574]/20">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#F5E6D3]/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B5844]">
                      {order.customer_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#8B6F47]">
                      ${Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B5844]">
                      {new Date(order.created_at).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: string
  color: string
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-[#D4A574]/20 overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${color}`} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[#6B5844]">{title}</h3>
          <span className="text-3xl">{icon}</span>
        </div>
        <p className="text-3xl font-bold text-[#8B6F47] mb-1">{value}</p>
        <p className="text-sm text-[#6B5844]/60">{subtitle}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
    paid: { color: 'bg-blue-100 text-blue-800', label: 'Pagado' },
    processing: { color: 'bg-purple-100 text-purple-800', label: 'Procesando' },
    shipped: { color: 'bg-indigo-100 text-indigo-800', label: 'Enviado' },
    delivered: { color: 'bg-green-100 text-green-800', label: 'Entregado' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelado' },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${config.color}`}
    >
      {config.label}
    </span>
  )
}
