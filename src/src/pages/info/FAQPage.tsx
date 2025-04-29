import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for embedding links
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Define interface for Q&A items
interface FAQItem {
  id: string; // For React key
  question: string;
  answer: string | React.ReactNode; // Allow string or JSX for answer
}

// Define the FAQ data
const faqData: FAQItem[] = [
  { 
    id: 'q1', 
    question: 'What types of wood do you use?', 
    answer: 'We primarily use high-quality, sustainably sourced European Oak for our main structures like garages, gazebos, porches, and beams. We may use other suitable timbers for specific components like cladding or roofing upon request.' 
  },
  { 
    id: 'q2', 
    question: 'What are your delivery areas and costs?', 
    // Use JSX for the answer to include a Link component
    answer: (
      <>
        Delivery is available throughout most of mainland UK. Costs vary based on location and order size (particularly for beams and flooring). 
        Garages, gazebos, and porches typically have delivery included within certain zones. 
        Please see our <Link to="/delivery">Delivery Information page</Link> or use the postcode checker for details.
      </>
    ) 
  },
  { 
    id: 'q3', 
    question: 'What are the typical lead times?', 
    answer: 'Lead times vary depending on the product complexity and current workload. Standard beams and flooring often ship within 2-4 weeks. Configured structures like garages or gazebos typically have lead times of 6-12 weeks. We will provide a more accurate estimate upon order confirmation.' 
  },
  { 
    id: 'q4', 
    question: 'Do you offer installation services?', 
    answer: 'While we primarily supply the kits for self-assembly or assembly by your chosen builder, we may be able to recommend installation partners in certain areas. Please contact us to discuss installation options.' 
  },
  { 
    id: 'q5', 
    question: 'Can I customize a design beyond the configurator options?', 
    answer: (
      <>
        Yes! We specialize in bespoke oak structures. If the online configurators don't meet your exact needs, 
        please use our <Link to="/custom-enquiry">Custom Enquiry form</Link> to provide details and drawings, and we'll be happy to provide a quote.
      </>
    ) 
  },
];


const FAQPage: React.FC = () => {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Frequently Asked Questions
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Find answers to common questions about our products, ordering process, delivery, and more.
      </Typography>
      
      {/* Map over the faqData to render Accordions */}
      {faqData.map((item) => (
        <Accordion key={item.id}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${item.id}-content`}
            id={`${item.id}-header`}
          >
            <Typography sx={{ fontWeight: 'medium' }}>{item.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {typeof item.answer === 'string' ? (
              <Typography>{item.answer}</Typography>
            ) : (
              // If answer is JSX, render it directly
              item.answer 
            )}
          </AccordionDetails>
        </Accordion>
      ))}

    </Container>
  );
};

export default FAQPage;

