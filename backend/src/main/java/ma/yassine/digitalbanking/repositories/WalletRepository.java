package ma.yassine.digitalbanking.repositories;

import ma.yassine.digitalbanking.entities.Wallet;
import ma.yassine.digitalbanking.enums.AccountStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, String> {

    List<Wallet> findByClientId(Long clientId);

    List<Wallet> findByStatus(AccountStatus status);

    @Query("SELECT ba FROM Wallet ba WHERE ba.client.id = :clientId")
    List<Wallet> findAccountsByClientId(@Param("clientId") Long clientId);

    @Query("SELECT ba FROM Wallet ba WHERE LOWER(ba.id) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(ba.client.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Wallet> search(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT COUNT(ba) FROM ActiveWallet ba")
    long countActiveWallets();

    @Query("SELECT COUNT(ba) FROM StashWallet ba")
    long countStashWallets();
}
