import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart from "./Cart";
import { generateCartItemsFrom } from "./Cart";

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

const Products = () => {
  let { enqueueSnackbar } = useSnackbar();
  const [productsList, setProductsList] = useState([]);
  const [state, setState] = useState(true);
  const [debounceTimeOut, setDebounceTime] = useState(0);
  const [cartItem, setCartItem] = useState([]);
  const [error, setError] = useState(false);
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */

  useEffect(() => {
    performAPICall();
    fetchCart(localStorage.getItem("token"));
  }, []);

  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      const res = await axios.get(config.endpoint + `/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItem(res.data);
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  const performAPICall = async () => {
    try {
      const response = await axios.get(config.endpoint + "/products");
      const products = response.data;
      setState(false);
      setProductsList(products);
      setError(false);
    } catch (error) {
      if (error.response) {
        enqueueSnackbar(error.response.statusText, { variant: "error" });
      } else {
        enqueueSnackbar("Something went wrong!", { variant: "error" });
      }
      setError(true);
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  async function performSearch(text) {
    try {
      const response = await axios.get(
        config.endpoint + `/products/search?value=${text}`
      );
      setError(false);
      setProductsList(response.data);
    } catch (error) {
      setProductsList([]);
      setError(true);
    }
  }

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    if (debounceTimeOut !== 0) {
      clearTimeout(debounceTimeOut);
    }
    const timeout = setTimeout(() => performSearch(event.target.value), 500);
    setDebounceTime(timeout);
  };

  const isItemInCart = (items, productId) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].productId === productId) {
        return true;
      }
    }
    return null;
  };

  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if (!token) {
      enqueueSnackbar("Login to add an item to the Cart", {
        variant: "warning",
      });
    }
    if (isItemInCart(items, productId)) {
      enqueueSnackbar(
        "Item already in cart. Use the cart sidebar to update quantity or remove item.",
        {
          variant: "warning",
        }
      );
    } else {
      try {
        const res = await axios.post(
          config.endpoint + `/cart`,
          {
            productId: productId,
            qty: qty,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCartItem(res.data);
      } catch (e) {
        if (e.response && e.response.status === 404) {
          enqueueSnackbar(e.response.data.message, { variant: "error" });
        }
      }
    }
  };

  const handleQuantity = async (e, id) => {
    for (let i = 0; i < cartItem.length; i++) {
      if (cartItem[i].productId === id) {
        // else {
        const res = await axios.post(
          config.endpoint + `/cart`,
          {
            //         //  ...cartItem,
            productId: id,
            qty:
              `${
                e === "handleAdd" ? cartItem[i].qty + 1 : cartItem[i].qty - 1
              }` * 1,
          },
          {
            headers: {
              Authorization: `Bearer ${window.localStorage.getItem("token")}`,
            },
          }
        );
        setCartItem(res.data);
      }
    }
  };

  return (
    <div>
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
          className="search-desktop"
          size="small"
          InputProps={{
            className: "search",
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="serach"
          onChange={(e) => {
            debounceSearch(e, debounceTimeOut);
          }}
        />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => {
          debounceSearch(e, debounceTimeOut);
        }}
      />
      <Grid container>
        <Grid item md>
          <Grid item className="product-grid">
            <Box className="hero">
              <p className="hero-heading">
                India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                to your door step
              </p>
            </Box>
          </Grid>
          <Grid container direction="row" spacing={{ xs: 1, md: 2 }} p={3}>
            {error ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    margin: "auto",
                    alignItems: "center",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: 300,
                  }}
                >
                  <SentimentDissatisfied />
                  No Products Found
                </Box>
              </>
            ) : (
              ""
            )}
            {state ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    margin: "auto",
                    alignItems: "center",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: 300,
                  }}
                >
                  <CircularProgress color="success" />
                  {""}
                  Loading...
                </Box>
              </>
            ) : (
              ""
            )}
            {productsList && (
              <>
                {productsList.map((product) => {
                  return (
                    <Grid item md={3} xs={6} key={product._id}>
                      <ProductCard
                        product={product}
                        key={product._id}
                        handleAddToCart={async () =>
                          await addToCart(
                            window.localStorage.getItem("token"),
                            cartItem,
                            productsList,
                            product._id,
                            1,
                            { preventDuplicate: true }
                          )
                        }
                      />
                    </Grid>
                  );
                })}
              </>
            )}
          </Grid>
        </Grid>
        {window.localStorage.getItem("token") !== null && (
          <Grid
            item
            md={3}
            sm={12}
            style={{ backgroundColor: "#E9F5E1", height: "auto" }}
            className="cart-Container"
            // sx={{ position: "fixed",bottom:0, height: "30vh", width: "100%" }}
          >
            <Cart
              items={generateCartItemsFrom(cartItem, productsList)}
              handleQuantity={(e, id) => handleQuantity(e, id)}
            />
          </Grid>
        )}
      </Grid>
      <Footer />
    </div>
  );
};

export default Products;
