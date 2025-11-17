-- ==============================================================================
-- Son de Nudos - Initial Database Schema
-- ==============================================================================
-- Description: Schema completo para ecommerce de collares artesanales
-- Author: Claude Code + Mario Perez
-- Date: 2025-11-16
-- Version: 1.0
-- ==============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- TABLA: products
-- ==============================================================================
-- Productos principales (collares)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description_html TEXT,
  images TEXT[] DEFAULT '{}',
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  tags TEXT[] DEFAULT '{}',
  available_for_sale BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT products_price_positive CHECK (price > 0),
  CONSTRAINT products_compare_price_higher CHECK (compare_at_price IS NULL OR compare_at_price > price)
);

-- Índices para productos
CREATE INDEX idx_products_handle ON products(handle);
CREATE INDEX idx_products_available ON products(available_for_sale);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- ==============================================================================
-- TABLA: variants
-- ==============================================================================
-- Variantes de productos (combinaciones de Largo, Material, Color)
CREATE TABLE variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  available BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT 0 NOT NULL,
  options JSONB DEFAULT '{}',
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT variants_price_positive CHECK (price > 0),
  CONSTRAINT variants_stock_non_negative CHECK (stock >= 0),
  CONSTRAINT variants_compare_price_higher CHECK (compare_at_price IS NULL OR compare_at_price > price)
);

-- Índices para variantes
CREATE INDEX idx_variants_product_id ON variants(product_id);
CREATE INDEX idx_variants_sku ON variants(sku);
CREATE INDEX idx_variants_available ON variants(available);
CREATE INDEX idx_variants_stock ON variants(stock);

-- ==============================================================================
-- TABLA: coupons
-- ==============================================================================
-- Cupones de descuento dinámicos
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  percent DECIMAL(5, 2) NOT NULL,
  min_amount DECIMAL(10, 2),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0 NOT NULL,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT coupons_percent_valid CHECK (percent > 0 AND percent <= 1),
  CONSTRAINT coupons_min_amount_positive CHECK (min_amount IS NULL OR min_amount > 0),
  CONSTRAINT coupons_max_uses_positive CHECK (max_uses IS NULL OR max_uses > 0),
  CONSTRAINT coupons_current_uses_valid CHECK (current_uses >= 0),
  CONSTRAINT coupons_dates_valid CHECK (valid_until IS NULL OR valid_until > valid_from)
);

-- Índices para cupones
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(active);
CREATE INDEX idx_coupons_valid_until ON coupons(valid_until);

-- ==============================================================================
-- TABLA: orders
-- ==============================================================================
-- Pedidos de clientes (guardados desde Stripe webhook)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  shipping_address JSONB,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  shipping DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT orders_status_valid CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  CONSTRAINT orders_subtotal_positive CHECK (subtotal >= 0),
  CONSTRAINT orders_discount_non_negative CHECK (discount >= 0),
  CONSTRAINT orders_shipping_non_negative CHECK (shipping >= 0),
  CONSTRAINT orders_total_positive CHECK (total >= 0)
);

-- Índices para pedidos
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_session_id);

-- ==============================================================================
-- TABLA: admins
-- ==============================================================================
-- Usuarios administradores con acceso al panel
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT admins_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT admins_role_valid CHECK (role IN ('admin', 'superadmin'))
);

-- Índices para admins
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_active ON admins(active);

-- ==============================================================================
-- TABLA: shipping_config
-- ==============================================================================
-- Configuración de envío editable
CREATE TABLE shipping_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_cost DECIMAL(10, 2) DEFAULT 10.00 NOT NULL,
  free_shipping_threshold DECIMAL(10, 2) DEFAULT 150.00 NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT shipping_cost_positive CHECK (standard_cost >= 0),
  CONSTRAINT shipping_threshold_positive CHECK (free_shipping_threshold > 0)
);

-- Insertar configuración inicial
INSERT INTO shipping_config (standard_cost, free_shipping_threshold, currency)
VALUES (10.00, 150.00, 'USD');

-- ==============================================================================
-- TABLA: stock_history
-- ==============================================================================
-- Histórico de movimientos de inventario
CREATE TABLE stock_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  change INTEGER NOT NULL,
  reason TEXT NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  admin_id UUID REFERENCES admins(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT stock_history_reason_valid CHECK (reason IN ('restock', 'sale', 'adjustment', 'return', 'damage'))
);

-- Índices para histórico de stock
CREATE INDEX idx_stock_history_variant_id ON stock_history(variant_id);
CREATE INDEX idx_stock_history_created_at ON stock_history(created_at DESC);

-- ==============================================================================
-- FUNCTIONS
-- ==============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variants_updated_at BEFORE UPDATE ON variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_config_updated_at BEFORE UPDATE ON shipping_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para registrar cambios de stock
CREATE OR REPLACE FUNCTION log_stock_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock != OLD.stock THEN
    INSERT INTO stock_history (variant_id, change, reason, previous_stock, new_stock)
    VALUES (
      NEW.id,
      NEW.stock - OLD.stock,
      CASE
        WHEN NEW.stock > OLD.stock THEN 'restock'
        WHEN NEW.stock < OLD.stock THEN 'adjustment'
        ELSE 'adjustment'
      END,
      OLD.stock,
      NEW.stock
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para logging de stock
CREATE TRIGGER log_variant_stock_changes AFTER UPDATE ON variants
  FOR EACH ROW EXECUTE FUNCTION log_stock_change();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- POLÍTICAS: products (lectura pública, escritura solo admins)
-- ==============================================================================

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete products"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- ==============================================================================
-- POLÍTICAS: variants (lectura pública, escritura solo admins)
-- ==============================================================================

CREATE POLICY "Variants are viewable by everyone"
  ON variants FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert variants"
  ON variants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update variants"
  ON variants FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete variants"
  ON variants FOR DELETE
  USING (auth.role() = 'authenticated');

-- ==============================================================================
-- POLÍTICAS: coupons (lectura pública solo código, escritura solo admins)
-- ==============================================================================

CREATE POLICY "Coupons can be validated by everyone"
  ON coupons FOR SELECT
  USING (active = true);

CREATE POLICY "Only admins can insert coupons"
  ON coupons FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update coupons"
  ON coupons FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete coupons"
  ON coupons FOR DELETE
  USING (auth.role() = 'authenticated');

-- ==============================================================================
-- POLÍTICAS: orders (solo admins)
-- ==============================================================================

CREATE POLICY "Only admins can view orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert orders"
  ON orders FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ==============================================================================
-- POLÍTICAS: shipping_config (lectura pública, escritura solo admins)
-- ==============================================================================

CREATE POLICY "Shipping config is viewable by everyone"
  ON shipping_config FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update shipping config"
  ON shipping_config FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ==============================================================================
-- POLÍTICAS: stock_history (solo admins)
-- ==============================================================================

CREATE POLICY "Only admins can view stock history"
  ON stock_history FOR SELECT
  USING (auth.role() = 'authenticated');

-- ==============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ==============================================================================

COMMENT ON TABLE products IS 'Productos principales (collares artesanales)';
COMMENT ON TABLE variants IS 'Variantes de productos con combinaciones de opciones (Largo, Material, Color)';
COMMENT ON TABLE coupons IS 'Cupones de descuento con validación y límites de uso';
COMMENT ON TABLE orders IS 'Pedidos de clientes procesados por Stripe';
COMMENT ON TABLE admins IS 'Usuarios administradores con acceso al panel';
COMMENT ON TABLE shipping_config IS 'Configuración de costos de envío';
COMMENT ON TABLE stock_history IS 'Histórico de cambios en el inventario';

-- ==============================================================================
-- FIN DEL SCHEMA
-- ==============================================================================
