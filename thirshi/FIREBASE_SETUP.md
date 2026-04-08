# Firebase Setup Guide for TalentAtlas Admin Panel

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Project name: `talentatlastatti`
4. Accept terms and create project
5. Select "Web" as the platform

## 2. Get Your Firebase Configuration

After creating the project:
1. Go to Project Settings (⚙️ icon)
2. Under "Your apps", find the web app config
3. Copy the entire `firebaseConfig` object

## 3. Replace Configuration in tatti.html

In `tatti.html`, find this section (around line 1345):

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Replace with your actual Firebase config values.

## 4. Enable Firebase Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. Go to **Users** tab
4. Click "Create user" and add admin account:
   - Email: `admin@tatti.in`
   - Password: Create a strong password (min 6 characters)

## 5. Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Start in **Test mode** (for development)
4. Create collection: `admin_users`

## 6. Security Rules (for Production)

Update Firestore security rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin users collection - only admins can read/write
    match /admin_users/{document=**} {
      allow read, write: if request.auth.uid != null && 
                            request.auth.email in ['admin@tatti.in'];
    }
    // HR users collection - only admins can manage
    match /hr_users/{document=**} {
      allow read, write: if request.auth.email in ['admin@tatti.in'];
    }
    // Candidate pipeline - only associated HR can edit
    match /hr_pipelines/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.email == resource.data.hr_email;
    }
  }
}
```

## 7. Deploy & Test

1. Update your `tatti.html` with correct Firebase config
2. Open the website in browser
3. Click **🔐 Admin Login** button
4. Use credentials: `admin@tatti.in` and your password
5. You should see the Admin Dashboard with HR management features

## 8. Data Structure in Firestore

### Collections Created:

**admin_users/**
```json
{
  "email": "admin@tatti.in",
  "name": "Sundar Sir",
  "created_at": "2025-01-15T10:00:00Z"
}
```

**hr_users/** (managed by admin)
```json
{
  "email": "recruiter@company.com",
  "name": "Recruiter Name",
  "company": "Company Name",
  "designation": "Recruiter",
  "approved": true,
  "requirements": "Java, React, MongoDB",
  "created_at": "2025-01-15T10:00:00Z"
}
```

**hr_pipelines/**
```json
{
  "hr_email": "recruiter@company.com",
  "student_id": 1,
  "stage": "shortlisted",
  "notes": "Strong candidate",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

## 9. Testing the Admin Panel

After logging in with admin credentials, you can:
- ✅ View all HR registrations
- ✅ View HR contact details
- ✅ View HR requirements
- ✅ View HR activity (pipeline stages)
- ✅ Approve/Reject HR accounts (pending implementation)

## Troubleshooting

**"Cannot read property 'initializeApp' of undefined"**
- Firebase SDK is not loaded. Check that Firebase scripts are in `<head>`

**"User not found"**
- Admin user doesn't exist in Firebase. Go to Firebase Console → Authentication → Create user

**"Wrong password"**
- Check that password matches what you set in Firebase Console

**Firestore writes failing**
- Check security rules allow your admin email
- Ensure Firestore database is created

## Questions?

Contact Sundar Sir for Firebase project access or configuration help.
