const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('../ai-painter-app-firebase-adminsdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixCredits() {
  try {
    console.log('=== Diagnóstico y Reparación de Créditos ===\n');
    
    // Buscar el usuario por email
    const email = 'asd@gmail.com'; // Email que proporcionaste antes
    
    console.log(`Buscando usuario con email: ${email}...`);
    
    // Buscar en customers primero
    const customersSnap = await db.collection('customers').get();
    let userId = null;
    
    for (const doc of customersSnap.docs) {
      const customerDoc = await db.collection('customers').doc(doc.id).get();
      const customerData = customerDoc.data();
      
      if (customerData && customerData.email === email) {
        userId = doc.id;
        console.log(`✅ Usuario encontrado: ${userId}`);
        break;
      }
    }
    
    if (!userId) {
      console.log('❌ No se encontró el usuario. Listando todos los usuarios...');
      const usersSnap = await db.collection('users').get();
      usersSnap.forEach(doc => {
        console.log(`  - User ID: ${doc.id}, Credits: ${doc.data().credits || 0}`);
      });
      return;
    }
    
    // Ver créditos actuales
    const userDoc = await db.collection('users').doc(userId).get();
    const currentCredits = userDoc.exists ? userDoc.data().credits || 0 : 0;
    
    console.log(`\nCréditos actuales: ${currentCredits}`);
    
    // Ver pagos en customers/{uid}/payments
    const paymentsSnap = await db.collection('customers').doc(userId).collection('payments').get();
    console.log(`\nPagos encontrados en Firestore: ${paymentsSnap.size}`);
    
    if (paymentsSnap.size > 0) {
      console.log('\nDetalles de pagos:');
      paymentsSnap.forEach(payment => {
        const data = payment.data();
        console.log(`  - Payment ID: ${payment.id}`);
        console.log(`    Status: ${data.status}`);
        console.log(`    Amount: $${(data.amount / 100).toFixed(2)}`);
        console.log(`    Created: ${new Date(data.created * 1000).toLocaleString()}`);
      });
    }
    
    // Ver checkout sessions
    const sessionsSnap = await db.collection('customers').doc(userId).collection('checkout_sessions').get();
    console.log(`\nCheckout sessions: ${sessionsSnap.size}`);
    
    if (sessionsSnap.size > 0) {
      sessionsSnap.forEach(session => {
        const data = session.data();
        console.log(`  - Session ID: ${session.id}`);
        console.log(`    Mode: ${data.mode}`);
        console.log(`    Status: ${data.status || 'N/A'}`);
      });
    }
    
    // AGREGAR CRÉDITOS MANUALMENTE
    console.log('\n=== Agregando Créditos Manualmente ===');
    
    // Determinar cuántos créditos agregar basado en el último pago
    let creditsToAdd = 10; // Por defecto, Starter Pack
    
    if (paymentsSnap.size > 0) {
      const lastPayment = paymentsSnap.docs[paymentsSnap.docs.length - 1].data();
      
      // Identificar el plan basado en el monto
      if (lastPayment.amount === 499) { // $4.99
        creditsToAdd = 10; // Starter Pack
        console.log('Detectado: Starter Pack - 10 créditos');
      } else if (lastPayment.amount === 1299) { // $12.99
        creditsToAdd = 30; // Popular Pack
        console.log('Detectado: Popular Pack - 30 créditos');
      }
    }
    
    // Agregar los créditos
    await db.collection('users').doc(userId).set(
      {
        credits: admin.firestore.FieldValue.increment(creditsToAdd)
      },
      { merge: true }
    );
    
    console.log(`✅ Se agregaron ${creditsToAdd} créditos`);
    
    // Verificar nuevo saldo
    const updatedDoc = await db.collection('users').doc(userId).get();
    const newCredits = updatedDoc.data().credits;
    
    console.log(`\nNuevo saldo de créditos: ${newCredits}`);
    console.log('\n✅ ¡Listo! Ahora puedes usar la app.');
    console.log('\nNOTA: Aún necesitas configurar el webhook correctamente para que funcione automáticamente en el futuro.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

fixCredits();
