package ma.yassine.digitalbanking.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateActiveWalletRequest {
    
    @NotNull(message = "Client ID is required")
    private Long clientId;
    
    @NotNull(message = "Initial balance is required")
    @PositiveOrZero(message = "Initial balance must be positive or zero")
    private BigDecimal initialBalance;
    
    @NotNull(message = "Overdraft is required")
    @PositiveOrZero(message = "Overdraft must be positive or zero")
    private BigDecimal overDraft;
    
    @Builder.Default
    private String currency = "MAD";
}
