import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  createDocument, 
  // serverTimestamp, // createDocument likely handles timestamps
  Address, 
  OrderData, 
  OrderItem 
} from '../../services/firebase'; // Adjust path if needed
import { CartItem, clearCart } from '../../store/slices/cartSlice'; // Adjust path if needed
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Divider, 
  CircularProgress, 
  Alert,
  List,
  ListItem,
  ListItemText 
} from '@mui/material';
import { AppDispatch } from '../../store'; // Adjust path if needed

// Helper to format address
const formatAddress = (address: Address | Omit<Address, 'id' | 'isDefault'> | null): string => {
  if (!address) return 'No address provided.';
  let parts = [address.line1];
  if (address.line2) parts.push(address.line2);
  parts = [...parts, address.city, address.county, address.postcode];
  return parts.filter(Boolean).join(', ');
};


const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Attempt to get state from location
  const checkoutState = location.state as {
    shippingAddress: Address | Omit<Address, 'id' | 'isDefault'> | null;
    items: CartItem[];
    totals: { subtotal: number; vatAmount: number; shippingCost: number; total: number };
    userId: string | undefined;
  } | null;

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Destructure state safely after checking its existence
  const { shippingAddress, items, totals, userId } = checkoutState || {};

  // Redirect if state is missing
  useEffect(() => {
    if (!shippingAddress || !items || !totals || !userId) {
      console.error("Payment page accessed without required state.");
      // Navigate back to checkout or cart might be better
      // Using Navigate component for immediate effect
    }
  }, [shippingAddress, items, totals, userId]); 
  
  if (!shippingAddress || !items || items.length === 0 || !totals || !userId) {
     // Redirect if essential data is missing
     return <Navigate to="/checkout" replace />;
  }


  const handlePayment = () => {
    setIsProcessing(true);
    setPaymentError(null);

    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        // Map CartItems to OrderItems
        const orderItems: OrderItem[] = items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.unitPrice, // Use unitPrice as 'price' in OrderItem
          options: item.options || {},
          // Note: Ensure OrderItem type in firebase.ts matches these fields
        }));

        // Create order data object for Firestore
        // Type assertion needed as createDocument expects data without id
        const orderData: Omit<OrderData, 'id' | 'createdAt' | 'updatedAt'> = {
          userId: userId,
          items: orderItems,
          status: 'pending', // Initial status
          totalAmount: totals.total,
          shippingAddress: shippingAddress as Address, // Assume it's a full Address or cast needed
          billingAddress: shippingAddress as Address, // Use shipping as billing for now
          paymentMethod: 'simulated_card',
          paymentStatus: 'completed', // Simulate successful payment
          shippingCost: totals.shippingCost,
          // createdAt and updatedAt will be added by createDocument via serverTimestamp
        };

        // Save order to Firestore
        const orderId = await createDocument<Omit<OrderData, 'id' | 'createdAt' | 'updatedAt'>>('orders', orderData);

        // Clear the cart in Redux store
        dispatch(clearCart());

        // Navigate to order confirmation page
        navigate(`/order-confirmation/${orderId}`, { replace: true });

      } catch (error) {
        console.error("Failed to process payment or save order:", error);
        setPaymentError("Payment failed or order could not be saved. Please try again or contact support.");
        setIsProcessing(false);
      } 
      // No finally block needed here as navigation replaces the component
    }, 2000); // Simulate 2 seconds processing time
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Review & Pay
      </Typography>
      <Grid container spacing={3}>
        {/* Order Review Section */}
        <Grid item xs={12} md={7}>
          <Typography variant="h6" gutterBottom>Review Your Order</Typography>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Shipping Address</Typography>
            <Typography variant="body2">{formatAddress(shippingAddress)}</Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
             <Typography variant="subtitle1" gutterBottom>Items</Typography>
             <List dense disablePadding>
               {items.map(item => (
                 <ListItem key={item.id} disableGutters divider>
                   <ListItemText 
                     primary={`${item.name} (x${item.quantity})`}
                     secondary={`£${(item.unitPrice * item.quantity).toFixed(2)}`} 
                   />
                 </ListItem>
               ))}
             </List>
             <Divider sx={{ my: 2 }} />
             <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Subtotal:</Typography>
                <Typography>£{totals.subtotal.toFixed(2)}</Typography>
             </Box>
             <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Shipping:</Typography>
                <Typography>£{totals.shippingCost.toFixed(2)}</Typography>
             </Box>
             <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>VAT (20%):</Typography>
                <Typography>£{totals.vatAmount.toFixed(2)}</Typography>
             </Box>
             <Divider sx={{ my: 1 }}/>
             <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">£{totals.total.toFixed(2)}</Typography>
             </Box>
          </Paper>
        </Grid>

        {/* Payment Method Section */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Payment Method</Typography>
            <Box sx={{ my: 3, p: 2, border: '1px dashed grey', textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                // TODO: Integrate Stripe Elements or other payment gateway here
              </Typography>
               <Typography variant="caption">
                  (Payment will be simulated for now)
               </Typography>
            </Box>
            
            {paymentError && (
              <Alert severity="error" sx={{ mb: 2 }}>{paymentError}</Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? <CircularProgress size={24} color="inherit" /> : `Pay £${totals.total.toFixed(2)}`}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PaymentPage;

