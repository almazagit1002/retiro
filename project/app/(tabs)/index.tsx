import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../lib/types';

export default function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('nombre');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Cargando inventario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Text style={styles.productName}>{item.nombre}</Text>
            <Text style={styles.productDetails}>{item.descripcion}</Text>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryText}>
                Categoría: {item.categoria}
              </Text>
              <Text style={styles.dateText}>
                {new Date(item.creado_en).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.stockInfo}>
              <Text style={styles.priceText}>
                Precio: ${item.precio.toFixed(2)}
              </Text>
              <Text style={styles.stockText}>
                Stock: {item.cantidad_stock}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>No se encontraron productos</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productCard: {
    backgroundColor: 'white',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#444',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ecc71',
  },
  stockText: {
    fontSize: 14,
    color: '#444',
  },
});