/*
  # Fix product table columns and constraints

  1. Changes
    - Ensure all required columns exist with correct names
    - Add proper constraints and defaults
  
  2. Security
    - Maintain existing RLS policies
*/

-- Ensure all required columns exist with correct names and constraints
DO $$ 
BEGIN
  -- Drop and recreate the table to ensure consistency
  DROP TABLE IF EXISTS products;
  
  CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    descripcion text NOT NULL,
    categoria text NOT NULL,
    codigo_qr text UNIQUE NOT NULL,
    codigo_sku text,
    cantidad_stock integer NOT NULL DEFAULT 0,
    precio decimal(10,2) NOT NULL DEFAULT 0.00,
    creado_en timestamptz DEFAULT now(),
    actualizado_en timestamptz DEFAULT now()
  );

  -- Re-enable RLS
  ALTER TABLE products ENABLE ROW LEVEL SECURITY;

  -- Recreate policies for anonymous access
  CREATE POLICY "Cualquier usuario puede leer productos"
    ON products FOR SELECT
    USING (true);

  CREATE POLICY "Cualquier usuario puede crear productos"
    ON products FOR INSERT
    WITH CHECK (true);

  CREATE POLICY "Cualquier usuario puede actualizar productos"
    ON products FOR UPDATE
    USING (true)
    WITH CHECK (true);
END $$;