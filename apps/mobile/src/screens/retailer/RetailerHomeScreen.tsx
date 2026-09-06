import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

export default function RetailerHomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gupta Kirana & General Store</Text>
        <Text style={styles.headerSubtitle}>KYC Verified ✓ • Wholesale Pricing Active</Text>
      </View>

      {/* Active Delivery OTP Alert */}
      <View style={styles.otpBanner}>
        <Text style={styles.otpBannerTitle}>🚚 Order Out for Delivery!</Text>
        <Text style={styles.otpBannerSubtitle}>Awadh Beverages (Order #ORD-506874)</Text>
        <View style={styles.otpCodeBox}>
          <Text style={styles.otpCodeLabel}>YOUR DELIVERY OTP:</Text>
          <Text style={styles.otpCodeValue}>1394</Text>
        </View>
        <Text style={styles.otpInstructions}>
          Share this 4-digit OTP with the delivery executive only after receiving and checking your crates.
        </Text>
      </View>

      {/* Catalog Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Wholesale SKUs</Text>
        <View style={styles.productCard}>
          <Text style={styles.brandBadge}>PARLE</Text>
          <Text style={styles.productName}>Parle-G Glucose Biscuits (80g)</Text>
          <Text style={styles.skuText}>Master Carton (72 packets) • MOQ: 2 Cartons</Text>
          <Text style={styles.priceText}>Wholesale: ₹580 <Text style={styles.mrpText}>₹720</Text></Text>
        </View>

        <View style={styles.productCard}>
          <Text style={styles.brandBadge}>COCA-COLA</Text>
          <Text style={styles.productName}>Limca Lemon Drink (750ml PET)</Text>
          <Text style={styles.skuText}>Crate (24 bottles) • MOQ: 2 Crates</Text>
          <Text style={styles.priceText}>Wholesale: ₹740 <Text style={styles.mrpText}>₹960</Text></Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#0f172a", padding: 20 },
  headerTitle: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  headerSubtitle: { color: "#34d399", fontSize: 12, marginTop: 4, fontWeight: "600" },
  otpBanner: { margin: 16, backgroundColor: "#eff6ff", borderWidth: 1.5, borderColor: "#3b82f6", borderRadius: 12, padding: 16 },
  otpBannerTitle: { fontSize: 15, fontWeight: "bold", color: "#1e3a8a" },
  otpBannerSubtitle: { fontSize: 12, color: "#3b82f6", marginTop: 2, fontWeight: "600" },
  otpCodeBox: { backgroundColor: "#ffffff", padding: 12, borderRadius: 8, marginVertical: 10, alignItems: "center", borderWidth: 1, borderColor: "#bfdbfe" },
  otpCodeLabel: { fontSize: 11, color: "#64748b", fontWeight: "bold" },
  otpCodeValue: { fontSize: 26, fontWeight: "black", color: "#1d4ed8", letterSpacing: 4, marginTop: 2 },
  otpInstructions: { fontSize: 11, color: "#475569", textAlign: "center" },
  section: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#1e293b", marginBottom: 12 },
  productCard: { backgroundColor: "#ffffff", padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 10 },
  brandBadge: { fontSize: 10, fontWeight: "bold", color: "#4f46e5", textTransform: "uppercase" },
  productName: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginTop: 2 },
  skuText: { fontSize: 12, color: "#64748b", marginTop: 2 },
  priceText: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginTop: 6 },
  mrpText: { fontSize: 12, color: "#94a3b8", textDecorationLine: "line-through", fontWeight: "normal" }
});
