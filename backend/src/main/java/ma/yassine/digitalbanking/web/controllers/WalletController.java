package ma.yassine.digitalbanking.web.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.yassine.digitalbanking.dtos.*;
import ma.yassine.digitalbanking.services.WalletService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class WalletController {

    private final WalletService walletService;

    // Account retrieval endpoints
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<List<WalletDTO>> listAccounts() {
        List<WalletDTO> wallets = walletService.walletList();
        return ResponseEntity.ok(wallets);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<Page<WalletDTO>> searchAccounts(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<WalletDTO> wallets = walletService.searchAccounts(keyword, page, size);
        return ResponseEntity.ok(wallets);
    }

    @GetMapping("/{walletId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<WalletDTO> getAccount(@PathVariable String walletId) {
        WalletDTO account = walletService.getWallet(walletId);
        return ResponseEntity.ok(account);
    }

    // Account creation endpoints
    @PostMapping("/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ActiveWalletDTO> createActiveWallet(
            @Valid @RequestBody CreateActiveWalletRequest request) {
        ActiveWalletDTO account = walletService.saveCurrentWallet(
                request.getInitialBalance(),
                request.getOverDraft(),
                request.getClientId(),
                request.getCurrency()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }

    @PostMapping("/saving")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<StashWalletDTO> createStashWallet(
            @Valid @RequestBody CreateStashWalletRequest request) {
        StashWalletDTO account = walletService.saveSavingWallet(
                request.getInitialBalance(),
                request.getInterestRate(),
                request.getClientId(),
                request.getCurrency()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }

    // Operations endpoints
    @GetMapping("/{walletId}/ledgerEntries")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<List<LedgerEntryDTO>> getLedgerEntrys(@PathVariable String walletId) {
        List<LedgerEntryDTO> ledgerEntries = walletService.accountHistory(walletId);
        return ResponseEntity.ok(ledgerEntries);
    }

    @GetMapping("/{walletId}/pageOperations")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<AccountHistoryDTO> getLedgerEntrysPaginated(
            @PathVariable String walletId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        AccountHistoryDTO history = walletService.getAccountHistory(walletId, page, size);
        return ResponseEntity.ok(history);
    }

    // Transaction endpoints
    @PostMapping("/debit")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<Void> debit(@Valid @RequestBody DebitRequest request) {
        walletService.debit(request.getAccountId(), request.getAmount(), request.getDescription());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/credit")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<Void> credit(@Valid @RequestBody CreditRequest request) {
        walletService.credit(request.getAccountId(), request.getAmount(), request.getDescription());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<Void> transfer(@Valid @RequestBody TransferRequest request) {
        walletService.transfer(
                request.getAccountIdSource(),
                request.getAccountIdDestination(),
                request.getAmount(),
                request.getDescription()
        );
        return ResponseEntity.noContent().build();
    }
}
