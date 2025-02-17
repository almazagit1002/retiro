import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5',
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
        height: Platform.OS === 'ios' ? 85 : 'auto',
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#8e8e93',
      headerStyle: {
        backgroundColor: '#ffffff',
      },
      headerShadowVisible: false,
      tabBarLabelStyle: {
        fontSize: 12,
        marginBottom: Platform.OS === 'ios' ? 0 : 4,
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inventario',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'cube' : 'cube-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Escanear',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'qr-code' : 'qr-code-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Añadir',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'add-circle' : 'add-circle-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Usuarios',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'people' : 'people-outline'} 
              size={size} 
              color={color} 
            />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}