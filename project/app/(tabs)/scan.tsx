import React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import NativeScannerComponent from './_components/NativeScannerComponent';

export default function ScanScreen() {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Escáner de Código QR</Text>
        <Text style={styles.message}>
          El escaneo de códigos QR no está disponible en navegadores web
        </Text>
        <Text style={styles.submessage}>
          Por favor, use la aplicación móvil para escanear códigos QR
        </Text>
      </View>
    );
  }

  return <NativeScannerComponent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  submessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
  },
});