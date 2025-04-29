# Oak Haven Commerce - Setup Instructions

This document provides detailed instructions for setting up the Oak Haven Commerce repository for Firebase integration and GitHub Actions automated deployments.

## 1. Generating a Firebase Service Account Key

A service account key is required for GitHub Actions to authenticate with Firebase and deploy your application. Follow these steps to generate one:

1. **Go to the Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account
   - Select the "Oak Haven Commerce" project

2. **Navigate to Project Settings**
   - Click on the gear icon (⚙️) in the top left sidebar
   - Select "Project settings" from the menu

3. **Access Service Accounts**
   - Click on the "Service accounts" tab
   - You should see "Firebase Admin SDK" section

4. **Generate a New Private Key**
   - Click the "Generate new private key" button
   - Confirm by clicking "Generate key" in the dialog
   - A JSON file will be downloaded to your computer

5. **Secure Your Key**
   - This key provides full access to your Firebase project
   - Never commit this file to version control
   - Keep it in a secure location
   - You will use the contents of this file for GitHub secrets

## 2. Setting Up GitHub Repository Secrets

GitHub Actions workflows need access to sensitive information like your Firebase service account key. Follow these steps to add them as secrets:

1. **Go to Your GitHub Repository**
   - Visit `https://github.com/lukefryer1234/oak-haven-commerce`
   - Make sure you're logged in and have admin access to the repository

2. **Access Repository Settings**
   - Click on the "Settings" tab near the top of the repository page
   - In the left sidebar, click on "Secrets and variables" and select "Actions"

3. **Add the Firebase Service Account Secret**
   - Click the "New repository secret" button
   - For the name, enter: `FIREBASE_SERVICE_ACCOUNT`
   - For the value, paste the entire contents of the JSON service account key file you downloaded
   - Click "Add secret"

4. **Generate a Firebase CLI Token**
   - On your local machine, open a terminal window
   - Run: `firebase login:ci`
   - Follow the authentication process in your browser
   - Copy the token that's displayed in your terminal

5. **Add the Firebase Token Secret**
   - Back in GitHub, click the "New repository secret" button again
   - For the name, enter: `FIREBASE_TOKEN`
   - For the value, paste the Firebase CLI token you just generated
   - Click "Add secret"

## 3. Troubleshooting Common Issues

If you encounter problems with the GitHub-Firebase integration, here are solutions to common issues:

### Authentication Failures

**Issue**: GitHub Actions workflow fails with authentication errors.

**Solutions**:
- Verify that `FIREBASE_SERVICE_ACCOUNT` contains the complete, unmodified JSON from the service account key file
- Regenerate the `FIREBASE_TOKEN` using `firebase login:ci` and update the GitHub secret
- Ensure the service account has the necessary permissions in Firebase (Hosting Admin, Firestore Admin, etc.)
- Check if the token has expired (they typically last 30 days)

### Deployment Errors

**Issue**: GitHub Actions workflow fails during deployment steps.

**Solutions**:
- Check the workflow logs carefully for specific error messages
- Ensure your firebase.json configuration is correct
- Verify that your project ID in the workflow file matches your Firebase project ID
- Make sure the project has all the required Firebase services enabled
- Try running the deployment commands locally with `firebase deploy` to identify issues

### Data Connect Deployment Issues

**Issue**: Data Connect deployment fails.

**Solutions**:
- Validate your schema.gql file syntax
- Ensure your dataconnect.yaml configuration is correct
- Verify that the Firebase project has Data Connect enabled
- Check if the service account has the necessary Data Connect permissions

### Workflow Not Triggering

**Issue**: The workflow doesn't run when you push to main.

**Solutions**:
- Verify that the workflow file is in the correct location: `.github/workflows/firebase-deploy.yml`
- Check the workflow trigger section to ensure it's configured for the right branch
- Look at the Actions tab in GitHub to see if there are any failed workflow attempts
- Make sure you're pushing to the main branch, not another branch

## 4. First-Time Setup of the Repository

Follow these steps to set up the repository for the first time and ensure GitHub Actions deployments work correctly:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/lukefryer1234/oak-haven-commerce.git
   cd oak-haven-commerce
   ```

2. **Verify Firebase Configuration Files**
   
   Ensure these files exist and are properly configured:
   - `firebase.json`
   - `firestore.rules`
   - `firestore.indexes.json`
   - `dataconnect/dataconnect.yaml`
   - `dataconnect/schema/schema.gql`

3. **Set Up GitHub Actions**
   
   Ensure this file exists:
   - `.github/workflows/firebase-deploy.yml`

4. **Test Firebase Authentication Locally**
   ```bash
   firebase login
   firebase use oak-haven-commerce
   firebase projects:list
   ```

5. **Make a Test Change**
   
   Make a small change to a file in the repository, then:
   ```bash
   git add .
   git commit -m "Test change for GitHub Actions deployment"
   git push origin main
   ```

6. **Verify Workflow Success**
   - Go to the GitHub repository
   - Click on the "Actions" tab
   - You should see your workflow running or completed
   - Check if it completed successfully

7. **Verify Deployment**
   - Visit your Firebase Hosting URL to verify the deployment
   - The URL is typically: `https://oak-haven-commerce.web.app`

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase Data Connect Documentation](https://firebase.google.com/docs/firestore/data-connect)

## Support

If you encounter issues not covered in this guide, please contact the repository administrator or create an issue in the GitHub repository.

