import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  accentColor?: string;
}

export function KpiCard({ title, value, subtitle, accentColor }: Props) {
  const { colors } = useTheme();
  const accent = accentColor ?? '#3B82F6';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.accent, { backgroundColor: `${accent}20` }]}>
        <View style={[styles.accentDot, { backgroundColor: accent }]} />
      </View>
      <Text style={[styles.title, { color: colors.textMuted }]}>{title.toUpperCase()}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    flex: 1,
    minWidth: '45%',
    gap: 4,
  },
  accent: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  accentDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  title: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
  },
});
