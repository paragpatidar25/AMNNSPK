import { useColorScheme } from 'react-native';
import { Colors } from '@/constants';

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return {
    isDark,
    colors: {
      background: isDark ? '#0f172a' : Colors.background,
      surface: isDark ? '#1e293b' : Colors.surface,
      card: isDark ? '#1e293b' : '#ffffff',
      text: isDark ? '#f1f5f9' : Colors.text,
      textMuted: isDark ? '#94a3b8' : Colors.textMuted,
      border: isDark ? Colors.borderDark : Colors.border,
      primary: Colors.primary,
      sidebar: Colors.sidebar,
    },
  };
}
