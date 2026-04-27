/**
 * GOE Mobile — Dashboard Screen
 * Shows KPIs, revenue trend, order status breakdown, recent orders, and GitHub issues summary
 */
import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { KpiCard } from '@/components/KpiCard';
import { SectionHeader } from '@/components/SectionHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingState, ErrorState } from '@/components/LoadingState';
import { Colors, QUERY_KEYS } from '@/constants';
import { useTheme } from '@/hooks/useTheme';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const stats = useQuery({ queryKey: QUERY_KEYS.STATS, queryFn: api.getStats });
  const orders = useQuery({ queryKey: QUERY_KEYS.ORDERS, queryFn: api.getOrders });
  const issues = useQuery({ queryKey: QUERY_KEYS.ISSUES, queryFn: api.getIssues });

  if (stats.isLoading) return <LoadingState message="Loading dashboard…" />;
  if (stats.isError) return <ErrorState message="Failed to load dashboard" />;

  const s = stats.data!;
  const recentOrders = (orders.data ?? []).slice(0, 5);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDark ? '#1e293b' : '#fff', borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Platform Overview</Text>
            <Text style={[styles.headerSub, { color: colors.textMuted }]}>
              GOE · Global Order Engine · ASP.NET Core 10
            </Text>
          </View>
          <View style={styles.repoChip}>
            <Text style={styles.repoChipText}>AMNNSPK</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* KPI Grid */}
          <View style={styles.kpiGrid}>
            <KpiCard
              title="Revenue"
              value={`$${parseFloat(s.revenue).toFixed(2)}`}
              subtitle="Completed orders"
              accentColor={Colors.success}
            />
            <KpiCard
              title="Total Orders"
              value={s.totalOrders}
              subtitle={`${s.pendingOrders} pending`}
              accentColor={Colors.primary}
            />
            <KpiCard
              title="Products"
              value={s.totalProducts}
              subtitle="In catalog"
              accentColor="#8b5cf6"
            />
            <KpiCard
              title="Customers"
              value={s.totalCustomers}
              subtitle="Registered"
              accentColor="#06b6d4"
            />
          </View>

          {/* GitHub Issues */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SectionHeader
              title="Integration Test Issues"
              subtitle={`${s.openIssues} open · ${s.totalTests} total test cases`}
            />
            {(issues.data ?? []).map((issue) => (
              <TouchableOpacity
                key={issue.id}
                style={[styles.issueRow, { borderBottomColor: colors.border }]}
                onPress={() => Linking.openURL(issue.url)}
                activeOpacity={0.7}
              >
                <View style={styles.issueLeft}>
                  <Text style={[styles.issueNum, { color: Colors.primary }]}>#{issue.id}</Text>
                  <Text
                    style={[styles.issueName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {issue.title.replace(/\[Integration Tests\]\s*/i, '')}
                  </Text>
                </View>
                <View style={styles.issueRight}>
                  <Text style={[styles.issueTests, { color: colors.textMuted }]}>
                    {issue.checkboxTotal} tests
                  </Text>
                  <StatusBadge label="open" type="generic" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Orders */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SectionHeader title="Recent Orders" />
            {recentOrders.map((order) => (
              <View
                key={order.id}
                style={[styles.orderRow, { borderBottomColor: colors.border }]}
              >
                <View style={styles.orderLeft}>
                  <View style={styles.orderIdChip}>
                    <Text style={styles.orderIdText}>#{order.id}</Text>
                  </View>
                  <View>
                    <Text style={[styles.orderEmail, { color: colors.text }]} numberOfLines={1}>
                      {order.customerEmail}
                    </Text>
                    <Text style={[styles.orderMeta, { color: colors.textMuted }]}>
                      {order.paymentMethod.replace('Payments.', '')}
                    </Text>
                  </View>
                </View>
                <View style={styles.orderRight}>
                  <Text style={[styles.orderTotal, { color: colors.text }]}>
                    {order.currency} {order.total.toFixed(2)}
                  </Text>
                  <StatusBadge label={order.orderStatus} type="order" />
                </View>
              </View>
            ))}
          </View>

          {/* Backend Modules */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SectionHeader title="Backend Modules" subtitle="GOE.Modules namespace" />
            <View style={styles.modulesGrid}>
              {[
                'Identity', 'Catalog', 'Pricing', 'Order',
                'Payment', 'Inventory', 'Shipping', 'Vendor',
                'MultiStore', 'Notification',
              ].map((mod) => (
                <View key={mod} style={[styles.moduleChip, { borderColor: colors.border }]}>
                  <Text style={[styles.moduleText, { color: colors.text }]}>{mod}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  headerSub: { fontSize: 11, marginTop: 1 },
  repoChip: {
    backgroundColor: '#0f172a',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  repoChipText: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  body: { padding: 16, gap: 16 },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  issueLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  issueNum: { fontSize: 12, fontWeight: '700', minWidth: 22 },
  issueName: { fontSize: 12, flex: 1 },
  issueRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  issueTests: { fontSize: 11 },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  orderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  orderIdChip: {
    backgroundColor: '#1e40af20',
    borderRadius: 4,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderIdText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  orderEmail: { fontSize: 12, fontWeight: '500' },
  orderMeta: { fontSize: 11 },
  orderRight: { alignItems: 'flex-end', gap: 3 },
  orderTotal: { fontSize: 13, fontWeight: '600' },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 4,
  },
  moduleChip: {
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moduleText: { fontSize: 11, fontWeight: '500' },
});
