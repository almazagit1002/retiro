/*
  # Update RLS policies for products table

  1. Changes
    - Enable anonymous access to products table
    - Update existing policies to allow anon access
  
  2. Security
    - Allow anonymous users to read products
    - Allow anonymous users to create and update products
    - This is necessary because we're using the anon key for our application
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Usuarios pueden leer todos los productos" ON products;
DROP POLICY IF EXISTS "Usuarios pueden crear productos" ON products;
DROP POLICY IF EXISTS "Usuarios pueden actualizar productos" ON products;

-- Create new policies that allow both authenticated and anonymous access
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