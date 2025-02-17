/*
  # Add missing columns to products table

  1. Changes
    - Add `descripcion` column for product descriptions
    - Add `categoria` column for product categories
    - Add `actualizado_en` trigger for automatic updates

  2. Security
    - No changes to existing policies
*/

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'descripcion'
  ) THEN
    ALTER TABLE products ADD COLUMN descripcion text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'categoria'
  ) THEN
    ALTER TABLE products ADD COLUMN categoria text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Create or replace the update timestamp trigger
CREATE OR REPLACE FUNCTION update_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_products_timestamp ON products;
CREATE TRIGGER update_products_timestamp
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_actualizado_en();