// Script simple para leer Firestore
const admin = require('firebase-admin');

// Inicializar sin credenciales (usa Application Default Credentials)
admin.initializeApp({
  projectId: 'ai-painter-app'
});

const db = admin.firestore();

async function readFirestoreData() {
  try {
    const customerId = 'JimmLaObAHO0MF9JyuhEC6SSA9t1';
    
    console.log(`\n📄 Customer Document: ${customerId}\n`);
    
    // Leer customer document
    const customerDoc = await db.collection('customers').doc(customerId).get();
    
    if (customerDoc.exists) {
      console.log('✅ Customer Data:');
      console.log(JSON.stringify(customerDoc.data(), null, 2));
    }
    
    console.log(`\n\n🛒 Checkout Sessions:\n`);
    
    // Leer checkout_sessions
    const sessionsSnapshot = await db
      .collection('customers')
      .doc(customerId)
      .collection('checkout_sessions')
      .get();
    
    if (sessionsSnapshot.empty) {
      console.log('❌ No checkout_sessions found');
    } else {
      console.log(`✅ Found ${sessionsSnapshot.size} checkout_session(s):\n`);
      sessionsSnapshot.forEach((doc) => {
        console.log(`📋 Session ID: ${doc.id}`);
        console.log(JSON.stringify(doc.data(), null, 2));
        console.log('\n---\n');
      });
    }
    
    console.log(`\n💳 Payments:\n`);
    
    // Leer payments
    const paymentsSnapshot = await db
      .collection('customers')
      .doc(customerId)
      .collection('payments')
      .get();
    
    if (paymentsSnapshot.empty) {
      console.log('❌ NO PAYMENTS FOUND - ESTE ES EL PROBLEMA!');
    } else {
      console.log(`✅ Found ${paymentsSnapshot.size} payment(s):\n`);
      paymentsSnapshot.forEach((doc) => {
        console.log(`💵 Payment ID: ${doc.id}`);
        console.log(JSON.stringify(doc.data(), null, 2));
        console.log('\n---\n');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

readFirestoreData();
