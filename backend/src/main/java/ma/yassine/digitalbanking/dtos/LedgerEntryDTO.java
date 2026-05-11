package ma.yassine.digitalbanking.dtos;

import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LedgerEntryDTO {
    private Long id;
    private Instant operationDate;
    private BigDecimal amount;
    private String type;
    private String description;
    private String performedBy;
}
