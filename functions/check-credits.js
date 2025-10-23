// Script para verificar créditos del usuario en Firestore
const admin = require('firebase-admin');

// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();

async function checkUserCredits(stripeCustomerId) {
  try {
    console.log(`🔍 Buscando usuario con Stripe Customer ID: ${stripeCustomerId}`);
    
    // Buscar en la colección customers
    const customerDoc = await db.collection('customers').doc(stripeCustomerId).get();
    
    if (!customerDoc.exists) {
      console.log('❌ No se encontró el documento del customer en Firestore');
      
      // Buscar en users por si el mapping está ahí
      const usersSnapshot = await db.collection('users')
        .where('stripeCustomerId', '==', stripeCustomerId)
        .limit(1)
        .get();
      
      if (usersSnapshot.empty) {
        console.log('❌ Tampoco se encontró en la colección users');
        return;
      }
      
      const userDoc = usersSnapshot.docs[0];
      console.log('\n📊 Usuario encontrado en users:');
      console.log(JSON.stringify(userDoc.data(), null, 2));
      return;
    }
    
    const customerData = customerDoc.data();
    console.log('\n📊 Customer Data:');
    console.log(JSON.stringify(customerData, null, 2));
    
    // Verificar payments subcollection
    console.log('\n💳 Verificando pagos...');
    const paymentsSnapshot = await db.collection('customers')
      .doc(stripeCustomerId)
      .collection('payments')
      .orderBy('created', 'desc')
      .limit(5)
      .get();
    
    if (paymentsSnapshot.empty) {
      console.log('⚠️  No se encontraron pagos en la subcollection');
    } else {
      console.log(`✅ Se encontraron ${paymentsSnapshot.size} pago(s):`);
      paymentsSnapshot.forEach((doc) => {
        const payment = doc.data();
        console.log(`\n  Payment ID: ${doc.id}`);
        console.log(`  Amount: $${payment.amount / 100}`);
        console.log(`  Status: ${payment.status}`);
        console.log(`  Created: ${new Date(payment.created * 1000).toLocaleString()}`);
      });
    }
    
    // Buscar el documento del usuario si existe mapping
    if (customerData.uid) {
      console.log(`\n👤 Buscando usuario con UID: ${customerData.uid}`);
      const userDoc = await db.collection('users').doc(customerData.uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('\n✅ Usuario encontrado:');
        console.log(`  Email: ${userData.email}`);
        console.log(`  Credits: ${userData.credits || 0}`);
        console.log(`  Created: ${userData.createdAt?.toDate?.().toLocaleString() || 'N/A'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

// Customer ID del pago más reciente que vimos
const customerId = process.argv[2] || 'cus_TFZcNflo5kBJ9x';
checkUserCredits(customerId);
