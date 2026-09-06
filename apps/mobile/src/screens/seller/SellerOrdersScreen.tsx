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

export default function SellerOrdersScreen() {
  const [orders, setOrders] = useState([
    {
      id: "so_1",
      orderNumber: "ORD-506874",
      shopName: "Gupta Kirana & General Store",
      amount: 2053,
      status: "DISPATCHED",
      otp: "1295"
    }
  ]);
  const [enteredOtp, setEnteredOtp] = useState("");

  const handleVerify = (orderId: string) => {
    if (enteredOtp !== "1295") {
      Alert.alert("Invalid OTP", "The 4-digit Delivery OTP does not match.");
      return;
    }
    setOrders(
      orders.map((o) =>
        o.id === orderId ? { ...o, status: "DELIVERED" } : o
      )
    );
    Alert.alert("Success", "Delivery Verified! Transit time logged: 18 mins. WhatsApp receipt sent.");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Anagata FMCG Wholesale (Brand App)</Text>
        <Text style={styles.headerSubtitle}>Fixed Beat Plan: ₹6,000/mo (0% Commission)</Text>
      </View>

      {/* Metrics Header */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Strike Rate</Text>
          <Text style={styles.metricValue}>86.4%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Avg Delivery SLA</Text>
          <Text style={styles.metricValue}>22 mins</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Net Savings</Text>
          <Text style={[styles.metricValue, { color: "#059669" }]}>81.8%</Text>
        </View>
      </View>

      {/* Orders List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Live Incoming Orders & Delivery Verification</Text>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
              <Text style={styles.statusBadge}>{order.status}</Text>
            </View>
            <Text style={styles.shopName}>{order.shopName}</Text>
            <Text style={styles.amountText}>Total Value: ₹{order.amount.toLocaleString("en-IN")}</Text>

            {order.status === "DISPATCHED" && (
              <View style={styles.otpVerifyBox}>
                <Text style={styles.otpPrompt}>Enter 4-Digit Delivery OTP from Retailer:</Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                  <TextInput
                    style={styles.otpInput}
                    keyboardType="numeric"
                    maxLength={4}
                    placeholder="• • • •"
                    value={enteredOtp}
                    onChangeText={setEnteredOtp}
                  />
                  <TouchableOpacity
                    style={styles.btnVerify}
                    onPress={() => handleVerify(order.id)}
                  >
                    <Text style={styles.btnVerifyText}>Verify OTP</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {order.status === "DELIVERED" && (
              <View style={styles.deliveredBanner}>
                <Text style={styles.deliveredText}>✓ Delivered & Verified (Transit: 18 mins)</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#0f172a", padding: 20 },
  headerTitle: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  headerSubtitle: { color: "#34d399", fontSize: 12, marginTop: 4, fontWeight: "600" },
  metricsRow: { flexDirection: "row", padding: 16, gap: 10 },
  metricCard: { flex: 1, backgroundColor: "#ffffff", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  metricLabel: { fontSize: 10, color: "#64748b", fontWeight: "bold", textTransform: "uppercase" },
  metricValue: { fontSize: 16, fontWeight: "bold", color: "#0f172a", marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#1e293b", marginBottom: 12 },
  orderCard: { backgroundColor: "#ffffff", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  orderNumber: { fontSize: 13, fontWeight: "bold", color: "#4f46e5" },
  statusBadge: { backgroundColor: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: "bold", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  shopName: { fontSize: 15, fontWeight: "bold", color: "#0f172a", marginTop: 4 },
  amountText: { fontSize: 13, color: "#334155", marginTop: 2, fontWeight: "600" },
  otpVerifyBox: { marginTop: 12, backgroundColor: "#eef2ff", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#c7d2fe" },
  otpPrompt: { fontSize: 11, fontWeight: "bold", color: "#3730a3" },
  otpInput: { flex: 1, height: 40, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#a5b4fc", borderRadius: 6, textAlign: "center", fontSize: 16, fontWeight: "bold" },
  btnVerify: { backgroundColor: "#4f46e5", paddingHorizontal: 16, justifyContent: "center", borderRadius: 6 },
  btnVerifyText: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },
  deliveredBanner: { marginTop: 12, backgroundColor: "#ecfdf5", padding: 10, borderRadius: 6 },
  deliveredText: { color: "#065f46", fontSize: 12, fontWeight: "bold" }
});
