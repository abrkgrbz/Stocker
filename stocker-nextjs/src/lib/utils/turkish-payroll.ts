/**
 * Turkish Payroll Calculation Utility
 * 2024 Vergi Parametreleri ile Türkiye Bordro Hesaplama
 *
 * Bu dosya SGK, Gelir Vergisi, Damga Vergisi hesaplamalarını içerir.
 * Parametreler yıllık olarak güncellenmeli.
 */

// =====================================
// 2024 YILI PARAMETRELERİ
// =====================================

export const PAYROLL_PARAMS_2024 = {
  // Asgari Ücret (Brüt)
  MINIMUM_WAGE: 20002.50,

  // SGK Tavan (30 x Asgari Ücret)
  SGK_CEILING: 150018.90,

  // SGK İşçi Payları
  SGK_EMPLOYEE: {
    INSURANCE: 0.14,      // %14 Sigorta Primi İşçi Payı
    UNEMPLOYMENT: 0.01,   // %1 İşsizlik Sigortası İşçi Payı
    TOTAL: 0.15,          // %15 Toplam İşçi Payı
  },

  // SGK İşveren Payları
  SGK_EMPLOYER: {
    INSURANCE: 0.205,     // %20.5 Sigorta Primi İşveren Payı (5 puan indirimli)
    UNEMPLOYMENT: 0.02,   // %2 İşsizlik Sigortası İşveren Payı
    TOTAL: 0.225,         // %22.5 Toplam İşveren Payı
  },

  // Gelir Vergisi Dilimleri (Kümülatif)
  INCOME_TAX_BRACKETS: [
    { limit: 110000, rate: 0.15 },    // 0 - 110.000 TL: %15
    { limit: 230000, rate: 0.20 },    // 110.000 - 230.000 TL: %20
    { limit: 580000, rate: 0.27 },    // 230.000 - 580.000 TL: %27
    { limit: 3000000, rate: 0.35 },   // 580.000 - 3.000.000 TL: %35
    { limit: Infinity, rate: 0.40 },  // 3.000.000 TL üzeri: %40
  ],

  // Damga Vergisi
  STAMP_TAX_RATE: 0.00759, // %0.759

  // Asgari Geçim İndirimi (AGİ) - 2024'te kaldırıldı, yerine vergi istisnası var
  // Asgari ücrete kadar olan kısım vergiden muaf
  MIN_WAGE_TAX_EXEMPTION: true,
};

// =====================================
// TİPLER
// =====================================

export interface PayrollInput {
  baseSalary: number;       // Brüt Maaş
  overtimePay?: number;     // Fazla Mesai
  bonus?: number;           // Prim/Bonus
  allowances?: number;      // Yan Haklar (Yol, Yemek vs.)
  cumulativeGross?: number; // Yılbaşından bugüne kümülatif brüt (vergi dilimi için)
  applyMinWageExemption?: boolean; // Asgari ücret istisnası uygulansın mı
}

export interface PayrollCalculation {
  // Kazançlar
  baseSalary: number;
  overtimePay: number;
  bonus: number;
  allowances: number;
  grossSalary: number;

  // SGK Kesintileri (İşçi)
  sgkInsuranceEmployee: number;     // SGK Sigorta İşçi Payı
  sgkUnemploymentEmployee: number;  // İşsizlik Sigortası İşçi Payı
  totalSgkEmployee: number;         // Toplam SGK İşçi Payı

  // Vergi Matrahı
  taxBase: number;                  // Gelir Vergisi Matrahı

  // Vergiler
  incomeTax: number;               // Gelir Vergisi
  stampTax: number;                // Damga Vergisi
  minWageExemption: number;        // Asgari Ücret İstisnası

  // Toplam Kesintiler
  totalDeductions: number;

  // Net Maaş
  netSalary: number;

  // İşveren Maliyetleri
  sgkInsuranceEmployer: number;    // SGK Sigorta İşveren Payı
  sgkUnemploymentEmployer: number; // İşsizlik Sigortası İşveren Payı
  totalSgkEmployer: number;        // Toplam SGK İşveren Payı
  totalEmployerCost: number;       // Toplam İşveren Maliyeti

  // Detaylar
  effectiveTaxRate: number;        // Efektif Vergi Oranı
  sgkCeilingApplied: boolean;      // SGK Tavan uygulandı mı
}

export interface PayrollBreakdown {
  label: string;
  code: string;
  amount: number;
  isDeduction: boolean;
  isEmployerCost: boolean;
  isTaxable: boolean;
}

// =====================================
// HESAPLAMA FONKSİYONLARI
// =====================================

/**
 * SGK Matrahı Hesapla (Tavana göre düzelt)
 */
function calculateSgkBase(grossSalary: number): number {
  return Math.min(grossSalary, PAYROLL_PARAMS_2024.SGK_CEILING);
}

/**
 * Gelir Vergisi Hesapla (Kümülatif dilim sistemi)
 */
function calculateIncomeTax(
  taxBase: number,
  cumulativeGross: number = 0,
  applyMinWageExemption: boolean = true
): { tax: number; exemption: number } {
  const params = PAYROLL_PARAMS_2024;

  // Asgari ücret istisnası (2024)
  let exemption = 0;
  let adjustedTaxBase = taxBase;

  if (applyMinWageExemption && params.MIN_WAGE_TAX_EXEMPTION) {
    // Asgari ücretin vergi matrahı kadar istisna
    const minWageTaxBase = params.MINIMUM_WAGE * (1 - params.SGK_EMPLOYEE.TOTAL);
    exemption = Math.min(minWageTaxBase, taxBase);
    adjustedTaxBase = Math.max(0, taxBase - exemption);
  }

  if (adjustedTaxBase <= 0) {
    return { tax: 0, exemption };
  }

  // Kümülatif vergi hesaplama
  const previousCumulativeTaxBase = cumulativeGross * (1 - params.SGK_EMPLOYEE.TOTAL);
  const newCumulativeTaxBase = previousCumulativeTaxBase + adjustedTaxBase;

  // Önceki dönem vergisi
  const previousTax = calculateCumulativeTax(previousCumulativeTaxBase);

  // Yeni toplam vergi
  const newTax = calculateCumulativeTax(newCumulativeTaxBase);

  // Bu dönem vergisi = Yeni toplam - Önceki toplam
  const currentTax = newTax - previousTax;

  return { tax: Math.max(0, currentTax), exemption };
}

/**
 * Kümülatif Vergi Hesapla (Dilim sistemi)
 */
function calculateCumulativeTax(cumulativeTaxBase: number): number {
  const brackets = PAYROLL_PARAMS_2024.INCOME_TAX_BRACKETS;
  let remainingBase = cumulativeTaxBase;
  let totalTax = 0;
  let previousLimit = 0;

  for (const bracket of brackets) {
    if (remainingBase <= 0) break;

    const bracketAmount = Math.min(remainingBase, bracket.limit - previousLimit);
    totalTax += bracketAmount * bracket.rate;
    remainingBase -= bracketAmount;
    previousLimit = bracket.limit;
  }

  return totalTax;
}

/**
 * Damga Vergisi Hesapla
 */
function calculateStampTax(grossSalary: number): number {
  return grossSalary * PAYROLL_PARAMS_2024.STAMP_TAX_RATE;
}

/**
 * Ana Bordro Hesaplama Fonksiyonu
 */
export function calculateTurkishPayroll(input: PayrollInput): PayrollCalculation {
  const params = PAYROLL_PARAMS_2024;

  // Kazançlar
  const baseSalary = input.baseSalary || 0;
  const overtimePay = input.overtimePay || 0;
  const bonus = input.bonus || 0;
  const allowances = input.allowances || 0;
  const grossSalary = baseSalary + overtimePay + bonus + allowances;

  // SGK Matrahı (Tavan kontrolü)
  const sgkBase = calculateSgkBase(grossSalary);
  const sgkCeilingApplied = grossSalary > params.SGK_CEILING;

  // SGK İşçi Payları
  const sgkInsuranceEmployee = sgkBase * params.SGK_EMPLOYEE.INSURANCE;
  const sgkUnemploymentEmployee = sgkBase * params.SGK_EMPLOYEE.UNEMPLOYMENT;
  const totalSgkEmployee = sgkInsuranceEmployee + sgkUnemploymentEmployee;

  // Gelir Vergisi Matrahı
  const taxBase = grossSalary - totalSgkEmployee;

  // Gelir Vergisi
  const { tax: incomeTax, exemption: minWageExemption } = calculateIncomeTax(
    taxBase,
    input.cumulativeGross || 0,
    input.applyMinWageExemption !== false
  );

  // Damga Vergisi
  const stampTax = calculateStampTax(grossSalary);

  // Toplam Kesintiler
  const totalDeductions = totalSgkEmployee + incomeTax + stampTax;

  // Net Maaş
  const netSalary = grossSalary - totalDeductions;

  // İşveren SGK Payları
  const sgkInsuranceEmployer = sgkBase * params.SGK_EMPLOYER.INSURANCE;
  const sgkUnemploymentEmployer = sgkBase * params.SGK_EMPLOYER.UNEMPLOYMENT;
  const totalSgkEmployer = sgkInsuranceEmployer + sgkUnemploymentEmployer;

  // Toplam İşveren Maliyeti
  const totalEmployerCost = grossSalary + totalSgkEmployer;

  // Efektif Vergi Oranı
  const effectiveTaxRate = grossSalary > 0 ? totalDeductions / grossSalary : 0;

  return {
    baseSalary,
    overtimePay,
    bonus,
    allowances,
    grossSalary,
    sgkInsuranceEmployee,
    sgkUnemploymentEmployee,
    totalSgkEmployee,
    taxBase,
    incomeTax,
    stampTax,
    minWageExemption,
    totalDeductions,
    netSalary,
    sgkInsuranceEmployer,
    sgkUnemploymentEmployer,
    totalSgkEmployer,
    totalEmployerCost,
    effectiveTaxRate,
    sgkCeilingApplied,
  };
}

/**
 * Bordro Kalemlerini Döndür (PayrollItem formatında)
 */
export function getPayrollBreakdown(calculation: PayrollCalculation): PayrollBreakdown[] {
  const items: PayrollBreakdown[] = [];

  // Kazançlar
  if (calculation.baseSalary > 0) {
    items.push({
      label: 'Temel Maaş',
      code: 'BASE_SALARY',
      amount: calculation.baseSalary,
      isDeduction: false,
      isEmployerCost: false,
      isTaxable: true,
    });
  }

  if (calculation.overtimePay > 0) {
    items.push({
      label: 'Fazla Mesai',
      code: 'OVERTIME',
      amount: calculation.overtimePay,
      isDeduction: false,
      isEmployerCost: false,
      isTaxable: true,
    });
  }

  if (calculation.bonus > 0) {
    items.push({
      label: 'Prim/Bonus',
      code: 'BONUS',
      amount: calculation.bonus,
      isDeduction: false,
      isEmployerCost: false,
      isTaxable: true,
    });
  }

  if (calculation.allowances > 0) {
    items.push({
      label: 'Yan Haklar',
      code: 'ALLOWANCES',
      amount: calculation.allowances,
      isDeduction: false,
      isEmployerCost: false,
      isTaxable: true,
    });
  }

  // İşçi Kesintileri
  items.push({
    label: 'SGK Sigorta Primi (%14)',
    code: 'SGK_EMPLOYEE_INSURANCE',
    amount: calculation.sgkInsuranceEmployee,
    isDeduction: true,
    isEmployerCost: false,
    isTaxable: false,
  });

  items.push({
    label: 'İşsizlik Sigortası (%1)',
    code: 'SGK_EMPLOYEE_UNEMPLOYMENT',
    amount: calculation.sgkUnemploymentEmployee,
    isDeduction: true,
    isEmployerCost: false,
    isTaxable: false,
  });

  items.push({
    label: 'Gelir Vergisi',
    code: 'INCOME_TAX',
    amount: calculation.incomeTax,
    isDeduction: true,
    isEmployerCost: false,
    isTaxable: false,
  });

  items.push({
    label: 'Damga Vergisi (%0.759)',
    code: 'STAMP_TAX',
    amount: calculation.stampTax,
    isDeduction: true,
    isEmployerCost: false,
    isTaxable: false,
  });

  // İşveren Maliyetleri
  items.push({
    label: 'SGK İşveren Payı (%20.5)',
    code: 'SGK_EMPLOYER_INSURANCE',
    amount: calculation.sgkInsuranceEmployer,
    isDeduction: false,
    isEmployerCost: true,
    isTaxable: false,
  });

  items.push({
    label: 'İşsizlik İşveren Payı (%2)',
    code: 'SGK_EMPLOYER_UNEMPLOYMENT',
    amount: calculation.sgkUnemploymentEmployer,
    isDeduction: false,
    isEmployerCost: true,
    isTaxable: false,
  });

  return items;
}

/**
 * Para Formatla (Türk Lirası)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Yüzde Formatla
 */
export function formatPercent(rate: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'percent',
    minimumFractionDigits: 2,
  }).format(rate);
}

// =====================================
// YARDIMCI FONKSİYONLAR
// =====================================

/**
 * Vergi Dilimi Bilgisi Getir
 */
export function getTaxBracketInfo(cumulativeGross: number): {
  currentBracket: number;
  currentRate: number;
  nextBracketLimit: number | null;
  amountUntilNextBracket: number | null;
} {
  const brackets = PAYROLL_PARAMS_2024.INCOME_TAX_BRACKETS;
  const taxBase = cumulativeGross * (1 - PAYROLL_PARAMS_2024.SGK_EMPLOYEE.TOTAL);

  let previousLimit = 0;
  for (let i = 0; i < brackets.length; i++) {
    if (taxBase < brackets[i].limit) {
      return {
        currentBracket: i + 1,
        currentRate: brackets[i].rate,
        nextBracketLimit: i < brackets.length - 1 ? brackets[i].limit : null,
        amountUntilNextBracket: i < brackets.length - 1
          ? brackets[i].limit - taxBase
          : null,
      };
    }
    previousLimit = brackets[i].limit;
  }

  // Son dilimde
  return {
    currentBracket: brackets.length,
    currentRate: brackets[brackets.length - 1].rate,
    nextBracketLimit: null,
    amountUntilNextBracket: null,
  };
}

/**
 * 2024 Parametrelerini Döndür (UI'da göstermek için)
 */
export function getPayrollParams() {
  return PAYROLL_PARAMS_2024;
}
