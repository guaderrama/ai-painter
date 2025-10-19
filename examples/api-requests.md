# Ejemplos de Llamadas API - AI Painter

## Llamar a Cloud Function /generate

```javascript
const imageUrl = "https://firebasestorage.googleapis.com/...";
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(
  'https://api-255643153942.us-central1.run.app/generate',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageUrl })
  }
);

const data = await response.json();
if (response.ok) {
  // data.imageUrl contiene imagen generada en base64
  document.getElementById('result-img').src = data.imageUrl;
} else {
  console.error('Error:', data.error);
}
```

## Upload a Firebase Storage

```javascript
const storageRef = firebase.storage().ref();
const fileRef = storageRef.child(
  `user_uploads/${user.uid}/${Date.now()}_${file.name}`
);

await fileRef.put(file);
const downloadURL = await fileRef.getDownloadURL();
```

## Leer/Escuchar Firestore

```javascript
// Lectura única
const doc = await db.collection('users').doc(uid).get();
const credits = doc.data().credits;

// Tiempo real
db.collection('users').doc(uid).onSnapshot(doc => {
  console.log('Credits:', doc.data().credits);
});
