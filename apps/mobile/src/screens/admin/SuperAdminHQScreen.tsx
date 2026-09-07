import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";

interface KYCRequest {
  id: string;
  name: string;
  type: "RETAILER" | "SELLER";
  phone: string;
  docId: string;
  submittedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function SuperAdminHQScreen() {
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([
    {
      id: "kyc_1",
      name: "Awadh Agro Wholesale",
      type: "SELLER",
      phone: "917705871046",
      docId: "GSTIN: 09AAACA1234A1Z5",
      submittedAt: "10 mins ago",
      status: "PENDING"
    },
    {
      id: "kyc_2",
      name: "Verma Daily Needs & Kirana",
      type: "RETAILER",
      phone: "919026019566",
      docId: "UDYAM: UP-28-0019283",
      submittedAt: "25 mins ago",
      status: "PENDING"
    }
  ]);

  const handleApprove = (id: string, name: string, phone: string) => {
    setKycRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r))
    );
    Alert.alert(
      "KYC Approved & Active! 🎉",
      `Credentials auto-generated for ${name}.\nWhatsApp notification dispatched to ${phone} via Evolution API.`
    );
  };

  const handleReject = (id: string, name: string) => {
    setKycRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r))
    );
    Alert.alert("KYC Rejected", `Application for ${name} flagged for resubmission.`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Super Admin Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛡️ Super Admin Command HQ</Text>
        <Text style={styles.headerSubtitle}>
          Platform Telemetry • Multi-Tenant Orchestration • Zero Paid APIs
        </Text>
      </View>

      {/* KPI Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Platform GMV</Text>
          <Text style={styles.statValue}>₹18.4L</Text>
          <Text style={styles.statSub}>+24% vs last week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active Beats</Text>
          <Text style={styles.statValue}>14 Routes</Text>
          <Text style={styles.statSub}>285 stores visited</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Strike Rate</Text>
          <Text style={[styles.statValue, { color: "#059669" }]}>84.6%</Text>
          <Text style={styles.statSub}>Conversion target &gt; 80%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Dispatch TAT</Text>
          <Text style={styles.statValue}>19 Mins</Text>
          <Text style={styles.statSub}>SLA: &lt; 30 Mins</Text>
        </View>
      </View>

      {/* KYC Verification Desk */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📋 KYC Verification Queue</Text>
          <View style={styles.badgePending}>
            <Text style={styles.badgePendingText}>
              {kycRequests.filter((k) => k.status === "PENDING").length} Pending
            </Text>
          </View>
        </View>

        {kycRequests.map((req) => (
          <View key={req.id} style={styles.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.applicantName}>{req.name}</Text>
              <Text
                style={[
                  styles.roleTag,
                  req.type === "SELLER" ? styles.sellerTag : styles.retailerTag
                ]}
              >
                {req.type}
              </Text>
            </View>
            <Text style={styles.docText}>📄 {req.docId}</Text>
            <Text style={styles.phoneText}>📱 WhatsApp: {req.phone} • {req.submittedAt}</Text>

            {req.status === "PENDING" ? (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.btnApprove}
                  onPress={() => handleApprove(req.id, req.name, req.phone)}
                >
                  <Text style={styles.btnApproveText}>✓ Approve & Provision</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnReject}
                  onPress={() => handleReject(req.id, req.name)}
                >
                  <Text style={styles.btnRejectText}>✕ Reject</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={[
                  styles.statusPill,
                  req.status === "APPROVED" ? styles.pillApproved : styles.pillRejected
                ]}
              >
                <Text style={styles.statusPillText}>
                  {req.status === "APPROVED" ? "✓ Approved & Credentials Dispatched" : "✕ Rejected"}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Field Agents Beat Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Field Agent Real-Time Telemetry</Text>
        <View style={styles.agentCard}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.agentName}>Rahul Sharma (Agent)</Text>
            <Text style={styles.agentBeat}>Hazratganj Beat</Text>
          </View>
          <Text style={styles.agentProgress}>18 / 20 Stops Checked-in (90%) • 16 Orders Booked</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: "90%" }]} />
          </View>
        </View>

        <View style={styles.agentCard}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.agentName}>Priya Singh (Agent)</Text>
            <Text style={styles.agentBeat}>Alambagh Beat</Text>
          </View>
          <Text style={styles.agentProgress}>14 / 15 Stops Checked-in (93%) • 12 Orders Booked</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: "93%", backgroundColor: "#3b82f6" }]} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: { backgroundColor: "#1e1b4b", padding: 18, borderBottomWidth: 1, borderColor: "#312e81" },
  headerTitle: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  headerSubtitle: { color: "#a5b4fc", fontSize: 11, marginTop: 4 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 8 },
  statCard: { width: "48%", backgroundColor: "#1e293b", padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#334155" },
  statLabel: { color: "#94a3b8", fontSize: 11, fontWeight: "600" },
  statValue: { color: "#ffffff", fontSize: 20, fontWeight: "black", marginTop: 4 },
  statSub: { color: "#64748b", fontSize: 10, marginTop: 2 },
  section: { paddingHorizontal: 16, marginTop: 14, marginBottom: 12 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", color: "#f8fafc", textTransform: "uppercase", letterSpacing: 0.5 },
  badgePending: { backgroundColor: "#f59e0b", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgePendingText: { color: "#000000", fontSize: 10, fontWeight: "bold" },
  card: { backgroundColor: "#1e293b", padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: "#334155" },
  applicantName: { color: "#ffffff", fontSize: 14, fontWeight: "bold" },
  roleTag: { fontSize: 10, fontWeight: "bold", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  sellerTag: { backgroundColor: "#4338ca", color: "#e0e7ff" },
  retailerTag: { backgroundColor: "#047857", color: "#d1fae5" },
  docText: { color: "#cbd5e1", fontSize: 12, marginTop: 6 },
  phoneText: { color: "#94a3b8", fontSize: 11, marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  btnApprove: { flex: 2, backgroundColor: "#059669", paddingVertical: 8, borderRadius: 6, alignItems: "center" },
  btnApproveText: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },
  btnReject: { flex: 1, backgroundColor: "#dc2626", paddingVertical: 8, borderRadius: 6, alignItems: "center" },
  btnRejectText: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },
  statusPill: { paddingVertical: 8, borderRadius: 6, marginTop: 10, alignItems: "center" },
  pillApproved: { backgroundColor: "#064e3b" },
  pillRejected: { backgroundColor: "#7f1d1d" },
  statusPillText: { color: "#ffffff", fontSize: 11, fontWeight: "bold" },
  agentCard: { backgroundColor: "#1e293b", padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: "#334155" },
  agentName: { color: "#ffffff", fontSize: 13, fontWeight: "bold" },
  agentBeat: { color: "#38bdf8", fontSize: 11, fontWeight: "600" },
  agentProgress: { color: "#cbd5e1", fontSize: 11, marginTop: 6 },
  progressBarBg: { height: 6, backgroundColor: "#334155", borderRadius: 3, marginTop: 6, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#10b981", borderRadius: 3 }
});
