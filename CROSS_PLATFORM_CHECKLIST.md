# Cross-Platform Development Environment Checklist

Use this checklist to verify that your development environment is correctly set up to work with the Oak Haven Commerce project across GitHub, Firebase, VSCode, and Cursor.

## GitHub Repository Setup Verification

- [ ] I can clone the repository
  ```bash
  git clone https://github.com/lukefryer1234/oak-haven-commerce.git
  cd oak-haven-commerce
  ```

- [ ] I can see the remote repository
  ```bash
  git remote -v
  # Should show origin pointing to https://github.com/lukefryer1234/oak-haven-commerce.git
  ```

- [ ] I have proper GitHub authentication configured
  ```bash
  # Test by running:
  git fetch
  # Should complete without authentication errors
  ```

## Firebase CLI Verification

- [ ] Firebase CLI is installed
  ```bash
  firebase --version
  # Should display the Firebase CLI version (v14.0.0 or higher)
  ```

- [ ] I am logged into Firebase
  ```bash
  firebase login:list
  # Should show your email address as logged in
  ```

- [ ] I can access the project
  ```bash
  firebase projects:list
  # Should show oak-haven-commerce in the list
  ```

- [ ] I can run the Firebase emulators
  ```bash
  firebase emulators:start --only hosting
  # Press Ctrl+C to exit after confirming it works
  ```

## VSCode Configuration Verification

- [ ] I can open the project in VSCode
  ```bash
  code .
  # VSCode should open with the project
  ```

- [ ] Recommended extensions are installed
  - [ ] Open Extensions panel (Ctrl+Shift+X or Cmd+Shift+X on Mac)
  - [ ] Type "@recommended" in the search box
  - [ ] Verify all recommended extensions are installed or install them

- [ ] VSCode settings are applied
  - [ ] Open a Firebase configuration file (e.g., firestore.rules)
  - [ ] Verify syntax highlighting works correctly

- [ ] GitHub integration is working
  - [ ] Click on the Source Control icon in the sidebar
  - [ ] Verify that Git information is displayed correctly

## Cursor Setup Verification

- [ ] I can open the project in Cursor
  - [ ] Open Cursor
  - [ ] Use File > Open to open the oak-haven-commerce directory

- [ ] GitHub integration is configured
  - [ ] Check that you can see Git information in Cursor
  - [ ] Verify that you're signed into your GitHub account

- [ ] Editor settings are working correctly
  - [ ] Open a Firebase configuration file
  - [ ] Verify formatting and syntax highlighting work correctly

## Cross-Platform Workflow Test

Follow these steps to verify that your entire workflow works correctly:

1. [ ] Create a simple text file
   ```bash
   echo "# Test file created on $(date)" > test_environment.txt
   ```

2. [ ] Commit the file using your preferred editor (VSCode or Cursor)
   ```bash
   git add test_environment.txt
   git commit -m "Test environment setup"
   ```

3. [ ] Push the change to GitHub
   ```bash
   git push origin main
   # If you don't have direct push access, create a branch:
   # git checkout -b test/environment-setup
   # git push origin test/environment-setup
   # Then create a PR on GitHub
   ```

4. [ ] On another device/platform:
   - [ ] Clone the repository (or pull if already cloned)
   ```bash
   git pull origin main
   ```
   - [ ] Verify the test file exists and can be opened
   - [ ] Make a small change to the file
   - [ ] Commit and push the change
   - [ ] Verify the change appears in GitHub

5. [ ] Test Firebase deployment (if you have permission)
   ```bash
   # Deploy only hosting to test
   firebase deploy --only hosting
   # Visit the hosted URL to verify your deployment
   ```

## Next Steps

Once all items are checked, your development environment is ready to work on the Oak Haven Commerce project across multiple platforms. For detailed development instructions, refer to:

- [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md) - Comprehensive setup guide
- [README.md](./README.md) - Project overview and general information

If you encounter any issues during setup, refer to the troubleshooting section in DEVELOPMENT_SETUP.md or reach out to the project maintainers.

