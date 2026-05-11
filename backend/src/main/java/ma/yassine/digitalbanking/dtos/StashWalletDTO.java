package ma.yassine.digitalbanking.dtos;

import lombok.*;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper=false)
public class StashWalletDTO extends WalletDTO {
    private BigDecimal interestRate;
}
