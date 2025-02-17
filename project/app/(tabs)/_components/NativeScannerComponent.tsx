import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, Platform } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { supabase } from '../../../lib/supabase';
import { logger } from '../../../lib/logger';
import { ErrorDisplay } from '../../../components/ErrorDisplay';

export default function NativeScannerComponent() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      try {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Error requesting camera permissions');
        logger.error('Failed to request camera permissions', error);
        setError(error);
      }
    };

    if (Platform.OS !== 'web') {
      getBarCodeScannerPermissions();
    }
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    try {
      logger.info('Scanning QR code', { data });
      
      const { data: product, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .eq('codigo_qr', data)
        .single();

      if (supabaseError) {
        logger.error('Supabase query error', supabaseError);
        throw supabaseError;
      }

      if (product) {
        logger.info('Product found', product);
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
        logger.warn('Product not found', { qrCode: data });
        Alert.alert('Error', 'Producto no encontrado', [
          { text: 'OK', onPress: () => setScanned(false) },
        ]);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error scanning product');
      logger.error('Error scanning product', error);
      setError(error);
      Alert.alert('Error', 'Error al procesar el código QR', [
        { text: 'OK', onPress: () => {
          setScanned(false);
          setError(null);
        }},
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

  if (error) {
    return <ErrorDisplay error={error} context="Error en el escáner" />;
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
      {Platform.OS !== 'web' && (
        <>
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
        </>
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