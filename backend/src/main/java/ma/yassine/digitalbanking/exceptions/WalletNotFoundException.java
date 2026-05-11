package ma.yassine.digitalbanking.exceptions;

public class WalletNotFoundException extends ResourceNotFoundException {
    public WalletNotFoundException(String walletId) {
        super("Bank account not found with id: " + walletId);
    }
}
