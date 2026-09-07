import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from "react-native";

interface CartItem {
  id: string;
  name: string;
  mrp: number;
  rate: number;
  costPrice: number;
  quantity: number;
}

const INITIAL_CATALOG = [
  { id: "p1", name: "Parle-G Glucose 80g", mrp: 10, rate: 10, costPrice: 8.05 },
  { id: "p2", name: "Limca Lemon Drink 750ml", mrp: 40, rate: 40, costPrice: 30.8 },
  { id: "p3", name: "Tata Salt Vacuum Evaporated 1kg", mrp: 28, rate: 28, costPrice: 22.4 },
  { id: "p4", name: "Fortune Refined Mustard Oil 1L", mrp: 145, rate: 140, costPrice: 121.5 },
  { id: "p5", name: "Maggi 2-Minute Noodles 70g", mrp: 14, rate: 14, costPrice: 11.2 }
];

export default function RetailerPOSCounterScreen() {
  // Cashier PIN Switch State
  const [activeUser, setActiveUser] = useState<"OWNER" | "CASHIER">("CASHIER");
  const [pinInput, setPinInput] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [privacyShield, setPrivacyShield] = useState(true); // Masks gross margin from cashier/customer

  // POS Billing State
  const [cart, setCart] = useState<CartItem[]>([
    { id: "p1", name: "Parle-G Glucose 80g", mrp: 10, rate: 10, costPrice: 8.05, quantity: 3 },
    { id: "p2", name: "Limca Lemon Drink 750ml", mrp: 40, rate: 40, costPrice: 30.8, quantity: 1 }
  ]);
  const [customerPhone, setCustomerPhone] = useState("919026019566");
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI">("UPI");

  const addToCart = (product: typeof INITIAL_CATALOG[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalBill = cart.reduce((acc, item) => acc + item.rate * item.quantity, 0);
  const totalCost = cart.reduce((acc, item) => acc + item.costPrice * item.quantity, 0);
  const totalMargin = totalBill - totalCost;
  const marginPct = totalBill > 0 ? ((totalMargin / totalBill) * 100).toFixed(1) : "0.0";

  const handleCashierPinAuth = () => {
    if (pinInput === "1234") {
      setActiveUser("OWNER");
      setPrivacyShield(false);
      setShowPinModal(false);
      setPinInput("");
      Alert.alert("Owner Mode Active", "Manager override enabled: Margins & analytics unshielded.");
    } else {
      Alert.alert("Invalid PIN", "Enter correct 4-digit Quick-PIN (Demo: 1234)");
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Add at least one item to bill.");
      return;
    }
    Alert.alert(
      "Bill Finalized! ⚡",
      `Invoice for ₹${totalBill} generated via ${paymentMode}.\nWhatsApp digital receipt dispatched to ${customerPhone} via Evolution API!`,
      [
        {
          text: "New Bill",
          onPress: () => {
            setCart([]);
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Top POS Counter Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={styles.headerTitle}>⚡ Kirana Express POS Counter</Text>
            <Text style={styles.headerSubtitle}>
              Counter #1 • Active: {activeUser === "OWNER" ? "Ramesh Gupta (Owner)" : "Ravi Kumar (Cashier)"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.btnPinSwitch}
            onPress={() => {
              if (activeUser === "OWNER") {
                setActiveUser("CASHIER");
                setPrivacyShield(true);
              } else {
                setShowPinModal(true);
              }
            }}
          >
            <Text style={styles.btnPinText}>
              {activeUser === "OWNER" ? "🔒 Lock (Cashier)" : "🔑 PIN Switch"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick PIN Modal View */}
        {showPinModal && (
          <View style={styles.pinBox}>
            <Text style={styles.pinLabel}>Enter 4-Digit Quick-PIN (Default: 1234):</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
              <TextInput
                style={styles.pinInput}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                placeholder="• • • •"
                value={pinInput}
                onChangeText={setPinInput}
              />
              <TouchableOpacity style={styles.btnPinSubmit} onPress={handleCashierPinAuth}>
                <Text style={styles.btnPinSubmitText}>Unlock Owner</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnPinCancel}
                onPress={() => setShowPinModal(false)}
              >
                <Text style={styles.btnPinCancelText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Margin Privacy Shield Banner */}
      <View style={styles.shieldBar}>
        <Text style={styles.shieldText}>
          {privacyShield ? "🛡️ Margin Privacy Shield: ACTIVE (Cost hidden)" : "🔓 Margin Transparency: VISIBLE"}
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (activeUser === "OWNER") {
              setPrivacyShield(!privacyShield);
            } else {
              Alert.alert("Permission Required", "Only Owner with PIN 1234 can toggle margin privacy shield.");
            }
          }}
        >
          <Text style={styles.shieldToggleText}>{privacyShield ? "Show (PIN)" : "Hide"}</Text>
        </TouchableOpacity>
      </View>

      {/* Fast Catalog Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Quick Tap Add to Bill</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
          {INITIAL_CATALOG.map((p) => (
            <TouchableOpacity key={p.id} style={styles.quickProductBadge} onPress={() => addToCart(p)}>
              <Text style={styles.quickProductName}>{p.name}</Text>
              <Text style={styles.quickProductPrice}>₹{p.rate}</Text>
              {!privacyShield && (
                <Text style={styles.quickMargin}>+{((p.rate - p.costPrice) / p.rate * 100).toFixed(0)}% mrg</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Active Bill Cart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧾 Current Bill ({cart.length} items)</Text>
        {cart.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ color: "#64748b" }}>Bill is empty. Tap items above or scan barcode.</Text>
          </View>
        ) : (
          cart.map((item) => (
            <View key={item.id} style={styles.cartRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemPrice}>
                  ₹{item.rate} × {item.quantity} = ₹{item.rate * item.quantity}
                </Text>
                {!privacyShield && (
                  <Text style={styles.cartMarginText}>
                    Cost: ₹{item.costPrice} • Profit: ₹{((item.rate - item.costPrice) * item.quantity).toFixed(1)}
                  </Text>
                )}
              </View>
              <View style={styles.qtyControls}>
                <TouchableOpacity style={styles.btnQty} onPress={() => updateQuantity(item.id, -1)}>
                  <Text style={styles.btnQtyText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity style={styles.btnQty} onPress={() => updateQuantity(item.id, 1)}>
                  <Text style={styles.btnQtyText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Bill Summary & Payment Box */}
      <View style={styles.checkoutBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Bill Amount:</Text>
          <Text style={styles.summaryTotal}>₹{totalBill}</Text>
        </View>

        {!privacyShield && (
          <View style={styles.profitBanner}>
            <Text style={styles.profitText}>
              Estimated Gross Margin: ₹{totalMargin.toFixed(1)} ({marginPct}%)
            </Text>
          </View>
        )}

        {/* Customer Phone for WhatsApp Receipt */}
        <View style={{ marginTop: 12 }}>
          <Text style={styles.inputLabel}>Customer Mobile (WhatsApp Receipt):</Text>
          <TextInput
            style={styles.phoneInput}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
            placeholder="e.g. 919026019566"
          />
        </View>

        {/* Payment Mode Selector */}
        <View style={styles.payModeRow}>
          <TouchableOpacity
            style={[styles.payModeBtn, paymentMode === "UPI" && styles.payModeBtnActive]}
            onPress={() => setPaymentMode("UPI")}
          >
            <Text style={[styles.payModeText, paymentMode === "UPI" && styles.payModeTextActive]}>
              📱 UPI Dynamic QR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.payModeBtn, paymentMode === "CASH" && styles.payModeBtnActive]}
            onPress={() => setPaymentMode("CASH")}
          >
            <Text style={[styles.payModeText, paymentMode === "CASH" && styles.payModeTextActive]}>
              💵 Cash Counter
            </Text>
          </TouchableOpacity>
        </View>

        {/* Finalize Checkout Button */}
        <TouchableOpacity style={styles.btnCheckout} onPress={handleCheckout}>
          <Text style={styles.btnCheckoutText}>⚡ Collect ₹{totalBill} & Send WhatsApp Bill</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  header: { backgroundColor: "#0f172a", padding: 16 },
  headerTitle: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  headerSubtitle: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
  btnPinSwitch: { backgroundColor: "#334155", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnPinText: { color: "#38bdf8", fontSize: 11, fontWeight: "bold" },
  pinBox: { marginTop: 12, backgroundColor: "#1e293b", padding: 12, borderRadius: 8 },
  pinLabel: { color: "#cbd5e1", fontSize: 12, fontWeight: "600" },
  pinInput: { flex: 1, backgroundColor: "#0f172a", color: "#ffffff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: "#475569" },
  btnPinSubmit: { backgroundColor: "#4f46e5", paddingHorizontal: 14, justifyContent: "center", borderRadius: 6 },
  btnPinSubmitText: { color: "#ffffff", fontWeight: "bold", fontSize: 12 },
  btnPinCancel: { paddingHorizontal: 10, justifyContent: "center" },
  btnPinCancelText: { color: "#94a3b8", fontSize: 16 },
  shieldBar: { backgroundColor: "#e2e8f0", paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  shieldText: { fontSize: 12, color: "#334155", fontWeight: "bold" },
  shieldToggleText: { fontSize: 12, color: "#4f46e5", fontWeight: "bold" },
  section: { paddingHorizontal: 16, marginTop: 14 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", color: "#1e293b", textTransform: "uppercase", letterSpacing: 0.5 },
  quickProductBadge: { backgroundColor: "#ffffff", padding: 12, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: "#cbd5e1", minWidth: 120 },
  quickProductName: { fontSize: 12, fontWeight: "bold", color: "#0f172a" },
  quickProductPrice: { fontSize: 13, fontWeight: "bold", color: "#059669", marginTop: 4 },
  quickMargin: { fontSize: 10, color: "#2563eb", fontWeight: "600" },
  cartRow: { backgroundColor: "#ffffff", padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  cartItemName: { fontSize: 13, fontWeight: "bold", color: "#0f172a" },
  cartItemPrice: { fontSize: 12, color: "#475569", marginTop: 2 },
  cartMarginText: { fontSize: 11, color: "#059669", marginTop: 2 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnQty: { backgroundColor: "#e2e8f0", width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  btnQtyText: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  qtyText: { fontSize: 14, fontWeight: "bold", minWidth: 20, textAlign: "center" },
  emptyBox: { backgroundColor: "#ffffff", padding: 20, borderRadius: 8, alignItems: "center", marginVertical: 8 },
  checkoutBox: { margin: 16, backgroundColor: "#ffffff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#cbd5e1" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 14, fontWeight: "bold", color: "#475569" },
  summaryTotal: { fontSize: 24, fontWeight: "black", color: "#0f172a" },
  profitBanner: { backgroundColor: "#ecfdf5", padding: 8, borderRadius: 6, marginTop: 8, borderWidth: 1, borderColor: "#a7f3d0" },
  profitText: { fontSize: 12, color: "#065f46", fontWeight: "bold" },
  inputLabel: { fontSize: 12, color: "#475569", fontWeight: "bold", marginBottom: 4 },
  phoneInput: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  payModeRow: { flexDirection: "row", gap: 8, marginVertical: 12 },
  payModeBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 6, borderWidth: 1, borderColor: "#cbd5e1", backgroundColor: "#f8fafc" },
  payModeBtnActive: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  payModeText: { fontSize: 12, fontWeight: "bold", color: "#475569" },
  payModeTextActive: { color: "#ffffff" },
  btnCheckout: { backgroundColor: "#059669", paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  btnCheckoutText: { color: "#ffffff", fontSize: 14, fontWeight: "bold" }
});
