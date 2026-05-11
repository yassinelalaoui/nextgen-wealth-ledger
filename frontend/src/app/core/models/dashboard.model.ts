export interface DashboardStatsDTO {
  totalClients: number;
  totalAccounts: number;
  totalActiveWallets: number;
  totalStashWallets: number;
  totalBalance: number;
  totalCreditAmount: number;
  totalDebitAmount: number;
  ledgerEntriesCount: number;
}

export interface MonthlyOperationStatsDTO {
  month: string;
  totalCredit: number;
  totalDebit: number;
  operationCount: number;
}

export interface AccountTypeStatsDTO {
  type: string;
  count: number;
}

export interface AccountStatusStatsDTO {
  status: string;
  count: number;
}
