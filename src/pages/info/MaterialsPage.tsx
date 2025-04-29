import React from 'react';
import { Container, Typography, Paper, Box, Divider } from '@mui/material';

const MaterialsPage: React.FC = () => {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Our Materials
      </Typography>
      
       <Paper sx={{ p: 3, mt: 2 }}>
         {/* Section 1: European Oak */}
         <Box mb={3}>
           <Typography variant="h6" gutterBottom>High-Quality European Oak</Typography>
           <Typography variant="body1" paragraph>
             The heart of our structures is high-quality European Oak (Quercus Robur/Petraea), renowned for its strength, durability, and beautiful grain patterns. We source our oak primarily from sustainably managed forests in France and other parts of Europe, ensuring responsible forestry practices.
           </Typography>
           <Typography variant="body1" paragraph>
             Oak is a natural material, and as such, it exhibits unique characteristics. You can expect features like knots, varying grain patterns, and potentially some surface checks or splits. These are not defects but part of the inherent beauty and character of the wood. Oak will also naturally move (expand and contract) slightly with changes in humidity and temperature. When used externally, untreated oak will gradually weather to an attractive silvery-grey patina over time.
           </Typography>
         </Box>

         <Divider sx={{ my: 3 }} />

         {/* Section 2: Grading */}
         <Box mb={3}>
           <Typography variant="h6" gutterBottom>Understanding Oak Grades</Typography>
           <Typography variant="body1" paragraph>
             We use different grades of oak depending on the application. For load-bearing structural elements like beams, posts, and trusses in our garages, gazebos, and porches, we use specific structural grades (such as QPA/QP1 or equivalent, meeting relevant strength classifications). These grades prioritise strength and integrity.
           </Typography>
           <Typography variant="body1" paragraph>
             For visual elements like cladding or flooring, appearance grades such as Character or Prime might be used. 'Character' grade typically features more knots and natural features for a rustic look, while 'Prime' grade has fewer knots and a more uniform appearance. The specific grade used for non-structural components can often be selected during configuration or specified in custom enquiries.
           </Typography>
         </Box>

         <Divider sx={{ my: 3 }} />

         {/* Section 3: Finishing */}
          <Box mb={3}>
           <Typography variant="h6" gutterBottom>Finishes and Treatments</Typography>
           <Typography variant="body1" paragraph>
             Our oak products can be supplied in various finishes. A 'Sawn Finish' provides a more textured, rustic appearance straight from the sawmill. 'Planed All Round' (PAR) offers a smooth, clean finish, reducing the dimensions slightly.
           </Typography>
            <Typography variant="body1" paragraph>
             While oak is naturally durable for external use, applying a treatment or finish can help maintain its original colour for longer and provide additional protection against UV rays and moisture ingress. We offer options like clear oils or microporous coatings. If left unfinished, the oak will naturally weather to a silver-grey colour, which many find aesthetically pleasing, without compromising the structural integrity for many years.
           </Typography>
         </Box>

         <Divider sx={{ my: 3 }} />

         {/* Section 4: Other Materials */}
         <Box>
           <Typography variant="h6" gutterBottom>Complementary Materials</Typography>
           <Typography variant="body1" paragraph>
             Where necessary, we utilize other high-quality materials chosen to complement the oak structure. This may include pressure-treated softwood for unseen roof timbers, durable cladding options (like oak or larch featheredge), traditional oak pegs for joinery, and appropriate structural fixings. Roofing materials, such as cedar shingles or specific tiles, can also be specified or supplied based on the project requirements.
           </Typography>
         </Box>
       </Paper>
    </Container>
  );
};

export default MaterialsPage;

