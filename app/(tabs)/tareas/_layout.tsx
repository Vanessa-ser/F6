import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function ChecklistLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#121212' : '#ffffff',
        },
        headerTintColor: isDark ? '#ffffff' : '#000000',
      }}
    >
     <Stack.Screen name="index" options={{ title: 'Tareas' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalle' }} />
    </Stack>
  );
}
