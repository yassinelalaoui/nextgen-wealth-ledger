package ma.yassine.digitalbanking.dtos;

import lombok.*;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatResponse {
    private String answer;
    private List<String> sources;
    private String conversationId;
}
