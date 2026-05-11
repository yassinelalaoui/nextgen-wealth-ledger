package ma.yassine.digitalbanking.dtos;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccountTypeStatsDTO {
    private String type;
    private long count;
}
