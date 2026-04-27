import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  OrderStatusColors,
  PaymentStatusColors,
  ShippingStatusColors,
  Colors,
} from '@/constants';

interface Props {
  label: string;
  type?: 'order' | 'payment' | 'shipping' | 'role' | 'generic';
  size?: 'sm' | 'md';
}

function getColor(label: string, type: Props['type']): string {
  if (type === 'order') return OrderStatusColors[label] ?? Colors.textMuted;
  if (type === 'payment') return PaymentStatusColors[label] ?? Colors.textMuted;
  if (type === 'shipping') return ShippingStatusColors[label] ?? Colors.textMuted;
  if (type === 'role') {
    const roleColors: Record<string, string> = {
      Administrators: '#7c3aed',
      Registered: Colors.primary,
      Vendors: '#0891b2',
      Moderators: '#059669',
    };
    return roleColors[label] ?? Colors.textMuted;
  }
  return Colors.primary;
}

export function StatusBadge({ label, type = 'generic', size = 'sm' }: Props) {
  const color = getColor(label, type);
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${color}20`,
          borderColor: `${color}40`,
          paddingHorizontal: isSmall ? 6 : 10,
          paddingVertical: isSmall ? 2 : 4,
        },
      ]}
    >
      <Text style={[styles.label, { color, fontSize: isSmall ? 10 : 12 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
