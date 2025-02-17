import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import type { Profile } from '../../../lib/types';
import { logger } from '../../../lib/logger';

export default function UsersScreen() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setIsAdmin(profile?.role === 'admin');
    } catch (error) {
      logger.error('Error checking admin status:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(profiles);
    } catch (error) {
      logger.error('Error fetching users:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Está seguro que desea eliminar al usuario ${userEmail}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              logger.info('Starting user deletion process', { userId });
              
              const { data, error } = await supabase
                .rpc('delete_user_with_profile', {
                  user_id: userId
                });

              if (error) throw error;

              if (!data) {
                throw new Error('No se pudo eliminar el usuario');
              }

              logger.info('User deleted successfully', { userId });
              Alert.alert('Éxito', 'Usuario eliminado correctamente');
              fetchUsers();
            } catch (error) {
              logger.error('Error deleting user:', error);
              Alert.alert(
                'Error',
                'No se pudo eliminar el usuario. Por favor, contacte al administrador del sistema.'
              );
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    checkAdminStatus();
    fetchUsers();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, []);

  if (!isAdmin) {
    return (
      <View style={styles.centered}>
        <Text>No tiene permisos para acceder a esta sección</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userCard}
            onPress={() => router.push(`/users/${item.id}`)}
          >
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.full_name || 'Sin nombre'}</Text>
              <Text style={styles.userEmail}>{item.email || 'Sin email'}</Text>
              <View style={styles.roleContainer}>
                <Text style={[
                  styles.roleText,
                  item.role === 'admin' ? styles.adminRole : styles.employeeRole
                ]}>
                  {item.role === 'admin' ? 'Administrador' : 'Empleado'}
                </Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteUser(item.id, item.email || '')}
              >
                <Ionicons 
                  name="trash-outline"
                  size={24} 
                  color="#ff3b30" 
                />
              </TouchableOpacity>
              <Ionicons 
                name="chevron-forward-outline"
                size={24} 
                color="#8e8e93" 
              />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>No hay usuarios registrados</Text>
          </View>
        }
      />
      
      <Link href="/users/new" asChild>
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="add-outline" size={24} color="white" />
        </TouchableOpacity>
      </Link>
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
  userCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  roleContainer: {
    alignSelf: 'flex-start',
  },
  roleText: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '500',
  },
  adminRole: {
    backgroundColor: '#e8f5e9',
    color: '#2ecc71',
  },
  employeeRole: {
    backgroundColor: '#f5f5f5',
    color: '#000000',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  deleteButton: {
    padding: 8,
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'ios' ? 32 : 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});