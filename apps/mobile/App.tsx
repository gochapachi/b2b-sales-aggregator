import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import AgentBeatScreen from "./src/screens/agent/AgentBeatScreen";
import SellerOrdersScreen from "./src/screens/seller/SellerOrdersScreen";
import RetailerHomeScreen from "./src/screens/retailer/RetailerHomeScreen";

export default function App() {
  const [role, setRole] = useState<"AGENT" | "SELLER" | "RETAILER">("AGENT");

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Role Navigation Bar */}
      <View style={styles.roleBar}>
        <TouchableOpacity
          style={[styles.roleTab, role === "AGENT" && styles.roleTabActive]}
          onPress={() => setRole("AGENT")}
        >
          <Text style={[styles.roleText, role === "AGENT" && styles.roleTextActive]}>
            📍 Agent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleTab, role === "SELLER" && styles.roleTabActive]}
          onPress={() => setRole("SELLER")}
        >
          <Text style={[styles.roleText, role === "SELLER" && styles.roleTextActive]}>
            🏢 Brand/Seller
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleTab, role === "RETAILER" && styles.roleTabActive]}
          onPress={() => setRole("RETAILER")}
        >
          <Text style={[styles.roleText, role === "RETAILER" && styles.roleTextActive]}>
            🛒 Retailer
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screen Render */}
      <View style={{ flex: 1 }}>
        {role === "AGENT" && <AgentBeatScreen />}
        {role === "SELLER" && <SellerOrdersScreen />}
        {role === "RETAILER" && <RetailerHomeScreen />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  roleBar: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    padding: 6,
    borderBottomWidth: 1,
    borderColor: "#334155"
  },
  roleTab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6 },
  roleTabActive: { backgroundColor: "#4f46e5" },
  roleText: { color: "#94a3b8", fontSize: 12, fontWeight: "bold" },
  roleTextActive: { color: "#ffffff" }
});
