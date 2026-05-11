import { ClientDTO } from './client.model';

export type AccountStatus = 'CREATED' | 'ACTIVATED' | 'SUSPENDED';

export interface WalletDTO {
  type: string;
  id: string;
  balance: number;
  createdAt: string;
  status: AccountStatus;
  clientDTO: ClientDTO;
  currency: string;
}

export interface ActiveWalletDTO extends WalletDTO {
  overDraft: number;
}

export interface StashWalletDTO extends WalletDTO {
  interestRate: number;
}

export interface CreateActiveWalletRequest {
  initialBalance: number;
  overDraft: number;
  clientId: number;
  currency?: string;
}

export interface CreateStashWalletRequest {
  initialBalance: number;
  interestRate: number;
  clientId: number;
  currency?: string;
}

export interface DebitRequest {
  walletId: string;
  amount: number;
  description: string;
}

export interface CreditRequest {
  walletId: string;
  amount: number;
  description: string;
}

export interface TransferRequest {
  walletIdSource: string;
  walletIdDestination: string;
  amount: number;
  description: string;
}
