# Project Manager

A modern project management desktop application built with Electron, React, and Node.js. This application integrates task management with a Jira-style board, note taking capabilities, and project statistics.

## Features

- **Multi-user support** with authentication
- **Project Management Dashboard** with card, table, and list views
- **Task Board** with drag and drop functionality (Jira-style)
- **Notes & File Management** with Google Drive-style folder structure
- **Statistics** for project and task metrics
- **Dark & Light Mode** with customizable color palettes
- **SQLite Database** for local storage
- **Import/Export Database** functionality

## Tech Stack

- **Frontend**: React, Redux Toolkit, React Router, styled-components
- **Backend**: Node.js, Sequelize (ORM)
- **Database**: SQLite
- **UI/UX**: Ant Design-inspired components with custom theming
- **Forms**: React Hook Form with Zod validation
- **Desktop**: Electron

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Steps

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/electron-project-manager.git
   cd electron-project-manager
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. In a separate terminal, start the Electron app
   ```bash
   npm start
   ```

## Build and Distribution

To build the application for distribution:

```bash
# Build for current platform
npm run dist

# Build portable version
npm run pack
```

## Project Structure

```
electron-project-manager/
 electron/                # Electron specific code
    main/                # Main process (Node.js backend)
       database/        # Database models and configuration
       handlers/        # IPC event handlers
       utils/           # Utilities for the main process
    preload/             # Preload scripts for renderer process
    shared/              # Shared types and utilities
 src/                     # Frontend React application
    components/          # Reusable UI components
    features/            # Feature-specific components
    hooks/               # Custom React hooks
    layouts/             # Layout components
    pages/               # Page components
    store/               # Redux store configuration
       slices/          # Redux slices
    themes/              # Theme configuration
    utils/               # Utility functions
 public/                  # Static assets
 vite.config.ts           # Vite configuration
```

## Configuration

### Environment Variables

Create `.env.development` or `.env.production` files in the root directory to configure environment-specific settings:

```
# Development Settings
NODE_ENV=development
VITE_APP_TITLE=Project Manager (Dev)
```

### Mock Mode

For development without a real database, enable mock mode in `.env.development`:

```
VITE_USE_MOCK_DATA=true
```

The mock mode uses in-memory data instead of SQLite, which is useful for testing UI components without setting up a database.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
