package ma.yassine.digitalbanking.repositories;

import ma.yassine.digitalbanking.entities.StashWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StashWalletRepository extends JpaRepository<StashWallet, String> {
}
