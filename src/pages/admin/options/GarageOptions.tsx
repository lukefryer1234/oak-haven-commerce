import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Button,
  Divider,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// Define the option interfaces
interface SizeOption {
  value: string;
  label: string;
  priceModifier: number;
}

interface RoofOption {
  value: string;
  label: string;
  priceModifierFactor: number;
}

interface GarageOptionsProps {
  productOptions: any;
  onChange: (newOptions: any) => void;
}

const GarageOptions: React.FC<GarageOptionsProps> = ({ productOptions, onChange }) => {
  // Initialize state with default empty arrays if not present in product options
  const [sizes, setSizes] = useState<SizeOption[]>(
    productOptions.availableSizes || []
  );
  const [roofs, setRoofs] = useState<RoofOption[]>(
    productOptions.availableRoofs || []
  );
  const [isEditingRoofFactors, setIsEditingRoofFactors] = useState<boolean>(false);

  // Update parent component whenever our local state changes
  useEffect(() => {
    onChange({
      availableSizes: sizes,
      availableRoofs: roofs
    });
  }, [sizes, roofs, onChange]);

  // --- Size Options Handlers ---
  const handleSizeChange = (index: number, field: keyof SizeOption, value: string) => {
    const newSizes = [...sizes];
    
    if (field === 'priceModifier') {
      // Convert string to number for priceModifier
      const numValue = parseFloat(value);
      newSizes[index][field] = isNaN(numValue) ? 0 : numValue;
    } else {
      // For string fields (value, label)
      newSizes[index][field] = value;
    }
    
    setSizes(newSizes);
  };

  const handleAddSize = () => {
    setSizes([...sizes, { value: '', label: '', priceModifier: 0 }]);
  };

  const handleDeleteSize = (index: number) => {
    const newSizes = sizes.filter((_, i) => i !== index);
    setSizes(newSizes);
  };

  // --- Roof Options Handlers ---
  const handleRoofChange = (index: number, field: keyof RoofOption, value: string) => {
    const newRoofs = [...roofs];
    
    if (field === 'priceModifierFactor') {
      // Convert string to number for priceModifierFactor
      const numValue = parseFloat(value);
      newRoofs[index][field] = isNaN(numValue) ? 1.0 : numValue;
    } else {
      // For string fields (value, label)
      newRoofs[index][field] = value;
    }
    
    setRoofs(newRoofs);
  };

  const handleAddRoof = () => {
    setRoofs([...roofs, { value: '', label: '', priceModifierFactor: 1.0 }]);
  };

  const handleDeleteRoof = (index: number) => {
    const newRoofs = roofs.filter((_, i) => i !== index);
    setRoofs(newRoofs);
  };

  return (
    <Box>
      {/* Size Options */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Available Sizes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These sizes will appear in the garage configurator. Each size can have a different price modifier added to the base price.
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Value (internal ID)</TableCell>
                <TableCell>Label (displayed to user)</TableCell>
                <TableCell>Price Modifier (£)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sizes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No sizes defined. Add a size below.
                  </TableCell>
                </TableRow>
              ) : (
                sizes.map((size, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={size.value}
                        onChange={(e) => handleSizeChange(index, 'value', e.target.value)}
                        placeholder="e.g., 3x4"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={size.label}
                        onChange={(e) => handleSizeChange(index, 'label', e.target.value)}
                        placeholder="e.g., 3m x 4m"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        InputProps={{
                          inputProps: { step: "1" }
                        }}
                        value={size.priceModifier}
                        onChange={(e) => handleSizeChange(index, 'priceModifier', e.target.value)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteSize(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Button 
          startIcon={<AddIcon />} 
          onClick={handleAddSize}
          variant="outlined"
          size="small"
        >
          Add Size
        </Button>
      </Box>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Roof Options */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Available Roof Types
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These roof options will appear in the garage configurator. Each roof type uses a price factor multiplier applied to the base price.
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Value (internal ID)</TableCell>
                <TableCell>Label (displayed to user)</TableCell>
                <TableCell>Price Factor (multiplier)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roofs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No roof types defined. Add a roof type below.
                  </TableCell>
                </TableRow>
              ) : (
                roofs.map((roof, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={roof.value}
                        onChange={(e) => handleRoofChange(index, 'value', e.target.value)}
                        placeholder="e.g., apex"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={roof.label}
                        onChange={(e) => handleRoofChange(index, 'label', e.target.value)}
                        placeholder="e.g., Apex Roof"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        InputProps={{
                          inputProps: { step: "0.1", min: "0.1" }
                        }}
                        value={roof.priceModifierFactor}
                        onChange={(e) => handleRoofChange(index, 'priceModifierFactor', e.target.value)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteRoof(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Button 
          startIcon={<AddIcon />} 
          onClick={handleAddRoof}
          variant="outlined"
          size="small"
        >
          Add Roof Type
        </Button>
      </Box>
      
      <Alert severity="info" sx={{ mt: 4 }}>
        Changes to options will not be saved until you click the "Save Options" button at the top of the page.
      </Alert>
    </Box>
  );
};

export default GarageOptions;

