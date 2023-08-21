import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import "./Cart.css";
import { Link } from "react-router-dom";


// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { Array.<{ productId: String, qty: Number }> } cartData
 *    Array of objects with productId and quantity of products in cart
 * 
 * @param { Array.<Product> } productsData
 *    Array of objects with complete data on all available products
 *
 * @returns { Array.<CartItem> }
 *    Array of objects with complete data on products in cart
 *
 */
 export const generateCartItemsFrom = (cartData, productsData) => {
  let allProductsdata = [];

for(let i = 0;i < cartData.length;i++){
  let currProd = cartData[i];

  for(let j = 0;j < productsData.length;j++)
  {
    if(productsData[j]._id === currProd.productId)
    {
      allProductsdata.push({...productsData[j], "qty": currProd.qty});
    }
  }
}

return allProductsdata;
};

const handleOnClick=()=>{
  document.getElementById('items-Container').classList.add('expand')
  document.getElementById('cart-info').classList.remove('cart-info')
}
const handleOnClose=()=>{
  document.getElementById('items-Container').classList.remove('expand')
  document.getElementById('cart-info').classList.add('cart-info')
}

/**
 * Get the total value of all products added to the cart
 *
 * @param { Array.<CartItem> } items
 *    Array of objects with complete data on products added to the cart
 *
 * @returns { Number }
 *    Value of all items in the cart
 *
 */
 export const getTotalCartValue = (items = []) => {
  const totalCost = items.reduce((acc, item) => {
    return acc + (item.cost * item.qty);
  }, 0);
  
  return `${totalCost}`
};

export const getTotalItems = (items = []) => {
  const totalQty = items.reduce((acc, item) => {
    return acc + item.qty;
  }, 0);
  return `${totalQty}`
};


/**
 * Component to display the current quantity for a product and + and - buttons to update product quantity on cart
 * 
 * @param {Number} value
 *    Current quantity of product in cart
 * 
 * @param {Function} handleAdd
 *    Handler function which adds 1 more of a product to cart
 * 
 * @param {Function} handleDelete
 *    Handler function which reduces the quantity of a product in cart by 1
 * 
 * 
 */
 const ItemQuantity = ({
  value,
  handleAdd,
  handleDelete,
}) => {
  return (
    <Stack direction="row" alignItems="center">
      <IconButton size="small" color="primary" onClick={handleDelete}>
        <RemoveOutlined />
      </IconButton>
      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
      <IconButton size="small" color="primary" onClick={handleAdd}>
        <AddOutlined />
      </IconButton>
    </Stack>
  );
};

/**
 * Component to display the Cart view
 * 
 * @param { Array.<Product> } products
 *    Array of objects with complete data of all available products
 * 
 * @param { Array.<Product> } items
 *    Array of objects with complete data on products in cart
 * 
 * @param {Function} handleDelete
 *    Current quantity of product in cart
 * 
 * @param {Boolean} isReadOnly
 *    If product quantity on cart is to be displayed as read only without the + - options to change quantity
 * 
 */
const Cart = ({
  products,
  items = [],
  handleQuantity,
  isReadOnly
}) => {
  getTotalItems(items)
  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box className="cart" position="relative">
        {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}
        <Box
          padding="1rem"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
          className="items-Container"
          id="items-Container"
          // style={{height:'30vh',overflowY:'scroll'}}
        >
          <Box
            alignItems="center"
            position="absolute"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "90%",
              backgroundColor: "#ffff",
              padding: "5px 0px 5px 8px",
              overFlow: "hidden",
            }}
            top={0}
          >
            {items.length} Items in cart
            <Button
              sx={{ display: "none" }}
              className="close-btn"
              onClick={handleOnClose}
            >
              <CloseIcon />
            </Button>
          </Box>
          {items.map((item) => {
            return (
              <div key={item._id}>
                <Box
                  display="flex"
                  alignItems="flex-start"
                  padding="1rem"
                  key={item._id}
                >
                  <Box className="image-container">
                    <img
                      src={item.image}
                      alt={item.name}
                      width="100%"
                      height="100%"
                    />
                  </Box>
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    height="6rem"
                    paddingX="1rem"
                  >
                    <div>{item.name}</div>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      {
                        isReadOnly ? (
                          <Box display="flex" alignItems="center">
                            Qty: {item.qty}
                          </Box>
                        ) : (
                          <ItemQuantity
                            value={item.qty}
                            handleAdd={() =>
                              handleQuantity("handleAdd", item._id)
                            }
                            handleDelete={() =>
                              handleQuantity("handleDelete", item._id)
                            }
                          />
                         )
                        // Add required props by checking implementation
                      } 

                      <Box padding="0.5rem" fontWeight="700">
                        ${item.cost}
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <hr />
              </div>
            );
          })}
        </Box>

        {!isReadOnly && (
          <Box
            display="flex"
            justifyContent="flex-end"
            onClick={handleOnClick}
            className="cart-footer"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "93%",
            }}
          >
            <Box
              color="#3C3C3C"
              fontWeight="700"
              fontSize="1.5rem"
              alignSelf="center"
            >
              <Box
                justifyContent="flex-start"
                fontSize="0.8rem"
                alignItems="center"
                className="cart-info"
                id="cart-info"
                display="none"
              >
                {items.length} Items in cart <InfoIcon fontSize="small" />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <Box color="#3C3C3C" alignSelf="center">
                  Total
                </Box>
                <Box
                  color="#3C3C3C"
                  fontWeight="700"
                  fontSize="1.5rem"
                  alignSelf="center"
                  data-testid="cart-total"
                >
                  ${getTotalCartValue(items)}
                </Box>
              </Box>
            </Box>
            <Link to="/checkout" className="link">
              <Button
                color="primary"
                variant="contained"
                startIcon={<ShoppingCart />}
                className="checkout-btn"
              >
                Checkout
              </Button>
            </Link>
          </Box>
         )}
      </Box>
      {isReadOnly && (
        <Box
          className="cart"
          padding="1rem"
          display="flex"
          flexDirection="column"
          gap="1rem"
        >
          <Box fontWeight="900" fontSize="1.2rem">
            Order Details
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>Products</Box>
            <Box>{getTotalItems(items)}</Box>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>Subtotal</Box>
            <Box>${getTotalCartValue(items)}</Box>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>Shipping Charges</Box>
            <Box>$0</Box>
          </Box>
          <Box
            fontWeight="900"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>Total</Box>
            <Box>${getTotalCartValue(items)}</Box>
          </Box>
        </Box>
      )} 
    </>
  );
};

export default Cart;
