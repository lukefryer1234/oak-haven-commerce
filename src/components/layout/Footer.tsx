import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  Divider, 
  IconButton,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Facebook as FacebookIcon, 
  Instagram as InstagramIcon, 
  Twitter as TwitterIcon, 
  Pinterest as PinterestIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const Footer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentYear = new Date().getFullYear();
  
  // We would normally get this from the app state but we'll hardcode for now until we implement settings
  const companyInfo = useSelector((state: RootState) => state.app.companyInfo) || {
    name: 'Oak Haven',
    address: '123 Woodland Way, Oakshire, England, OA1 2BC',
    phone: '01234 567890',
    email: 'info@oakhaven.com',
    socialMedia: {
      facebook: 'https://facebook.com/oakhaven',
      instagram: 'https://instagram.com/oakhaven',
      twitter: 'https://twitter.com/oakhaven',
      pinterest: 'https://pinterest.com/oakhaven'
    }
  };
  
  // Footer links sections
  const footerSections = [
    {
      title: 'Products',
      links: [
        { name: 'Garages', path: '/products/garage' },
        { name: 'Gazebos', path: '/products/gazebo' },
        { name: 'Porches', path: '/products/porch' },
        { name: 'Oak Beams', path: '/products/beam' },
        { name: 'Oak Flooring', path: '/products/flooring' },
        { name: 'Custom Enquiry', path: '/custom-enquiry' }
      ]
    },
    {
      title: 'Information',
      links: [
        { name: 'Gallery', path: '/gallery' },
        { name: 'Materials', path: '/materials' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Delivery', path: '/delivery' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact Us', path: '/contact' }
      ]
    },
    {
      title: 'Customer Service',
      links: [
        { name: 'My Account', path: '/account' },
        { name: 'Order Tracking', path: '/account/orders' },
        { name: 'Shipping Policy', path: '/shipping' },
        { name: 'Returns & Refunds', path: '/returns' },
        { name: 'Check Postcode', path: '#', isButton: true, action: 'checkPostcode' }
      ]
    }
  ];
  
  // Legal links
  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms of Service', path: '/terms-of-service' },
    { name: 'Cookie Policy', path: '/cookie-policy' }
  ];
  
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        mt: 'auto',
        pt: 6,
        pb: 3
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          {/* Company info and social */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              component={RouterLink} 
              to="/" 
              sx={{ 
                textDecoration: 'none', 
                color: 'inherit',
                display: 'block',
                mb: 2
              }}
            >
              {companyInfo.name}
            </Typography>
            
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <IconButton color="inherit" aria-label="Facebook" component="a" href={companyInfo.socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram" component="a" href={companyInfo.socialMedia.instagram} target="_blank" rel="noopener noreferrer">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter" component="a" href={companyInfo.socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Pinterest" component="a" href={companyInfo.socialMedia.pinterest} target="_blank" rel="noopener noreferrer">
                <PinterestIcon />
              </IconButton>
            </Stack>
            
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">{companyInfo.address}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  <Link href={`tel:${companyInfo.phone.replace(/\s/g, '')}`} color="inherit">
                    {companyInfo.phone}
                  </Link>
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  <Link href={`mailto:${companyInfo.email}`} color="inherit">
                    {companyInfo.email}
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Footer sections */}
          {!isMobile && footerSections.map((section) => (
            <Grid item xs={12} sm={6} md={2} key={section.title}>
              <Typography variant="h6" color="inherit" gutterBottom>
                {section.title}
              </Typography>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {section.links.map((link) => (
                  <li key={link.name} style={{ marginBottom: '0.5rem' }}>
                    <Link
                      component={RouterLink}
                      to={link.path}
                      color="inherit"
                      sx={{ 
                        textDecoration: 'none',
                        '&:hover': { 
                          textDecoration: 'underline' 
                        } 
                      }}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Grid>
          ))}
          
          {/* Mobile accordion version */}
          {isMobile && (
            <Grid item xs={12} sm={8}>
              <Grid container spacing={2}>
                {footerSections.map((section) => (
                  <Grid item xs={12} sm={4} key={section.title}>
                    <Typography variant="subtitle1" color="inherit" gutterBottom>
                      {section.title}
                    </Typography>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {section.links.map((link) => (
                        <li key={link.name} style={{ marginBottom: '0.5rem' }}>
                          <Link
                            component={RouterLink}
                            to={link.path}
                            color="inherit"
                            sx={{ 
                              textDecoration: 'none',
                              '&:hover': { 
                                textDecoration: 'underline' 
                              } 
                            }}
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>
        
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', my: 3 }} />
        
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-start' }}>
          <Typography variant="body2" color="inherit" align={isMobile ? 'center' : 'left'}>
            &copy; {currentYear} {companyInfo.name}. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mt: isMobile ? 2 : 0 }}>
            {legalLinks.map((link, index) => (
              <React.Fragment key={link.name}>
                <Link
                  component={RouterLink}
                  to={link.path}
                  color="inherit"
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': { 
                      textDecoration: 'underline' 
                    } 
                  }}
                >
                  {link.name}
                </Link>
                {index < legalLinks.length - 1 && (
                  <Typography variant="body2" component="span" sx={{ mx: 1 }}>
                    |
                  </Typography>
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

