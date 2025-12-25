// Firebase Payments Configuration
class FirebasePayments {
  constructor() {
    this.stripe = null;
    this.isInitialized = false;
  }

  // Initialize Stripe
  async initializeStripe() {
    if (!window.Stripe) {
      console.error('Stripe.js not loaded');
      return false;
    }

    try {
      // Get Stripe publishable key from Firebase config
      const stripeConfig = await this.getStripeConfig();
      this.stripe = Stripe(stripeConfig.publishableKey);
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      return false;
    }
  }

  // Get Stripe configuration from Firebase
  async getStripeConfig() {
    // You'll set this in Firebase Firestore
    // Or hardcode your Stripe publishable key
    return {
      publishableKey: 'pk_test_51STpLOABJOESI1YbhNYJCqEB6Ehjm7ytG3DFOatwkXXBvCU5EdrQ98x6ETfGqX4HNmzkE0ZFD3sx8JPHkYM4XMl6009IY2pn6c',
      currency: 'zar'
    };
  }

  // Create checkout session
  async createCheckoutSession(cart, customerInfo) {
    if (!this.isInitialized) {
      await this.initializeStripe();
    }

    try {
      // Call your Firebase Function to create checkout session
      const createCheckoutSession = firebase.functions().httpsCallable('createCheckoutSession');
      
      const sessionData = {
        items: cart.map(item => ({
          name: item.name,
          price: Math.round(item.price * 100), // Convert to cents
          quantity: item.quantity || 1,
          image: item.image,
          category: item.category
        })),
        total: Math.round(cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) * 100),
        currency: 'zar',
        customerEmail: customerInfo.email,
        customerName: customerInfo.name,
        shippingAddress: customerInfo.shippingAddress,
        metadata: {
          orderId: `CG-${Date.now()}`,
          customerId: customerInfo.id || 'guest'
        }
      };

      const result = await createCheckoutSession(sessionData);
      
      // Redirect to Stripe Checkout
      const { error } = await this.stripe.redirectToCheckout({
        sessionId: result.data.sessionId
      });

      if (error) {
        throw error;
      }

      return { success: true, sessionId: result.data.sessionId };
      
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }

  // Handle payment success
  async handlePaymentSuccess(sessionId) {
    try {
      // Verify payment with your backend
      const verifyPayment = firebase.functions().httpsCallable('verifyPayment');
      const result = await verifyPayment({ sessionId });
      
      return {
        success: true,
        order: result.data.order,
        receipt: result.data.receipt
      };
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  }

  // Save order to Firebase
  async saveOrder(cart, customerInfo, paymentIntentId) {
    if (!firebase.firestore()) {
      console.error('Firestore not available');
      return null;
    }

    const db = firebase.firestore();
    
    const order = {
      items: cart,
      total: cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
      subtotal: cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
      shipping: 0, // Add shipping calculation if needed
      tax: 0, // Add tax calculation if needed
      grandTotal: cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
      currency: 'ZAR',
      status: 'pending',
      paymentStatus: 'pending',
      paymentIntentId: paymentIntentId,
      customer: {
        email: customerInfo.email,
        name: customerInfo.name,
        phone: customerInfo.phone,
        shippingAddress: customerInfo.shippingAddress
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      const orderRef = await db.collection('orders').add(order);
      return orderRef.id;
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  }
}

// Create global instance
window.firebasePayments = new FirebasePayments();