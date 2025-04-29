# Oak Haven Commerce

An e-commerce platform for Oak Haven products with Firebase integration and automated deployments.

## Project Overview

Oak Haven Commerce is a web-based e-commerce solution that leverages Firebase's robust suite of tools to provide a seamless shopping experience. The platform integrates Firebase Hosting for web content delivery, Firestore for database services, and Firebase Data Connect for sophisticated data management.

## Features

- **Responsive Web Interface**: Mobile-friendly shopping experience
- **Real-time Database**: Powered by Firebase Firestore
- **Secure Authentication**: User account management
- **Advanced Data Handling**: Using Firebase Data Connect
- **Automated Deployments**: CI/CD pipeline with GitHub Actions

## Local Development Setup

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Firebase CLI
- Git

### Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/lukefryer1234/oak-haven-commerce.git
   cd oak-haven-commerce
   ```

2. **Install Firebase CLI (if not already installed)**

   ```bash
   npm install -g firebase-tools
   ```

3. **Login to Firebase**

   ```bash
   firebase login
   ```

4. **Select the project**

   ```bash
   firebase use oak-haven-commerce
   ```

5. **Install dependencies (if applicable)**

   If the project contains a package.json file:
   ```bash
   npm install
   ```

6. **Run the local development server**

   ```bash
   firebase serve
   ```

   This will start a local server for development at `http://localhost:5000`.

### Working with Firebase Data Connect

The project uses Firebase Data Connect for managing database interactions. The schema is defined in `dataconnect/schema/schema.gql`.

To modify or update the data schema:

1. Edit the schema file in `dataconnect/schema/schema.gql`
2. Update queries and mutations in `dataconnect/connector/` as needed
3. Deploy your changes with `firebase deploy --only dataconnect`

## GitHub Actions for Firebase Deployment

This project uses GitHub Actions to automate the deployment process to Firebase. Every push to the `main` branch triggers the workflow defined in `.github/workflows/firebase-deploy.yml`.

### What the Workflow Does

1. **Sets up the environment**: Installs Node.js and required dependencies
2. **Caches dependencies**: Speeds up subsequent workflows
3. **Deploys to Firebase Hosting**: Updates the public-facing website
4. **Updates Firestore Rules**: Enforces security rules for the database
5. **Deploys Data Connect Configurations**: Updates the data schema and connectors

### Manually Triggering Deployment

You can also manually trigger the deployment workflow from the GitHub Actions tab in the repository.

## Firebase Features Used

### Firebase Hosting

Used to serve the web application. Configuration is in `firebase.json` under the `hosting` key, and the public files are stored in the `public` directory.

### Firestore

NoSQL database solution used for storing application data. Security rules are defined in `firestore.rules`, and custom indexes in `firestore.indexes.json`.

### Firebase Data Connect

Enables advanced data querying and management. The configuration files are stored in the `dataconnect` directory:

- `dataconnect/dataconnect.yaml`: Main configuration file
- `dataconnect/schema/schema.gql`: GraphQL schema definition
- `dataconnect/connector/`: Contains query and mutation definitions

## Managing GitHub Secrets for Firebase Integration

To enable the GitHub Actions workflow to deploy to Firebase, the following secrets must be configured in the GitHub repository:

1. **FIREBASE_SERVICE_ACCOUNT**: A JSON key for a Firebase service account with appropriate permissions
2. **FIREBASE_TOKEN**: A CI token for Firebase authentication (obtained via `firebase login:ci`)

### How to Set Up Secrets

1. Navigate to your GitHub repository
2. Go to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret with its corresponding value

### Generating Firebase Service Account

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. Paste the entire contents into the FIREBASE_SERVICE_ACCOUNT secret

### Obtaining Firebase Token

Run the following command and follow the prompts:

```bash
firebase login:ci
```

Copy the token and save it as the FIREBASE_TOKEN secret in GitHub.

## Contribution Guidelines

### Branching Strategy

- `main`: Production-ready code
- `develop`: Integration branch for feature work
- Feature branches: Named as `feature/your-feature-name`

### Pull Request Process

1. Create a branch from `develop` for your changes
2. Make your changes with appropriate tests
3. Submit a pull request to merge back into `develop`
4. Request review from a team member
5. Once approved, your changes will be merged

### Code Style

Follow established coding conventions for the project. If in doubt, refer to existing code for guidance.

### Deployment

Deployments to production (Firebase) are handled automatically through GitHub Actions when changes are merged to the `main` branch.

## License

[Include appropriate license information here]

## Contact

For questions or support, please contact [your contact information].

