import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import DevServerWatcher from './components/DevServerWatcher';
import { useNotesStore } from '../store/notesStore';
import { getToken } from '../lib/auth';

function DataLoader() {
  const fetchNotes = useNotesStore((state) => state.fetchNotes);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadNotes() {
      const token = await getToken();
      if (!active) return;

      if (token) {
        await fetchNotes();
      }

      if (active) {
        setIsReady(true);
      }
    }

    loadNotes();

    return () => {
      active = false;
    };
  }, [fetchNotes]);

  return isReady ? null : null;
}

export default function RootLayout() {
  return (
    <>
      <DevServerWatcher />
      <DataLoader />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen 
          name="nueva-nota" 
          options={{ presentation: 'modal' }} 
        />
      </Stack>
    </>
  );
}