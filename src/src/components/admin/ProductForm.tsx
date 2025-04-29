import React, { useState, useEffect } from 'react';
import { 
  ProductData, 
  // Assuming ProductCategories is an enum or type defined elsewhere, like in types.ts or firebase.ts
  // If not, define categories array here
} from '../../services/firebase'; // Adjust path if needed
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Typography,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

// Define categories - ensure this matches the ProductData type/enum
const categories = ['garage', 'gazebo', 'porch', 'beam', 'flooring'];

// Define the structure for form data state
interface ProductFormData {
  name: string;
  category: 'garage' | 'gazebo' | 'porch' | 'beam' | 'flooring' | ''; // Allow empty initial state
  description: string;
  images: string; // Comma-separated URLs for simplicity
  options: string; // JSON string for simplicity
}

// Define props for the component
interface Props {
  initialData?: Partial<ProductData>;
  onSubmit: (productData: Omit<ProductData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isSaving: boolean;
  submitButtonText?: string;
  onCancel?: () => void; // Optional cancel handler
}

const ProductForm: React.FC<Props> = ({ 
  initialData, 
  onSubmit, 
  isSaving, 
  submitButtonText = "Save Product",
  onCancel
}) => {

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    description: '',
    images: '',
    options: '{}', // Default to empty JSON object string
  });

  // Effect to populate form when initialData is provided (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        description: initialData.description || '',
        images: (initialData.images || []).join(', '), // Join array to comma-separated string
        // Stringify options object, handle potential errors or undefined
        options: initialData.options ? JSON.stringify(initialData.options, null, 2) : '{}', 
      });
    } else {
       // Reset form if initialData becomes null/undefined (e.g., switching from edit to add)
        setFormData({
             name: '', category: '', description: '', images: '', options: '{}'
        });
    }
  }, [initialData]);

  // Handle input changes for TextFields
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle change for Select component
   const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
     setFormData(prev => ({ 
       ...prev, 
       [name]: value as ProductFormData['category'] // Cast value to category type
     }));
  };

  // Handle form submission
  const handleSubmitInternal = async (event: React.FormEvent) => {
    event.preventDefault();

    // Basic validation
    if (!formData.name || !formData.category) {
        alert("Product Name and Category are required."); // Replace with better error handling
        return;
    }

    let parsedOptions = {};
    try {
      parsedOptions = formData.options ? JSON.parse(formData.options) : {};
    } catch (e) {
      alert("Options field contains invalid JSON."); // Replace with better error handling
      return;
    }

    const productDataToSubmit: Omit<ProductData, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      category: formData.category, // Already correct type from state/select handler
      description: formData.description,
      // Split comma-separated string into array, trim whitespace
      images: formData.images.split(',').map(url => url.trim()).filter(url => url), 
      options: parsedOptions,
    };
    
    await onSubmit(productDataToSubmit);
  };

  return (
    <Box component="form" onSubmit={handleSubmitInternal} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="name"
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={isSaving}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required disabled={isSaving}>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              id="category"
              name="category"
              value={formData.category}
              label="Category"
              onChange={handleSelectChange}
            >
              <MenuItem value="" disabled><em>Select Category...</em></MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)} {/* Capitalize */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="description"
            label="Description"
            name="description"
            multiline
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            disabled={isSaving}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="images"
            label="Image URLs (comma-separated)"
            name="images"
            value={formData.images}
            onChange={handleInputChange}
            disabled={isSaving}
            helperText="Enter full URLs separated by commas."
          />
        </Grid>
         <Grid item xs={12}>
           <TextField
            fullWidth
            id="options"
            label="Options (JSON format)"
            name="options"
            multiline
            rows={6}
            value={formData.options}
            onChange={handleInputChange}
            disabled={isSaving}
            helperText='Enter product options as a valid JSON object. E.g., {"basePrice": 5000, "sizes": ["3x4", "4x5"]}'
            InputProps={{ 
                sx: { fontFamily: 'monospace' } // Use monospace font for JSON
            }}
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
        >
          {submitButtonText}
        </Button>
        {onCancel && (
             <Button 
                variant="outlined" 
                onClick={onCancel} 
                disabled={isSaving}
             >
                Cancel
             </Button>
        )}
      </Box>
    </Box>
  );
};

export default ProductForm;

