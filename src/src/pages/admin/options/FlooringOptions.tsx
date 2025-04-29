import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, IconButton, Button, Divider, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// Define interfaces
interface ThicknessOption {
  value: string; 
  label: string;
}

interface GradeOption {
  value: string;
  label: string;
  priceModifierFactor: number;
}

interface FinishOption {
  value: string;
  label: string;
  priceModifierPerSqM: number;
}

interface FlooringOptionsProps {
  productOptions: any;
  onChange: (newOptions: any) => void;
}

const FlooringOptions: React.FC<FlooringOptionsProps> = ({ productOptions, onChange }) => {
  // Initialize state
  const [thicknesses, setThicknesses] = useState<ThicknessOption[]>(
    productOptions.availableThicknesses || []
  );
  const [grades, setGrades] = useState<GradeOption[]>(
    productOptions.availableGrades || []
  );
  const [finishes, setFinishes] = useState<FinishOption[]>(
    productOptions.availableFinishes || []
  );

  // Update parent component when state changes
  useEffect(() => {
    onChange({
      availableThicknesses: thicknesses,
      availableGrades: grades,
      availableFinishes: finishes
    });
  }, [thicknesses, grades, finishes, onChange]);

  // Handlers for thickness options
  const handleThicknessChange = (index: number, field: keyof ThicknessOption, value: string) => {
    const newThicknesses = [...thicknesses];
    newThicknesses[index][field] = value;
    setThicknesses(newThicknesses);
  };

  const handleAddThickness = () => {
    setThicknesses([...thicknesses, { value: '', label: '' }]);
  };

  const handleDeleteThickness = (index: number) => {
    setThicknesses(thicknesses.filter((_, i) => i !== index));
  };

  // Handlers for grade options
  const handleGradeChange = (index: number, field: keyof GradeOption, value: string) => {
    const newGrades = [...grades];
    
    if (field === 'priceModifierFactor') {
      const numValue = parseFloat(value);
      newGrades[index][field] = isNaN(numValue) ? 1.0 : numValue;
    } else {
      newGrades[index][field] = value;
    }
    
    setGrades(newGrades);
  };

  const handleAddGrade = () => {
    setGrades([...grades, { value: '', label: '', priceModifierFactor: 1.0 }]);
  };

  const handleDeleteGrade = (index: number) => {
    setGrades(grades.filter((_, i) => i !== index));
  };

  // Handlers for finish options
  const handleFinishChange = (index: number, field: keyof FinishOption, value: string) => {
    const newFinishes = [...finishes];
    
    if (field === 'priceModifierPerSqM') {
      const numValue = parseFloat(value);
      newFinishes[index][field] = isNaN(numValue) ? 0 : numValue;
    } else {
      newFinishes[index][field] = value;
    }
    
    setFinishes(newFinishes);
  };

  const handleAddFinish = () => {
    setFinishes([...finishes, { value: '', label: '', priceModifierPerSqM: 0 }]);
  };

  const handleDeleteFinish = (index: number) => {
    setFinishes(finishes.filter((_, i) => i !== index));
  };

  return (
    <Box>
      {/* Thickness Options */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Available Thicknesses</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These thicknesses will appear in the flooring configurator.
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
              {thicknesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">No thicknesses defined.</TableCell>
                </TableRow>
              ) : (
                thicknesses.map((thickness, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={thickness.value}
                        onChange={(e) => handleThicknessChange(index, 'value', e.target.value)}
                        placeholder="e.g., 14"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={thickness.label}
                        onChange={(e) => handleThicknessChange(index, 'label', e.target.value)}
                        placeholder="e.g., 14mm"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteThickness(index)}
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
          onClick={handleAddThickness}
          variant="outlined"
          size="small"
        >
          Add Thickness
        </Button>
      </Box>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Grade Options */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Available Grades</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These grades will appear in the flooring configurator. Each grade has a price factor multiplier.
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
              {grades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No grades defined.</TableCell>
                </TableRow>
              ) : (
                grades.map((grade, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={grade.value}
                        onChange={(e) => handleGradeChange(index, 'value', e.target.value)}
                        placeholder="e.g., prime"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={grade.label}
                        onChange={(e) => handleGradeChange(index, 'label', e.target.value)}
                        placeholder="e.g., Prime Grade"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        InputProps={{
                          inputProps: { step: "0.1", min: "0.1" }
                        }}
                        value={grade.priceModifierFactor}
                        onChange={(e) => handleGradeChange(index, 'priceModifierFactor', e.target.value)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteGrade(index)}
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
          onClick={handleAddGrade}
          variant="outlined"
          size="small"
        >
          Add Grade
        </Button>
      </Box>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Finish Options */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Available Finishes</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These finishes will appear in the flooring configurator. Each finish has a price modifier per square meter.
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Value (internal ID)</TableCell>
                <TableCell>Label (displayed to user)</TableCell>
                <TableCell>Price Modifier (£/m²)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {finishes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No finishes defined.</TableCell>
                </TableRow>
              ) : (
                finishes.map((finish, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={finish.value}
                        onChange={(e) => handleFinishChange(index, 'value', e.target.value)}
                        placeholder="e.g., unfinished"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={finish.label}
                        onChange={(e) => handleFinishChange(index, 'label', e.target.value)}
                        placeholder="e.g., Unfinished"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        InputProps={{
                          inputProps: { step: "0.5", min: "0" }
                        }}
                        value={finish.priceModifierPerSqM}
                        onChange={(e) => handleFinishChange(index, 'priceModifierPerSqM', e.target.value)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteFinish(index)}
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
          onClick={handleAddFinish}
          variant="outlined"
          size="small"
        >
          Add Finish
        </Button>
      </Box>
      
      <Alert severity="info" sx={{ mt: 4 }}>
        Changes will not be saved until you click the "Save Options" button at the top of the page.
      </Alert>
    </Box>
  );
};

export default FlooringOptions;

