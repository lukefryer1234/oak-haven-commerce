import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, IconButton, Button, Divider, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// Define interfaces
interface SizeOption {
  value: string;
  label: string;
}

interface RoofOption {
  value: string;
  label: string;
  priceModifierFactor: number;
}

interface PanelOption {
  value: string;
  label: string;
  priceModifierPerSide: number;
}

interface GazeboOptionsProps {
  productOptions: any;
  onChange: (newOptions: any) => void;
}

const GazeboOptions: React.FC<GazeboOptionsProps> = ({ productOptions, onChange }) => {
  // Initialize state
  const [sizes, setSizes] = useState<SizeOption[]>(
    productOptions.availableSizes || []
  );
  const [roofs, setRoofs] = useState<RoofOption[]>(
    productOptions.availableRoofs || []
  );
  const [panels, setPanels] = useState<PanelOption[]>(
    productOptions.availablePanels || []
  );

  // Update parent component when state changes
  useEffect(() => {
    onChange({
      availableSizes: sizes,
      availableRoofs: roofs,
      availablePanels: panels
    });
  }, [sizes, roofs, panels, onChange]);

  // --- Size Options Handlers ---
  const handleSizeChange = (index: number, field: keyof SizeOption, value: string) => {
    const newSizes = [...sizes];
    newSizes[index][field] = value;
    setSizes(newSizes);
  };

  const handleAddSize = () => {
    setSizes([...sizes, { value: '', label: '' }]);
  };

  const handleDeleteSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  // --- Roof Options Handlers ---
  const handleRoofChange = (index: number, field: keyof RoofOption, value: string) => {
    const newRoofs = [...roofs];
    
    if (field === 'priceModifierFactor') {
      const numValue = parseFloat(value);
      newRoofs[index][field] = isNaN(numValue) ? 1.0 : numValue;
    } else {
      newRoofs[index][field] = value;
    }
    
    setRoofs(newRoofs);
  };

  const handleAddRoof = () => {
    setRoofs([...roofs, { value: '', label: '', priceModifierFactor: 1.0 }]);
  };

  const handleDeleteRoof = (index: number) => {
    setRoofs(roofs.filter((_, i) => i !== index));
  };

  // --- Panel Options Handlers ---
  const handlePanelChange = (index: number, field: keyof PanelOption, value: string) => {
    const newPanels = [...panels];
    
    if (field === 'priceModifierPerSide') {
      const numValue = parseFloat(value);
      newPanels[index][field] = isNaN(numValue) ? 0 : numValue;
    } else {
      newPanels[index][field] = value;
    }
    
    setPanels(newPanels);
  };

  const handleAddPanel = () => {
    setPanels([...panels, { value: '', label: '', priceModifierPerSide: 0 }]);
  };

  const handleDeletePanel = (index: number) => {
    setPanels(panels.filter((_, i) => i !== index));
  };

  return (
    <Box>
      {/* Size Options */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Available Sizes</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These sizes will appear in the gazebo configurator.
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Value (internal ID)</TableCell>
                <TableCell>Label (displayed to user)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sizes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">No sizes defined.</TableCell>
                </TableRow>
              ) : (
                sizes.map((size, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={size.value}
                        onChange={(e) => handleSizeChange(index, 'value', e.target.value)}
                        placeholder="e.g., 3x3"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={size.label}
                        onChange={(e) => handleSizeChange(index, 'label', e.target.value)}
                        placeholder="e.g., 3m x 3m"
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
        <Typography variant="h6" gutterBottom>Available Roof Types</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These roof options will appear in the gazebo configurator. Each roof type has a price multiplier.
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
                  <TableCell colSpan={4} align="center">No roof types defined.</TableCell>
                </TableRow>
              ) : (
                roofs.map((roof, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={roof.value}
                        onChange={(e) => handleRoofChange(index, 'value', e.target.value)}
                        placeholder="e.g., hip"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={roof.label}
                        onChange={(e) => handleRoofChange(index, 'label', e.target.value)}
                        placeholder="e.g., Hip Roof"
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
      
      <Divider sx={{ my: 4 }} />
      
      {/* Panel Options */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Available Panel Types</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These panel options will appear in the gazebo configurator. Each panel type has a price per side.
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Value (internal ID)</TableCell>
                <TableCell>Label (displayed to user)</TableCell>
                <TableCell>Price (£ per side)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {panels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No panel types defined.</TableCell>
                </TableRow>
              ) : (
                panels.map((panel, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={panel.value}
                        onChange={(e) => handlePanelChange(index, 'value', e.target.value)}
                        placeholder="e.g., half"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={panel.label}
                        onChange={(e) => handlePanelChange(index, 'label', e.target.value)}
                        placeholder="e.g., Half-Height Panels"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        InputProps={{
                          inputProps: { step: "10", min: "0" }
                        }}
                        value={panel.priceModifierPerSide}
                        onChange={(e) => handlePanelChange(index, 'priceModifierPerSide', e.target.value)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeletePanel(index)}
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
          onClick={handleAddPanel}
          variant="outlined"
          size="small"
        >
          Add Panel Type
        </Button>
      </Box>
      
      <Alert severity="info" sx={{ mt: 4 }}>
        Changes will not be saved until you click the "Save Options" button at the top of the page.
      </Alert>
    </Box>
  );
};

export default GazeboOptions;

