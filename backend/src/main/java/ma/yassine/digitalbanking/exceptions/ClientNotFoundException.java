package ma.yassine.digitalbanking.exceptions;

public class ClientNotFoundException extends ResourceNotFoundException {
    public ClientNotFoundException(Long clientId) {
        super("Client not found with id: " + clientId);
    }

    public ClientNotFoundException(String message) {
        super(message);
    }
}
