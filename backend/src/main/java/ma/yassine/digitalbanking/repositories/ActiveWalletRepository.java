package ma.yassine.digitalbanking.repositories;

import ma.yassine.digitalbanking.entities.ActiveWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActiveWalletRepository extends JpaRepository<ActiveWallet, String> {
}
