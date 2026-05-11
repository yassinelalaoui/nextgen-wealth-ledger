package ma.yassine.digitalbanking.dtos;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccountHistoryDTO {
    private String walletId;
    private BigDecimal balance;
    private int currentPage;
    private int totalPages;
    private int pageSize;
    private long totalElements;
    private List<LedgerEntryDTO> ledgerEntryDTOs;
}
