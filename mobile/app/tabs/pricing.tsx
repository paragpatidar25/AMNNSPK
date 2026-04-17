/**
 * GOE Mobile — Pricing Screen
 * Pipeline visualizer, price simulator, discounts, currency rates
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { LoadingState, ErrorState } from '@/components/LoadingState';
import { Colors, QUERY_KEYS } from '@/constants';
import { useTheme } from '@/hooks/useTheme';

const PIPELINE_STEPS = [
  { order: 0, name: 'BasePrice', desc: "Sets working price to product's BasePrice" },
  { order: 10, name: 'TierPrice', desc: 'Applies best tier price for order quantity' },
  { order: 20, name: 'Discount', desc: 'Applies coupon codes and auto discounts' },
  { order: 30, name: 'Tax', desc: 'Adds 10% tax (or passes through if inclusive)' },
  { order: 40, name: 'Currency', desc: 'Converts to requested currency from cache' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD'];

const CURRENCY_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  AUD: 1.54,
};

function simulatePipeline(base: number, qty: number, coupon: string, currency: string, taxInclusive: boolean, discounts: Array<{ couponCode: string | null; type: string; value: number; active: number }>) {
  let price = base;
  const steps: { name: string; price: number }[] = [];

  // Step 0 — Base
  steps.push({ name: 'BasePriceCalculator', price });

  // Step 10 — Tier
  if (qty >= 5) price *= 0.95;
  if (qty >= 10) price *= 0.90;
  steps.push({ name: 'TierPriceCalculator', price: parseFloat(price.toFixed(2)) });

  // Step 20 — Discount
  const activeDiscounts = discounts.filter((d) => d.active === 1);
  for (const d of activeDiscounts) {
    if (!coupon || d.couponCode === coupon || d.couponCode === null) {
      if (d.type === 'Percentage') price -= (price * d.value) / 100;
      else if (d.type === 'Flat') price -= d.value;
    }
  }
  price = Math.max(0, price);
  steps.push({ name: 'DiscountCalculator', price: parseFloat(price.toFixed(2)) });

  // Step 30 — Tax
  if (!taxInclusive) price *= 1.10;
  steps.push({ name: 'TaxCalculator', price: parseFloat(price.toFixed(2)) });

  // Step 40 — Currency
  const rate = CURRENCY_RATES[currency] ?? 1;
  price *= rate;
  steps.push({ name: 'CurrencyCalculator', price: parseFloat(price.toFixed(2)) });

  return { steps, finalPrice: parseFloat(price.toFixed(2)) };
}

export default function PricingScreen() {
  const { colors } = useTheme();
  const qc = useQueryClient();
  const [basePrice, setBasePrice] = useState('100');
  const [qty, setQty] = useState('1');
  const [coupon, setCoupon] = useState('SAVE20');
  const [currency, setCurrency] = useState('USD');
  const [taxInclusive, setTaxInclusive] = useState(true);
  const [result, setResult] = useState<ReturnType<typeof simulatePipeline> | null>(null);

  const discountsQ = useQuery({ queryKey: QUERY_KEYS.DISCOUNTS, queryFn: api.getDiscounts });

  const deleteMutation = useMutation({
    mutationFn: api.deleteDiscount,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.DISCOUNTS }),
  });

  if (discountsQ.isLoading) return <LoadingState message="Loading pricing…" />;
  if (discountsQ.isError) return <ErrorState message="Failed to load pricing data" />;

  const discounts = discountsQ.data ?? [];

  const handleSimulate = () => {
    const sim = simulatePipeline(
      parseFloat(basePrice) || 100,
      parseInt(qty) || 1,
      coupon,
      currency,
      taxInclusive,
      discounts,
    );
    setResult(sim);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Pipeline Visualizer */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>IPriceCalculationService Pipeline</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pipelineScroll}>
            <View style={styles.pipeline}>
              {PIPELINE_STEPS.map((step, i) => (
                <View key={step.order} style={styles.pipelineItem}>
                  <View style={[styles.pipelineBox, { borderColor: Colors.primary, backgroundColor: `${Colors.primary}10` }]}>
                    <Text style={[styles.pipelineOrder, { color: colors.textMuted }]}>Order {step.order}</Text>
                    <Text style={[styles.pipelineName, { color: Colors.primary }]}>{step.name}</Text>
                    <Text style={[styles.pipelineDesc, { color: colors.textMuted }]}>{step.desc}</Text>
                  </View>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={styles.arrow} />
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Price Simulator */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Price Simulator</Text>
          <View style={styles.formGrid}>
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Base Price (USD)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={basePrice}
                onChangeText={setBasePrice}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Quantity</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={qty}
                onChangeText={setQty}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Coupon Code</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={coupon}
                onChangeText={setCoupon}
                autoCapitalize="characters"
                placeholder="e.g. SAVE20"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Currency</Text>
              <View style={styles.currencyRow}>
                {CURRENCIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.currencyChip,
                      {
                        backgroundColor: currency === c ? Colors.primary : colors.background,
                        borderColor: currency === c ? Colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setCurrency(c)}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: currency === c ? '#fff' : colors.text }}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.toggleRow]}
            onPress={() => setTaxInclusive((v) => !v)}
          >
            <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: taxInclusive ? Colors.primary : 'transparent' }]}>
              {taxInclusive && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Price is tax-inclusive</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.runBtn} onPress={handleSimulate}>
            <Text style={styles.runBtnText}>Run Pipeline</Text>
          </TouchableOpacity>

          {result && (
            <View style={[styles.resultBox, { borderColor: Colors.success, backgroundColor: `${Colors.success}10` }]}>
              <Text style={[styles.resultTitle, { color: colors.text }]}>Pipeline Result</Text>
              {result.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <Text style={[styles.stepName, { color: colors.textMuted }]}>{step.name}</Text>
                  <Text style={[styles.stepPrice, { color: colors.text }]}>${step.price.toFixed(2)}</Text>
                </View>
              ))}
              <View style={[styles.stepRow, { marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
                <Text style={[styles.stepName, { color: colors.text, fontWeight: '700' }]}>
                  Final Price ({currency})
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.primary }}>
                  {result.finalPrice.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Discounts */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Discounts & Coupons</Text>
          {discounts.map((d) => (
            <View key={d.id} style={[styles.discountRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.discountIcon, { backgroundColor: `${Colors.primary}15` }]}>
                <Ionicons name="pricetag-outline" size={14} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.discountName, { color: colors.text }]}>{d.name}</Text>
                <Text style={[styles.discountMeta, { color: colors.textMuted }]}>
                  {d.type === 'Percentage' ? `${d.value}% off` : `$${d.value} off`}
                  {d.couponCode ? `  ·  ${d.couponCode}` : ''}
                </Text>
              </View>
              <View style={[
                styles.activeBadge,
                { backgroundColor: d.active ? `${Colors.success}20` : `${Colors.textMuted}20` }
              ]}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: d.active ? Colors.success : colors.textMuted }}>
                  {d.active ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Delete Discount', d.name, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(d.id) },
              ])}>
                <Ionicons name="trash-outline" size={15} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Currency Rates */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Exchange Rates (Cached)</Text>
          <View style={styles.ratesGrid}>
            {Object.entries(CURRENCY_RATES).map(([code, rate]) => (
              <View key={code} style={[styles.rateCard, { borderColor: colors.border }]}>
                <Text style={[styles.rateCode, { color: colors.text }]}>{code}</Text>
                <Text style={[styles.rateValue, { color: colors.textMuted }]}>
                  1 USD = {rate} {code}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 12, gap: 12, paddingBottom: 32 },
  card: { borderRadius: 10, borderWidth: 1, padding: 14 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  pipelineScroll: { marginTop: 4 },
  pipeline: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 4 },
  pipelineItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pipelineBox: {
    width: 140,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    gap: 2,
  },
  pipelineOrder: { fontSize: 9, fontWeight: '500' },
  pipelineName: { fontSize: 12, fontWeight: '700' },
  pipelineDesc: { fontSize: 9, lineHeight: 13 },
  arrow: { marginHorizontal: -2 },
  formGrid: { gap: 10 },
  fieldWrap: { gap: 4 },
  fieldLabel: { fontSize: 11, fontWeight: '600' },
  input: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 10,
    fontSize: 14,
  },
  currencyRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  currencyChip: {
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: { fontSize: 13 },
  runBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  runBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  resultBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginTop: 10,
    gap: 6,
  },
  resultTitle: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepName: { fontSize: 11 },
  stepPrice: { fontSize: 12, fontWeight: '600' },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  discountIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountName: { fontSize: 12, fontWeight: '600' },
  discountMeta: { fontSize: 10 },
  activeBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  rateCard: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 10,
    minWidth: '45%',
    flex: 1,
    gap: 2,
  },
  rateCode: { fontSize: 14, fontWeight: '700' },
  rateValue: { fontSize: 10 },
});
