import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Container, 
  Menu, 
  MenuItem, 
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  ShoppingCart as CartIcon, 
  AccountCircle, 
  Home, 
  Category, 
  Info, 
  LocalShipping, 
  Email, 
  Settings,
  ChevronRight
} from '@mui/icons-material';

import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { showPostcodeCheckModal } from '../../store/slices/appSlice';
import { UserRole, ProductCategory } from '../../types';
import { selectCartItemsCount } from '../../store/slices/cartSlice';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user } = useSelector((state: RootState) => state.auth);
  const itemCount = useSelector(selectCartItemsCount);
  const { temporaryClosureNotice } = useSelector((state: RootState) => state.app);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [productMenuAnchor, setProductMenuAnchor] = useState<null | HTMLElement>(null);
  
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleProductMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProductMenuAnchor(event.currentTarget);
  };
  
  const handleProductMenuClose = () => {
    setProductMenuAnchor(null);
  };
  
  const handleLogout = async () => {
    try {
      await dispatch(logout());
      handleUserMenuClose();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const handlePostcodeCheck = () => {
    dispatch(showPostcodeCheckModal());
  };
  
  // Menu items
  const productCategories = [
    { name: 'Garages', value: ProductCategory.GARAGE, path: '/products/garage' },
    { name: 'Gazebos', value: ProductCategory.GAZEBO, path: '/products/gazebo' },
    { name: 'Porches', value: ProductCategory.PORCH, path: '/products/porch' },
    { name: 'Oak Beams', value: ProductCategory.OAK_BEAM, path: '/products/beam' },
    { name: 'Oak Flooring', value: ProductCategory.OAK_FLOORING, path: '/products/flooring' },
  ];
  
  const infoPages = [
    { name: 'Gallery', path: '/gallery' },
    { name: 'Materials', path: '/materials' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Delivery', path: '/delivery' },
    { name: 'Contact', path: '/contact' },
  ];
  
  return (
    <>
      {temporaryClosureNotice.enabled && (
        <Box sx={{ backgroundColor: theme.palette.warning.main, p: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="white">
            {temporaryClosureNotice.message}
          </Typography>
        </Box>
      )}
      
      <AppBar position="sticky" color="primary">
        <Toolbar>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Logo / Brand */}
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Oak Haven
          </Typography>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/"
              >
                Home
              </Button>
              
              <Button 
                color="inherit" 
                onClick={handleProductMenuOpen}
                aria-controls="product-menu"
                aria-haspopup="true"
              >
                Products
              </Button>
              <Menu
                id="product-menu"
                anchorEl={productMenuAnchor}
                keepMounted
                open={Boolean(productMenuAnchor)}
                onClose={handleProductMenuClose}
              >
                {productCategories.map((category) => (
                  <MenuItem 
                    key={category.value}
                    component={RouterLink}
                    to={category.path}
                    onClick={handleProductMenuClose}
                  >
                    {category.name}
                  </MenuItem>
                ))}
                <Divider />
                <MenuItem 
                  component={RouterLink}
                  to="/products"
                  onClick={handleProductMenuClose}
                >
                  All Products
                </MenuItem>
              </Menu>
              
              {infoPages.map((page) => (
                <Button 
                  key={page.path}
                  color="inherit" 
                  component={RouterLink} 
                  to={page.path}
                >
                  {page.name}
                </Button>
              ))}
              
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/custom-enquiry"
              >
                Custom Enquiry
              </Button>
              
              <Button 
                color="inherit" 
                onClick={handlePostcodeCheck}
              >
                Check Delivery
              </Button>
            </Box>
          )}
          
          {/* Cart Icon */}
          <IconButton 
            color="inherit" 
            component={RouterLink} 
            to="/cart"
            sx={{ ml: 1 }}
          >
            <Badge badgeContent={itemCount} color="secondary">
              <CartIcon />
            </Badge>
          </IconButton>
          
          {/* User Account Menu */}
          {user ? (
            <>
              <IconButton
                onClick={handleUserMenuOpen}
                color="inherit"
                sx={{ ml: 1 }}
              >
                {user.photoURL ? (
                  <Avatar src={user.photoURL} sx={{ width: 32, height: 32 }} />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
              >
                <MenuItem component={RouterLink} to="/account" onClick={handleUserMenuClose}>
                  My Account
                </MenuItem>
                <MenuItem component={RouterLink} to="/account/orders" onClick={handleUserMenuClose}>
                  My Orders
                </MenuItem>
                <MenuItem component={RouterLink} to="/account/addresses" onClick={handleUserMenuClose}>
                  My Addresses
                </MenuItem>
                <Divider />
                {user.role === UserRole.ADMIN && (
                  <MenuItem component={RouterLink} to="/admin" onClick={handleUserMenuClose}>
                    Admin Panel
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/login"
              sx={{ ml: 1 }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': { width: 240 },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="div">
              Menu
            </Typography>
            <IconButton onClick={handleDrawerToggle}>
              <ChevronRight />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItem button component={RouterLink} to="/" onClick={handleDrawerToggle}>
              <ListItemIcon><Home /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            
            <ListItem button onClick={handleProductMenuOpen}>
              <ListItemIcon><Category /></ListItemIcon>
              <ListItemText primary="Products" />
            </ListItem>
            
            {productCategories.map((category) => (
              <ListItem 
                key={category.value}
                button 
                component={RouterLink} 
                to={category.path}
                onClick={handleDrawerToggle}
                sx={{ pl: 4 }}
              >
                <ListItemText primary={category.name} />
              </ListItem>
            ))}
            
            {infoPages.map((page) => (
              <ListItem 
                key={page.path}
                button 
                component={RouterLink} 
                to={page.path}
                onClick={handleDrawerToggle}
              >
                <ListItemIcon><Info /></ListItemIcon>
                <ListItemText primary={page.name} />
              </ListItem>
            ))}
            
            <ListItem button component={RouterLink} to="/custom-enquiry" onClick={handleDrawerToggle}>
              <ListItemIcon><Email /></ListItemIcon>
              <ListItemText primary="Custom Enquiry" />
            </ListItem>
            
            <ListItem button onClick={() => { handlePostcodeCheck(); handleDrawerToggle(); }}>
              <ListItemIcon><LocalShipping /></ListItemIcon>
              <ListItemText primary="Check Delivery" />
            </ListItem>
            
            {user && user.role === UserRole.ADMIN && (
              <ListItem button component={RouterLink} to="/admin" onClick={handleDrawerToggle}>
                <ListItemIcon><Settings /></ListItemIcon>
                <ListItemText primary="Admin Panel" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;

