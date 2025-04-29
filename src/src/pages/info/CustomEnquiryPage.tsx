import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Alert, 
  Box, 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SendIcon from '@mui/icons-material/Send';
import { createDocument, uploadFile, EnquiryData } from '../../services/firebase'; // Adjust path if needed
import { v4 as uuidv4 } from 'uuid'; // For unique file paths

// Define the structure for form state, extending EnquiryData fields
interface CustomEnquiryFormData {
    name: string;
    email: string;
    phone: string;
    projectType: string; // Could use EnquiryData['productCategory'] | 'other' | ''
    dimensions: string;
    postcode: string;
    message: string;
}

const initialFormData: CustomEnquiryFormData = {
    name: '',
    email: '',
    phone: '',
    projectType: '',
    dimensions: '',
    postcode: '',
    message: '',
};

// Define project types for the dropdown
const projectTypes = ['garage', 'gazebo', 'porch', 'beam', 'flooring', 'other'];


const CustomEnquiryPage: React.FC = () => {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Custom Project Enquiry
      </Typography>
       <Typography variant="body1" paragraph>
          Have a unique project in mind? Use the form below to provide details about your custom requirements. 
          We can discuss bespoke designs, sizes, or features not covered by our standard configurators. 
          Please provide as much detail as possible, and optionally attach any relevant drawings or plans.
       </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
              {/* Standard Fields */}
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="name" label="Your Name" name="name" value={formData.name} onChange={handleInputChange} disabled={isSending} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="email" label="Your Email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={isSending} />
              </Grid>
              <Grid item xs={12} sm={6}>
                 <TextField fullWidth id="phone" label="Your Phone (Optional)" name="phone" value={formData.phone} onChange={handleInputChange} disabled={isSending} />
              </Grid>
               <Grid item xs={12} sm={6}>
                 <TextField required fullWidth id="postcode" label="Project Postcode" name="postcode" value={formData.postcode} onChange={handleInputChange} disabled={isSending} helperText="Helps us estimate delivery costs."/>
              </Grid>

              {/* Custom Fields */}
               <Grid item xs={12} sm={6}>
                 <FormControl fullWidth required disabled={isSending}>
                    <InputLabel id="projectType-label">Project Type</InputLabel>
                    <Select
                        labelId="projectType-label"
                        id="projectType"
                        name="projectType"
                        value={formData.projectType}
                        label="Project Type"
                        onChange={handleSelectChange}
                    >
                        <MenuItem value="" disabled><em>Select Type...</em></MenuItem>
                        {projectTypes.map(type => (
                            <MenuItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                 </FormControl>
               </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth id="dimensions" label="Approx. Dimensions (if known)" name="dimensions" value={formData.dimensions} onChange={handleInputChange} disabled={isSending} helperText="E.g., Length x Width x Height"/>
               </Grid>
               
              {/* Message */}
              <Grid item xs={12}>
                <TextField required fullWidth id="message" label="Project Details / Message" name="message" multiline rows={6} value={formData.message} onChange={handleInputChange} disabled={isSending} />
              </Grid>
              
              {/* File Upload */}
              <Grid item xs={12}>
                 <Button
                    variant="outlined"
                    component="label" // Makes the button act like a label for the hidden input
                    startIcon={<UploadFileIcon />}
                    disabled={isSending}
                 >
                    Upload Drawing/Plan (Optional)
                    <input
                       type="file"
                       hidden
                       onChange={handleFileChange}
                       accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" // Specify acceptable file types
                    />
                 </Button>
                 {file && <Typography variant="body2" component="span" sx={{ ml: 2 }}>Selected: {file.name}</Typography>}
              </Grid>

          </Grid>

          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mt: 3 }}>{successMessage}</Alert>}
          
          <Button
            type="submit"
            variant="contained"
            disabled={isSending}
            startIcon={isSending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            sx={{ mt: 3 }}
          >
            Submit Enquiry
          </Button>
        </Box>
      </Paper>
    </Container>
  );
  const [formData, setFormData] = useState<CustomEnquiryFormData>(initialFormData);
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); setSuccessMessage(null); // Clear messages
  };
  
   const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
     setError(null); setSuccessMessage(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      // Basic size check (e.g., 5MB limit)
      if (event.target.files[0].size > 5 * 1024 * 1024) {
           setError("File size cannot exceed 5MB.");
           setFile(null); // Clear selection
           event.target.value = ''; // Reset input field
           return;
       }
      setFile(event.target.files[0]);
      setError(null); setSuccessMessage(null);
    } else {
        setFile(null);
    }
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.name || !formData.email || !formData.message || !formData.projectType || !formData.postcode) {
      setError("Please fill in all required fields (Name, Email, Postcode, Project Type, Message).");
      return;
    }
     // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address.");
        return;
    }


    setIsSending(true);
    let fileURL: string | undefined = undefined;

    try {
      // 1. Upload file if it exists
      if (file) {
        const uniqueFileName = `${uuidv4()}-${file.name}`;
        const filePath = `enquiry_attachments/${uniqueFileName}`;
        try {
           fileURL = await uploadFile(filePath, file);
        } catch (uploadError) {
             console.error("Error uploading file:", uploadError);
             throw new Error("Failed to upload attachment. Please try again."); // Throw to be caught below
        }
      }

      // 2. Prepare data for Firestore (assuming EnquiryData can handle these fields)
      // Use a specific type that matches the expected Firestore structure
      const enquiryData: Omit<EnquiryData, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        message: formData.message,
        status: 'new',
        // Custom fields - ensure EnquiryData interface supports these or adjust
        productCategory: formData.projectType === 'other' ? undefined : (formData.projectType as EnquiryData['productCategory']), // Map if type matches
        projectType: formData.projectType, // Store the selected type directly too
        dimensions: formData.dimensions || undefined,
        postcode: formData.postcode || undefined,
        attachmentURL: fileURL, 
      };

      // 3. Save enquiry to Firestore
      await createDocument('enquiries', enquiryData);

      // 4. Success handling
      setSuccessMessage("Your enquiry has been submitted successfully! We'll review the details and get back to you.");
      setFormData(initialFormData); // Clear form
      setFile(null); // Clear file input

    } catch (err: any) {
      console.error("Error submitting custom enquiry:", err);
      // Use the error message from file upload if it exists, otherwise a generic one
      setError(err.message || "Failed to submit enquiry. Please try again later.");
    } finally {
      setIsSending(false);
    }
  };


  return ( // ... rest of the return statement from previous thought block
      <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Custom Project Enquiry
      </Typography>
       <Typography variant="body1" paragraph>
          Have a unique project in mind? Use the form below to provide details about your custom requirements. 
          We can discuss bespoke designs, sizes, or features not covered by our standard configurators. 
          Please provide as much detail as possible, and optionally attach any relevant drawings or plans.
       </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
              {/* Standard Fields */}
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="name" label="Your Name" name="name" value={formData.name} onChange={handleInputChange} disabled={isSending} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="email" label="Your Email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={isSending} />
              </Grid>
              <Grid item xs={12} sm={6}>
                 <TextField fullWidth id="phone" label="Your Phone (Optional)" name="phone" value={formData.phone} onChange={handleInputChange} disabled={isSending} />
              </Grid>
               <Grid item xs={12} sm={6}>
                 <TextField required fullWidth id="postcode" label="Project Postcode" name="postcode" value={formData.postcode} onChange={handleInputChange} disabled={isSending} helperText="Helps us estimate delivery costs."/>
              </Grid>

              {/* Custom Fields */}
               <Grid item xs={12} sm={6}>
                 <FormControl fullWidth required disabled={isSending}>
                    <InputLabel id="projectType-label">Project Type</InputLabel>
                    <Select
                        labelId="projectType-label"
                        id="projectType"
                        name="projectType"
                        value={formData.projectType}
                        label="Project Type"
                        onChange={handleSelectChange}
                    >
                        <MenuItem value="" disabled><em>Select Type...</em></MenuItem>
                        {projectTypes.map(type => (
                            <MenuItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                 </FormControl>
               </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth id="dimensions" label="Approx. Dimensions (if known)" name="dimensions" value={formData.dimensions} onChange={handleInputChange} disabled={isSending} helperText="E.g., Length x Width x Height"/>
               </Grid>
               
              {/* Message */}
              <Grid item xs={12}>
                <TextField required fullWidth id="message" label="Project Details / Message" name="message" multiline rows={6} value={formData.message} onChange={handleInputChange} disabled={isSending} />
              </Grid>
              
              {/* File Upload */}
              <Grid item xs={12}>
                 <Button
                    variant="outlined"
                    component="label" // Makes the button act like a label for the hidden input
                    startIcon={<UploadFileIcon />}
                    disabled={isSending}
                 >
                    Upload Drawing/Plan (Optional, Max 5MB)
                    <input
                       type="file"
                       hidden
                       onChange={handleFileChange}
                       accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" // Specify acceptable file types
                    />
                 </Button>
                 {file && <Typography variant="body2" component="span" sx={{ ml: 2, fontStyle: 'italic' }}>Selected: {file.name}</Typography>}
              </Grid>

          </Grid>

          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mt: 3 }}>{successMessage}</Alert>}
          
          <Button
            type="submit"
            variant="contained"
            disabled={isSending}
            startIcon={isSending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            sx={{ mt: 3 }}
          >
            Submit Enquiry
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CustomEnquiryPage;

