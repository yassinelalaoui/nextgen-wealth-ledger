package ma.yassine.digitalbanking.services;

import ma.yassine.digitalbanking.dtos.ChatRequest;
import ma.yassine.digitalbanking.dtos.ChatResponse;

public interface ChatbotService {

    ChatResponse chat(ChatRequest request);
    void ingestDocumentation(String documentation);
}
