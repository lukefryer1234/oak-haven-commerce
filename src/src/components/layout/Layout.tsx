import React, { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header'; // Assuming Header is in the same directory
import Footer from './Footer'; // Assuming Footer is in the same directory

interface Props {
  children: ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {/* The page content passed as children will be rendered here */}
        {children} 
      </Container>
      
      <Footer />
    </Box>
  );
};

export default Layout;

