import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, Platform } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { supabase } from '../../../lib/supabase';

export default function NativeScannerComponent() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      if (Platform.OS === 'web') {
        setHasPermission(false);
        return;
      }
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('codigo_qr', data)
        .single();

      if (error) throw error;

      if (product) {
        Alert.alert(
          'Producto Encontrado',
          `${product.nombre}\n${product.descripcion}`,
          [
            {
              text: 'Ver Detalles',
              onPress: () => {
                setScanned(false);
              },
            },
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => setScanned(false),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Producto no encontrado', [
          { text: 'OK', onPress: () => setScanned(false) },
        ]);
      }
    } catch (error) {
      console.error('Error al escanear producto:', error);
      Alert.alert('Error', 'Error al procesar el código QR', [
        { text: 'OK', onPress: () => setScanned(false) },
      ]);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>El escáner no está disponible en web</Text>
        <Text style={styles.errorSubtext}>
          Por favor, use la aplicación móvil para escanear códigos QR
        </Text>
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Solicitando permiso de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Sin acceso a la cámara</Text>
        <Text style={styles.errorSubtext}>
          Por favor, conceda permiso de cámara para usar el escáner
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <View style={styles.overlay}>
          <Button 
            title="Toque para escanear de nuevo" 
            onPress={() => setScanned(false)} 
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff3b30',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});