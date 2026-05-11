package ma.yassine.digitalbanking.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.yassine.digitalbanking.entities.AppRole;
import ma.yassine.digitalbanking.entities.AppUser;
import ma.yassine.digitalbanking.entities.Client;
import ma.yassine.digitalbanking.repositories.AppRoleRepository;
import ma.yassine.digitalbanking.repositories.AppUserRepository;
import ma.yassine.digitalbanking.repositories.ClientRepository;
import ma.yassine.digitalbanking.services.WalletService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Configuration
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataInitializationConfig {

    private final AppUserRepository appUserRepository;
    private final AppRoleRepository appRoleRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final WalletService walletService;

    @Bean
    public CommandLineRunner initializeData() {
        return args -> {
            log.info("========== Initializing Development Data ==========");

            // Initialize roles
            if (appRoleRepository.count() == 0) {
                AppRole adminRole = new AppRole(null, "ROLE_ADMIN", "Administrator role");
                AppRole userRole = new AppRole(null, "ROLE_USER", "User role");
                AppRole managerRole = new AppRole(null, "ROLE_MANAGER", "Manager role");

                appRoleRepository.save(adminRole);
                appRoleRepository.save(userRole);
                appRoleRepository.save(managerRole);
                log.info("✓ Roles created");
            }

            // Initialize admin user
            if (appUserRepository.count() == 0) {
                AppRole adminRole = appRoleRepository.findByName("ROLE_ADMIN")
                        .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));
                
                AppUser adminUser = new AppUser();
                adminUser.setUsername("admin");
                adminUser.setEmail("admin@banking.local");
                adminUser.setPassword(passwordEncoder.encode("admin123"));
                adminUser.setEnabled(true);
                
                Set<AppRole> roles = new HashSet<>();
                roles.add(adminRole);
                adminUser.setRoles(roles);

                appUserRepository.save(adminUser);
                log.info("✓ Admin user created (username: admin, password: admin123)");
            }

            // Initialize sample clients
            if (clientRepository.count() == 0) {
                String[] names = {"Hassan Ahmed", "Imane Bennani", "Mohamed Saadi"};
                String[] emails = {"hassan@example.com", "imane@example.com", "mohamed@example.com"};

                for (int i = 0; i < names.length; i++) {
                    Client client = new Client();
                    client.setName(names[i]);
                    client.setEmail(emails[i]);
                    client.setCreatedBy("system");
                    
                    Client savedClient = clientRepository.save(client);
                    log.info("✓ Client created: {}", names[i]);

                    // Create one current account and one saving account for each client
                    try {
                        walletService.saveCurrentWallet(
                                new BigDecimal("10000"),
                                new BigDecimal("5000"),
                                savedClient.getId(),
                                "MAD"
                        );
                        log.info("  ✓ Current account created for {}", names[i]);

                        walletService.saveSavingWallet(
                                new BigDecimal("5000"),
                                new BigDecimal("2.5"),
                                savedClient.getId(),
                                "MAD"
                        );
                        log.info("  ✓ Saving account created for {}", names[i]);
                    } catch (Exception e) {
                        log.error("Error creating wallets for client: {}", names[i], e);
                    }
                }
            }

            log.info("========== Development Data Initialization Complete ==========");
        };
    }
}
