import React from 'react';
import { Container, Typography, Paper, Box, Divider } from '@mui/material';
import { Link } from 'react-router-dom'; // For linking

const DeliveryInfoPage: React.FC = () => {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Delivery Information
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2 }}>
        {/* Section 1: Delivery Areas */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Areas We Cover</Typography>
          <Typography variant="body1" paragraph>
            We deliver our oak structures and products throughout mainland England and Wales. 
            Delivery to Scotland, Northern Ireland, and offshore islands may be possible but often incurs significant surcharges and requires specific arrangements. 
          </Typography>
          <Typography variant="body1">
             Please use the postcode checker available in the header or contact us directly to confirm deliverability and potential costs for areas outside mainland England and Wales.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Section 2: Delivery Costs */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Delivery Costs</Typography>
           <Typography variant="body1" paragraph>
            Delivery costs for large structures like **Garages, Gazebos, and Porches** are typically calculated and included in the price shown for standard delivery zones within mainland England and Wales. You will be notified of any additional charges for complex deliveries or locations outside our standard zones.
          </Typography>
          <Typography variant="body1" paragraph>
            For **Oak Beams and Oak Flooring**, delivery costs are calculated in the shopping cart based on the total volume/weight of the items and the delivery postcode. There is a minimum delivery charge (e.g., £XX) and potentially a free delivery threshold for larger orders (e.g., over £YYYY). These values are subject to change and will be confirmed in the cart.
          </Typography>
           {/* TODO: Fetch and display actual threshold/min charge from appSlice if dynamic */}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Section 3: Lead Times */}
        <Box mb={3}>
           <Typography variant="h6" gutterBottom>Estimated Lead Times</Typography>
           <Typography variant="body1" paragraph>
             Please note that all lead times are estimates and can vary based on workload and material availability.
           </Typography>
           <ul>
             <li><Typography variant="body1">Standard Oak Beams & Flooring: Typically 2-4 weeks.</Typography></li>
             <li><Typography variant="body1">Configured Porches & Gazebos: Typically 6-10 weeks.</Typography></li>
             <li><Typography variant="body1">Configured Garages & Larger Structures: Typically 8-12 weeks.</Typography></li>
           </ul>
            <Typography variant="body1">
             We will provide a more specific estimated delivery window after your order is confirmed.
           </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />

        {/* Section 4: Delivery Process */}
         <Box>
           <Typography variant="h6" gutterBottom>Delivery Process</Typography>
            <Typography variant="body1" paragraph>
             Once your order is ready for dispatch, our logistics team or a third-party courier will contact you to arrange a suitable delivery date. Deliveries are typically made **kerbside**, meaning the driver will unload the items to the nearest safe point accessible by their vehicle (usually the pavement or driveway entrance).
           </Typography>
            <Typography variant="body1" paragraph>
             Please ensure adequate access for large delivery vehicles (dimensions can be provided upon request). It is the customer's responsibility to arrange for moving the materials from the kerbside delivery point to their desired location on site. For very large deliveries, mechanical offload (e.g., forklift) may be required, which would need to be arranged by the customer unless otherwise specified.
           </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default DeliveryInfoPage;

