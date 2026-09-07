import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput
} from "react-native";

interface PricingSlab {
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
  discountPct: number;
}

interface ProductDetailModalProps {
  visible: boolean;
  product: any | null;
  currentCartQty?: number;
  onAddToCart: (skuId: string, quantity: number) => void;
  onClose: () => void;
}

export default function ProductDetailModal({
  visible,
  product,
  currentCartQty = 0,
  onAddToCart,
  onClose
}: ProductDetailModalProps) {
  if (!product) return null;

  const skus = product.skus || [];
  const [selectedSkuIdx, setSelectedSkuIdx] = useState(0);

  const currentSku = skus[selectedSkuIdx] || {
    id: "default_sku",
    unitTitle: product.name,
    unitMultiplier: 1,
    cartonMultiplier: 24,
    mrp: product.wholesalePrice ? Math.round(product.wholesalePrice * 1.25) : 100,
    wholesalePrice: product.wholesalePrice || 80,
    minimumOrderQuantity: 1,
    stockQuantity: 120,
    pricingSlabs: []
  };

  const cartonMultiplier = currentSku.cartonMultiplier || 24;
  const moq = currentSku.minimumOrderQuantity || 1;
  const mrp = currentSku.mrp || Math.round(currentSku.wholesalePrice * 1.25);
  const baseWholesalePrice = currentSku.wholesalePrice || Math.round(mrp * 0.8);

  // Initialize quantity
  const initialQty = currentCartQty > 0 ? currentCartQty : moq;
  const [calcQty, setCalcQty] = useState(initialQty);

  useEffect(() => {
    const qty = currentCartQty > 0 ? currentCartQty : moq;
    setCalcQty(qty);
  }, [product, selectedSkuIdx, currentCartQty, moq]);

  // Pricing slabs: use product slabs if available, else derive default volume slabs
  const slabs: PricingSlab[] =
    currentSku.pricingSlabs && currentSku.pricingSlabs.length > 0
      ? currentSku.pricingSlabs
      : [
          {
            minQuantity: 1,
            maxQuantity: cartonMultiplier * 4,
            pricePerUnit: baseWholesalePrice,
            discountPct: 0
          },
          {
            minQuantity: cartonMultiplier * 4 + 1,
            maxQuantity: cartonMultiplier * 10,
            pricePerUnit: Math.round(baseWholesalePrice * 0.96 * 100) / 100,
            discountPct: 4
          },
          {
            minQuantity: cartonMultiplier * 10 + 1,
            maxQuantity: 999999,
            pricePerUnit: Math.round(baseWholesalePrice * 0.92 * 100) / 100,
            discountPct: 8
          }
        ];

  // Determine active slab and effective unit wholesale price
  const activeSlab =
    slabs.find(
      (s) =>
        calcQty >= s.minQuantity &&
        (!s.maxQuantity || calcQty <= s.maxQuantity)
    ) || slabs[0];

  const effectiveWholesalePrice = activeSlab ? activeSlab.pricePerUnit : baseWholesalePrice;

  // Margin calculations
  const totalWholesaleCost = Math.round(calcQty * effectiveWholesalePrice * 100) / 100;
  const totalMrpRevenue = Math.round(calcQty * mrp * 100) / 100;
  const netProfitUnit = Math.max(0, Math.round((mrp - effectiveWholesalePrice) * 100) / 100);
  const totalNetProfit = Math.max(0, Math.round((totalMrpRevenue - totalWholesaleCost) * 100) / 100);
  const profitPerCarton = Math.round(netProfitUnit * cartonMultiplier * 100) / 100;
  const marginPct = mrp > 0 ? Math.round(((mrp - effectiveWholesalePrice) / mrp) * 100) : 0;
  const totalCartons = Math.floor(calcQty / cartonMultiplier);
  const looseUnits = calcQty % cartonMultiplier;

  const handleQtyChange = (newQty: number) => {
    if (newQty < 0) newQty = 0;
    setCalcQty(newQty);
  };

  const handleSaveToCart = () => {
    onAddToCart(currentSku.id, calcQty);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={styles.badgeRow}>
                <Text style={styles.brandBadge}>{product.brand || "FMCG Brand"}</Text>
                <Text style={styles.categoryBadge}>{product.category || "General"}</Text>
                {product.hsnCode && (
                  <Text style={styles.hsnBadge}>HSN {product.hsnCode}</Text>
                )}
              </View>
              <Text style={styles.productTitle} numberOfLines={2}>
                {product.name}
              </Text>
              <Text style={styles.supplierText}>
                Wholesaler: {product.organizationName || "Anagata FMCG Wholesale Hub"}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* SKU Selector if multiple */}
            {skus.length > 1 && (
              <View style={styles.sectionBox}>
                <Text style={styles.sectionLabel}>SELECT PACK / SKU VARIANT</Text>
                <View style={styles.skuPillsRow}>
                  {skus.map((sku: any, idx: number) => (
                    <TouchableOpacity
                      key={sku.id || idx}
                      style={[
                        styles.skuPill,
                        selectedSkuIdx === idx && styles.skuPillActive
                      ]}
                      onPress={() => setSelectedSkuIdx(idx)}
                    >
                      <Text
                        style={[
                          styles.skuPillText,
                          selectedSkuIdx === idx && styles.skuPillTextActive
                        ]}
                      >
                        {sku.unitTitle || `SKU ${idx + 1}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* SKU Technical Specifications */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionLabel}>SKU PACKAGING & TAX SPECIFICATIONS</Text>
              <View style={styles.specsGrid}>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Packaging Unit</Text>
                  <Text style={styles.specValue}>{currentSku.unitTitle || "Standard Pack"}</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Carton Size</Text>
                  <Text style={styles.specValue}>{cartonMultiplier} Units / Box</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Unit Multiplier</Text>
                  <Text style={styles.specValue}>{currentSku.unitMultiplier || 1}x</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>GST Tax Rate</Text>
                  <Text style={styles.specValue}>{product.gstRatePct || 5}% (Included)</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Available Stock</Text>
                  <Text style={[styles.specValue, { color: "#10b981" }]}>
                    {currentSku.stockQuantity || 150} Units Ready
                  </Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Wholesale MOQ</Text>
                  <Text style={styles.specValue}>{moq} Unit(s)</Text>
                </View>
              </View>
            </View>

            {/* Tiered Volume Slabs */}
            <View style={styles.sectionBox}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={styles.sectionLabel}>TIERED VOLUME SLABS</Text>
                <Text style={styles.slabHint}>Higher Quantity = Lower Wholesale Rate</Text>
              </View>

              <View style={styles.slabList}>
                {slabs.map((slab, sIdx) => {
                  const isSelected = activeSlab === slab;
                  return (
                    <View
                      key={sIdx}
                      style={[styles.slabCard, isSelected && styles.slabCardActive]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.slabRange, isSelected && styles.slabRangeActive]}>
                          {slab.minQuantity}
                          {slab.maxQuantity && slab.maxQuantity < 999999
                            ? ` – ${slab.maxQuantity}`
                            : "+"}{" "}
                          units ({Math.floor(slab.minQuantity / cartonMultiplier)}
                          {slab.maxQuantity && slab.maxQuantity < 999999
                            ? `–${Math.floor(slab.maxQuantity / cartonMultiplier)}`
                            : "+"} ctn)
                        </Text>
                        <Text style={styles.slabDiscountText}>
                          {slab.discountPct > 0
                            ? `Save ${slab.discountPct}% vs base wholesale`
                            : "Standard Wholesaler Price"}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={[styles.slabPrice, isSelected && styles.slabPriceActive]}>
                          ₹{slab.pricePerUnit} /u
                        </Text>
                        {isSelected && (
                          <View style={styles.activeSlabBadge}>
                            <Text style={styles.activeSlabBadgeText}>✓ APPLIED</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Live Retail Resale Margin Calculator */}
            <View style={styles.calculatorCard}>
              <View style={styles.calcHeader}>
                <Text style={styles.calcTitle}>📊 LIVE RETAIL RESALE MARGIN CALCULATOR</Text>
                <View style={styles.marginPctBadge}>
                  <Text style={styles.marginPctText}>+{marginPct}% NET MARGIN</Text>
                </View>
              </View>

              <Text style={styles.calcSubtitle}>
                Adjust quantity below to calculate your store's total profit on resale:
              </Text>

              {/* Interactive Quantity Stepper */}
              <View style={styles.stepperSection}>
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={styles.stepBtnLarge}
                    onPress={() => handleQtyChange(calcQty - cartonMultiplier)}
                    disabled={calcQty <= 0}
                  >
                    <Text style={styles.stepBtnLargeText}>−1 Ctn</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => handleQtyChange(calcQty - 1)}
                    disabled={calcQty <= 0}
                  >
                    <Text style={styles.stepBtnText}>−</Text>
                  </TouchableOpacity>

                  <View style={styles.qtyDisplayBox}>
                    <Text style={styles.qtyDisplayText}>{calcQty}</Text>
                    <Text style={styles.qtyUnitSubtitle}>
                      {totalCartons > 0 ? `${totalCartons} Ctn` : ""}
                      {looseUnits > 0 ? ` + ${looseUnits} u` : ""}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => handleQtyChange(calcQty + 1)}
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.stepBtnLarge}
                    onPress={() => handleQtyChange(calcQty + cartonMultiplier)}
                  >
                    <Text style={styles.stepBtnLargeText}>+1 Ctn</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Calculator Metrics Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricBoxLabel}>Wholesale Rate</Text>
                  <Text style={styles.metricBoxValue}>₹{effectiveWholesalePrice}</Text>
                  <Text style={styles.metricBoxSub}>Per unit cost</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricBoxLabel}>Customer MRP</Text>
                  <Text style={styles.metricBoxValue}>₹{mrp}</Text>
                  <Text style={styles.metricBoxSub}>Retail selling price</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricBoxLabel}>Profit / Unit</Text>
                  <Text style={[styles.metricBoxValue, { color: "#10b981" }]}>
                    +₹{netProfitUnit}
                  </Text>
                  <Text style={styles.metricBoxSub}>{marginPct}% on MRP</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricBoxLabel}>Profit / Carton</Text>
                  <Text style={[styles.metricBoxValue, { color: "#10b981" }]}>
                    +₹{profitPerCarton}
                  </Text>
                  <Text style={styles.metricBoxSub}>Box of {cartonMultiplier}u</Text>
                </View>
              </View>

              {/* Total Summary Row */}
              <View style={styles.summaryBar}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryLabel}>Wholesale Investment:</Text>
                  <Text style={styles.summaryCost}>₹{totalWholesaleCost.toLocaleString("en-IN")}</Text>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={styles.summaryLabel}>Resale Revenue:</Text>
                  <Text style={styles.summaryRevenue}>₹{totalMrpRevenue.toLocaleString("en-IN")}</Text>
                </View>
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <Text style={styles.summaryLabel}>Your Net Profit:</Text>
                  <Text style={styles.summaryProfit}>+₹{totalNetProfit.toLocaleString("en-IN")}</Text>
                </View>
              </View>
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={styles.footerBar}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.footerQtyLabel}>
                {calcQty} Units ({totalCartons} Cartons{looseUnits ? `, ${looseUnits} loose` : ""})
              </Text>
              <Text style={styles.footerPrice}>₹{totalWholesaleCost.toLocaleString("en-IN")}</Text>
              <Text style={styles.footerProfitSub}>
                +{marginPct}% Profit (+₹{totalNetProfit.toLocaleString("en-IN")})
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.btnAction,
                calcQty === 0 && { backgroundColor: "#475569" }
              ]}
              onPress={handleSaveToCart}
              disabled={calcQty === 0}
            >
              <Text style={styles.btnActionText}>
                {currentCartQty > 0 ? "✓ Update Order" : "🛒 Add to Order"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    justifyContent: "flex-end"
  },
  modalContainer: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: "92%",
    borderWidth: 1,
    borderColor: "#334155"
  },
  modalHeader: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#1e293b",
    alignItems: "flex-start"
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
    flexWrap: "wrap"
  },
  brandBadge: {
    backgroundColor: "#1e293b",
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  categoryBadge: {
    backgroundColor: "#312e81",
    color: "#a5b4fc",
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  hsnBadge: {
    backgroundColor: "#1e1b4b",
    color: "#c7d2fe",
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  productTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 22
  },
  supplierText: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 3
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155"
  },
  closeBtnText: {
    color: "#94a3b8",
    fontSize: 16,
    fontWeight: "bold"
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 14
  },
  sectionBox: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155"
  },
  sectionLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 10
  },
  skuPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  skuPill: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155"
  },
  skuPillActive: {
    backgroundColor: "#4338ca",
    borderColor: "#6366f1"
  },
  skuPillText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600"
  },
  skuPillTextActive: {
    color: "#ffffff",
    fontWeight: "bold"
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  specItem: {
    width: "48%",
    backgroundColor: "#0f172a",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155"
  },
  specLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "600"
  },
  specValue: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2
  },
  slabHint: {
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "600"
  },
  slabList: {
    gap: 6
  },
  slabCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155"
  },
  slabCardActive: {
    borderColor: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.08)"
  },
  slabRange: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "600"
  },
  slabRangeActive: {
    color: "#10b981",
    fontWeight: "bold"
  },
  slabDiscountText: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 1
  },
  slabPrice: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold"
  },
  slabPriceActive: {
    color: "#10b981"
  },
  activeSlabBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2
  },
  activeSlabBadgeText: {
    color: "#0f172a",
    fontSize: 9,
    fontWeight: "bold"
  },
  calculatorCard: {
    backgroundColor: "#131d33",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#4f46e5"
  },
  calcHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  calcTitle: {
    color: "#c7d2fe",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5
  },
  marginPctBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  marginPctText: {
    color: "#0f172a",
    fontSize: 10,
    fontWeight: "bold"
  },
  calcSubtitle: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 4,
    marginBottom: 10
  },
  stepperSection: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155"
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  stepBtnLarge: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#475569"
  },
  stepBtnLargeText: {
    color: "#38bdf8",
    fontSize: 11,
    fontWeight: "bold"
  },
  stepBtn: {
    width: 38,
    height: 38,
    backgroundColor: "#312e81",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#4338ca"
  },
  stepBtnText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold"
  },
  qtyDisplayBox: {
    alignItems: "center",
    paddingHorizontal: 12
  },
  qtyDisplayText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold"
  },
  qtyUnitSubtitle: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 2
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12
  },
  metricBox: {
    width: "48%",
    backgroundColor: "#0f172a",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b"
  },
  metricBoxLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "600"
  },
  metricBoxValue: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 2
  },
  metricBoxSub: {
    color: "#94a3b8",
    fontSize: 9,
    marginTop: 2
  },
  summaryBar: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155"
  },
  summaryLabel: {
    color: "#64748b",
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase"
  },
  summaryCost: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 2
  },
  summaryRevenue: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 2
  },
  summaryProfit: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 2
  },
  footerBar: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#334155",
    alignItems: "center"
  },
  footerQtyLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600"
  },
  footerPrice: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold"
  },
  footerProfitSub: {
    color: "#10b981",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 1
  },
  btnAction: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  btnActionText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold"
  }
});
