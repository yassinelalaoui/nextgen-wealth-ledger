package ma.yassine.digitalbanking.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.yassine.digitalbanking.dtos.ChatRequest;
import ma.yassine.digitalbanking.dtos.ChatResponse;
import ma.yassine.digitalbanking.services.ChatbotService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotServiceImpl implements ChatbotService {

    @Value("${OPENAI_API_KEY:}")
    private String openaiApiKey;

    private final List<String> knowledgeBase = new ArrayList<>();
    private final Map<String, List<String>> conversationHistories = new HashMap<>();

    @Override
    public ChatResponse chat(ChatRequest request) {
        String conversationId = request.getConversationId() != null ? 
            request.getConversationId() : UUID.randomUUID().toString();

        // For now, provide a helpful response about the banking app
        String answer = generateAnswer(request.getMessage());
        List<String> sources = retrieveRelevantSources(request.getMessage());

        // Store conversation history
        conversationHistories.computeIfAbsent(conversationId, k -> new ArrayList<>())
                .add("User: " + request.getMessage());
        conversationHistories.get(conversationId)
                .add("Bot: " + answer);

        log.info("Chat interaction - Conversation: {}, Message: {}", conversationId, request.getMessage());

        return ChatResponse.builder()
                .answer(answer)
                .sources(sources)
                .conversationId(conversationId)
                .build();
    }

    @Override
    public void ingestDocumentation(String documentation) {
        if (documentation != null && !documentation.isEmpty()) {
            // Split documentation into chunks
            String[] chunks = documentation.split("\n\n");
            for (String chunk : chunks) {
                if (!chunk.isEmpty()) {
                    knowledgeBase.add(chunk.trim());
                }
            }
            log.info("Documentation ingested. Total knowledge base chunks: {}", knowledgeBase.size());
        }
    }

    private String generateAnswer(String message) {
        // Fallback answers for common questions
        String lowerMessage = message.toLowerCase();

        if (lowerMessage.contains("client") && (lowerMessage.contains("create") || lowerMessage.contains("add"))) {
            return "To create a new client, use the Clients section and click 'Add Client'. " +
                    "Fill in the client name and email address, then click Submit. " +
                    "Once created, you can add bank wallets for this client.";
        }

        if (lowerMessage.contains("account") && (lowerMessage.contains("create") || lowerMessage.contains("add"))) {
            return "To create a bank account, navigate to Accounts section and click 'Create Account'. " +
                    "Choose between Current Account (with overdraft) or Saving Account (with interest rate). " +
                    "Select a client and set the initial balance and other parameters.";
        }

        if (lowerMessage.contains("debit") || lowerMessage.contains("withdraw")) {
            return "Debit ledgerEntries reduce the account balance. Go to Account Details, click 'Debit', " +
                    "enter the amount and description. For Saving Accounts, the balance cannot go negative. " +
                    "For Current Accounts, you can use the overdraft facility up to the limit.";
        }

        if (lowerMessage.contains("credit") || lowerMessage.contains("deposit")) {
            return "Credit ledgerEntries increase the account balance. Go to Account Details, click 'Credit', " +
                    "enter the amount and description. There are no restrictions on credit ledgerEntries.";
        }

        if (lowerMessage.contains("transfer")) {
            return "To transfer money between wallets, go to Account Details and click 'Transfer'. " +
                    "Select the source account and destination account, enter the amount, and confirm. " +
                    "Both wallets must be activated for transfer to work.";
        }

        if (lowerMessage.contains("dashboard")) {
            return "The Dashboard shows real-time statistics including total clients, wallets, balance, " +
                    "and transaction summaries. Charts display account types and statuses distribution.";
        }

        if (lowerMessage.contains("password") || lowerMessage.contains("change")) {
            return "To change your password, go to Account Settings and click 'Change Password'. " +
                    "Enter your old password and new password (minimum 6 characters). Click 'Update' to confirm.";
        }

        if (lowerMessage.contains("role") || lowerMessage.contains("permission")) {
            return "The system has three roles: ADMIN (full access), MANAGER (manage wallets and ledgerEntries), " +
                    "and USER (view and manage personal ledgerEntries). Contact an admin to change your role.";
        }

        // Default response
        return "I'm a Banking Assistant. I can help you with questions about: " +
                "creating clients, managing wallets, performing transactions (debit/credit/transfer), " +
                "viewing dashboard, and account ledgerEntries. Ask me anything about the Digital Banking application!";
    }

    private List<String> retrieveRelevantSources(String message) {
        List<String> sources = new ArrayList<>();
        
        // Simple keyword matching to return relevant sources
        String lowerMessage = message.toLowerCase();
        
        if (lowerMessage.contains("documentation")) {
            sources.add("Application Documentation");
        }
        if (lowerMessage.contains("faq") || lowerMessage.contains("frequently")) {
            sources.add("FAQ Section");
        }
        if (lowerMessage.contains("banking") || lowerMessage.contains("account")) {
            sources.add("Banking Guide");
        }
        
        if (sources.isEmpty()) {
            sources.add("General Knowledge Base");
        }
        
        return sources;
    }
}
