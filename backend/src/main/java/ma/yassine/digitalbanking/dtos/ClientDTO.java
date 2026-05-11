package ma.yassine.digitalbanking.dtos;

import lombok.*;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ClientDTO {
    private Long id;
    private String name;
    private String email;
    private String createdBy;
    private Instant createdAt;
}
