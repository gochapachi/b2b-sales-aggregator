import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl
} from "react-native";
import ProductDetailModal from "./ProductDetailModal";

const API_BASE = "https://api-b2b.anagataitsolutions.in";

interface RetailerHomeScreenProps {
  onNavigateTab?: (tab: "CATALOG" | "ORDERS" | "PROFILE") => void;
}

export default function RetailerHomeScreen({ onNavigateTab }: RetailerHomeScreenProps = {}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ [skuId: string]: number }>({});
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const setQuantityDirect = (skuId: string, quantity: number) => {
    setCart((prev) => ({ ...prev, [skuId]: quantity }));
  };

  const categories = [
    { id: "ALL", label: "All Items" },
    { id: "Biscuits & Bakery", label: "Biscuits" },
    { id: "Beverages & Cold Drinks", label: "Beverages" },
    { id: "Staples & Edible Oils", label: "Staples" },
    { id: "Instant Food & Noodles", label: "Instant Food" }
  ];

  const loadData = async () => {
    try {
      // 1. Fetch live catalog
      const catRes = await fetch(`${API_BASE}/api/catalog?role=RETAILER&retailerId=ret_gupta_kirana`);
      const catData = await catRes.json();
      if (catData.products) {
        setProducts(catData.products);
      }

      // 2. Fetch live orders for delivery OTP
      const ordRes = await fetch(`${API_BASE}/api/orders?role=RETAILER&retailerId=ret_gupta_kirana`);
      const ordData = await ordRes.json();
      if (ordData.orders) {
        setActiveOrders(ordData.orders);
      }
    } catch (err) {
      console.warn("Failed to fetch mobile catalog:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const updateQuantity = (skuId: string, delta: number, moq: number = 1) => {
    setCart((prev) => {
      const current = prev[skuId] || 0;
      let next = current + delta;
      if (next < 0) next = 0;
      if (next > 0 && next < moq && delta > 0) next = moq;
      if (next > 0 && next < moq && delta < 0) next = 0;
      return { ...prev, [skuId]: next };
    });
  };

  // Calculate cart metrics
  let totalWholesale = 0;
  let totalMrp = 0;
  let totalUnits = 0;

  products.forEach((prod) => {
    prod.skus?.forEach((sku: any) => {
      const qty = cart[sku.id] || 0;
      if (qty > 0) {
        totalUnits += qty;
        totalWholesale += sku.wholesalePrice * qty;
        totalMrp += (sku.mrp || sku.wholesalePrice) * qty;
      }
    });
  });

  const projectedProfit = Math.max(0, totalMrp - totalWholesale);
  const marginPct = totalMrp > 0 ? Math.round((projectedProfit / totalMrp) * 100) : 0;

  // Filtered products
  const filteredProducts = products.filter((prod) => {
    const matchesCat = selectedCategory === "ALL" || prod.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Find latest active sub-order with OTP
  let activeDeliveryOtp: any = null;
  for (const o of activeOrders) {
    for (const so of o.subOrders || []) {
      if (so.deliveryOtp && so.status !== "DELIVERED") {
        activeDeliveryOtp = { ...so, masterOrderNumber: o.orderNumber };
        break;
      }
    }
    if (activeDeliveryOtp) break;
  }

  const handleCheckout = async () => {
    if (totalUnits === 0) return;
    setOrderSubmitting(true);
    try {
      const items: any[] = [];
      products.forEach((prod) => {
        prod.skus?.forEach((sku: any) => {
          const qty = cart[sku.id] || 0;
          if (qty > 0) {
            items.push({
              productId: prod.id,
              skuId: sku.id,
              quantity: qty,
              wholesalePrice: sku.wholesalePrice,
              mrp: sku.mrp
            });
          }
        });
      });

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          retailerId: "ret_gupta_kirana",
          paymentTerm: "NET_7",
          notes: "Placed via Android Kirana App",
          items
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Order placement failed");
      }

      setCart({});
      Alert.alert(
        "🎉 Order Placed Successfully!",
        `Master Order #${data.order?.orderNumber || "CONFIRMED"} has been dispatched to wholesaler warehouses. Delivery OTP and bill details sent to your registered WhatsApp.`,
        [{ text: "Great, Continue", onPress: () => loadData() }]
      );
    } catch (err: any) {
      Alert.alert("Checkout Error", err.message || "Failed to place order.");
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Active Store Profile Header */}
        <TouchableOpacity
          style={styles.header}
          onPress={() => onNavigateTab && onNavigateTab("PROFILE")}
          activeOpacity={0.8}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Gupta Kirana & General Store</Text>
            <Text style={styles.headerSubtitle}>Verified B2B Storefront • Lucknow Hazratganj ➔</Text>
          </View>
          <View style={styles.creditPill}>
            <Text style={styles.creditPillLabel}>Net-7 Limit</Text>
            <Text style={styles.creditPillValue}>₹35,800</Text>
          </View>
        </TouchableOpacity>

        {/* Live Delivery OTP Alert Banner */}
        {activeDeliveryOtp ? (
          <TouchableOpacity
            style={styles.otpBanner}
            onPress={() => onNavigateTab && onNavigateTab("ORDERS")}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.otpBannerTitle}>🚚 Crates Out for Delivery!</Text>
              <Text style={styles.otpBadge}>TAP FOR DETAILS</Text>
            </View>
            <Text style={styles.otpBannerSubtitle}>
              {activeDeliveryOtp.organizationName} • #{activeDeliveryOtp.masterOrderNumber}
            </Text>
            <View style={styles.otpCodeBox}>
              <Text style={styles.otpCodeLabel}>YOUR 4-DIGIT DELIVERY OTP</Text>
              <Text style={styles.otpCodeValue}>{activeDeliveryOtp.deliveryOtp}</Text>
            </View>
            <Text style={styles.otpInstructions}>
              Inspect seal & share this OTP with driver to confirm handoff. Tap to track.
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.verifiedNotice}>
            <Text style={styles.verifiedNoticeText}>
              ✓ Wholesale rates unlocked • Direct distributor pricing with 0% markup
            </Text>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search biscuits, cold drinks, staples..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.searchClear}>
              <Text style={{ color: "#64748b", fontWeight: "bold" }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Horizontal Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedCategory(c.id)}
              style={[
                styles.categoryPill,
                selectedCategory === c.id && styles.categoryPillActive
              ]}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === c.id && styles.categoryPillTextActive
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Live Catalog List */}
        <View style={styles.section}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>
              Direct Wholesale FMCG SKUs ({filteredProducts.length})
            </Text>
            <Text style={{ fontSize: 11, color: "#6366f1", fontWeight: "bold" }}>
              Best Wholesale Rates
            </Text>
          </View>

          {loading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text style={{ marginTop: 12, color: "#64748b", fontSize: 12 }}>
                Loading live catalog from wholesale hubs...
              </Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No SKUs found</Text>
              <Text style={styles.emptySubtitle}>Try changing category filter or search query.</Text>
            </View>
          ) : (
            filteredProducts.map((prod) => (
              <View key={prod.id} style={styles.productCard}>
                {/* Tappable Card Header & Info to open ProductDetailModal */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setSelectedProduct(prod)}
                  style={styles.cardHeaderTouchable}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.brandBadge}>{prod.brand || "FMCG"}</Text>
                    {prod.marginPct > 0 && (
                      <View style={styles.marginBadge}>
                        <Text style={styles.marginBadgeText}>+{prod.marginPct}% Margin</Text>
                      </View>
                    )}
                    <View style={styles.inspectPill}>
                      <Text style={styles.inspectPillText}>Specs & Slabs 🔍</Text>
                    </View>
                  </View>

                  {/* Product Name */}
                  <Text style={styles.productName}>{prod.name}</Text>
                  <Text style={styles.supplierText}>
                    Wholesaler: {prod.organizationName || "Anagata Wholesale Hub"}
                  </Text>
                </TouchableOpacity>

                {/* SKUs List */}
                {prod.skus?.map((sku: any) => {
                  const qty = cart[sku.id] || 0;
                  const unitProfit = Math.max(0, (sku.mrp || 0) - sku.wholesalePrice);
                  const skuMargin = sku.mrp > 0 ? Math.round((unitProfit / sku.mrp) * 100) : 0;

                  return (
                    <View key={sku.id} style={styles.skuRow}>
                      <TouchableOpacity
                        style={{ flex: 1, paddingRight: 8 }}
                        activeOpacity={0.7}
                        onPress={() => setSelectedProduct(prod)}
                      >
                        <Text style={styles.skuTitle}>{sku.unitTitle}</Text>
                        <Text style={styles.skuMoq}>MOQ: {sku.minimumOrderQuantity} units</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                          <Text style={styles.wholesalePrice}>₹{sku.wholesalePrice}</Text>
                          {sku.mrp > sku.wholesalePrice && (
                            <Text style={styles.mrpPrice}>₹{sku.mrp}</Text>
                          )}
                          <View style={styles.netProfitTag}>
                            <Text style={styles.netProfitText}>
                              Profit: +₹{unitProfit} ({skuMargin}%)
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>

                      {/* Interactive Quantity Stepper */}
                      <View style={styles.stepperContainer}>
                        {qty === 0 ? (
                          <TouchableOpacity
                            style={styles.btnAdd}
                            onPress={() => updateQuantity(sku.id, sku.minimumOrderQuantity || 1, sku.minimumOrderQuantity || 1)}
                          >
                            <Text style={styles.btnAddText}>+ ADD</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.stepperBox}>
                            <TouchableOpacity
                              style={styles.stepperBtn}
                              onPress={() => updateQuantity(sku.id, -1, sku.minimumOrderQuantity || 1)}
                            >
                              <Text style={styles.stepperBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.stepperQty}>{qty}</Text>
                            <TouchableOpacity
                              style={styles.stepperBtn}
                              onPress={() => updateQuantity(sku.id, 1, sku.minimumOrderQuantity || 1)}
                            >
                              <Text style={styles.stepperBtnText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </View>

        {/* Bottom spacer so content doesn't get covered by sticky bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Order & Resale Profit Bar */}
      {totalUnits > 0 && (
        <View style={styles.bottomCartBar}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.cartUnits}>{totalUnits} Units in Cart</Text>
              <View style={styles.profitChip}>
                <Text style={styles.profitChipText}>+{marginPct}% Profit</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 2 }}>
              <Text style={styles.cartTotal}>₹{totalWholesale.toLocaleString("en-IN")}</Text>
              <Text style={styles.cartResaleProfit}>
                Projected Profit: ₹{projectedProfit.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btnCheckout, orderSubmitting && { opacity: 0.7 }]}
            onPress={handleCheckout}
            disabled={orderSubmitting}
          >
            {orderSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.btnCheckoutText}>Order Net-7 ➔</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Product Detail Modal with Live Margin Calculator */}
      <ProductDetailModal
        visible={!!selectedProduct}
        product={selectedProduct}
        currentCartQty={
          selectedProduct?.skus?.[0]
            ? (cart[selectedProduct.skus[0].id] || 0)
            : 0
        }
        onAddToCart={(skuId, qty) => setQuantityDirect(skuId, qty)}
        onClose={() => setSelectedProduct(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: "#f8fafc" },
  container: { flex: 1 },
  header: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b"
  },
  headerTitle: { color: "#ffffff", fontSize: 15, fontWeight: "bold" },
  headerSubtitle: { color: "#94a3b8", fontSize: 11, marginTop: 2 },
  creditPill: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "flex-end"
  },
  creditPillLabel: { color: "#6ee7b7", fontSize: 9, fontWeight: "bold" },
  creditPillValue: { color: "#ffffff", fontSize: 13, fontWeight: "black" },
  verifiedNotice: {
    backgroundColor: "#ecfdf5",
    borderBottomWidth: 1,
    borderBottomColor: "#a7f3d0",
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  verifiedNoticeText: { color: "#065f46", fontSize: 11, fontWeight: "600" },
  otpBanner: {
    margin: 14,
    backgroundColor: "#eff6ff",
    borderWidth: 1.5,
    borderColor: "#3b82f6",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  otpBannerTitle: { fontSize: 14, fontWeight: "bold", color: "#1e3a8a" },
  otpBadge: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  otpBannerSubtitle: { fontSize: 12, color: "#3b82f6", marginTop: 2, fontWeight: "600" },
  otpCodeBox: {
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bfdbfe"
  },
  otpCodeLabel: { fontSize: 10, color: "#64748b", fontWeight: "bold" },
  otpCodeValue: { fontSize: 24, fontWeight: "black", color: "#1d4ed8", letterSpacing: 4, marginTop: 1 },
  otpInstructions: { fontSize: 10, color: "#475569", textAlign: "center" },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 13,
    color: "#0f172a"
  },
  searchClear: { padding: 6 },
  categoryScroll: {
    paddingHorizontal: 14,
    marginBottom: 10
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 8
  },
  categoryPillActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a"
  },
  categoryPillText: { fontSize: 11, fontWeight: "600", color: "#475569" },
  categoryPillTextActive: { color: "#ffffff", fontWeight: "bold" },
  section: { paddingHorizontal: 14, marginTop: 4 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", color: "#1e293b" },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  brandBadge: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4f46e5",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    textTransform: "uppercase"
  },
  marginBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12
  },
  marginBadgeText: { fontSize: 10, fontWeight: "bold", color: "#15803d" },
  productName: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginTop: 4 },
  supplierText: { fontSize: 11, color: "#64748b", marginTop: 2, marginBottom: 8 },
  skuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9"
  },
  skuTitle: { fontSize: 12, fontWeight: "600", color: "#1e293b" },
  skuMoq: { fontSize: 10, color: "#94a3b8", marginTop: 1 },
  wholesalePrice: { fontSize: 15, fontWeight: "black", color: "#0f172a" },
  mrpPrice: { fontSize: 12, color: "#94a3b8", textDecorationLine: "line-through", marginLeft: 4 },
  netProfitTag: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8
  },
  netProfitText: { fontSize: 10, color: "#16a34a", fontWeight: "bold" },
  stepperContainer: { minWidth: 78, alignItems: "flex-end" },
  btnAdd: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8
  },
  btnAddText: { color: "#ffffff", fontSize: 11, fontWeight: "bold" },
  stepperBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8
  },
  stepperBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  stepperBtnText: { fontSize: 14, fontWeight: "bold", color: "#334155" },
  stepperQty: { fontSize: 12, fontWeight: "bold", color: "#0f172a", paddingHorizontal: 6 },
  emptyCard: {
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center"
  },
  emptyTitle: { fontSize: 14, fontWeight: "bold", color: "#334155" },
  emptySubtitle: { fontSize: 12, color: "#94a3b8", marginTop: 4 },
  bottomCartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8
  },
  cartUnits: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },
  profitChip: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6
  },
  profitChipText: { color: "#34d399", fontSize: 10, fontWeight: "bold" },
  cartTotal: { color: "#ffffff", fontSize: 16, fontWeight: "black" },
  cartResaleProfit: { color: "#94a3b8", fontSize: 10 },
  btnCheckout: {
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10
  },
  btnCheckoutText: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },
  cardHeaderTouchable: {
    marginBottom: 6
  },
  inspectPill: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
    marginLeft: "auto"
  },
  inspectPillText: {
    color: "#6366f1",
    fontSize: 10,
    fontWeight: "bold"
  }
});
