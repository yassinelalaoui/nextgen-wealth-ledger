import os
import re

# Directory to refactor
target_dirs = [
    r"c:\Users\ASUS\OneDrive\Desktop\TP4\backend\src",
    r"c:\Users\ASUS\OneDrive\Desktop\TP4\frontend\src"
]

# Mapping of replacements (Order matters!)
replacements = {
    # Exact URL changes first
    "/api/customers": "/api/clients",
    "/api/accounts": "/api/wallets",
    "/api/operations": "/api/ledger-entries",

    # Java/TS classes and types
    "CurrentBankAccountDTO": "ActiveWalletDTO",
    "SavingBankAccountDTO": "StashWalletDTO",
    "CurrentAccount": "ActiveWallet",
    "SavingAccount": "StashWallet",
    "BankAccount": "Wallet",
    "AccountOperation": "LedgerEntry",
    "OperationType": "LedgerAction",
    "CustomerDTO": "ClientDTO",
    "Customer": "Client",

    # Variables (camelCase)
    "currentAccount": "activeWallet",
    "savingAccount": "stashWallet",
    "bankAccount": "wallet",
    "accountOperation": "ledgerEntry",
    "operationType": "ledgerAction",
    "customer": "client",
    "accountId": "walletId",
    "operationId": "entryId",
    "customers": "clients",
    "accounts": "wallets",
    "operations": "ledgerEntries",
    
    # DB / constants (SNAKE_CASE)
    "ACCOUNT_OPERATION": "LEDGER_ENTRY",
    "CURRENT_ACCOUNT": "ACTIVE_WALLET",
    "SAVING_ACCOUNT": "STASH_WALLET",
    "account_id": "wallet_id",
    "operation_date": "entry_date",
    "operation_type": "ledger_action",
    "bank_account": "wallet",
    
    # other lowercase
    "bank-account": "wallet",
    "account-operation": "ledger-entry",
}

def replace_in_string(content):
    for old, new in replacements.items():
        content = content.replace(old, new)
    return content

def refactor_files(directory):
    for root, dirs, files in os.walk(directory, topdown=False):
        # Rename files
        for file in files:
            if file.endswith('.class') or file.endswith('.jar'):
                continue
            
            old_path = os.path.join(root, file)
            
            # Read content and replace
            try:
                with open(old_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = replace_in_string(content)
                
                if content != new_content:
                    with open(old_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
            except Exception as e:
                pass # skip binary or unreadable files

            new_name = replace_in_string(file)
            if new_name != file:
                new_path = os.path.join(root, new_name)
                os.rename(old_path, new_path)
                
        # Rename directories
        for d in dirs:
            new_name = replace_in_string(d)
            if new_name != d:
                old_path = os.path.join(root, d)
                new_path = os.path.join(root, new_name)
                os.rename(old_path, new_path)

for d in target_dirs:
    if os.path.exists(d):
        refactor_files(d)

print("Refactoring complete.")
