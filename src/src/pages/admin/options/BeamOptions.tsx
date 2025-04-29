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
interface DimensionOption {
  value: number;
  label: string;
}

interface FinishOption {
  value: string;
  label: string;
  priceModifierPerMeter: number;
}

interface ProfileOption {
  value: string;
  label: string;
  priceModifier: number;
}

interface BeamOptionsProps {
  productOptions: any;
  onChange: (newOptions: any) => void;
}

const BeamOptions: React.FC<BeamOptionsProps> = ({ productOptions, onChange }) => {
  // Initialize state with default empty arrays if not present
  const [widths, setWidths] = useState<DimensionOption[]>(
    productOptions.availableWidths || []
  );
  const [thicknesses, setThicknesses] = useState<DimensionOption[]>(
    productOptions.availableThicknesses || []
  );
  const [finishes, setFinishes] = useState<FinishOption[]>(
    productOptions.availableFinishes || []
  );
  const [profiles, setProfiles] = useState<ProfileOption[]>(
    productOptions.availableProfiles || []
  );

  // Update parent component whenever our local state changes
  useEffect(() => {
    onChange({
      availableWidths: widths,
      availableThicknesses: thicknesses,
      availableFinishes: finishes,
      availableProfiles: profiles
    });
  }, [widths, thicknesses, finishes, profiles, onChange]);

  // --- Width Options Handlers ---
  const handleWidthChange = (index: number, field: keyof DimensionOption, value: string) => {
    const newWidths = [...widths];
    
    if (field === 'value') {
      // Convert string to number for value
      const numValue = parseInt(value, 10);
      newWidths[index][field] = isNaN(numValue) ? 0 : numValue;
    } else {
      // For string fields (label)
      newWidths[index][field] = value;
    }
    
    setWidths(newWidths);
  };

  const handleAddWidth = () => {
    setWidths([...widths, { value: 0, label: '' }]);
  };

  const handleDeleteWidth = (index: number) => {
    const newWidths = widths.filter((_, i) => i !== index);
    setWidths(newWidths);
  };

  // --- Thickness Options Handlers ---
  const handleThicknessChange = (index: number, field: keyof DimensionOption, value: string) => {
    const newThicknesses = [...thicknesses];
    
    if (field === 'value') {
      // Convert string to number for value
      const numValue = parseInt(value, 10);
      newThicknesses[index][field] = isNaN(numValue) ? 0 : numValue;
    } else {
      // For string fields (label)
      newThicknesses[index][field] = value;
    }
    
    setThicknesses(newThicknesses);
  };

  const handleAddThickness = () => {
    setThicknesses([...thicknesses, { value: 0, label: '' }]);
  };

  const handleDeleteThickness = (index: number) => {
    const newThicknesses = thicknesses.filter((_, i) => i !== index);
    setThicknesses(newThicknesses);
  };

  // --- Finish Options Handlers ---
  const handleFinishChange = (index: number, field: keyof FinishOption, value: string) => {
    const newFinishes = [...finishes];
    
    if (field === 'priceModifierPerMeter') {
      // Convert string to number for price
      const numValue = parseFloat(value);
      newFinishes[index][field] = isNaN(numValue) ? 0 : numValue;
    } else {
      // For string fields (value, label)
      newFinishes[index][field] = value;
    }
    
    setFinishes(newFinishes);
  };

  const handleAddFinish = () => {
    setFinishes([...finishes, { value: '', label: '', priceModifierPerMeter: 0 }]);
  };

  const handleDeleteFinish = (index: number) => {
    const newFinishes = finishes.filter((_, i) => i !== index);
    setFinishes(newFinishes);
  };

  // --- Profile Options Handlers ---
  const handleProfileChange = (index: number, field: keyof ProfileOption, value: string) => {
    const newProfiles = [...profiles];
    
    if (field === 'priceModifier') {
      // Convert string to number for price
      const numValue = parseFloat(value);
      newProfiles[index][field] = isNaN(numValue) ? 0 : numValue;
    } else {
      // For string fields (value, label)
      newProfiles[index][field] = value;
    }
    
    setProfiles(newProfiles);
  };

  const handleAddProfile = () => {
    setProfiles([...profiles, { value: '', label: '', priceModifier: 0 }]);
  };

  const handleDeleteProfile = (index: number) => {
    const newProfiles = profiles.filter((_, i) => i !== index);
    setProfiles(newProfiles);
  };

