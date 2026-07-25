# Food Waste Redistribution Platform - Foundation Setup

This is the production-ready project foundation for the **Food Waste Redistribution Platform**, designed to connect Food Donors, NGOs, Volunteers, and Admins to coordinate surplus food redistribution.

This codebase contains the complete architecture shell and configurations. No business models or API modules are implemented yet.

---

## 📂 Project Structure

```text
FoodWasteRedistribution/
├── client/                      # React Frontend Application
│   ├── src/
│   │   ├── assets/              # Static media assets (e.g. logos)
│   │   ├── components/          # Reusable UI components
│   │   │   ├── cards/
│   │   │   ├── common/
│   │   │   ├── forms/
│   │   │   ├── layout/          # App layout shell (Header, Sidebar, Footer)
│   │   │   ├── tables/
│   │   │   └── ui/
│   │   ├── pages/               # Page views with layout integration
│   │   │   ├── Dashboard/
│   │   │   ├── Home/
│   │   │   ├── Login/
│   │   │   ├── NotFound/
│   │   │   └── Register/
│   │   ├── api/                 # Axios configuration (interceptors, error handler)
│   │   ├── constants/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/                 # Tailwind class merging cn() helper
│   │   ├── providers/           # TanStack Query Client provider wrapper
│   │   ├── routes/              # Routing configurations (Lazy loaded routes, ProtectedRoute wrapper)
│   │   ├── services/            # Base API service instance
│   │   ├── styles/              # Global css imports and styling variables
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.jsx              # Routing and Provider bootstrap
│   │   └── main.jsx             # React entrypoint
│   ├── .env                     # Client environment configuration
│   ├── .env.example             # Client environment template
│   ├── .eslintrc.json           # Frontend linting rules
│   ├── index.html               # Main HTML wrapper
│   ├── package.json             # Frontend package definitions
│   ├── postcss.config.js        # PostCSS processing configuration
│   ├── tailwind.config.js       # Tailwind CSS variables and theme properties
│   └── vite.config.js           # Vite development server and path aliases configuration
│
├── server/                      # Node.js Express Backend API
│   ├── prisma/
│   │   └── schema.prisma        # Prisma ORM configuration schema for MySQL
│   ├── src/
│   │   ├── config/              # Centralized application configs (Env, DB, JWT, Cloudinary)
│   │   ├── controllers/
│   │   ├── errors/              # Custom Operational Error classes (ApiError)
│   │   ├── helpers/             # Response, pagination, string utilities
│   │   ├── middlewares/         # Authorization, role checking, error, not found, upload stubs
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── uploads/             # Temp location for uploads
│   │   ├── utils/               # Constants, regex patterns, http status codes, winston logger
│   │   ├── validators/          # Input schema request validators
│   │   ├── app.js               # Express application middleware registration
│   │   └── server.js            # Node startup script and process handler
│   ├── logs/                    # Logging output directory (error.log, combined.log)
│   ├── uploads/                 # Local directory for disk uploads
│   ├── .env                     # Server environment settings
│   ├── .env.example             # Server environment template
│   ├── .eslintrc.json           # Backend linting rules
│   └── package.json             # Backend package definitions
│
├── .editorconfig                # Universal IDE file formatting settings
├── .gitignore                   # Universal files to exclude from git
├── .prettierrc                  # Universal code formatter config
└── package.json                 # Monorepo concurrency management scripts
```

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js**: LTS version (v18 or higher recommended)
- **npm**: v9 or higher

### Installation Commands
Run the following command at the root of the project to install all dependencies for both the frontend client and backend server concurrently:

```bash
# Install root package dependencies
npm install

# Install server package dependencies
npm install --prefix server

# Install client package dependencies
npm install --prefix client --legacy-peer-deps
```

*Note: The `--legacy-peer-deps` flag is used on client install to resolve React 19 dependency trees with legacy packages (e.g. lucide-react).*

---

## 🚀 Running the Project

You can run client and server concurrently from the root directory:

```bash
# Run both projects concurrently (in development mode)
npm run dev
```

Alternatively, you can boot each project independently:

### Running Server
```bash
# Start server dev nodemon watcher
npm run dev:server

# Start server production environment
npm run start:server
```

Server environment logs are outputted to the console and stored under:
- `server/logs/combined.log` (Info logs and request telemetry)
- `server/logs/error.log` (Errors only)

### Running Client
```bash
# Start Vite development server
npm run dev:client
```

---

## 🧪 Build and Quality Checks

### Compiling Client Code
```bash
# Compile frontend distribution bundle
npm run build --prefix client
```

### Formatting and Linting
```bash
# Run ESLint validation checks
npm run lint

# Run Prettier formatter auto-fix
npm run format
```

---

## 📡 Database Migration

When you are ready to define models, place them in `server/prisma/schema.prisma` and run:

```bash
# Generate the updated prisma client
npm run prisma:generate --prefix server

# Create database tables and run migration
npm run prisma:migrate --prefix server
```
