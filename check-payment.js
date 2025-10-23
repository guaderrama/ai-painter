const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('./ai-painter-app-firebase-adminsdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkPayments() {
  try {
    // Buscar usuario por email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    
    console.log('=== Buscando usuarios ===');
    for (const doc of snapshot.docs) {
      console.log(`\nUsuario ID: ${doc.id}`);
      console.log('Datos:', doc.data());
      
      // Buscar datos del customer
      const customerDoc = await db.collection('customers').doc(doc.id).get();
      if (customerDoc.exists) {
        console.log('Customer data:', customerDoc.data());
        
        // Buscar checkout sessions
        const sessionsSnap = await db.collection('customers').doc(doc.id).collection('checkout_sessions').get();
        console.log(`\nCheckout Sessions (${sessionsSnap.size}):`);
        sessionsSnap.forEach(session => {
          console.log(`  - ${session.id}:`, session.data());
        });
        
        // Buscar payments
        const paymentsSnap = await db.collection('customers').doc(doc.id).collection('payments').get();
        console.log(`\nPayments (${paymentsSnap.size}):`);
        paymentsSnap.forEach(payment => {
          console.log(`  - ${payment.id}:`, payment.data());
        });
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPayments().then(() => {
  console.log('\n=== Verificación completa ===');
  process.exit(0);
});
