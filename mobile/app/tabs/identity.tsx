/**
 * GOE Mobile — Identity Screen
 * Role breakdown, customer table, application services, domain events
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { StatusBadge } from '@/components/StatusBadge';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadingState, ErrorState } from '@/components/LoadingState';
import { Colors, QUERY_KEYS } from '@/constants';
import { useTheme } from '@/hooks/useTheme';

const APP_SERVICES = [
  { name: 'GoeSignInManager', desc: 'Lockout, last-activity, external OAuth, event publishing' },
  { name: 'WorkContext', desc: 'HTTP-scoped: current customer, language, currency from JWT' },
  { name: 'StoreContext', desc: 'Resolves active store from Host header with 10-min cache' },
  { name: 'TokenService', desc: 'JWT Bearer issuance/validation with HMAC-SHA256' },
  { name: 'PermissionService', desc: 'Role-based ACL — Administrators bypass all checks' },
  { name: 'DeleteGuestsTask', desc: 'Quartz.NET daily cleanup of guest records older than 7 days' },
];

const DOMAIN_EVENTS = [
  { name: 'CustomerRegisteredEvent', fields: 'CustomerId, Email, OccurredOnUtc' },
  { name: 'CustomerLoggedInEvent', fields: 'CustomerId, Email, IpAddress, OccurredOnUtc' },
  { name: 'PasswordChangedEvent', fields: 'CustomerId, OccurredOnUtc' },
];

export default function IdentityScreen() {
  const { colors } = useTheme();

  const { data: customers = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMERS,
    queryFn: api.getCustomers,
  });

  if (isLoading) return <LoadingState message="Loading identity data…" />;
  if (isError) return <ErrorState message="Failed to load identity" />;

  // Role breakdown
  const roleCounts: Record<string, number> = {};
  customers.forEach((c) => {
    roleCounts[c.role] = (roleCounts[c.role] ?? 0) + 1;
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Role Breakdown */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader title="Identity" subtitle="GoeIdentity module · ASP.NET Core Identity + JWT + ACL" />
          <View style={styles.rolesGrid}>
            {Object.entries(roleCounts).map(([role, count]) => (
              <View key={role} style={[styles.roleCard, { borderColor: colors.border }]}>
                <Text style={[styles.roleCount, { color: colors.text }]}>{count}</Text>
                <StatusBadge label={role} type="role" size="sm" />
              </View>
            ))}
          </View>
        </View>

        {/* Customer Table */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader title={`Customers (${customers.length})`} />
          {customers.map((c) => (
            <View key={c.id} style={[styles.customerRow, { borderBottomColor: colors.border }]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.custName, { color: colors.text }]}>
                  {c.firstName} {c.lastName}
                </Text>
                <Text style={[styles.custEmail, { color: colors.textMuted }]}>{c.email}</Text>
              </View>
              <View style={styles.custRight}>
                <StatusBadge label={c.role} type="role" size="sm" />
                <View style={styles.statusRow}>
                  {c.active ? (
                    <View style={styles.activeIndicator}>
                      <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                      <Text style={[styles.activeText, { color: Colors.success }]}>Active</Text>
                    </View>
                  ) : (
                    <View style={styles.activeIndicator}>
                      <Ionicons name="close-circle" size={12} color={Colors.error} />
                      <Text style={[styles.activeText, { color: Colors.error }]}>Inactive</Text>
                    </View>
                  )}
                  {c.failedLogins > 0 && (
                    <Text style={[styles.failedText, { color: c.failedLogins >= 5 ? Colors.error : Colors.warning }]}>
                      {c.failedLogins} failed
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Application Services */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader title="Application Services" />
          {APP_SERVICES.map((svc) => (
            <View key={svc.name} style={[styles.svcRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.svcIcon, { backgroundColor: `${Colors.primary}15` }]}>
                <Ionicons name="shield-checkmark-outline" size={14} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.svcName, { color: colors.text }]}>{svc.name}</Text>
                <Text style={[styles.svcDesc, { color: colors.textMuted }]}>{svc.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Domain Events */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader title="Domain Events" />
          {DOMAIN_EVENTS.map((ev) => (
            <View key={ev.name} style={[styles.eventRow, { borderBottomColor: colors.border, backgroundColor: `${Colors.primary}05` }]}>
              <Text style={[styles.eventName, { color: colors.text }]}>{ev.name}</Text>
              <Text style={[styles.eventFields, { color: colors.textMuted }]}>{ev.fields}</Text>
            </View>
          ))}
        </View>

        {/* Lockout Policy */}
        <View style={[styles.lockoutBanner, { borderColor: Colors.warning, backgroundColor: `${Colors.warning}10` }]}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.warning} />
          <Text style={[styles.lockoutText, { color: Colors.warning }]}>
            Lockout Policy: 5 consecutive failed login attempts trigger a 15-minute lockout. Customers with FailedLoginAttempts ≥ 5 are shown above in red.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 12, gap: 12, paddingBottom: 32 },
  card: { borderRadius: 10, borderWidth: 1, padding: 14 },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  roleCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    minWidth: '44%',
    flex: 1,
    gap: 4,
  },
  roleCount: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  custName: { fontSize: 13, fontWeight: '600' },
  custEmail: { fontSize: 11 },
  custRight: { alignItems: 'flex-end', gap: 4 },
  statusRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  activeIndicator: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  activeText: { fontSize: 10, fontWeight: '600' },
  failedText: { fontSize: 10, fontWeight: '600' },
  svcRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  svcIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  svcName: { fontSize: 12, fontWeight: '600' },
  svcDesc: { fontSize: 10, lineHeight: 15, marginTop: 1 },
  eventRow: {
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    gap: 2,
  },
  eventName: { fontSize: 12, fontWeight: '600' },
  eventFields: { fontSize: 10 },
  lockoutBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  lockoutText: { fontSize: 11, flex: 1, lineHeight: 16 },
});
