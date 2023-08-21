import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card" key={product.id}>
      <CardMedia
      component="img"
      image={product.image}
      alt="image"
      >
      </CardMedia>
      <CardContent>
        <Typography gutterBottom variant="subtitle1">
          {product.name}
        </Typography>
        <Typography color="textPrimary" variant="subtitle2" style={{fontWeight:"900"}}>
          ${product.cost}
        </Typography>
        <Rating name="read-only" value={product.rating} readOnly/> 
        <CardActions className="card-actions">
          <Button className="button" variant="button" style={{color:"#ffff", fontWeight:'600'}} fullWidth name="add to cart" onClick={handleAddToCart}>
            < AddShoppingCartOutlined/>
            {"add to cart"}
          </Button>
        </CardActions>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
