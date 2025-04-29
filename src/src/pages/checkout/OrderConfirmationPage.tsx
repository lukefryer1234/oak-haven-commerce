import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDocument, OrderData, Address } from '../../services/firebase'; // Adjust path if needed
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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Helper to format address (consider moving to a utils file if used elsewhere)
const formatAddress = (address: Address | Omit<Address, 'id' | 'isDefault'> | null): string => {
  if (!address) return 'No address provided.';
  let parts = [address.line1];
  if (address.line2) parts.push(address.line2);
  parts = [...parts, address.city, address.county, address.postcode];
  return parts.filter(Boolean).join(', ');
};

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID is missing.");
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
          // Convert Firestore Timestamps to JS Dates if necessary for display
          // (Assuming getDocument might already handle this, or do it here)
          // Example: fetchedOrder.createdAt = (fetchedOrder.createdAt as any).toDate();
          setOrderData(fetchedOrder);
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
  }, [orderId]);

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
        <Button component={Link} to="/" sx={{ mt: 2 }}>Go Home</Button>
      </Container>
    );
  }

  if (!orderData) {
     return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="warning">Order not found.</Alert>
         <Button component={Link} to="/" sx={{ mt: 2 }}>Go Home</Button>
      </Container>
    );
  }
  
  // Safely access potentially undefined createdAt
  const orderDate = orderData.createdAt 
    ? new Date((orderData.createdAt as any).seconds * 1000).toLocaleDateString() // Basic date conversion
    : 'N/A';

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40, mr: 1 }} />
          <Typography variant="h4" component="h1">
            Thank you for your order!
          </Typography>
        </Box>
        <Typography variant="h6" gutterBottom>
          Order Confirmation: #{orderData.id}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Order Placed: {orderDate}
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Shipping Address</Typography>
            <Typography variant="body2">{formatAddress(orderData.shippingAddress)}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
             {/* Optional: Billing Address if different */}
             <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Payment Method</Typography>
             <Typography variant="body2">{orderData.paymentMethod || 'N/A'}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Order Summary</Typography>
        <List disablePadding>
          {orderData.items.map((item, index) => (
            <ListItem key={`${item.productId}-${index}`} disableGutters divider>
              <ListItemText 
                primary={`${item.name} (x${item.quantity})`} 
                secondary={item.options ? `Options: ${formatAddress(item.options)}` : null} // Basic options display
              />
              <Typography variant="body1">£{(item.price * item.quantity).toFixed(2)}</Typography>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 2, pl: 2 }}> {/* Align with ListItemText */}
           <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Typography sx={{ mr: 4 }}>Subtotal:</Typography>
              {/* Note: Subtotal/VAT might not be on orderData, recalculate or just show total */}
              {/* <Typography>£{CalculateSubtotalHere}</Typography> */}
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
              <Typography variant="h6" sx={{ mr: 4 }}>Total Paid:</Typography>
              <Typography variant="h6">£{orderData.totalAmount.toFixed(2)}</Typography>
           </Box>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button component={Link} to="/products" variant="outlined">
            Continue Shopping
          </Button>
          <Button component={Link} to="/account/orders" variant="contained">
            View Order History
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderConfirmationPage;

