export interface DedicatedRepCostInputs {
  monthlyBaseSalary: number;     // e.g. ₹22,000
  dailyTravelAllowance: number;  // e.g. ₹250 / day
  workingDaysPerMonth: number;   // e.g. 26 days
  monthlyPerformanceIncentive: number; // e.g. ₹3,000
  deviceAndOverheads: number;    // e.g. ₹1,500 (SIM, app, insurance, HR)
  numberOfRepsOrBeats: number;   // e.g. 1, 2, 5
}

export interface PlatformSharedRepCostInputs {
  fixedMonthlyBeatSubscription: number; // e.g. ₹6,000 per beat/rep replaced
  numberOfBeats: number;                // e.g. 1, 2, 5
}

export interface SellerRoiAnalysisResult {
  dedicatedRepMonthlyTotal: number;
  dedicatedRepAnnualTotal: number;
  platformSharedMonthlyTotal: number;
  platformSharedAnnualTotal: number;
  monthlyRupeeSavings: number;
  annualRupeeSavings: number;
  savingsPercentage: number;
  effectiveCostPerVisit: {
    dedicatedRep: number;
    platformShared: number;
  };
  commissionRate: number; // Always 0% - pure subscription
  summaryPitch: string;
}

export function calculateSellerSavings(
  repInputs: DedicatedRepCostInputs,
  platformInputs: PlatformSharedRepCostInputs,
  averageVisitsPerMonth: number = 780 // ~30 visits/day * 26 days
): SellerRoiAnalysisResult {
  const taTotal = repInputs.dailyTravelAllowance * repInputs.workingDaysPerMonth;
  const singleDedicatedRepCost =
    repInputs.monthlyBaseSalary +
    taTotal +
    repInputs.monthlyPerformanceIncentive +
    repInputs.deviceAndOverheads;

  const totalDedicatedMonthly = singleDedicatedRepCost * repInputs.numberOfRepsOrBeats;
  const totalDedicatedAnnual = totalDedicatedMonthly * 12;

  const totalPlatformMonthly =
    platformInputs.fixedMonthlyBeatSubscription * platformInputs.numberOfBeats;
  const totalPlatformAnnual = totalPlatformMonthly * 12;

  const monthlyRupeeSavings = Math.max(0, totalDedicatedMonthly - totalPlatformMonthly);
  const annualRupeeSavings = monthlyRupeeSavings * 12;
  const savingsPercentage =
    totalDedicatedMonthly > 0
      ? Math.round(((monthlyRupeeSavings / totalDedicatedMonthly) * 100) * 10) / 10
      : 0;

  const totalVisits = averageVisitsPerMonth * repInputs.numberOfRepsOrBeats;
  const dedicatedCostPerVisit =
    totalVisits > 0 ? Math.round((totalDedicatedMonthly / totalVisits) * 10) / 10 : 0;
  const platformCostPerVisit =
    totalVisits > 0 ? Math.round((totalPlatformMonthly / totalVisits) * 10) / 10 : 0;

  const summaryPitch = `By switching to our Shared Sales Force, you replace a ₹${Math.round(
    totalDedicatedMonthly
  ).toLocaleString('en-IN')}/mo dedicated sales payroll with a fixed ₹${Math.round(
    totalPlatformMonthly
  ).toLocaleString('en-IN')}/mo subscription (0% commission). You save ₹${Math.round(
    monthlyRupeeSavings
  ).toLocaleString('en-IN')} every month (${savingsPercentage}% savings) while keeping 100% of your sales revenues!`;

  return {
    dedicatedRepMonthlyTotal: totalDedicatedMonthly,
    dedicatedRepAnnualTotal: totalDedicatedAnnual,
    platformSharedMonthlyTotal: totalPlatformMonthly,
    platformSharedAnnualTotal: totalPlatformAnnual,
    monthlyRupeeSavings,
    annualRupeeSavings,
    savingsPercentage,
    effectiveCostPerVisit: {
      dedicatedRep: dedicatedCostPerVisit,
      platformShared: platformCostPerVisit
    },
    commissionRate: 0,
    summaryPitch
  };
}
