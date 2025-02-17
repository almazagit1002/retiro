import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Picker } from '@react-native-picker/picker';
import { logger } from '../../../lib/logger';

export default function NewUserScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'employee',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    logger.info('Starting form validation');
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'El nombre completo es requerido';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    logger.info(`Form validation ${isValid ? 'passed' : 'failed'}`, { errors: newErrors });
    return isValid;
  };

  const verifyProfile = async (userId: string, attempt: number): Promise<boolean> => {
    logger.info(`Starting profile verification attempt ${attempt + 1}/3`, { userId });
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        logger.error(`Profile verification attempt ${attempt + 1} failed with error`, profileError);
        return false;
      }

      if (profile) {
        logger.info(`Profile verification successful on attempt ${attempt + 1}`, { profile });
        return true;
      } else {
        logger.warn(`Profile not found on verification attempt ${attempt + 1}`, { userId });
        return false;
      }
    } catch (error) {
      logger.error(`Unexpected error in profile verification attempt ${attempt + 1}`, error);
      return false;
    }
  };

  const handleCreateUser = async () => {
    logger.info('Starting user creation process');
    
    if (!validateForm()) {
      logger.warn('Form validation failed, stopping user creation');
      return;
    }

    try {
      setLoading(true);
      logger.info('Initiating signup with Supabase Auth', { 
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role 
      });

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: formData.role,
          },
        },
      });

      if (signUpError) {
        logger.error('Supabase Auth signup failed', signUpError);
        if (signUpError.message.includes('weak_password')) {
          logger.warn('Weak password error detected');
          setErrors({
            ...errors,
            password: 'La contraseña debe tener al menos 6 caracteres',
          });
          return;
        }
        throw signUpError;
      }

      if (!authData.user) {
        logger.error('Auth successful but no user data returned');
        throw new Error('No se pudo crear el usuario');
      }

      logger.info('Auth signup successful', { userId: authData.user.id });
      logger.info('Starting profile verification process');

      let profileCreated = false;
      for (let i = 0; i < 3; i++) {
        logger.info(`Waiting for profile creation, attempt ${i + 1}/3`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        profileCreated = await verifyProfile(authData.user.id, i);
        if (profileCreated) {
          logger.info('Profile creation confirmed successfully');
          break;
        }
      }

      if (!profileCreated) {
        logger.error('Profile creation verification failed after all attempts');
        throw new Error('No se pudo verificar la creación del perfil');
      }

      logger.info('User creation process completed successfully');

      Alert.alert(
        'Éxito',
        'Usuario creado correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              logger.info('Navigating back to users list');
              router.replace('/(tabs)/users');
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      logger.error('Fatal error in user creation process', error);
      Alert.alert(
        'Error',
        'No se pudo crear el usuario. Por favor, intente de nuevo.'
      );
    } finally {
      setLoading(false);
      logger.info('User creation process finished');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.form}>
          <Text style={styles.label}>Nombre Completo *</Text>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            value={formData.fullName}
            onChangeText={(text) => {
              setFormData({ ...formData, fullName: text });
              if (errors.fullName) {
                setErrors({ ...errors, fullName: '' });
              }
            }}
            placeholder="Ingrese nombre completo"
            editable={!loading}
          />
          {errors.fullName && (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          )}

          <Text style={styles.label}>Correo Electrónico *</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={formData.email}
            onChangeText={(text) => {
              setFormData({ ...formData, email: text });
              if (errors.email) {
                setErrors({ ...errors, email: '' });
              }
            }}
            placeholder="Ingrese correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <Text style={styles.label}>Contraseña *</Text>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            value={formData.password}
            onChangeText={(text) => {
              setFormData({ ...formData, password: text });
              if (errors.password) {
                setErrors({ ...errors, password: '' });
              }
            }}
            placeholder="Ingrese contraseña (mínimo 6 caracteres)"
            secureTextEntry
            editable={!loading}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Ingrese teléfono"
            keyboardType="phone-pad"
            editable={!loading}
          />

          <Text style={styles.label}>Rol *</Text>
          {Platform.OS === 'ios' ? (
            <View style={styles.pickerContainerIOS}>
              <Picker
                selectedValue={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                enabled={!loading}
                itemStyle={styles.pickerItemIOS}
              >
                <Picker.Item label="Empleado" value="employee" color="#000000" />
                <Picker.Item label="Administrador" value="admin" color="#2ecc71" />
              </Picker>
            </View>
          ) : (
            <View style={styles.pickerContainerAndroid}>
              <Picker
                selectedValue={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                enabled={!loading}
                mode="dropdown"
              >
                <Picker.Item label="Empleado" value="employee" />
                <Picker.Item label="Administrador" value="admin" />
              </Picker>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateUser}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creando usuario...' : 'Crear Usuario'}
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
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
    marginBottom: 4,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginBottom: 12,
    marginTop: 2,
  },
  pickerContainerIOS: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16,
    height: 150,
  },
  pickerItemIOS: {
    fontSize: 16,
    height: 150,
  },
  pickerContainerAndroid: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
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