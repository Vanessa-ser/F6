import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getToken } from '../lib/auth';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function resolveRoute() {
      const token = await getToken();
      if (!active) return;
      router.replace(token ? '/(tabs)/tareas' : '/login');
      setLoading(false);
    }

    resolveRoute();

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
