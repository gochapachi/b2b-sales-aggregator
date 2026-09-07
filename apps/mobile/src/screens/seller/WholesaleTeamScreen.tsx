import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from "react-native";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  canViewMargins: boolean;
  canManageOrders: boolean;
  canDispatch: boolean;
}

export default function WholesaleTeamScreen() {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "tm_1",
      name: "Rajesh Kumar",
      role: "Partner / Admin",
      phone: "919026019566",
      canViewMargins: true,
      canManageOrders: true,
      canDispatch: true
    },
    {
      id: "tm_2",
      name: "Manoj Verma",
      role: "Warehouse Picker",
      phone: "917705871046",
      canViewMargins: false,
      canManageOrders: true,
      canDispatch: true
    },
    {
      id: "tm_3",
      name: "Deepu Yadav",
      role: "Delivery Driver",
      phone: "919839001122",
      canViewMargins: false,
      canManageOrders: false,
      canDispatch: true
    }
  ]);

  const toggleMarginShield = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, canViewMargins: !m.canViewMargins } : m
      )
    );
    Alert.alert("Permission Updated", "Margin privacy shield rule updated for this team member.");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 Wholesale Team & RBAC</Text>
        <Text style={styles.headerSubtitle}>
          Anagata FMCG Wholesale • Role Permissions & Margin Privacy Shield
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Team Members ({members.length})</Text>
        {members.map((m) => (
          <View key={m.id} style={styles.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={styles.memberName}>{m.name}</Text>
                <Text style={styles.memberRole}>{m.role}</Text>
                <Text style={styles.phoneText}>📱 {m.phone}</Text>
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>Active</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Permission Toggles */}
            <View style={styles.permissionRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.permTitle}>View Purchase Costs & Margins</Text>
                <Text style={styles.permDesc}>
                  {m.canViewMargins ? "Visible on mobile bills" : "🛡️ Shielded (Privacy Active)"}
                </Text>
              </View>
              <Switch
                value={m.canViewMargins}
                onValueChange={() => toggleMarginShield(m.id)}
                trackColor={{ false: "#64748b", true: "#4f46e5" }}
              />
            </View>

            <View style={styles.permissionRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.permTitle}>Fulfill & Dispatch Orders</Text>
                <Text style={styles.permDesc}>Access crate packing & dispatch routes</Text>
              </View>
              <Switch
                value={m.canDispatch}
                disabled={true}
                trackColor={{ false: "#64748b", true: "#059669" }}
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#1e1b4b", padding: 18 },
  headerTitle: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  headerSubtitle: { color: "#a5b4fc", fontSize: 11, marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", color: "#1e293b", marginBottom: 12, textTransform: "uppercase" },
  card: { backgroundColor: "#ffffff", padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  memberName: { fontSize: 15, fontWeight: "bold", color: "#0f172a" },
  memberRole: { fontSize: 12, color: "#4f46e5", fontWeight: "600", marginTop: 2 },
  phoneText: { fontSize: 11, color: "#64748b", marginTop: 2 },
  roleBadge: { backgroundColor: "#ecfdf5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#a7f3d0" },
  roleBadgeText: { color: "#065f46", fontSize: 11, fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 12 },
  permissionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  permTitle: { fontSize: 13, fontWeight: "600", color: "#1e293b" },
  permDesc: { fontSize: 11, color: "#64748b", marginTop: 2 }
});
