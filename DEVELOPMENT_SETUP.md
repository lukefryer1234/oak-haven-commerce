# Oak Haven Commerce - Development Setup Guide

This guide provides detailed instructions for setting up the Oak Haven Commerce development environment across multiple platforms. It ensures consistent development experiences whether you're using GitHub, Firebase, VSCode, or Cursor.

## Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Setting Up Your Development Environment](#setting-up-your-development-environment)
  - [GitHub Repository Setup](#github-repository-setup)
  - [Firebase Setup](#firebase-setup)
  - [VSCode Configuration](#vscode-configuration)
  - [Cursor Setup](#cursor-setup)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Project Overview

Oak Haven Commerce is a web application built with Firebase services. It uses:

- **Firebase Hosting** for web application hosting
- **Firebase Firestore** for database
- **Firebase Data Connect** for data integration
- **GitHub Actions** for CI/CD pipelines

The project is configured to work seamlessly across multiple development platforms using Git for version control.

## Project Structure

```
oak-haven-commerce/
├── .github/                    # GitHub Actions workflow configurations
├── .vscode/                    # VSCode configuration files
├── dataconnect/                # Firebase Data Connect configurations
│   ├── connector/              # Data Connect connector definitions
│   ├── schema/                 # Data schema definitions
│   └── dataconnect.yaml        # Data Connect main configuration
├── public/                     # Public web assets for Firebase Hosting
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore indexes configuration
├── firebase.json               # Firebase project configuration
├── .firebaserc                 # Firebase project aliases
└── README.md                   # Project readme
```

## Setting Up Your Development Environment

### GitHub Repository Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/lukefryer1234/oak-haven-commerce.git
   cd oak-haven-commerce
   ```

2. **Configure Git (if not already set up)**

   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. **Set up GitHub authentication**

   - For HTTPS: Configure credential manager or use a personal access token
   - For SSH: Generate and add SSH keys to your GitHub account

   Detailed instructions: [GitHub Authentication Documentation](https://docs.github.com/en/authentication)

### Firebase Setup

1. **Install Firebase CLI** (if not already installed)

   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**

   ```bash
   firebase login
   ```

3. **Verify project configuration**

   The project is already configured to use the `oak-haven-commerce` Firebase project. Verify this by checking the `.firebaserc` file:

   ```bash
   cat .firebaserc
   ```

   Expected output:
   ```json
   {
     "projects": {
       "default": "oak-haven-commerce"
     }
   }
   ```

4. **List available Firebase projects** (optional)

   ```bash
   firebase projects:list
   ```

### VSCode Configuration

1. **Install Visual Studio Code**

   Download and install from [code.visualstudio.com](https://code.visualstudio.com/)

2. **Open the project in VSCode**

   ```bash
   code .
   ```

3. **Install recommended extensions**

   VSCode should prompt you to install recommended extensions when you open the project. If not:

   - Open the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X` on macOS)
   - Type `@recommended` in the search box
   - Install all recommended extensions

   Key extensions include:
   - Firebase Explorer
   - GitHub Pull Requests and Issues
   - ESLint, Prettier
   - GitLens

4. **Configure GitHub authentication in VSCode**

   - Click on the Accounts icon in the bottom left corner
   - Click "Sign in to GitHub"
   - Follow the authentication flow

### Cursor Setup

1. **Install Cursor**

   Download and install from [cursor.sh](https://cursor.sh)

2. **Open the project in Cursor**

   ```bash
   # If Cursor has a command-line utility, or use the GUI to open the folder
   cursor oak-haven-commerce
   ```

3. **Configure GitHub integration**

   - Open Settings in Cursor
   - Navigate to the GitHub/Git integration section
   - Connect your GitHub account
   - Enable Git features

4. **Configure editor settings**

   Cursor should respect the project's `.vscode/settings.json` file, but double-check that the settings are applied correctly.

## Development Workflow

### Basic Git Workflow

1. **Always pull latest changes before starting work**

   ```bash
   git pull origin main
   ```

2. **Create a feature branch for your work**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and commit regularly**

   ```bash
   git add .
   git commit -m "Descriptive commit message"
   ```

4. **Push your branch to GitHub**

   ```bash
   git push -u origin feature/your-feature-name
   ```

5. **Create a Pull Request on GitHub**

   Go to the repository on GitHub and create a pull request from your branch to `main`.

### Firebase Development

1. **Run Firebase emulators for local development**

   ```bash
   firebase emulators:start
   ```

2. **Deploy specific Firebase services for testing**

   ```bash
   # Deploy only Firestore rules
   firebase deploy --only firestore

   # Deploy only hosting
   firebase deploy --only hosting

   # Deploy only Data Connect
   firebase deploy --only dataconnect
   ```

### Cross-Platform Synchronization

When working across multiple devices:

1. **Always commit and push your changes** before switching devices
2. **Pull the latest changes** immediately after switching to a new device
3. **Use the same versions** of development tools where possible
4. **Rely on project configuration files** (.vscode/settings.json, etc.) for consistent settings

## Deployment

The project uses GitHub Actions for automated deployments:

- **Pull Request Previews**: Every PR automatically creates a Firebase Hosting preview
- **Production Deployment**: Merges to `main` automatically deploy to Firebase Hosting, Firestore, and Data Connect

Manual deployment is also possible:

```bash
# Full project deployment
firebase deploy

# Deploy specific components
firebase deploy --only hosting,firestore
```

## Troubleshooting

### Common GitHub Issues

- **Authentication problems**: Ensure your GitHub credentials are up to date
- **Merge conflicts**: Pull the latest changes from `main` and resolve conflicts locally before pushing

### Common Firebase Issues

- **Permission denied errors**: Ensure you're logged in with `firebase login` and have the correct project permissions
- **Deployment failures**: Check the Firebase project settings and ensure the required APIs are enabled
- **Emulator connection issues**: Ensure ports are not in use by other applications

### VSCode/Cursor Issues

- **Extensions not working**: Try reinstalling the extension or checking its specific requirements
- **Settings not applying**: Ensure the .vscode directory is not ignored by your editor
- **Synchronization issues**: Ensure you're properly signed in to GitHub in both editors

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [VSCode Documentation](https://code.visualstudio.com/docs)
- [Cursor Documentation](https://cursor.sh/docs)
- [Git Documentation](https://git-scm.com/doc)

