import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store'; // Adjust path if needed
import { createDocument, EnquiryData } from '../../services/firebase'; // Adjust path if needed
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert, 
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    message: string;
}

const initialFormData: ContactFormData = {
    name: '',
    email: '',
    phone: '',
    message: '',
};

const ContactPage: React.FC = () => {
  const companyInfo = useSelector((state: RootState) => state.app.companyInfo);
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
     // Clear messages on input change
     setError(null);
     setSuccessMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in your name, email, and message.");
      return;
    }
    
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address.");
        return;
    }


    setIsSending(true);

    const enquiryData: Omit<EnquiryData, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined, // Store as undefined if empty
      message: formData.message,
      status: 'new',
      // productCategory is not included in this general form
    };

    try {
      await createDocument('enquiries', enquiryData);
      setSuccessMessage("Your message has been sent successfully! We'll get back to you soon.");
      setFormData(initialFormData); // Clear form on success
    } catch (err) {
      console.error("Error sending enquiry:", err);
      setError("Failed to send message. Please try again later or contact us directly.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Contact Us
      </Typography>
      <Grid container spacing={4}>
        {/* Contact Information */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Get in Touch</Typography>
            <List>
               <ListItem disablePadding>
                  <ListItemIcon><LocationOnIcon /></ListItemIcon>
                  <ListItemText primary={companyInfo.address || 'Address not available'} />
               </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon><PhoneIcon /></ListItemIcon>
                  <ListItemText primary={companyInfo.phone || 'Phone not available'} />
               </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon><EmailIcon /></ListItemIcon>
                  <ListItemText primary={companyInfo.email || 'Email not available'} />
               </ListItem>
            </List>
             <Box sx={{mt: 3}}>
                <Typography variant="subtitle2" gutterBottom>Opening Hours:</Typography>
                 <Typography variant="body2">Mon - Fri: 9:00 AM - 5:00 PM</Typography>
                 <Typography variant="body2">Sat - Sun: Closed</Typography>
                 {/* TODO: Add map embed */}
             </Box>
          </Paper>
        </Grid>

        {/* Contact Form */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Send us a Message</Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="name"
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isSending}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Your Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isSending}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="phone"
                    label="Your Phone (Optional)"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isSending}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="message"
                    label="Your Message"
                    name="message"
                    multiline
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    disabled={isSending}
                  />
                </Grid>
              </Grid>
              
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
              
              <Button
                type="submit"
                variant="contained"
                disabled={isSending}
                startIcon={isSending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                sx={{ mt: 3 }}
              >
                Send Message
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactPage;

