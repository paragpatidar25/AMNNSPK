/**
 * GOE Mobile — Orders Screen
 * Full order list with filter tabs, status badges, inline status update
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api, Order } from '@/services/api';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingState, ErrorState } from '@/components/LoadingState';
import { Colors, QUERY_KEYS } from '@/constants';
import { useTheme } from '@/hooks/useTheme';

const FILTERS = ['All', 'Pending', 'Processing', 'Complete', 'Cancelled'] as const;
type Filter = (typeof FILTERS)[number];

const ORDER_STATUSES = ['Pending', 'Processing', 'Complete', 'Cancelled'];

export default function OrdersScreen() {
  const { colors } = useTheme();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>('All');

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.ORDERS,
    queryFn: api.getOrders,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS }),
    onError: () => Alert.alert('Error', 'Failed to update order status'),
  });

  const filtered = filter === 'All'
    ? orders
    : orders.filter((o) => o.orderStatus === filter);

  if (isLoading) return <LoadingState message="Loading orders…" />;
  if (isError) return <ErrorState message="Failed to load orders" />;

  const renderOrder = ({ item }: { item: Order }) => {
    const date = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short',
    });

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.orderIdWrap}>
            <Text style={[styles.orderId, { color: Colors.primary }]}>#{item.id}</Text>
            {item.isGuest ? (
              <View style={styles.guestBadge}>
                <Text style={styles.guestText}>Guest</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.date, { color: colors.textMuted }]}>{date}</Text>
        </View>

        <Text style={[styles.email, { color: colors.text }]}>{item.customerEmail}</Text>

        <View style={styles.statusRow}>
          <StatusBadge label={item.orderStatus} type="order" />
          <StatusBadge label={item.paymentStatus} type="payment" />
          <StatusBadge label={item.shippingStatus} type="shipping" />
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={[styles.total, { color: colors.text }]}>
              {item.currency} {item.total.toFixed(2)}
            </Text>
            <Text style={[styles.method, { color: colors.textMuted }]}>
              {item.paymentMethod.replace('Payments.', '')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.updateBtn, { borderColor: colors.border }]}
            onPress={() => {
              Alert.alert('Update Status', `Order #${item.id}`, [
                ...ORDER_STATUSES.map((s) => ({
                  text: s,
                  onPress: () => updateMutation.mutate({ id: item.id, status: s }),
                })),
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
          >
            <Ionicons name="refresh-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.updateBtnText, { color: colors.textMuted }]}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Filter Tabs */}
      <View style={[styles.filters, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f ? Colors.primary : colors.textMuted },
                filter === f && styles.filterTextActive,
              ]}
            >
              {f}
              {f !== 'All' && (
                <Text style={{ fontSize: 10 }}>
                  {' '}({orders.filter((o) => o.orderStatus === f).length})
                </Text>
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    overflow: 'scroll',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: Colors.primary,
  },
  filterText: { fontSize: 12, fontWeight: '500' },
  filterTextActive: { color: Colors.primary, fontWeight: '700' },
  list: { padding: 12, paddingBottom: 32 },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderIdWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderId: { fontSize: 14, fontWeight: '700' },
  guestBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  guestText: { fontSize: 9, color: '#64748b', fontWeight: '600' },
  date: { fontSize: 11 },
  email: { fontSize: 13, fontWeight: '500' },
  statusRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  total: { fontSize: 14, fontWeight: '700' },
  method: { fontSize: 11 },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  updateBtnText: { fontSize: 12 },
});
