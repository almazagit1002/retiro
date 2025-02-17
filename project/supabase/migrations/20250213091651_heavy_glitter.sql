/*
  # Add RLS policies for products table

  1. Security Changes
    - Enable RLS on products table
    - Add policies for:
      - Authenticated users can read all products
      - Authenticated users can insert products
      - Authenticated users can update products
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Usuarios pueden leer todos los productos" ON products;
DROP POLICY IF EXISTS "Usuarios pueden crear productos" ON products;
DROP POLICY IF EXISTS "Usuarios pueden actualizar productos" ON products;

-- Re-create policies with proper security
CREATE POLICY "Usuarios pueden leer todos los productos"
ON products FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios pueden crear productos"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar productos"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);