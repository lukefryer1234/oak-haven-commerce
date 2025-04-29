import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  getDocument, 
  updateDocument, 
  OrderData, 
  Address, 
  Timestamp 
} from '../../services/firebase'; // Adjust path if needed
import { 
  Container, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper, 
  Grid, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
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

// Define possible order statuses
const orderStatuses: OrderData['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState<boolean>(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

  // Fetch order data
  useEffect(() => {
    if (!orderId) {
      setError("Order ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);
      setStatusUpdateError(null); // Clear status errors on refetch
      setOrderData(null);
      try {
        const fetchedOrder = await getDocument<OrderData>('orders', orderId);
        if (fetchedOrder) {
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

  // Handle status change
  const handleStatusChange = async (event: SelectChangeEvent<string>) => {
    const newStatus = event.target.value as OrderData['status'];
    if (!orderId || !orderData || newStatus === orderData.status) {
      return; // No change or missing data
    }

    setIsSavingStatus(true);
    setStatusUpdateError(null);
    try {
      await updateDocument('orders', orderId, { status: newStatus });
      // Update local state immediately for better UX
      setOrderData(prevData => prevData ? { ...prevData, status: newStatus } : null);
    } catch (err) {
      console.error("Error updating order status:", err);
      setStatusUpdateError("Failed to update status. Please try again.");
    } finally {
      setIsSavingStatus(false);
    }
  };


  // --- Render Logic ---
  if (isLoading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography>Loading order details...</Typography>
      </Container>
    );
  }

  if (error) { // Primarily fetch error
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
        <Button component={Link} to="/admin/orders" sx={{ mt: 2 }}>Back to Orders</Button>
      </Container>
    );
  }
  
  if (!orderData) {
     return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="warning">Order not found.</Alert>
         <Button component={Link} to="/admin/orders" sx={{ mt: 2 }}>Back to Orders</Button>
      </Container>
    );
  }
  
  const orderDate = formatDate(orderData.createdAt);

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom component="div">
            Order Details: #{orderData.id}
          </Typography>
           <Button component={Link} to="/admin/orders" variant="outlined">
              Back to Orders
            </Button>
       </Box>
       
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
           <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Order Placed</Typography>
              <Typography variant="body1">{orderDate}</Typography>
           </Grid>
           <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">User ID</Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{orderData.userId}</Typography>
           </Grid>
           <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Total</Typography>
              <Typography variant="body1">£{orderData.totalAmount.toFixed(2)}</Typography>
           </Grid>
           <Grid item xs={6} sm={3}>
             <Typography variant="body2" color="text.secondary" id="status-label">Status</Typography>
             <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
                <InputLabel id="status-select-label" sx={{ display: 'none' }}>Status</InputLabel> {/* Hide label, use Typography above */}
                <Select
                    labelId="status-select-label"
                    id="status-select"
                    value={orderData.status}
                    onChange={handleStatusChange}
                    disabled={isSavingStatus}
                    // label="Status" // Remove label prop if using external label
                >
                    {orderStatuses.map(status => (
                        <MenuItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </MenuItem>
                    ))}
                </Select>
                {isSavingStatus && <CircularProgress size={20} sx={{ position: 'absolute', top: '50%', right: 35, marginTop: '-10px' }}/>}
             </FormControl>
            {statusUpdateError && <Alert severity="error" sx={{ mt: 1 }}>{statusUpdateError}</Alert>}
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
                // Basic options display
                secondary={item.options && Object.keys(item.options).length > 0 ? `Options: ${JSON.stringify(item.options)}` : null} 
              />
              <Typography variant="body1">£{(item.price * item.quantity).toFixed(2)}</Typography>
            </ListItem>
          ))}
        </List>

        {/* Totals Summary */}
         <Box sx={{ mt: 2, pl: { xs: 0, sm: 2 } }}>
           <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Typography sx={{ mr: 4 }}>Subtotal:</Typography>
              {/* Calculate if needed: (orderData.totalAmount - orderData.shippingCost - VAT).toFixed(2) */}
              <Typography>£{(orderData.totalAmount - orderData.shippingCost).toFixed(2)} (ex. VAT)</Typography> 
           </Box>
           <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Typography sx={{ mr: 4 }}>Shipping:</Typography>
              <Typography>£{orderData.shippingCost.toFixed(2)}</Typography>
           </Box>
           {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Typography sx={{ mr: 4 }}>VAT (Est.):</Typography>
              <Typography>£{CalculateVATHere}</Typography>
           </Box> */}
           <Divider sx={{ my: 1 }} />
           <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="h6" sx={{ mr: 4 }}>Grand Total:</Typography>
              <Typography variant="h6">£{orderData.totalAmount.toFixed(2)}</Typography>
           </Box>
        </Box>

      </Paper>
    </Container>
  );
};

export default AdminOrderDetailsPage;

