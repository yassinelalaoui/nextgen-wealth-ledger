package ma.yassine.digitalbanking.repositories;

import ma.yassine.digitalbanking.entities.LedgerEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {

    List<LedgerEntry> findByWalletId(String walletId);

    Page<LedgerEntry> findByWalletId(String walletId, Pageable pageable);

    @Query("SELECT SUM(ao.amount) FROM LedgerEntry ao WHERE ao.wallet.id = :walletId AND ao.type = 'CREDIT'")
    BigDecimal sumCreditByAccountId(@Param("walletId") String walletId);

    @Query("SELECT SUM(ao.amount) FROM LedgerEntry ao WHERE ao.wallet.id = :walletId AND ao.type = 'DEBIT'")
    BigDecimal sumDebitByAccountId(@Param("walletId") String walletId);

    @Query("SELECT COUNT(ao) FROM LedgerEntry ao WHERE ao.wallet.client.id = :clientId")
    long countByClientId(@Param("clientId") Long clientId);

    @Query("SELECT SUM(ao.amount) FROM LedgerEntry ao WHERE ao.type = 'CREDIT'")
    BigDecimal totalCreditAmount();

    @Query("SELECT SUM(ao.amount) FROM LedgerEntry ao WHERE ao.type = 'DEBIT'")
    BigDecimal totalDebitAmount();

    @Query("SELECT COUNT(ao) FROM LedgerEntry ao")
    long totalOperations();

    @Query("SELECT ao FROM LedgerEntry ao WHERE ao.operationDate >= :startDate AND ao.operationDate <= :endDate ORDER BY ao.operationDate DESC")
    List<LedgerEntry> findOperationsBetweenDates(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
}
