/**
 * GOE Mobile — Catalog Screen
 * Product list with search, add product modal, delete, low-stock alerts
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api, Product, InsertProduct } from '@/services/api';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingState, ErrorState } from '@/components/LoadingState';
import { Colors, QUERY_KEYS } from '@/constants';
import { useTheme } from '@/hooks/useTheme';

const EMPTY_FORM: InsertProduct = {
  name: '',
  sku: '',
  category: '',
  price: 0,
  stock: 0,
  status: 'Draft',
  productType: 'SimpleProduct',
};

export default function CatalogScreen() {
  const { colors } = useTheme();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<InsertProduct>(EMPTY_FORM);

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.PRODUCTS,
    queryFn: api.getProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS }),
  });

  const createMutation = useMutation({
    mutationFn: api.createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      setShowAdd(false);
      setForm(EMPTY_FORM);
    },
    onError: () => Alert.alert('Error', 'Failed to create product'),
  });

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const lowStock = products.filter((p) => p.stock <= 20).length;

  if (isLoading) return <LoadingState message="Loading catalog…" />;
  if (isError) return <ErrorState message="Failed to load products" />;

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.rowMain}>
        <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.sku, { color: colors.textMuted }]}>{item.sku}</Text>
      </View>
      <View style={styles.rowMeta}>
        <StatusBadge label={item.category} />
        <Text style={[styles.price, { color: colors.text }]}>${item.price.toFixed(2)}</Text>
        <Text style={[styles.stock, { color: item.stock === 0 ? Colors.error : item.stock <= 20 ? Colors.warning : colors.textMuted }]}>
          {item.stock}
        </Text>
        <StatusBadge label={item.status} type="generic" />
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Delete Product', `Delete "${item.name}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) },
            ])
          }
        >
          <Ionicons name="trash-outline" size={16} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.topTitle, { color: colors.text }]}>
          Catalog <Text style={{ color: colors.textMuted, fontWeight: '400' }}>· {products.length} products</Text>
        </Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAdd(true)}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {lowStock > 0 && (
        <View style={styles.alertBanner}>
          <Ionicons name="warning-outline" size={14} color={Colors.warning} />
          <Text style={styles.alertText}>{lowStock} product(s) low or out of stock</Text>
        </View>
      )}

      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={16} color={colors.textMuted} />
        <TextInput
          style={[styles.search, { color: colors.text }]}
          placeholder="Search by name, SKU, or category…"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProduct}
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      {/* Add Product Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Product</Text>
            {(
              [
                { key: 'name', label: 'Product Name', type: 'default' },
                { key: 'sku', label: 'SKU', type: 'default' },
                { key: 'category', label: 'Category', type: 'default' },
                { key: 'price', label: 'Price', type: 'decimal-pad' },
                { key: 'stock', label: 'Stock Quantity', type: 'number-pad' },
              ] as const
            ).map(({ key, label, type }) => (
              <View key={key} style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder={label}
                  placeholderTextColor={colors.textMuted}
                  keyboardType={type}
                  value={String(form[key])}
                  onChangeText={(v) =>
                    setForm((f) => ({
                      ...f,
                      [key]: key === 'price' || key === 'stock' ? Number(v) || 0 : v,
                    }))
                  }
                />
              </View>
            ))}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.border }]}
                onPress={() => { setShowAdd(false); setForm(EMPTY_FORM); }}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.primary }]}
                onPress={() => createMutation.mutate(form)}
                disabled={createMutation.isPending}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {createMutation.isPending ? 'Saving…' : 'Save Product'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  topTitle: { fontSize: 15, fontWeight: '700' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef3c720',
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  alertText: { color: Colors.warning, fontSize: 12 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    height: 40,
  },
  search: { flex: 1, fontSize: 14 },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 4,
  },
  rowMain: {},
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: { fontSize: 13, fontWeight: '600' },
  sku: { fontSize: 11 },
  price: { fontSize: 12, fontWeight: '600' },
  stock: { fontSize: 12, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000080',
  },
  modalBox: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  fieldWrap: { gap: 4 },
  fieldLabel: { fontSize: 11, fontWeight: '600' },
  fieldInput: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 10,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 7,
    padding: 12,
    alignItems: 'center',
  },
});
