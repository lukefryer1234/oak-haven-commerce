import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Button, 
  TextField, 
  Divider, 
  Grid, 
  Paper,
  Avatar,
  ListItemAvatar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  removeItem, 
  updateItemQuantity, 
  selectCartItems, 
  selectCartTotals,
  CartItem // Import CartItem type for formatting options
} from '../../store/slices/cartSlice'; // Adjust path if needed

// Helper to format options nicely
const formatOptions = (options?: Record<string, any>): string => {
  if (!options) return '';
  return Object.entries(options)
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
    .join(', ');
};

const CartPage: React.FC = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const { subtotal, vatAmount, shippingCost, total } = useSelector(selectCartTotals);

  const handleRemoveItem = (id: string) => {
    dispatch(removeItem(id));
  };

  const handleQuantityChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(event.target.value, 10);
    if (!isNaN(quantity) && quantity >= 0) { // Allow 0 temporarily, updateItemQuantity handles removal
      dispatch(updateItemQuantity({ id, quantity }));
    }
  };

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
        <Button component={Link} to="/products" variant="contained">
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, mt: 2 }}>
      <Typography variant="h4" gutterBottom>Shopping Cart</Typography>
      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <List>
            {items.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    {/* Use item.image or a placeholder */}
                    <Avatar variant="square" src={item.image || '/placeholder.png'} alt={item.name} sx={{ width: 60, height: 60, mr: 2 }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.name}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          Options: {formatOptions(item.options) || 'Standard'}
                        </Typography>
                        <br />
                        Price: £{item.unitPrice.toFixed(2)}
                      </React.Fragment>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <TextField
                      type="number"
                      label="Qty"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e as React.ChangeEvent<HTMLInputElement>)}
                      InputProps={{ inputProps: { min: 1, style: { textAlign: 'center' } } }}
                      size="small"
                      sx={{ width: '70px', mx: 1 }}
                    />
                     <Typography variant="body1" sx={{ minWidth: '80px', textAlign: 'right', mr: 1 }}>
                      £{(item.unitPrice * item.quantity).toFixed(2)}
                    </Typography>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveItem(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        </Grid>

        {/* Cart Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal</Typography>
              <Typography>£{subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>VAT (20%)</Typography> 
              <Typography>£{vatAmount.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Shipping</Typography>
              <Typography>£{shippingCost.toFixed(2)}</Typography> 
              {/* TODO: Add note about shipping calculation if needed */}
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">£{total.toFixed(2)}</Typography>
            </Box>
            <Button 
              component={Link} 
              to="/checkout" 
              variant="contained" 
              color="primary" 
              fullWidth
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CartPage;

