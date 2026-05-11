package ma.yassine.digitalbanking.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.yassine.digitalbanking.dtos.*;
import ma.yassine.digitalbanking.entities.*;
import ma.yassine.digitalbanking.enums.AccountStatus;
import ma.yassine.digitalbanking.enums.LedgerAction;
import ma.yassine.digitalbanking.exceptions.*;
import ma.yassine.digitalbanking.repositories.*;
import ma.yassine.digitalbanking.services.WalletService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class WalletServiceImpl implements WalletService {

    private final ClientRepository clientRepository;
    private final WalletRepository walletRepository;
    private final ActiveWalletRepository activeWalletRepository;
    private final StashWalletRepository stashWalletRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    // ==================== Client Operations ====================

    @Override
    public ClientDTO saveClient(CreateClientRequest request) {
        if (clientRepository.existsByEmail(request.getEmail())) {
            throw new InvalidOperationException("Email already exists: " + request.getEmail());
        }

        Client client = new Client();
        client.setName(request.getName());
        client.setEmail(request.getEmail());
        client.setCreatedBy(getCurrentUsername());

        Client saved = clientRepository.save(client);
        log.info("Client created: {}", saved.getId());
        return mapClientToDTO(saved);
    }

    @Override
    public ClientDTO updateClient(Long clientId, UpdateClientRequest request) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ClientNotFoundException(clientId));

        // Check if new email is already used by another client
        if (!client.getEmail().equals(request.getEmail()) && 
            clientRepository.existsByEmail(request.getEmail())) {
            throw new InvalidOperationException("Email already exists: " + request.getEmail());
        }

        client.setName(request.getName());
        client.setEmail(request.getEmail());
        client.setUpdatedBy(getCurrentUsername());

        Client updated = clientRepository.save(client);
        log.info("Client updated: {}", clientId);
        return mapClientToDTO(updated);
    }

    @Override
    public void deleteClient(Long clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ClientNotFoundException(clientId));

        if (!client.getWallets().isEmpty()) {
            throw new InvalidOperationException("Cannot delete client with active wallets");
        }

        clientRepository.delete(client);
        log.info("Client deleted: {}", clientId);
    }

    @Override
    @Transactional(readOnly = true)
    public ClientDTO getClient(Long clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ClientNotFoundException(clientId));
        return mapClientToDTO(client);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientDTO> listClients() {
        return clientRepository.findAll().stream()
                .map(this::mapClientToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ClientDTO> searchClients(String keyword, int page, int size) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        Page<Client> clients = clientRepository.searchByNameOrEmail(keyword, pageable);
        return clients.map(this::mapClientToDTO);
    }

    // ==================== Account Operations ====================

    @Override
    public ActiveWalletDTO saveCurrentWallet(BigDecimal initialBalance, BigDecimal overDraft, 
                                                         Long clientId, String currency) {
        if (initialBalance == null || initialBalance.signum() < 0) {
            throw new InvalidOperationException("Initial balance must be positive or zero");
        }
        if (overDraft == null || overDraft.signum() < 0) {
            throw new InvalidOperationException("Overdraft must be positive or zero");
        }

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ClientNotFoundException(clientId));

        ActiveWallet account = new ActiveWallet();
        account.setBalance(initialBalance != null ? initialBalance : BigDecimal.ZERO);
        account.setOverDraft(overDraft);
        account.setClient(client);
        account.setStatus(AccountStatus.CREATED);
        account.setCurrency(currency != null ? currency : "MAD");
        account.setCreatedBy(getCurrentUsername());

        ActiveWallet saved = activeWalletRepository.save(account);
        log.info("Current account created: {}", saved.getId());
        return mapActiveWalletToDTO(saved);
    }

    @Override
    public StashWalletDTO saveSavingWallet(BigDecimal initialBalance, BigDecimal interestRate, 
                                                       Long clientId, String currency) {
        if (initialBalance == null || initialBalance.signum() < 0) {
            throw new InvalidOperationException("Initial balance must be positive or zero");
        }
        if (interestRate == null || interestRate.signum() < 0) {
            throw new InvalidOperationException("Interest rate must be positive or zero");
        }

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ClientNotFoundException(clientId));

        StashWallet account = new StashWallet();
        account.setBalance(initialBalance != null ? initialBalance : BigDecimal.ZERO);
        account.setInterestRate(interestRate);
        account.setClient(client);
        account.setStatus(AccountStatus.CREATED);
        account.setCurrency(currency != null ? currency : "MAD");
        account.setCreatedBy(getCurrentUsername());

        StashWallet saved = stashWalletRepository.save(account);
        log.info("Saving account created: {}", saved.getId());
        return mapStashWalletToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public WalletDTO getWallet(String walletId) {
        Wallet account = walletRepository.findById(walletId)
            .orElseThrow(() -> new WalletNotFoundException(walletId));
        
        if (account instanceof ActiveWallet) {
            return mapActiveWalletToDTO((ActiveWallet) account);
        } else if (account instanceof StashWallet) {
            return mapStashWalletToDTO((StashWallet) account);
        }
        return mapWalletToDTO(account);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WalletDTO> walletList() {
        return walletRepository.findAll().stream()
                .map(account -> {
                    if (account instanceof ActiveWallet) {
                        return mapActiveWalletToDTO((ActiveWallet) account);
                    } else if (account instanceof StashWallet) {
                        return mapStashWalletToDTO((StashWallet) account);
                    }
                    return mapWalletToDTO(account);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WalletDTO> searchAccounts(String keyword, int page, int size) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        Page<Wallet> wallets = walletRepository.search(keyword, pageable);
        return wallets.map(account -> {
            if (account instanceof ActiveWallet) {
                return mapActiveWalletToDTO((ActiveWallet) account);
            } else if (account instanceof StashWallet) {
                return mapStashWalletToDTO((StashWallet) account);
            }
            return mapWalletToDTO(account);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<WalletDTO> getClientAccounts(Long clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ClientNotFoundException(clientId));
        
        return client.getWallets().stream()
                .map(account -> {
                    if (account instanceof ActiveWallet) {
                        return mapActiveWalletToDTO((ActiveWallet) account);
                    } else if (account instanceof StashWallet) {
                        return mapStashWalletToDTO((StashWallet) account);
                    }
                    return mapWalletToDTO(account);
                })
                .collect(Collectors.toList());
    }

    // ==================== Transaction Operations ====================

    @Override
    public void debit(String walletId, BigDecimal amount, String description) {
        if (amount == null || amount.signum() <= 0) {
            throw new InvalidOperationException("Debit amount must be positive");
        }

        Wallet account = walletRepository.findById(walletId)
                .orElseThrow(() -> new WalletNotFoundException(walletId));

        // Check if account is active
        if (!account.getStatus().equals(AccountStatus.ACTIVATED)) {
            throw new InvalidOperationException("Account is not activated");
        }

        // Check balance
        if (account instanceof StashWallet) {
            if (account.getBalance().subtract(amount).signum() < 0) {
                throw new BalanceNotSufficientException("Insufficient balance for saving account");
            }
        } else if (account instanceof ActiveWallet) {
            ActiveWallet activeWallet = (ActiveWallet) account;
            BigDecimal allowedBalance = activeWallet.getBalance().add(activeWallet.getOverDraft());
            if (allowedBalance.subtract(amount).signum() < 0) {
                throw new BalanceNotSufficientException("Insufficient balance including overdraft");
            }
        }

        // Perform debit
        account.setBalance(account.getBalance().subtract(amount));
        account.setUpdatedBy(getCurrentUsername());
        walletRepository.save(account);

        // Record operation
        LedgerEntry operation = new LedgerEntry();
        operation.setAmount(amount);
        operation.setType(LedgerAction.DEBIT);
        operation.setDescription(description);
        operation.setWallet(account);
        operation.setPerformedBy(getCurrentUsername());
        ledgerEntryRepository.save(operation);

        log.info("Debit operation: account={}, amount={}", walletId, amount);
    }

    @Override
    public void credit(String walletId, BigDecimal amount, String description) {
        if (amount == null || amount.signum() <= 0) {
            throw new InvalidOperationException("Credit amount must be positive");
        }

        Wallet account = walletRepository.findById(walletId)
                .orElseThrow(() -> new WalletNotFoundException(walletId));

        // Check if account is active
        if (!account.getStatus().equals(AccountStatus.ACTIVATED)) {
            throw new InvalidOperationException("Account is not activated");
        }

        // Perform credit
        account.setBalance(account.getBalance().add(amount));
        account.setUpdatedBy(getCurrentUsername());
        walletRepository.save(account);

        // Record operation
        LedgerEntry operation = new LedgerEntry();
        operation.setAmount(amount);
        operation.setType(LedgerAction.CREDIT);
        operation.setDescription(description);
        operation.setWallet(account);
        operation.setPerformedBy(getCurrentUsername());
        ledgerEntryRepository.save(operation);

        log.info("Credit operation: account={}, amount={}", walletId, amount);
    }

    @Override
    public void transfer(String walletIdSource, String walletIdDestination, BigDecimal amount, String description) {
        if (amount == null || amount.signum() <= 0) {
            throw new InvalidOperationException("Transfer amount must be positive");
        }

        // Validate wallets exist
        Wallet sourceAccount = walletRepository.findById(walletIdSource)
                .orElseThrow(() -> new WalletNotFoundException(walletIdSource));
        Wallet destinationAccount = walletRepository.findById(walletIdDestination)
                .orElseThrow(() -> new WalletNotFoundException(walletIdDestination));

        // Check if both wallets are activated
        if (!sourceAccount.getStatus().equals(AccountStatus.ACTIVATED) ||
            !destinationAccount.getStatus().equals(AccountStatus.ACTIVATED)) {
            throw new InvalidOperationException("Both wallets must be activated for transfer");
        }

        // Check balance
        if (sourceAccount instanceof StashWallet) {
            if (sourceAccount.getBalance().subtract(amount).signum() < 0) {
                throw new BalanceNotSufficientException("Insufficient balance in source saving account");
            }
        } else if (sourceAccount instanceof ActiveWallet) {
            ActiveWallet activeWallet = (ActiveWallet) sourceAccount;
            BigDecimal allowedBalance = activeWallet.getBalance().add(activeWallet.getOverDraft());
            if (allowedBalance.subtract(amount).signum() < 0) {
                throw new BalanceNotSufficientException("Insufficient balance in source account including overdraft");
            }
        }

        // Perform transfer
        sourceAccount.setBalance(sourceAccount.getBalance().subtract(amount));
        destinationAccount.setBalance(destinationAccount.getBalance().add(amount));
        sourceAccount.setUpdatedBy(getCurrentUsername());
        destinationAccount.setUpdatedBy(getCurrentUsername());

        walletRepository.save(sourceAccount);
        walletRepository.save(destinationAccount);

        // Record ledgerEntries
        LedgerEntry debitOp = new LedgerEntry();
        debitOp.setAmount(amount);
        debitOp.setType(LedgerAction.DEBIT);
        debitOp.setDescription("Transfer to " + walletIdDestination + (description != null ? " - " + description : ""));
        debitOp.setWallet(sourceAccount);
        debitOp.setPerformedBy(getCurrentUsername());
        ledgerEntryRepository.save(debitOp);

        LedgerEntry creditOp = new LedgerEntry();
        creditOp.setAmount(amount);
        creditOp.setType(LedgerAction.CREDIT);
        creditOp.setDescription("Transfer from " + walletIdSource + (description != null ? " - " + description : ""));
        creditOp.setWallet(destinationAccount);
        creditOp.setPerformedBy(getCurrentUsername());
        ledgerEntryRepository.save(creditOp);

        log.info("Transfer operation: from={}, to={}, amount={}", walletIdSource, walletIdDestination, amount);
    }

    // ==================== History Operations ====================

    @Override
    @Transactional(readOnly = true)
    public List<LedgerEntryDTO> accountHistory(String walletId) {
        walletRepository.findById(walletId)
                .orElseThrow(() -> new WalletNotFoundException(walletId));

        return ledgerEntryRepository.findByWalletId(walletId).stream()
                .map(this::mapOperationToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AccountHistoryDTO getAccountHistory(String walletId, int page, int size) {
        Wallet account = walletRepository.findById(walletId)
                .orElseThrow(() -> new WalletNotFoundException(walletId));

        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        Page<LedgerEntry> ledgerEntries = ledgerEntryRepository.findByWalletId(walletId, pageable);

        return AccountHistoryDTO.builder()
                .walletId(walletId)
                .balance(account.getBalance())
                .currentPage(page)
                .totalPages(ledgerEntries.getTotalPages())
                .pageSize(size)
                .totalElements(ledgerEntries.getTotalElements())
                .ledgerEntryDTOs(ledgerEntries.getContent().stream()
                        .map(this::mapOperationToDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    // ==================== Dashboard Operations ====================

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        long totalClients = clientRepository.count();
        long totalAccounts = walletRepository.count();
        
        BigDecimal totalBalance = walletRepository.findAll().stream()
                .map(Wallet::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCreditAmount = ledgerEntryRepository.totalCreditAmount();
        BigDecimal totalDebitAmount = ledgerEntryRepository.totalDebitAmount();
        long ledgerEntriesCount = ledgerEntryRepository.totalOperations();

        return DashboardStatsDTO.builder()
                .totalClients(totalClients)
                .totalAccounts(totalAccounts)
                .totalActiveWallets(walletRepository.countActiveWallets())
                .totalStashWallets(walletRepository.countStashWallets())
                .totalBalance(totalBalance)
                .totalCreditAmount(totalCreditAmount != null ? totalCreditAmount : BigDecimal.ZERO)
                .totalDebitAmount(totalDebitAmount != null ? totalDebitAmount : BigDecimal.ZERO)
                .ledgerEntriesCount(ledgerEntriesCount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MonthlyOperationStatsDTO> getMonthlyOperationStats() {
        // Simplified: return empty list (can be enhanced with actual monthly aggregation)
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountTypeStatsDTO> getAccountTypeStats() {
        return List.of(
            AccountTypeStatsDTO.builder().type("CURRENT").count(walletRepository.countActiveWallets()).build(),
            AccountTypeStatsDTO.builder().type("SAVING").count(walletRepository.countStashWallets()).build()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountStatusStatsDTO> getAccountStatusStats() {
        return walletRepository.findAll().stream()
                .collect(Collectors.groupingBy(ba -> ba.getStatus().toString(), Collectors.counting()))
                .entrySet().stream()
                .map(e -> AccountStatusStatsDTO.builder().status(e.getKey()).count(e.getValue()).build())
                .collect(Collectors.toList());
    }

    // ==================== Mapping Methods ====================

    private ClientDTO mapClientToDTO(Client client) {
        return ClientDTO.builder()
                .id(client.getId())
                .name(client.getName())
                .email(client.getEmail())
                .createdBy(client.getCreatedBy())
                .createdAt(client.getCreatedAt())
                .build();
    }

    private WalletDTO mapWalletToDTO(Wallet account) {
        return WalletDTO.builder()
                .id(account.getId())
                .type(account.getClass().getSimpleName())
                .balance(account.getBalance())
                .status(account.getStatus().toString())
                .currency(account.getCurrency())
                .createdAt(account.getCreatedAt())
                .createdBy(account.getCreatedBy())
                .client(mapClientToDTO(account.getClient()))
                .build();
    }

    private ActiveWalletDTO mapActiveWalletToDTO(ActiveWallet account) {
        ActiveWalletDTO dto = new ActiveWalletDTO();
        dto.setId(account.getId());
        dto.setType("CURRENT");
        dto.setBalance(account.getBalance());
        dto.setStatus(account.getStatus().toString());
        dto.setCurrency(account.getCurrency());
        dto.setCreatedAt(account.getCreatedAt());
        dto.setCreatedBy(account.getCreatedBy());
        dto.setClient(mapClientToDTO(account.getClient()));
        dto.setOverDraft(account.getOverDraft());
        return dto;
    }

    private StashWalletDTO mapStashWalletToDTO(StashWallet account) {
        StashWalletDTO dto = new StashWalletDTO();
        dto.setId(account.getId());
        dto.setType("SAVING");
        dto.setBalance(account.getBalance());
        dto.setStatus(account.getStatus().toString());
        dto.setCurrency(account.getCurrency());
        dto.setCreatedAt(account.getCreatedAt());
        dto.setCreatedBy(account.getCreatedBy());
        dto.setClient(mapClientToDTO(account.getClient()));
        dto.setInterestRate(account.getInterestRate());
        return dto;
    }

    private LedgerEntryDTO mapOperationToDTO(LedgerEntry operation) {
        return LedgerEntryDTO.builder()
                .id(operation.getId())
                .operationDate(operation.getOperationDate())
                .amount(operation.getAmount())
                .type(operation.getType().toString())
                .description(operation.getDescription())
                .performedBy(operation.getPerformedBy())
                .build();
    }

    private String getCurrentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "SYSTEM";
    }
}
