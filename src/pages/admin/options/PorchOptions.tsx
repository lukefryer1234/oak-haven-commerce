import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, IconButton, Button, Divider, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// Define interfaces
interface StyleOption {
  value: string;
  label: string;
}

interface RoofOption {
  value: string;
  label: string;
  priceModifierFactor: number;
}

interface PostOption {
  value: string;
  label: string;
  priceModifierPerPost: number;
}

interface TrussOption {
  value: string;
  label: string;
  priceModifier: number;
}

interface PorchOptionsProps {
  productOptions: any;
  onChange: (newOptions: any) => void;
}

const PorchOptions: React.FC<PorchOptionsProps> = ({ productOptions, onChange }) => {
  // Initialize state
  const [styles, setStyles] = useState<StyleOption[]>(
    productOptions.availableStyles || []
  );
  const [roofs, setRoofs] = useState<RoofOption[]>(
    productOptions.availableRoofs || []
  );
  const [posts, setPosts] = useState<PostOption[]>(
    productOptions.availablePosts || []
  );
  const [trusses, setTrusses] = useState<TrussOption[]>(
    productOptions.availableTrusses || []
  );

  // Update parent component when state changes
  useEffect(() => {
    onChange({
      availableStyles: styles,
      availableRoofs: roofs,
      availablePosts: posts,
      availableTrusses: trusses
    });
  }, [styles, roofs, posts, trusses, onChange]);

  // --- Style Options Handlers ---
  const handleStyleChange = (index: number, field: keyof StyleOption, value: string) => {
    const newStyles = [...styles];
    newStyles[index][field] = value;
    setStyles(newStyles);
  };

  const handleAddStyle = () => {
    setStyles([...styles, { value: '', label: '' }]);
  };

  const handleDeleteStyle = (index: number) => {
    setStyles(styles.filter((_, i) => i !== index));
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

  // --- Post Options Handlers ---
  const handlePostChange = (index: number, field: keyof PostOption, value: string) => {
    const newPosts = [...posts];
    
    if (field === 'priceModifierPerPost') {
      const numValue = parseFloat(value);
      newPosts[index][field] = isNaN(numValue) ? 0 : numValue;
    } else {
      newPosts[index][field] = value;
    }
    
    setPosts(newPosts);
  };

  const handleAddPost = () => {
    setPosts([...posts, { value: '', label: '', priceModifierPerPost: 0 }]);
  };

  const handleDeletePost = (index: number) => {
    setPosts(posts.filter((_, i) => i !== index));
  };

  // --- Truss Options Handlers ---
  const handleTrussChange = (index: number, field: keyof TrussOption, value: string) => {
    const newTrusses = [...trusses];
    
    if (field === 'priceModifier') {
      const numValue = parseFloat(value);
      newTrusses[index][field] = isNaN(numValue) ? 0 : numValue;
    } else {
      newTrusses[index][field] = value;
    }
    
    setTrusses(newTrusses);
  };

  const handleAddTruss = () => {
    setTrusses([...trusses, { value: '', label: '', priceModifier: 0 }]);
  };

  const handleDeleteTruss = (index: number) => {
    setTrusses(trusses.filter((_, i) => i !== index));
  };

  return (
    <Box>
      {/* Style Options */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Available Styles</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These styles will appear in the porch configurator.
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
              {styles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">No styles defined.</TableCell>
                </TableRow>
              ) : (
                styles.map((style, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={style.value}
                        onChange={(e) => handleStyleChange(index, 'value', e.target.value)}
                        placeholder="e.g., wall_lean"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={style.label}
                        onChange={(e) => handleStyleChange(index, 'label', e.target.value)}
                        placeholder="e.g., Wall Mounted Lean-To"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteStyle(index)}
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
          onClick={handleAddStyle}
          variant="outlined"
          size="small"
        >
          Add Style
        </Button>
      </Box>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Roof Options */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Available Roof Types</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These roof options will appear in the porch configurator. Each roof type has a price multiplier.
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
                        placeholder="e.g., standard_pitch"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={roof.label}
                        onChange={(e) => handleRoofChange(index, 'label', e.target.value)}
                        placeholder="e.g., Standard Pitch"
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
      
      {/* Post Options */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Available Post Types</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These post options will appear in the porch configurator. Each post type has a price per post.
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Value (internal ID)</TableCell>
                <TableCell>Label (displayed to user)</TableCell>
                <TableCell>Price (£ per post)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No post types defined.</TableCell>
                </TableRow>
              ) : (
                posts.map((post, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={post.value}
                        onChange={(e) => handlePostChange(index, 'value', e.target.value)}
                        placeholder="e.g., standard_150"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={post.label}
                        onChange={(e) => handlePostChange(index, 'label', e.target.value)}
                        placeholder="e.g., Standard 150mm Posts"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        InputProps={{
                          inputProps: { step: "5", min: "0" }
                        }}
                        value={post.priceModifierPerPost}
                        onChange={(e) => handlePostChange(index, 'priceModifierPerPost', e.target.value)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeletePost(index)}
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
          onClick={handleAddPost}
          variant="outlined"
          size="small"
        >
          Add Post Type
        </Button>
      </Box>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Truss Options */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Available Truss Types</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These truss options will appear in the porch configurator. Each truss type has a fixed price modifier.
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
              {trusses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No truss types defined.</TableCell>
                </TableRow>
              ) : (
                trusses.map((truss, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={truss.value}
                        onChange={(e) => handleTrussChange(index, 'value', e.target.value)}
                        placeholder="e.g., standard"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={truss.label}
                        onChange={(e) => handleTrussChange(index, 'label', e.target.value)}
                        placeholder="e.g., Standard Truss"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        InputProps={{
                          inputProps: { step: "10", min: "0" }
                        }}
                

