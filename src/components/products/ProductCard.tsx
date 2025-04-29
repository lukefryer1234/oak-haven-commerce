import React from 'react';
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import { ProductData } from '../../services/firebase';
  product: ProductData;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  return (
    <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea 
        component={Link} 
        to={`/products/detail/${product.id}`}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }} // Ensure content aligns top
      >
        {product.images && product.images.length > 0 && (
          <CardMedia
            component="img"
            height="190" // Adjust height as needed
            image={product.images[0]}
            alt={product.name}
          />
        )}
        <CardContent sx={{ flexGrow: 1 }}> {/* Allow content to take remaining space */}
          <Typography gutterBottom variant="h6" component="div">
            {product.name}
          </Typography>
          {/* TODO: Add price or short description here if desired */}
        </CardContent>
      </CardActionArea>
      {/* TODO: Could add CardActions here for buttons outside the link area */}
    </Card>
  );
};

export default ProductCard;

