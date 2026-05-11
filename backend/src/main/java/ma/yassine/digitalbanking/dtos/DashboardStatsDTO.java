package ma.yassine.digitalbanking.dtos;

import lombok.*;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashboardStatsDTO {
    private long totalClients;
    private long totalAccounts;
    private long totalActiveWallets;
    private long totalStashWallets;
    private BigDecimal totalBalance;
    private BigDecimal totalCreditAmount;
    private BigDecimal totalDebitAmount;
    private long ledgerEntriesCount;
}
