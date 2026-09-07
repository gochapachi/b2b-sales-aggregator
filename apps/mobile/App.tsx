import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Linking,
  ScrollView,
  StatusBar
} from "react-native";
import AgentBeatScreen from "./src/screens/agent/AgentBeatScreen";
import SellerOrdersScreen from "./src/screens/seller/SellerOrdersScreen";
import WholesaleTeamScreen from "./src/screens/seller/WholesaleTeamScreen";
import RetailerHomeScreen from "./src/screens/retailer/RetailerHomeScreen";
import RetailerOrdersScreen from "./src/screens/retailer/RetailerOrdersScreen";
import RetailerProfileScreen from "./src/screens/retailer/RetailerProfileScreen";
import RetailerPOSCounterScreen from "./src/screens/retailer/RetailerPOSCounterScreen";
import SuperAdminHQScreen from "./src/screens/admin/SuperAdminHQScreen";

const CURRENT_VERSION = "2.1.0";
const UPDATE_URL = "https://b2b.anagataitsolutions.in/downloads/b2b-sales-aggregator.apk";
const API_VERSION_URL = "https://api-b2b.anagataitsolutions.in/api/version";

const TEST_ACCOUNTS = [
  {
    role: "SUPER_ADMIN",
    title: "Super Admin HQ",
    username: "superadmin",
    tag: "Full Platform HQ",
    color: "#6366f1"
  },
  {
    role: "AGENT",
    title: "Field Sales Agent",
    username: "agent_rahul",
    tag: "Hazratganj Beat (GPS Check-in)",
    color: "#0ea5e9"
  },
  {
    role: "SELLER",
    title: "Wholesaler (Anagata FMCG)",
    username: "seller_anagata",
    tag: "Orders & Margin Privacy",
    color: "#8b5cf6"
  },
  {
    role: "RETAILER",
    title: "Kirana Store Owner",
    username: "ret_gupta",
    tag: "Gupta Kirana Storefront",
    color: "#10b981"
  },
  {
    role: "POS",
    title: "Kirana Counter POS (Cashier)",
    username: "ret_cashier",
    tag: "Quick-PIN: 1234",
    color: "#f59e0b"
  }
];

export default function App() {
  type RoleType = "SUPER_ADMIN" | "AGENT" | "SELLER" | "RETAILER" | "POS";
  const [role, setRole] = useState<RoleType>("POS");
  const [sellerSubTab, setSellerSubTab] = useState<"ORDERS" | "TEAM">("ORDERS");
  const [retailerSubTab, setRetailerSubTab] = useState<"CATALOG" | "ORDERS" | "PROFILE">("CATALOG");
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [otaUpdateAvailable, setOtaUpdateAvailable] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState(CURRENT_VERSION);

  // In-app OTA Update Check
  useEffect(() => {
    fetch(API_VERSION_URL)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.version) {
          setRemoteVersion(data.version);
          if (data.version !== CURRENT_VERSION) {
            setOtaUpdateAvailable(true);
          }
        }
      })
      .catch(() => {
        // Offline or fallback gracefully
      });
  }, []);

  const handleDownloadApk = () => {
    Linking.openURL(UPDATE_URL).catch((err) => {
      console.error("Failed to open APK URL:", err);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Top Banner / In-App OTA Update Indicator */}
      {otaUpdateAvailable && (
        <TouchableOpacity style={styles.otaBanner} onPress={handleDownloadApk}>
          <Text style={styles.otaText}>
            ⚡ Update Available: v{remoteVersion} Ready • Tap to Download APK
          </Text>
        </TouchableOpacity>
      )}

      {/* App Header & Persona Switcher */}
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.appTitle}>
            {role === "POS" || role === "RETAILER" ? "Gupta Kirana Store" : role === "SELLER" ? "Anagata FMCG Wholesale" : role === "AGENT" ? "Rahul Sharma (Agent)" : "Super Admin Command HQ"}
          </Text>
          <Text style={styles.appSubtitle}>
            Active Persona: {role} • v{CURRENT_VERSION}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.btnTestAccounts}
          onPress={() => setShowAccountsModal(true)}
        >
          <Text style={styles.btnTestAccountsText}>🔄 Switch User</Text>
        </TouchableOpacity>
      </View>

      {/* Role-Scoped Navigation Bar */}
      <View style={styles.roleBar}>
        {(role === "POS" || role === "RETAILER") && (
          <>
            <TouchableOpacity
              style={[styles.roleTab, role === "POS" && styles.roleTabActive]}
              onPress={() => setRole("POS")}
            >
              <Text style={[styles.roleText, role === "POS" && styles.roleTextActive]}>
                ⚡ Counter POS
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleTab, role === "RETAILER" && styles.roleTabActive]}
              onPress={() => setRole("RETAILER")}
            >
              <Text style={[styles.roleText, role === "RETAILER" && styles.roleTextActive]}>
                🛒 Kirana Storefront
              </Text>
            </TouchableOpacity>
          </>
        )}

        {role === "SELLER" && (
          <>
            <TouchableOpacity
              style={[styles.roleTab, sellerSubTab === "ORDERS" && styles.roleTabActive]}
              onPress={() => setSellerSubTab("ORDERS")}
            >
              <Text style={[styles.roleText, sellerSubTab === "ORDERS" && styles.roleTextActive]}>
                📦 Orders & Dispatch
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleTab, sellerSubTab === "TEAM" && styles.roleTabActive]}
              onPress={() => setSellerSubTab("TEAM")}
            >
              <Text style={[styles.roleText, sellerSubTab === "TEAM" && styles.roleTextActive]}>
                👥 Team & Margins
              </Text>
            </TouchableOpacity>
          </>
        )}

        {role === "AGENT" && (
          <TouchableOpacity style={[styles.roleTab, styles.roleTabActive]}>
            <Text style={[styles.roleText, styles.roleTextActive]}>
              📍 Beat Route & GPS Check-in
            </Text>
          </TouchableOpacity>
        )}

        {role === "SUPER_ADMIN" && (
          <TouchableOpacity style={[styles.roleTab, styles.roleTabActive]}>
            <Text style={[styles.roleText, styles.roleTextActive]}>
              🛡️ Operations HQ & KYC Queue
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Retailer Sub-Tab Bar */}
      {role === "RETAILER" && (
        <View style={styles.retailerSubBar}>
          <TouchableOpacity
            style={[styles.retailerSubTab, retailerSubTab === "CATALOG" && styles.retailerSubTabActive]}
            onPress={() => setRetailerSubTab("CATALOG")}
          >
            <Text
              style={[
                styles.retailerSubTabText,
                retailerSubTab === "CATALOG" && styles.retailerSubTabTextActive
              ]}
            >
              📦 Catalog
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.retailerSubTab, retailerSubTab === "ORDERS" && styles.retailerSubTabActive]}
            onPress={() => setRetailerSubTab("ORDERS")}
          >
            <Text
              style={[
                styles.retailerSubTabText,
                retailerSubTab === "ORDERS" && styles.retailerSubTabTextActive
              ]}
            >
              🚚 Orders & OTP
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.retailerSubTab, retailerSubTab === "PROFILE" && styles.retailerSubTabActive]}
            onPress={() => setRetailerSubTab("PROFILE")}
          >
            <Text
              style={[
                styles.retailerSubTabText,
                retailerSubTab === "PROFILE" && styles.retailerSubTabTextActive
              ]}
            >
              🏪 Store Profile
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Screen Render */}
      <View style={{ flex: 1 }}>
        {role === "SUPER_ADMIN" && <SuperAdminHQScreen />}
        {role === "AGENT" && <AgentBeatScreen />}
        {role === "SELLER" && sellerSubTab === "ORDERS" && <SellerOrdersScreen />}
        {role === "SELLER" && sellerSubTab === "TEAM" && <WholesaleTeamScreen />}
        {role === "RETAILER" && retailerSubTab === "CATALOG" && (
          <RetailerHomeScreen onNavigateTab={(tab) => setRetailerSubTab(tab)} />
        )}
        {role === "RETAILER" && retailerSubTab === "ORDERS" && <RetailerOrdersScreen />}
        {role === "RETAILER" && retailerSubTab === "PROFILE" && <RetailerProfileScreen />}
        {role === "POS" && <RetailerPOSCounterScreen />}
      </View>

      {/* Demo Test Accounts Switcher Modal */}
      <Modal visible={showAccountsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.modalTitle}>⚡ Instant Demo User Switch</Text>
              <TouchableOpacity onPress={() => setShowAccountsModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Tap any test account to instantly load their mobile persona:
            </Text>

            <ScrollView style={{ marginTop: 12, maxHeight: 380 }}>
              {TEST_ACCOUNTS.map((acc) => (
                <TouchableOpacity
                  key={acc.username}
                  style={styles.accountCard}
                  onPress={() => {
                    setRole(acc.role as RoleType);
                    setShowAccountsModal(false);
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={[styles.accDot, { backgroundColor: acc.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.accTitle}>{acc.title}</Text>
                      <Text style={styles.accUsername}>@{acc.username}</Text>
                      <Text style={styles.accTag}>{acc.tag}</Text>
                    </View>
                    <Text style={styles.accArrow}>→</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.btnDirectDownload} onPress={handleDownloadApk}>
              <Text style={styles.btnDirectDownloadText}>
                📥 Download Latest APK Binary (v{remoteVersion})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  otaBanner: { backgroundColor: "#f59e0b", paddingVertical: 8, paddingHorizontal: 14, alignItems: "center" },
  otaText: { color: "#000000", fontSize: 12, fontWeight: "bold" },
  topHeader: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#1e293b"
  },
  appTitle: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  appSubtitle: { color: "#38bdf8", fontSize: 11, fontWeight: "600" },
  btnTestAccounts: { backgroundColor: "#312e81", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: "#4338ca" },
  btnTestAccountsText: { color: "#c7d2fe", fontSize: 11, fontWeight: "bold" },
  roleBar: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    padding: 6,
    borderBottomWidth: 1,
    borderColor: "#334155"
  },
  roleTab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6 },
  roleTabActive: { backgroundColor: "#4f46e5" },
  roleText: { color: "#94a3b8", fontSize: 11, fontWeight: "bold" },
  roleTextActive: { color: "#ffffff" },
  sellerSubBar: { flexDirection: "row", backgroundColor: "#0f172a", padding: 4, borderBottomWidth: 1, borderColor: "#1e293b" },
  subTab: { flex: 1, paddingVertical: 6, alignItems: "center", borderRadius: 4 },
  subTabActive: { backgroundColor: "#334155" },
  subTabText: { color: "#94a3b8", fontSize: 11, fontWeight: "600" },
  subTabTextActive: { color: "#ffffff", fontWeight: "bold" },
  retailerSubBar: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#1e293b",
    gap: 6
  },
  retailerSubTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 6,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155"
  },
  retailerSubTabActive: {
    backgroundColor: "#059669",
    borderColor: "#10b981"
  },
  retailerSubTabText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600"
  },
  retailerSubTabTextActive: {
    color: "#ffffff",
    fontWeight: "bold"
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#0f172a", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, borderTopWidth: 1, borderColor: "#334155" },
  modalTitle: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  modalClose: { color: "#94a3b8", fontSize: 20, fontWeight: "bold", paddingHorizontal: 8 },
  modalSubtitle: { color: "#94a3b8", fontSize: 12, marginTop: 4 },
  accountCard: { backgroundColor: "#1e293b", padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: "#334155" },
  accDot: { width: 12, height: 12, borderRadius: 6 },
  accTitle: { color: "#ffffff", fontSize: 13, fontWeight: "bold" },
  accUsername: { color: "#38bdf8", fontSize: 11, marginTop: 1 },
  accTag: { color: "#94a3b8", fontSize: 10, marginTop: 2 },
  accArrow: { color: "#64748b", fontSize: 16, fontWeight: "bold" },
  btnDirectDownload: { backgroundColor: "#059669", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 12 },
  btnDirectDownloadText: { color: "#ffffff", fontSize: 12, fontWeight: "bold" }
});
