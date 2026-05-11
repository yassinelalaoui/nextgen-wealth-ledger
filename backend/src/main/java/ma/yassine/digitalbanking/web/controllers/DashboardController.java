package ma.yassine.digitalbanking.web.controllers;

import lombok.RequiredArgsConstructor;
import ma.yassine.digitalbanking.dtos.*;
import ma.yassine.digitalbanking.services.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class DashboardController {

    private final WalletService walletService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        DashboardStatsDTO stats = walletService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/monthly-ledgerEntries")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<MonthlyOperationStatsDTO>> getMonthlyOperations() {
        List<MonthlyOperationStatsDTO> stats = walletService.getMonthlyOperationStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/account-types")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<AccountTypeStatsDTO>> getAccountTypes() {
        List<AccountTypeStatsDTO> stats = walletService.getAccountTypeStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/account-statuses")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<AccountStatusStatsDTO>> getAccountStatuses() {
        List<AccountStatusStatsDTO> stats = walletService.getAccountStatusStats();
        return ResponseEntity.ok(stats);
    }
}
