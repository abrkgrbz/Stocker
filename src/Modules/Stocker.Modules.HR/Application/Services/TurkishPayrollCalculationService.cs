namespace Stocker.Modules.HR.Application.Services;

/// <summary>
/// 2024 Türkiye Bordro Hesaplama Servisi
/// SGK, Gelir Vergisi, Damga Vergisi hesaplamalarını içerir
/// </summary>
public class TurkishPayrollCalculationService : ITurkishPayrollCalculationService
{
    // 2024 Yılı Parametreleri
    private const decimal MINIMUM_WAGE = 20002.50m;
    private const decimal SGK_CEILING = 150018.90m;

    // SGK İşçi Payları
    private const decimal SGK_EMPLOYEE_INSURANCE = 0.14m;
    private const decimal SGK_EMPLOYEE_UNEMPLOYMENT = 0.01m;
    private const decimal SGK_EMPLOYEE_TOTAL = 0.15m;

    // SGK İşveren Payları
    private const decimal SGK_EMPLOYER_INSURANCE = 0.205m;
    private const decimal SGK_EMPLOYER_UNEMPLOYMENT = 0.02m;
    private const decimal SGK_EMPLOYER_TOTAL = 0.225m;

    // Damga Vergisi
    private const decimal STAMP_TAX_RATE = 0.00759m;

    // Gelir Vergisi Dilimleri
    private static readonly (decimal Limit, decimal Rate)[] IncomeTaxBrackets = new[]
    {
        (110000m, 0.15m),
        (230000m, 0.20m),
        (580000m, 0.27m),
        (3000000m, 0.35m),
        (decimal.MaxValue, 0.40m)
    };

    public PayrollCalculationResult Calculate(PayrollCalculationInput input)
    {
        // Brüt Kazanç
        var grossEarnings = input.BaseSalary + input.OvertimePay + input.Bonus + input.Allowances;

        // SGK Matrahı (Tavan kontrolü)
        var sgkBase = Math.Min(grossEarnings, SGK_CEILING);
        var sgkCeilingApplied = grossEarnings > SGK_CEILING;

        // SGK İşçi Payları
        var sgkInsuranceEmployee = sgkBase * SGK_EMPLOYEE_INSURANCE;
        var sgkUnemploymentEmployee = sgkBase * SGK_EMPLOYEE_UNEMPLOYMENT;
        var totalSgkEmployee = sgkInsuranceEmployee + sgkUnemploymentEmployee;

        // Gelir Vergisi Matrahı
        var taxBase = grossEarnings - totalSgkEmployee;

        // Asgari Ücret İstisnası (2024)
        decimal minWageExemption = 0;
        decimal adjustedTaxBase = taxBase;

        if (input.ApplyMinWageExemption)
        {
            var minWageTaxBase = MINIMUM_WAGE * (1 - SGK_EMPLOYEE_TOTAL);
            minWageExemption = Math.Min(minWageTaxBase, taxBase);
            adjustedTaxBase = Math.Max(0, taxBase - minWageExemption);
        }

        // Gelir Vergisi Hesaplama (Kümülatif)
        var (incomeTax, taxBracket, taxBracketRate) = CalculateIncomeTax(
            adjustedTaxBase,
            input.CumulativeGrossEarnings);

        // Damga Vergisi
        var stampTax = grossEarnings * STAMP_TAX_RATE;

        // Toplam Kesintiler
        var totalDeductions = totalSgkEmployee + incomeTax + stampTax;

        // Net Maaş
        var netSalary = grossEarnings - totalDeductions;

        // İşveren SGK Payları
        var sgkInsuranceEmployer = sgkBase * SGK_EMPLOYER_INSURANCE;
        var sgkUnemploymentEmployer = sgkBase * SGK_EMPLOYER_UNEMPLOYMENT;
        var totalSgkEmployer = sgkInsuranceEmployer + sgkUnemploymentEmployer;

        // Toplam İşveren Maliyeti
        var totalEmployerCost = grossEarnings + totalSgkEmployer;

        // Efektif Vergi Oranı
        var effectiveTaxRate = grossEarnings > 0 ? totalDeductions / grossEarnings : 0;

        return new PayrollCalculationResult
        {
            // Kazançlar
            GrossEarnings = grossEarnings,

            // SGK İşçi
            SgkInsuranceEmployee = Math.Round(sgkInsuranceEmployee, 2),
            SgkUnemploymentEmployee = Math.Round(sgkUnemploymentEmployee, 2),
            TotalSgkEmployee = Math.Round(totalSgkEmployee, 2),

            // Vergiler
            TaxBase = Math.Round(taxBase, 2),
            MinWageExemption = Math.Round(minWageExemption, 2),
            AdjustedTaxBase = Math.Round(adjustedTaxBase, 2),
            IncomeTax = Math.Round(incomeTax, 2),
            StampTax = Math.Round(stampTax, 2),
            TaxBracket = taxBracket,
            TaxBracketRate = taxBracketRate,

            // Kesintiler
            TotalDeductions = Math.Round(totalDeductions, 2),

            // Net
            NetSalary = Math.Round(netSalary, 2),

            // SGK İşveren
            SgkInsuranceEmployer = Math.Round(sgkInsuranceEmployer, 2),
            SgkUnemploymentEmployer = Math.Round(sgkUnemploymentEmployer, 2),
            TotalSgkEmployer = Math.Round(totalSgkEmployer, 2),

            // İşveren Maliyeti
            TotalEmployerCost = Math.Round(totalEmployerCost, 2),

            // SGK Tavan
            SgkCeilingApplied = sgkCeilingApplied,
            SgkBase = Math.Round(sgkBase, 2),

            // Efektif Oran
            EffectiveTaxRate = Math.Round(effectiveTaxRate, 4),

            // Kümülatif (güncelleme için)
            NewCumulativeGross = input.CumulativeGrossEarnings + grossEarnings
        };
    }

    private (decimal Tax, int Bracket, decimal Rate) CalculateIncomeTax(
        decimal adjustedTaxBase,
        decimal cumulativeGross)
    {
        if (adjustedTaxBase <= 0)
            return (0, 1, 0.15m);

        // Önceki dönem vergi matrahı
        var previousCumulativeTaxBase = cumulativeGross * (1 - SGK_EMPLOYEE_TOTAL);

        // Asgari ücret istisnası önceki dönemler için de uygulanmalı
        var monthCount = cumulativeGross > 0 ? (int)Math.Ceiling(cumulativeGross / MINIMUM_WAGE) : 0;
        var minWageTaxBase = MINIMUM_WAGE * (1 - SGK_EMPLOYEE_TOTAL);
        previousCumulativeTaxBase = Math.Max(0, previousCumulativeTaxBase - (minWageTaxBase * monthCount));

        // Yeni kümülatif vergi matrahı
        var newCumulativeTaxBase = previousCumulativeTaxBase + adjustedTaxBase;

        // Önceki dönem vergisi
        var previousTax = CalculateCumulativeTax(previousCumulativeTaxBase);

        // Yeni toplam vergi
        var newTax = CalculateCumulativeTax(newCumulativeTaxBase);

        // Bu dönem vergisi
        var currentTax = Math.Max(0, newTax - previousTax);

        // Vergi dilimi belirleme
        var (bracket, rate) = GetTaxBracket(newCumulativeTaxBase);

        return (currentTax, bracket, rate);
    }

    private decimal CalculateCumulativeTax(decimal cumulativeTaxBase)
    {
        if (cumulativeTaxBase <= 0) return 0;

        decimal totalTax = 0;
        decimal remainingBase = cumulativeTaxBase;
        decimal previousLimit = 0;

        foreach (var (limit, rate) in IncomeTaxBrackets)
        {
            if (remainingBase <= 0) break;

            var bracketAmount = Math.Min(remainingBase, limit - previousLimit);
            totalTax += bracketAmount * rate;
            remainingBase -= bracketAmount;
            previousLimit = limit;
        }

        return totalTax;
    }

    private (int Bracket, decimal Rate) GetTaxBracket(decimal cumulativeTaxBase)
    {
        decimal previousLimit = 0;
        for (int i = 0; i < IncomeTaxBrackets.Length; i++)
        {
            var (limit, rate) = IncomeTaxBrackets[i];
            if (cumulativeTaxBase <= limit)
            {
                return (i + 1, rate);
            }
            previousLimit = limit;
        }
        return (5, 0.40m);
    }

    public TurkishPayrollParameters GetParameters()
    {
        return new TurkishPayrollParameters
        {
            Year = 2024,
            MinimumWage = MINIMUM_WAGE,
            SgkCeiling = SGK_CEILING,
            SgkEmployeeInsurance = SGK_EMPLOYEE_INSURANCE,
            SgkEmployeeUnemployment = SGK_EMPLOYEE_UNEMPLOYMENT,
            SgkEmployerInsurance = SGK_EMPLOYER_INSURANCE,
            SgkEmployerUnemployment = SGK_EMPLOYER_UNEMPLOYMENT,
            StampTaxRate = STAMP_TAX_RATE,
            IncomeTaxBrackets = IncomeTaxBrackets.Select(b => new TaxBracketInfo
            {
                Limit = b.Limit == decimal.MaxValue ? 0 : b.Limit,
                Rate = b.Rate
            }).ToList()
        };
    }
}

public interface ITurkishPayrollCalculationService
{
    PayrollCalculationResult Calculate(PayrollCalculationInput input);
    TurkishPayrollParameters GetParameters();
}

public class PayrollCalculationInput
{
    public decimal BaseSalary { get; set; }
    public decimal OvertimePay { get; set; }
    public decimal Bonus { get; set; }
    public decimal Allowances { get; set; }
    public decimal CumulativeGrossEarnings { get; set; }
    public bool ApplyMinWageExemption { get; set; } = true;
}

public class PayrollCalculationResult
{
    // Kazançlar
    public decimal GrossEarnings { get; set; }

    // SGK İşçi
    public decimal SgkInsuranceEmployee { get; set; }
    public decimal SgkUnemploymentEmployee { get; set; }
    public decimal TotalSgkEmployee { get; set; }

    // Vergi
    public decimal TaxBase { get; set; }
    public decimal MinWageExemption { get; set; }
    public decimal AdjustedTaxBase { get; set; }
    public decimal IncomeTax { get; set; }
    public decimal StampTax { get; set; }
    public int TaxBracket { get; set; }
    public decimal TaxBracketRate { get; set; }

    // Kesintiler
    public decimal TotalDeductions { get; set; }

    // Net
    public decimal NetSalary { get; set; }

    // SGK İşveren
    public decimal SgkInsuranceEmployer { get; set; }
    public decimal SgkUnemploymentEmployer { get; set; }
    public decimal TotalSgkEmployer { get; set; }

    // İşveren Maliyeti
    public decimal TotalEmployerCost { get; set; }

    // SGK Tavan
    public bool SgkCeilingApplied { get; set; }
    public decimal SgkBase { get; set; }

    // Efektif Oran
    public decimal EffectiveTaxRate { get; set; }

    // Kümülatif
    public decimal NewCumulativeGross { get; set; }
}

public class TurkishPayrollParameters
{
    public int Year { get; set; }
    public decimal MinimumWage { get; set; }
    public decimal SgkCeiling { get; set; }
    public decimal SgkEmployeeInsurance { get; set; }
    public decimal SgkEmployeeUnemployment { get; set; }
    public decimal SgkEmployerInsurance { get; set; }
    public decimal SgkEmployerUnemployment { get; set; }
    public decimal StampTaxRate { get; set; }
    public List<TaxBracketInfo> IncomeTaxBrackets { get; set; } = new();
}

public class TaxBracketInfo
{
    public decimal Limit { get; set; }
    public decimal Rate { get; set; }
}
