import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Esto dice que cargue todo lo que está en (tabs) */}
      <Stack.Screen name="(tabs)" />
      
      {/* Y esto define tu modal de nueva nota */}
      <Stack.Screen 
        name="nueva-nota" 
        options={{ presentation: 'modal' }} 
      />
    </Stack>
  );
}