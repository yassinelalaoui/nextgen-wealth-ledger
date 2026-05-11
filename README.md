# NexGen Wealth Ledger

Welcome to the **NexGen Wealth Ledger** repository! 

NexGen Wealth Ledger is a modern, high-performance wealth management platform built specifically for enterprise fintechs, investment firms, and digital asset custodians. We prioritize security, robust auditing, and a streamlined user experience to manage client portfolios, active wallets, and immutable ledger entries.

---

## 🌟 Vision & Architecture

The core philosophy behind NexGen Wealth Ledger is maintaining absolute consistency in transactional data. This is achieved via our robust **LedgerAction** mechanisms ensuring every credit and debit is systematically recorded. 

### Technology Stack
This platform leverages a cutting-edge 3-tier architecture:
- **Backend Infrastructure**: Java 21 powered by Spring Boot 3.2, ensuring extreme scalability, type safety, and rapid transaction processing.
- **Security & Identity**: Stateless authentication powered by JWT (JSON Web Tokens) seamlessly integrated with Spring Security.
- **Frontend Experience**: Angular 18 providing a fully responsive Single Page Application (SPA), styled with a bespoke "Emerald Dark Mode" utilizing the elegant *Outfit* typography.
- **AI Integration**: Features a sophisticated RAG (Retrieval-Augmented Generation) Chatbot utilizing OpenAI, allowing client relationship managers to instantly query ledger histories and portfolio statuses in natural language.

---

## 🚀 Key Features

1. **Client Portfolio Management**
   - Onboard, verify, and manage institutional or individual clients.
   - Aggregate view of a client's entire financial footprint across multiple asset classes.
   
2. **Dynamic Wallets**
   - **Active Wallets**: Designed for high-frequency liquidity operations.
   - **Stash Wallets**: High-yield secure vaults designed for long-term asset retention.

3. **Immutable Ledger Operations**
   - Execute secure `LedgerActions` (Credits, Debits, and Transfers).
   - Traceable, time-stamped ledger entries to guarantee audit compliance.

4. **Emerald Dark Mode Dashboard**
   - A stunning, low-fatigue visual interface.
   - Real-time data visualization of wallet distributions and ledger velocity using customized Chart.js integrations.

5. **AI Assistant**
   - Embedded intelligence for querying complex transactional datasets without needing SQL or manual filters.

---

## 🛠️ Getting Started

### Prerequisites
- **JDK 21** or higher
- **Node.js** (v18+) and **npm**
- **Maven** (for backend dependency resolution)
- **MySQL/H2** (configurable in properties)

### Launching the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure your environment variables (e.g., Database credentials, OpenAI API Key for the RAG bot).
3. Build and execute the Spring Boot application:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   *The REST API will be available at `http://localhost:8080`*

### Launching the Frontend

1. Navigate to the frontend workspace:
   ```bash
   cd frontend
   ```
2. Install necessary node modules:
   ```bash
   npm install
   ```
3. Boot the development server:
   ```bash
   npm start
   ```
   *The Emerald Dashboard is accessible at `http://localhost:4200`*

---

## 🛡️ Security Posture

NexGen Wealth Ledger implements rigorous API protection. All operational endpoints (`/api/wallets`, `/api/clients`, `/api/ledger-entries`) require a valid JWT Bearer token acquired via the `/auth/login` gateway. Role-Based Access Control (RBAC) ensures that only authorized administrators can mutate ledger states.

---

*NexGen Wealth Ledger — Engineered for the future of decentralized and institutional finance.*
