import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Typography, 
  Box, 
  CircularProgress,
  Alert,
  Divider,
  useTheme
} from '@mui/material';
import { 
  CheckCircleOutline as SuccessIcon, 
  ErrorOutline as ErrorIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  hidePostcodeCheckModal, 
  checkPostcodeDelivery, 
  clearPostcodeResult 
} from '../../store/slices/appSlice';
import { Link as RouterLink } from 'react-router-dom';

const PostcodeCheck: React.FC = () => {
  const [postcode, setPostcode] = useState('');
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const { 
    showPostcodeCheck, 
    loading, 
    postcodeDeliveryResult 
  } = useSelector((state: RootState) => state.app);
  
  const handleClose = () => {
    dispatch(hidePostcodeCheckModal());
    
    // Clear the result after closing to reset for next time
    setTimeout(() => {
      dispatch(clearPostcodeResult());
      setPostcode('');
    }, 300);
  };
  
  const handleCheck = () => {
    if (postcode.trim()) {
      dispatch(checkPostcodeDelivery(postcode.trim()));
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };
  
  return (
    <Dialog 
      open={showPostcodeCheck} 
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="postcode-check-dialog-title"
    >
      <DialogTitle id="postcode-check-dialog-title" sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ShippingIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          Check Delivery Availability
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Please enter your postcode to check if we deliver to your location. We currently deliver to Mainland England and Wales.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
          <TextField
            autoFocus
            label="Postcode"
            variant="outlined"
            fullWidth
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., AB12 3CD"
            disabled={loading}
            sx={{ mr: 2 }}
          />
          <Button 
            onClick={handleCheck} 
            variant="contained" 
            disabled={!postcode.trim() || loading}
          >
            {loading ? 'Checking...' : 'Check'}
          </Button>
        </Box>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={40} />
          </Box>
        )}
        
        {postcodeDeliveryResult && !loading && (
          <Box sx={{ mt: 2 }}>
            {postcodeDeliveryResult.isDeliverable ? (
              <Alert 
                icon={<SuccessIcon fontSize="inherit" />} 
                severity="success"
                sx={{ mb: 2 }}
              >
                {postcodeDeliveryResult.message}
              </Alert>
            ) : (
              <>
                <Alert 
                  icon={<ErrorIcon fontSize="inherit" />} 
                  severity="error"
                  sx={{ mb: 2 }}
                >
                  {postcodeDeliveryResult.message}
                </Alert>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  If you would like to discuss alternative arrangements, please use our{' '}
                  <Button 
                    component={RouterLink} 
                    to="/custom-enquiry" 
                    variant="text" 
                    onClick={handleClose}
                    sx={{ p: 0, verticalAlign: 'baseline', minWidth: 'auto' }}
                  >
                    Custom Enquiry
                  </Button>{' '}
                  form or call us directly.
                </Typography>
              </>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          Close
        </Button>
        {postcodeDeliveryResult?.isDeliverable && (
          <Button 
            component={RouterLink} 
            to="/products" 
            variant="contained" 
            color="primary"
            onClick={handleClose}
          >
            Shop Now
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PostcodeCheck;

