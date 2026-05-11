export type LedgerAction = 'DEBIT' | 'CREDIT';

export interface LedgerEntryDTO {
  id: number;
  operationDate: string;
  amount: number;
  type: LedgerAction;
  description: string;
}

export interface AccountHistoryDTO {
  walletId: string;
  balance: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  ledgerEntryDTOS: LedgerEntryDTO[];
}
