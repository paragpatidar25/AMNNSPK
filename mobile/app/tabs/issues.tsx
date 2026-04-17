/**
 * GOE Mobile — Test Issues Screen
 * GitHub Issues #1-5 with full test checklists, progress bars, labels
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { LoadingState, ErrorState } from '@/components/LoadingState';
import { Colors, QUERY_KEYS } from '@/constants';
import { useTheme } from '@/hooks/useTheme';

const LABEL_COLORS: Record<string, string> = {
  testing: '#e4e669',
  'integration-test': '#0075ca',
  identity: '#bfd4f2',
  orders: '#d4c5f9',
  pricing: '#c5def5',
};

export default function IssuesScreen() {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState<number | null>(1);

  const { data: issues = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.ISSUES,
    queryFn: api.getIssues,
  });

  if (isLoading) return <LoadingState message="Loading issues…" />;
  if (isError) return <ErrorState message="Failed to load GitHub Issues" />;

  const totalTests = issues.reduce((sum, i) => sum + i.checkboxTotal, 0);
  const totalChecked = issues.reduce((sum, i) => sum + i.checkboxChecked, 0);
  const overallPct = totalTests > 0 ? Math.round((totalChecked / totalTests) * 100) : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Overall Coverage */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.coverageHeader}>
            <View>
              <Text style={[styles.coverageTitle, { color: colors.text }]}>Total Test Coverage</Text>
              <View style={styles.coverageMeta}>
                <Text style={[styles.coverageMetaText, { color: colors.textMuted }]}>{totalTests} test cases</Text>
                <Text style={[styles.coverageMetaText, { color: colors.textMuted }]}>  ·  </Text>
                <Text style={[styles.coverageMetaText, { color: colors.textMuted }]}>{issues.length} issues</Text>
              </View>
            </View>
            <Text style={[styles.coveragePct, { color: Colors.primary }]}>{overallPct}/92 complete</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${overallPct}%`, backgroundColor: Colors.primary }]} />
          </View>
          <View style={styles.tagRow}>
            {['AuthController', 'SignInManager', 'CheckoutService', 'Pipeline', 'Calculators'].map((t) => (
              <View key={t} style={[styles.tag, { borderColor: colors.border }]}>
                <Text style={[styles.tagText, { color: colors.textMuted }]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Issue Cards */}
        {issues.map((issue) => {
          const labels: string[] = JSON.parse(issue.labels ?? '[]');
          const pct = issue.checkboxTotal > 0
            ? Math.round((issue.checkboxChecked / issue.checkboxTotal) * 100)
            : 0;
          const isOpen = expanded === issue.id;

          const shortTitle = issue.title
            .replace(/\[Integration Tests\]\s*/i, '')
            .replace(/\s—\s.*/, '');

          return (
            <View key={issue.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Issue Header */}
              <TouchableOpacity
                style={styles.issueHeader}
                onPress={() => setExpanded(isOpen ? null : issue.id)}
                activeOpacity={0.7}
              >
                <View style={styles.issueHeaderLeft}>
                  <Text style={[styles.issueNum, { color: Colors.primary }]}>#{issue.id}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.issueTitle, { color: colors.text }]} numberOfLines={2}>
                      {shortTitle}
                    </Text>
                    <View style={styles.labelsRow}>
                      {labels.map((l) => (
                        <View
                          key={l}
                          style={[
                            styles.labelChip,
                            { backgroundColor: `${LABEL_COLORS[l] ?? '#888'}40` },
                          ]}
                        >
                          <Text style={[styles.labelText, { color: LABEL_COLORS[l] ?? '#888' }]}>{l}</Text>
                        </View>
                      ))}
                      <View style={[styles.labelChip, { backgroundColor: '#22c55e30' }]}>
                        <Text style={[styles.labelText, { color: '#22c55e' }]}>open</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.issueHeaderRight}>
                  <Text style={[styles.issuePct, { color: Colors.primary }]}>{pct}%</Text>
                  <Text style={[styles.issueCount, { color: colors.textMuted }]}>
                    {issue.checkboxChecked}/{issue.checkboxTotal}
                  </Text>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.textMuted}
                  />
                </View>
              </TouchableOpacity>

              {/* Progress Bar */}
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${pct}%`, backgroundColor: pct === 100 ? Colors.success : Colors.primary },
                  ]}
                />
              </View>

              {/* Expanded: open on GitHub */}
              {isOpen && (
                <TouchableOpacity
                  style={[styles.ghLink, { borderTopColor: colors.border }]}
                  onPress={() => Linking.openURL(issue.url)}
                >
                  <Ionicons name="logo-github" size={14} color={colors.textMuted} />
                  <Text style={[styles.ghLinkText, { color: Colors.primary }]}>
                    View on GitHub → {issue.url.split('/').slice(-2).join('/#')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* View All Link */}
        <TouchableOpacity
          style={[styles.viewAllBtn, { borderColor: colors.border }]}
          onPress={() => Linking.openURL('https://github.com/paragpatidar25/AMNNSPK/issues')}
        >
          <Ionicons name="logo-github" size={16} color={Colors.primary} />
          <Text style={[styles.viewAllText, { color: Colors.primary }]}>
            View All Issues on GitHub
          </Text>
          <Ionicons name="open-outline" size={14} color={Colors.primary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 12, gap: 12, paddingBottom: 32 },
  card: { borderRadius: 10, borderWidth: 1, padding: 14, gap: 10 },
  coverageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  coverageTitle: { fontSize: 14, fontWeight: '700' },
  coverageMeta: { flexDirection: 'row', marginTop: 2 },
  coverageMetaText: { fontSize: 11 },
  coveragePct: { fontSize: 12, fontWeight: '700' },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 4,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  tagText: { fontSize: 10, fontWeight: '500' },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  issueHeaderLeft: { flexDirection: 'row', flex: 1, gap: 8 },
  issueNum: { fontSize: 13, fontWeight: '700', marginTop: 1 },
  issueTitle: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
  labelsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  labelChip: {
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  labelText: { fontSize: 9, fontWeight: '600' },
  issueHeaderRight: { alignItems: 'center', gap: 2 },
  issuePct: { fontSize: 13, fontWeight: '700' },
  issueCount: { fontSize: 10 },
  ghLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  ghLinkText: { fontSize: 11, textDecorationLine: 'underline' },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  viewAllText: { fontSize: 13, fontWeight: '600' },
});
