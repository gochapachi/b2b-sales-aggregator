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

export default function AgentBeatScreen() {
  const [selectedStop, setSelectedStop] = useState<any | null>(null);
  const [checkinStatus, setCheckinStatus] = useState<string>("");
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({
    "sku_parle": 2,
    "sku_limca": 2
  });

  const stops = [
    {
      id: "stop_1",
      sequence: 1,
      shopName: "Gupta Kirana & General Store",
      owner: "Ramesh Gupta",
      distanceMeters: 22,
      isWithin: true,
      status: "Pending"
    },
    {
      id: "stop_2",
      sequence: 2,
      shopName: "Sharma General Provision Store",
      owner: "Suresh Sharma",
      distanceMeters: 480,
      isWithin: false,
      status: "Pending"
    }
  ];

  const handleCheckin = (stop: any) => {
    if (!stop.isWithin) {
      Alert.alert(
        "Geofence Error",
        `You are ${stop.distanceMeters}m away. You must be within 100m of ${stop.shopName} to check in.`
      );
      return;
    }
    setCheckinStatus(`Verified Check-in! Distance: ${stop.distanceMeters}m`);
    setSelectedStop(stop);
  };

  const handleBookOrder = () => {
    Alert.alert(
      "Order Placed!",
      `Order booked for ${selectedStop?.shopName}. An itemized bill has been dispatched to retailer's WhatsApp.`
    );
  };

  const handleDisposition = (reason: string) => {
    Alert.alert("Disposition Logged", `Reason: "${reason}" saved for beat report.`);
    setSelectedStop(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monday Hazratganj Beat</Text>
        <Text style={styles.headerSubtitle}>Agent: Rahul Sharma • 2 Scheduled Stops</Text>
      </View>

      {checkinStatus !== "" && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✓ {checkinStatus}</Text>
        </View>
      )}

      {/* Stop Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Beat Sequence</Text>
        {stops.map((stop) => (
          <View key={stop.id} style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.sequenceBadge}>
                <Text style={styles.sequenceText}>{stop.sequence}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.shopName}>{stop.shopName}</Text>
                <Text style={styles.ownerText}>Owner: {stop.owner}</Text>
                <Text
                  style={[
                    styles.distanceText,
                    stop.isWithin ? styles.textGreen : styles.textRed
                  ]}
                >
                  GPS Distance: {stop.distanceMeters}m ({stop.isWithin ? "Inside 100m Geofence" : "Outside Geofence"})
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.btnPrimary,
                !stop.isWithin && styles.btnDisabled
              ]}
              onPress={() => handleCheckin(stop)}
            >
              <Text style={styles.btnPrimaryText}>
                {stop.isWithin ? "Check-In (<100m)" : "Too Far to Check-In"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Order-on-Behalf Form */}
      {selectedStop && (
        <View style={styles.orderSection}>
          <Text style={styles.sectionTitle}>
            Take Order for {selectedStop.shopName}
          </Text>

          <View style={styles.skuCard}>
            <Text style={styles.skuTitle}>Parle-G Glucose (Master Carton 72pkts)</Text>
            <Text style={styles.skuMeta}>Wholesale: ₹580 • MOQ: 2 Cartons</Text>
            <View style={styles.qtyRow}>
              <Text style={styles.qtyLabel}>Quantity (Cartons):</Text>
              <TextInput
                style={styles.qtyInput}
                keyboardType="numeric"
                value={String(quantities["sku_parle"] || 2)}
                onChangeText={(t) => setQuantities({ ...quantities, sku_parle: parseInt(t) || 0 })}
              />
            </View>
          </View>

          <View style={styles.skuCard}>
            <Text style={styles.skuTitle}>Limca Lemon Drink (Crate 24 btls)</Text>
            <Text style={styles.skuMeta}>Wholesale: ₹740 • MOQ: 2 Crates</Text>
            <View style={styles.qtyRow}>
              <Text style={styles.qtyLabel}>Quantity (Crates):</Text>
              <TextInput
                style={styles.qtyInput}
                keyboardType="numeric"
                value={String(quantities["sku_limca"] || 2)}
                onChangeText={(t) => setQuantities({ ...quantities, sku_limca: parseInt(t) || 0 })}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.btnSuccess} onPress={handleBookOrder}>
            <Text style={styles.btnSuccessText}>Book Order & Send WhatsApp Bill</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.subTitle}>Or Log Reason for No Order:</Text>
            <View style={styles.dispositionGrid}>
              {["Stock Full", "Owner Unavailable", "Store Closed", "Price Issue"].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={styles.dispositionBtn}
                  onPress={() => handleDisposition(r)}
                >
                  <Text style={styles.dispositionText}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#0f172a", padding: 20 },
  headerTitle: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },
  headerSubtitle: { color: "#94a3b8", fontSize: 12, marginTop: 4 },
  successBanner: { backgroundColor: "#ecfdf5", padding: 12, borderBottomWidth: 1, borderColor: "#a7f3d0" },
  successText: { color: "#065f46", fontSize: 13, fontWeight: "bold" },
  section: { padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#1e293b", marginBottom: 12 },
  card: { backgroundColor: "#ffffff", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  cardRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  sequenceBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#e2e8f0", justifyContent: "center", alignItems: "center" },
  sequenceText: { fontSize: 12, fontWeight: "bold", color: "#334155" },
  shopName: { fontSize: 15, fontWeight: "bold", color: "#0f172a" },
  ownerText: { fontSize: 12, color: "#64748b", marginTop: 2 },
  distanceText: { fontSize: 12, fontWeight: "bold", marginTop: 4 },
  textGreen: { color: "#059669" },
  textRed: { color: "#e11d48" },
  btnPrimary: { marginTop: 12, backgroundColor: "#4f46e5", paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  btnPrimaryText: { color: "#ffffff", fontSize: 13, fontWeight: "bold" },
  btnDisabled: { backgroundColor: "#94a3b8" },
  orderSection: { padding: 16, backgroundColor: "#ffffff", borderTopWidth: 1, borderColor: "#e2e8f0" },
  skuCard: { backgroundColor: "#f8fafc", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 10 },
  skuTitle: { fontSize: 13, fontWeight: "bold", color: "#0f172a" },
  skuMeta: { fontSize: 11, color: "#64748b", marginTop: 2 },
  qtyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  qtyLabel: { fontSize: 12, color: "#334155", fontWeight: "600" },
  qtyInput: { width: 60, height: 36, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 6, textAlign: "center", fontWeight: "bold", backgroundColor: "#ffffff" },
  btnSuccess: { backgroundColor: "#059669", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 12 },
  btnSuccessText: { color: "#ffffff", fontSize: 14, fontWeight: "bold" },
  subTitle: { fontSize: 12, fontWeight: "bold", color: "#64748b", marginBottom: 8 },
  dispositionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dispositionBtn: { backgroundColor: "#f1f5f9", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: "#cbd5e1" },
  dispositionText: { fontSize: 12, color: "#334155", fontWeight: "600" }
});
