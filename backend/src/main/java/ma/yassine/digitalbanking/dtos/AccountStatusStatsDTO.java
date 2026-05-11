package ma.yassine.digitalbanking.dtos;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccountStatusStatsDTO {
    private String status;
    private long count;
}
