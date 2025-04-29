import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  Timestamp // Import Timestamp type
} from 'firebase/firestore';
import { db, OrderData } from '../../services/firebase'; // Import db instance and OrderData type
import { RootState } from '../../store'; // Adjust path if needed
import { 
  Container, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button 
} from '@mui/material';

// Helper to format Firestore Timestamp or return 'N/A'
const formatDate = (timestamp: Timestamp | undefined): string => {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleDateString();
  }
  return 'N/A';
};

const OrderHistoryPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      // If user is not logged in, don't attempt to fetch orders
      // ProtectedRoute should prevent this, but added defensively
      setIsLoading(false);
      setOrders([]); 
      // setError("You must be logged in to view order history."); // Optional error
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      setOrders([]); // Clear previous orders

      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef, 
          where('userId', '==', user.uid), 
          orderBy('createdAt', 'desc') // Order by most recent first
        );
        
        const querySnapshot = await getDocs(q);
        // Ensure data includes the document ID
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id, // Include the document ID
          ...doc.data(),
        })) as OrderData[]; 

        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch order history. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();

  }, [user?.uid]); // Dependency on user ID

  if (isLoading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography>Loading order history...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Order History
      </Typography>
      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6">You haven't placed any orders yet.</Typography>
          <Button component={Link} to="/products" variant="contained" sx={{ mt: 2 }}>
            Start Shopping
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="order history table">
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    #{order.id.substring(0, 8)}... {/* Shorten ID for display */}
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell align="right">£{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell align="center">
                    <Button 
                      component={Link} 
                      to={`/account/orders/${order.id}`} 
                      size="small"
                      variant="outlined"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default OrderHistoryPage;

