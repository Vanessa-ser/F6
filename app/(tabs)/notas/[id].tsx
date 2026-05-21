import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function NotaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Detalle de nota: {id}</Text>
    </View>
  );
}
