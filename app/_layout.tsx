import { Stack } from 'expo-router';
import DevServerWatcher from './components/DevServerWatcher';

export default function RootLayout() {
  return (
    <>
      <DevServerWatcher />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />


        <Stack.Screen 
          name="nueva-nota" 
          options={{ presentation: 'modal' }} 
        />
      </Stack>
    </>
  );
}