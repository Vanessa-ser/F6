import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#2E7D32',   
        tabBarInactiveTintColor: '#9E9E9E',
      }}
    >
      <Tabs.Screen 
        name="notas" 
        options={{ 
          tabBarLabel: 'Notas', 
          tabBarIcon: ({ color }) => <Ionicons name="document" color={color} size={24}/> 
        }} 
      />
      <Tabs.Screen 
        name="ideas" 
        options={{ 
          tabBarLabel: 'Ideas', 
          tabBarIcon: ({ color }) => <Ionicons name="bulb" color={color} size={24}/> 
        }} 
      />
      <Tabs.Screen 
        name="tareas" 
        options={{ 
          tabBarLabel: 'Tareas',
          tabBarIcon: ({ color }) => <Ionicons name="checkbox" color={color} size={24}/> 
        }} 
      />
    </Tabs>
  );
}