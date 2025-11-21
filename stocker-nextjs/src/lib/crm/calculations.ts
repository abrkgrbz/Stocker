import type { Customer, Lead, Deal } from '@/lib/api/services/crm.service';

// Calculate conversion rate
export function calculateConversionRate(converted: number, total: number): number {
  if (total === 0) return 0;
  return (converted / total) * 100;
}

// Calculate average customer value
export function calculateAverageCustomerValue(customers: Customer[]): number {
  if (customers.length === 0) return 0;
  const totalValue = customers.reduce((sum, customer) => sum + (customer.totalPurchases || 0), 0);
  return totalValue / customers.length;
}

// Calculate total revenue
export function calculateTotalRevenue(customers: Customer[]): number {
  return customers.reduce((sum, customer) => sum + (customer.totalPurchases || 0), 0);
}

// Calculate deal win rate
export function calculateWinRate(deals: Deal[]): number {
  if (deals.length === 0) return 0;
  const wonDeals = deals.filter(d => d.status === 'Won').length;
  return (wonDeals / deals.length) * 100;
}

// Calculate pipeline value
export function calculatePipelineValue(deals: Deal[]): number {
  return deals
    .filter(d => d.status === 'Open')
    .reduce((sum, deal) => sum + deal.amount, 0);
}

// Calculate weighted pipeline value (considering probability)
export function calculateWeightedPipelineValue(deals: Deal[]): number {
  return deals
    .filter(d => d.status === 'Open')
    .reduce((sum, deal) => sum + (deal.amount * (deal.probability / 100)), 0);
}

// Calculate lead qualification rate
export function calculateQualificationRate(leads: Lead[]): number {
  if (leads.length === 0) return 0;
  const qualifiedLeads = leads.filter(l => l.status === 'Qualified').length;
  return (qualifiedLeads / leads.length) * 100;
}

// Calculate dashboard metrics
export function calculateDashboardMetrics(data: {
  customers: Customer[];
  leads: Lead[];
  deals: Deal[];
}) {
  const { customers, leads, deals } = data;

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  const totalRevenue = calculateTotalRevenue(customers);
  const avgCustomerValue = calculateAverageCustomerValue(customers);

  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l => l.status === 'Qualified').length;
  const qualificationRate = calculateQualificationRate(leads);

  const openDeals = deals.filter(d => d.status === 'Open').length;
  const wonDeals = deals.filter(d => d.status === 'Won').length;
  const lostDeals = deals.filter(d => d.status === 'Lost').length;
  const winRate = calculateWinRate(deals);
  const pipelineValue = calculatePipelineValue(deals);
  const weightedPipelineValue = calculateWeightedPipelineValue(deals);

  // Top customers by revenue
  const topCustomers = [...customers]
    .sort((a, b) => (b.totalPurchases || 0) - (a.totalPurchases || 0))
    .slice(0, 5);

  // Upcoming deals (open deals sorted by expected close date)
  const upcomingDeals = [...deals]
    .filter(d => d.status === 'Open' && d.expectedCloseDate)
    .sort((a, b) => new Date(a.expectedCloseDate!).getTime() - new Date(b.expectedCloseDate!).getTime())
    .slice(0, 5);

  // Sales funnel data
  const funnel = {
    totalLeads,
    qualifiedLeads,
    openDeals,
    wonDeals,
  };

  return {
    // Customer metrics
    totalCustomers,
    activeCustomers,
    totalRevenue,
    avgCustomerValue,

    // Lead metrics
    totalLeads,
    qualifiedLeads,
    qualificationRate,

    // Deal metrics
    openDeals,
    wonDeals,
    lostDeals,
    winRate,
    pipelineValue,
    weightedPipelineValue,

    // Lists
    topCustomers,
    upcomingDeals,
    funnel,
  };
}
