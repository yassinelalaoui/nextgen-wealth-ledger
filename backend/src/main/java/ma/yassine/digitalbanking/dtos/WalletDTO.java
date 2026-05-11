package ma.yassine.digitalbanking.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = ActiveWalletDTO.class, name = "CURRENT"),
    @JsonSubTypes.Type(value = StashWalletDTO.class, name = "SAVING")
})
public class WalletDTO {
    private String id;
    private String type;
    private BigDecimal balance;
    private String status;
    private String currency;
    private Instant createdAt;
    private String createdBy;
    private ClientDTO client;
}
