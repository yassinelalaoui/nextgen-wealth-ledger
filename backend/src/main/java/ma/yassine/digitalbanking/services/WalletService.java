package ma.yassine.digitalbanking.services;

import ma.yassine.digitalbanking.dtos.*;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

public interface WalletService {

    // Client ledgerEntries
    ClientDTO saveClient(CreateClientRequest request);
    ClientDTO updateClient(Long clientId, UpdateClientRequest request);
    void deleteClient(Long clientId);
    ClientDTO getClient(Long clientId);
    List<ClientDTO> listClients();
    Page<ClientDTO> searchClients(String keyword, int page, int size);

    // Account ledgerEntries
    ActiveWalletDTO saveCurrentWallet(BigDecimal initialBalance, BigDecimal overDraft, Long clientId, String currency);
    StashWalletDTO saveSavingWallet(BigDecimal initialBalance, BigDecimal interestRate, Long clientId, String currency);
    WalletDTO getWallet(String walletId);
    List<WalletDTO> walletList();
    Page<WalletDTO> searchAccounts(String keyword, int page, int size);
    List<WalletDTO> getClientAccounts(Long clientId);

    // Transaction ledgerEntries
    void debit(String walletId, BigDecimal amount, String description);
    void credit(String walletId, BigDecimal amount, String description);
    void transfer(String walletIdSource, String walletIdDestination, BigDecimal amount, String description);

    // History ledgerEntries
    List<LedgerEntryDTO> accountHistory(String walletId);
    AccountHistoryDTO getAccountHistory(String walletId, int page, int size);

    // Dashboard ledgerEntries
    DashboardStatsDTO getDashboardStats();
    List<MonthlyOperationStatsDTO> getMonthlyOperationStats();
    List<AccountTypeStatsDTO> getAccountTypeStats();
    List<AccountStatusStatsDTO> getAccountStatusStats();
}
