import { Stack } from 'expo-router';

export default function UsersLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Gestión de Usuarios',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="new" 
        options={{ 
          title: 'Nuevo Usuario',
          headerShown: true,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Detalles de Usuario',
          headerShown: true 
        }} 
      />
    </Stack>
  );
}