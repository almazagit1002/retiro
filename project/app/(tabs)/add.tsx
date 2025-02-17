import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';
import { ErrorDisplay } from '../../components/ErrorDisplay';

export default function AddProductScreen() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [codigoQR, setCodigoQR] = useState('');
  const [precio, setPrecio] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const validateForm = () => {
    if (!nombre.trim()) return 'El nombre es requerido';
    if (!descripcion.trim()) return 'La descripción es requerida';
    if (!categoria.trim()) return 'La categoría es requerida';
    if (!codigoQR.trim()) return 'El código QR es requerido';
    if (!precio.trim() || isNaN(Number(precio)) || Number(precio) < 0) 
      return 'El precio debe ser un número válido mayor o igual a 0';
    if (!cantidad.trim() || isNaN(Number(cantidad)) || Number(cantidad) < 0) 
      return 'La cantidad debe ser un número válido mayor o igual a 0';
    return null;
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      const validationError = validateForm();
      if (validationError) {
        throw new Error(validationError);
      }

      setLoading(true);
      logger.info('Attempting to add product', {
        nombre,
        categoria,
        codigoQR,
      });

      const { data, error: supabaseError } = await supabase
        .from('products')
        .insert([
          {
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            categoria: categoria.trim(),
            codigo_qr: codigoQR.trim(),
            precio: parseFloat(precio),
            cantidad_stock: parseInt(cantidad, 10),
          },
        ])
        .select();

      if (supabaseError) {
        logger.error('Supabase error', supabaseError);
        throw new Error(supabaseError.message);
      }

      logger.info('Product added successfully', data);
      Alert.alert('Éxito', 'Producto añadido correctamente');
      
      // Clear form
      setNombre('');
      setDescripcion('');
      setCategoria('');
      setCodigoQR('');
      setPrecio('');
      setCantidad('');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al añadir producto');
      logger.error('Failed to add product', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.form}>
          {error && (
            <ErrorDisplay error={error} context="Error al añadir producto" />
          )}

          <Text style={styles.label}>Nombre del Producto</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ingrese nombre del producto"
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Ingrese descripción del producto"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Categoría</Text>
          <TextInput
            style={styles.input}
            value={categoria}
            onChangeText={setCategoria}
            placeholder="Ingrese categoría"
          />

          <Text style={styles.label}>Código QR</Text>
          <TextInput
            style={styles.input}
            value={codigoQR}
            onChangeText={setCodigoQR}
            placeholder="Ingrese código QR"
          />

          <Text style={styles.label}>Precio</Text>
          <TextInput
            style={styles.input}
            value={precio}
            onChangeText={setPrecio}
            placeholder="Ingrese precio"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Cantidad en Stock</Text>
          <TextInput
            style={styles.input}
            value={cantidad}
            onChangeText={setCantidad}
            placeholder="Ingrese cantidad"
            keyboardType="number-pad"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Añadiendo...' : 'Añadir Producto'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  form: {
    backgroundColor: 'white',
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});