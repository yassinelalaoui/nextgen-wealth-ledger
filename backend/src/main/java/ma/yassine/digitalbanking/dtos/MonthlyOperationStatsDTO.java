package ma.yassine.digitalbanking.dtos;

import lombok.*;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MonthlyOperationStatsDTO {
    private String month;
    private BigDecimal totalCredit;
    private BigDecimal totalDebit;
    private long operationCount;
}
