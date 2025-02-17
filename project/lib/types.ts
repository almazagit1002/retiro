export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  creado_en: string;
  codigo_qr: string;
  codigo_sku: string;
  cantidad_stock: number;
  precio: number;
}

export interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'employee';
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  // Add other client fields as needed
}

export interface Inventory {
  id: string;
  // Add other inventory fields as needed
}

export interface Venta {
  id: string;
  // Add other sales fields as needed
}