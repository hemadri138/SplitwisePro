# Fix Android App Bundle Signing Key Issue

## Problem
Your App Bundle is signed with the wrong key. Google Play expects:
- **Expected SHA1**: `1B:FE:EF:49:4D:4C:0E:E5:3E:0B:31:88:18:D0:80:DE:E2:F9:2F:AB`
- **Current SHA1**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

## Solution Steps

### Option 1: If you have the original keystore file

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to EAS**:
   ```bash
   eas login
   ```

3. **Update Android credentials with your keystore**:
   ```bash
   eas credentials
   ```
   - Select: Android
   - Select: Set up a new keystore or update an existing one
   - Choose: Upload a keystore file
   - Provide your keystore file path, keystore password, key alias, and key password

4. **Verify the certificate fingerprint**:
   ```bash
   keytool -list -v -keystore your-keystore.jks -alias your-key-alias
   ```
   Make sure the SHA1 fingerprint matches: `1B:FE:EF:49:4D:4C:0E:E5:3E:0B:31:88:18:D0:80:DE:E2:F9:2F:AB`

5. **Rebuild your app bundle**:
   ```bash
   eas build --platform android --profile production
   ```

### Option 2: If you don't have the original keystore

**⚠️ WARNING**: If you've lost the original keystore, you have two options:

1. **Contact Google Play Support**: They may be able to help if this is a new app or if you can prove ownership.

2. **Create a new app listing**: If you can't recover the keystore, you'll need to create a new app in Google Play Console with a new package name.

### Option 3: Check if credentials are stored elsewhere

1. **Check EAS credentials**:
   ```bash
   eas credentials
   ```
   - Select: Android
   - View current credentials
   - Check if you can see the keystore information

2. **If credentials exist but are wrong**, you can:
   - Delete the current credentials: `eas credentials` → Android → Remove credentials
   - Then upload the correct keystore

## Verify Your Keystore Fingerprint

To check if a keystore file matches the expected fingerprint:

```bash
keytool -list -v -keystore path/to/your-keystore.jks -alias your-key-alias
```

Look for the SHA1 fingerprint in the output. It should match:
`1B:FE:EF:49:4D:4C:0E:E5:3E:0B:31:88:18:D0:80:DE:E2:F9:2F:AB`

## After Fixing

Once you've updated the credentials:

1. **Build a new app bundle**:
   ```bash
   eas build --platform android --profile production
   ```

2. **Submit to Google Play**:
   ```bash
   eas submit --platform android --profile production
   ```

Or manually upload the new `.aab` file from the EAS build output to Google Play Console.

## Important Notes

- **Never lose your keystore file** - Keep it in a secure location (password manager, secure backup)
- **The keystore password and key password are critical** - Store them securely
- **Each app on Google Play must use the same signing key** - You cannot change it after the first upload
- If you're using EAS managed credentials, EAS stores them securely, but you should still have a backup
