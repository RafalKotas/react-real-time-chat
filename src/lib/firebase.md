# firebase

## apiKey

`const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;`

Identifies Firebase project when the browser talks to Firebase (Auth, Firestore, Storage)

Required by the Firebase JS SDK: 


```typescript
initializeApp({
    apikey: "..."
})
```

It's a **public** key. Security is enforced by Firebase Rules and Auth.

Stored in `.env` file.

## firebaseConfig

```typescript
const firebaseConfig = {
  apiKey,
  authDomain: "reactrealtimechat-17f13.firebaseapp.com",
  projectId: "reactrealtimechat-17f13",
  storageBucket: "reactrealtimechat-17f13.firebasestorage.app",
  messagingSenderId: "148344823322",
  appId: "1:148344823322:web:0e5d000b8e874447763ba3"
};
```

`authDomain` - domain used for Firebase Authentication

`projectId` - Firebase project's unique ID, used internally to route requests to the correct project (Firestore, Storage, Auth)

`storageBucket` - default Google Cloud Storage bucket for Firebase Storage, used when `getStorage()` is called without a bucket name. 

Format: `<projectId>.firebase.app`

`messagingSenderId` - number that identifies Firebase project for FCM (Firebase Cloud Messaging). Without it FCM don't know to which app belongs devices tokens, and can't send notifications.

`appId` - unique ID for this "Firebase app" (web app) in project. Lets Firebase tell web app apart from other apps in the same project.

Format is like:

`1:<messagingSenderId>:web:<unikalny_hash>`

Here:
- `1` - application type (Web)
- `148344823322` - messagingSenderId
- `web` - platform
- `0e5d000b8e874447763ba3` - unique id for this web app

