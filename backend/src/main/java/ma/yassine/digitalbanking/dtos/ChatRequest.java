package ma.yassine.digitalbanking.dtos;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatRequest {
    private String message;
    private String conversationId;
}
