package ma.yassine.digitalbanking.dtos;

import lombok.*;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper=false)
public class ActiveWalletDTO extends WalletDTO {
    private BigDecimal overDraft;
}
