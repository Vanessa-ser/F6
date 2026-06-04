export const Palette = {
    light: {
      background: '#F9F9F9',
      surface: '##F5F5F5',
      text: '#1C1C1E',
      textMuted: '#8E8E93',
      primary: '#2F6F4E',
      border: '#E5E5E5',
      accent: '#4C9A6A',
      danger: '#E9E4DD"',
    },
    dark: {
      background: '#121212',
      surface: '#1E1E1E',
      text: '#FFFFFF',
      textMuted: '#A1A1A6',
      primary: '#3FA66B',
      border: '#2C2C2E',
      accent: '#58C386',
      danger: '#2A2A2A',
    }
  };
  
  export const Typography = {
    title: { fontSize: 20, fontWeight: '700' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    caption: { fontSize: 12, fontWeight: '400' as const },
  };
  
  export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  };