/*
  # Actualizar esquema de base de datos a español

  1. Cambios en la tabla products
    - Renombrar campos a español:
      - name -> nombre
      - description -> descripcion
      - category -> categoria
      - qr_code -> codigo_qr
      - stock_quantity -> cantidad_stock
      - price -> precio
      - created_at -> creado_en
      - updated_at -> actualizado_en

  2. Seguridad
    - Se mantienen las políticas de RLS existentes
    - Se actualizan los nombres de las políticas a español
*/

DO $$ 
BEGIN
  -- Renombrar columnas existentes
  ALTER TABLE products RENAME COLUMN name TO nombre;
  ALTER TABLE products RENAME COLUMN sku TO codigo_sku;
  ALTER TABLE products RENAME COLUMN qr_code TO codigo_qr;
  ALTER TABLE products RENAME COLUMN stock_quantity TO cantidad_stock;
  ALTER TABLE products RENAME COLUMN price TO precio;
  ALTER TABLE products RENAME COLUMN created_at TO creado_en;
  ALTER TABLE products RENAME COLUMN updated_at TO actualizado_en;

  -- Actualizar nombres de políticas
  ALTER POLICY "Users can read all products" ON products
    RENAME TO "Usuarios pueden leer todos los productos";

  ALTER POLICY "Users can create products" ON products
    RENAME TO "Usuarios pueden crear productos";

  ALTER POLICY "Users can update products" ON products
    RENAME TO "Usuarios pueden actualizar productos";
END $$;