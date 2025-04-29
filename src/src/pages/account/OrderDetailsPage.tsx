import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDocument, OrderData, Address, Timestamp } from '../../services/firebase'; // Adjust path if needed
import { RootState } from '../../store'; // Adjust path if needed
import { 
  Container, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Button,
  Grid 
} from '@mui/material';

// Helper to format address (consider moving to a utils file if used elsewhere)
const formatAddress = (address: Address | Omit<Address, 'id' | 'isDefault'> | null): string => {
  if (!address) return 'No address provided.';
  let parts = [address.line1];
  if (address.line2) parts.push(address.line2);
  parts = [...parts, address.city, address.county, address.postcode];
  return parts.filter(Boolean).join(', ');
};

// Helper to format Firestore Timestamp or return 'N/A'
const formatDate = (timestamp: Timestamp | undefined): string => {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleDateString();
  }
  return 'N/A';
};

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID is missing.");
      setIsLoading(false);
      return;
    }
    if (!user?.uid) {
       setError("User not logged in."); // Should be handled by ProtectedRoute
       setIsLoading(false);
       return;
    }

    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);
      setOrderData(null);
      try {
        const fetchedOrder = await getDocument<OrderData>('orders', orderId);
        
        if (fetchedOrder) {
          // **Security Check: Verify order belongs to the current user**
          if (fetchedOrder.userId === user.uid) {
            setOrderData(fetchedOrder);
          } else {
            console.warn(`User ${user.uid} attempted to access order ${orderId} owned by ${fetchedOrder.userId}`);
            setError(`Order not found.`); // Treat as not found for security
            setOrderData(null); 
          }
        } else {
          setError(`Order with ID "${orderId}" not found.`);
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to fetch order details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user?.uid]); // Add user.uid dependency

  if (isLoading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography>Loading order details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
        <Button component={Link} to="/account/orders" sx={{ mt: 2 }}>Back to Order History</Button>
      </Container>
    );
  }

  if (!orderData) {
     return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="warning">Order not found.</Alert>
         <Button component={Link} to="/account/orders" sx={{ mt: 2 }}>Back to Order History</Button>
      </Container>
    );
  }
  
  const orderDate = formatDate(orderData.createdAt);

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Order Details: #{orderData.id}
      </Typography>
      
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
           <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Order Placed</Typography>
              <Typography variant="body1">{orderDate}</Typography>
           </Grid>
           <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Total</Typography>
              <Typography variant="body1">£{orderData.totalAmount.toFixed(2)}</Typography>
           </Grid>
           <Grid item xs={6} sm={3}>
             <Typography variant="body2" color="text.secondary">Status</Typography>
             <Typography variant="body1">{orderData.status}</Typography>
           </Grid>
            <Grid item xs={6} sm={3} sx={{ textAlign: 'right' }}>
                {/* Optional: Add reorder or print button */}
            </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }}/>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Shipping Address</Typography>
            <Typography variant="body2">{formatAddress(orderData.shippingAddress)}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
             <Typography variant="h6" gutterBottom>Billing Address</Typography>
             <Typography variant="body2">{formatAddress(orderData.billingAddress)}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Items Ordered</Typography>
        <List disablePadding>
          {orderData.items.map((item, index) => (
            <ListItem key={`${item.productId}-${index}`} disableGutters divider>
              <ListItemText 
                primary={`${item.name} (x${item.quantity})`} 
                // Basic options display - consider making formatOptions helper more robust
                secondary={item.options && Object.keys(item.options).length > 0 ? `Options: ${JSON.stringify(item.options)}` : null} 
              />
              <Typography variant="body1">£{(item.price * item.quantity).toFixed(2)}</Typography>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 2, pl: { xs: 0, sm: 2 } }}> {/* Adjust padding */}
           <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Typography sx={{ mr: 4 }}>Subtotal:</Typography>
              {/* Subtotal/VAT might need recalculation if not stored */}
              <Typography>£{(orderData.totalAmount - orderData.shippingCost /* - VAT */).toFixed(2)} (Est.)</Typography> 
           </Box>
           <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Typography sx={{ mr: 4 }}>Shipping:</Typography>
              <Typography>£{orderData.shippingCost.toFixed(2)}</Typography>
           </Box>
           <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Typography sx={{ mr: 4 }}>VAT (included):</Typography>
              {/* <Typography>£{CalculateVATHere}</Typography> */}
           </Box>
           <Divider sx={{ my: 1 }} />
           <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="h6" sx={{ mr: 4 }}>Grand Total:</Typography>
              <Typography variant="h6">£{orderData.totalAmount.toFixed(2)}</Typography>
           </Box>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'left' }}>
          <Button component={Link} to="/account/orders" variant="outlined">
            Back to Order History
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderDetailsPage;

