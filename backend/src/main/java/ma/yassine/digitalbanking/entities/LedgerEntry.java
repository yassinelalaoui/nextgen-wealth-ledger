package ma.yassine.digitalbanking.entities;

import jakarta.persistence.*;
import lombok.*;
import ma.yassine.digitalbanking.enums.LedgerAction;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "account_ledgerEntries", indexes = {
    @Index(name = "idx_bank_wallet_id", columnList = "bank_wallet_id"),
    @Index(name = "idx_entry_date", columnList = "entry_date")
})
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString(exclude = "wallet")
public class LedgerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Instant operationDate;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LedgerAction type;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_wallet_id", nullable = false)
    private Wallet wallet;

    @Column(length = 100)
    private String performedBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        if (this.operationDate == null) {
            this.operationDate = Instant.now();
        }
    }
}
