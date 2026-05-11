package ma.yassine.digitalbanking.entities;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@DiscriminatorValue("CA")
@Data
@EqualsAndHashCode(callSuper=false)
@AllArgsConstructor
@NoArgsConstructor
public class ActiveWallet extends Wallet {

    @Column(name = "over_draft", nullable = false, precision = 19, scale = 2)
    private BigDecimal overDraft;
}
