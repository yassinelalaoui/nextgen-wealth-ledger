package ma.yassine.digitalbanking.web.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.yassine.digitalbanking.dtos.CreateClientRequest;
import ma.yassine.digitalbanking.dtos.ClientDTO;
import ma.yassine.digitalbanking.dtos.UpdateClientRequest;
import ma.yassine.digitalbanking.services.WalletService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ClientController {

    private final WalletService walletService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<List<ClientDTO>> listClients() {
        List<ClientDTO> clients = walletService.listClients();
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<Page<ClientDTO>> searchClients(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ClientDTO> clients = walletService.searchClients(keyword, page, size);
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<ClientDTO> getClient(@PathVariable Long id) {
        ClientDTO client = walletService.getClient(id);
        return ResponseEntity.ok(client);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ClientDTO> createClient(@Valid @RequestBody CreateClientRequest request) {
        ClientDTO client = walletService.saveClient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(client);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ClientDTO> updateClient(
            @PathVariable Long id,
            @Valid @RequestBody UpdateClientRequest request) {
        ClientDTO client = walletService.updateClient(id, request);
        return ResponseEntity.ok(client);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        walletService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/wallets")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<?> getClientAccounts(@PathVariable Long id) {
        return ResponseEntity.ok(walletService.getClientAccounts(id));
    }
}
