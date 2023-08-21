/* eslint-disable no-lone-blocks */
import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, {
  getTotalCartValue,
  generateCartItemsFrom,
  getTotalItems,
} from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";
import emailjs from "emailjs-com";

const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        onChange={(e) =>
          handleNewAddress((prevAdd) => ({ ...prevAdd, value: e.target.value }))
        }
      />

      <Stack direction="row" my="1rem">
        <Button
          variant="contained"
          onClick={() => addAddress(token, newAddress)}
        >
          Add
        </Button>
        <Button
          onClick={() =>
            handleNewAddress((prevAdd) => ({
              ...prevAdd,
              isAddingNewAddress: false,
            }))
          }
          variant="text"
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};
const AddUpdateAddressView = ({
  token,
  updatedAddress,
  setNewUpdatedAddress,
  addAddress,
}) => {
  console.log(updatedAddress);
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        onChange={(e) =>
          setNewUpdatedAddress((prevAdd) => ({
            ...prevAdd,
            value: e.target.value,
          }))
        }
        defaultValue={updatedAddress.value}
        id={updatedAddress._id}
      />

      <Stack direction="row" my="1rem">
        <Button
          variant="contained"
          onClick={() => addAddress(token, updatedAddress, updatedAddress._id)}
        >
          Update
        </Button>
        <Button
          onClick={() =>
            setNewUpdatedAddress((currNewAddress) => ({
              ...currNewAddress,
              isUpdatingAddress: false,
            }))
          }
          variant="text"
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};
const AddNewEmailView = ({ token, newEmail, handleNewEmail, addEmail }) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete email"
        onChange={(e) =>
          handleNewEmail((prevAdd) => ({ ...prevAdd, value: e.target.value }))
        }
      />

      <Stack direction="row" my="1rem">
        <Button variant="contained" onClick={() => addEmail(token, newEmail)}>
          Add
        </Button>
        <Button
          onClick={() =>
            handleNewEmail((prevAdd) => ({
              ...prevAdd,
              isAddingNewEmail: false,
            }))
          }
          variant="text"
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });
  const [updatedAddress, setNewUpdatedAddress] = useState({
    isUpdatingAddress: false,
    value: "jjdjdjd",
    _id: "",
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "Your orders are placed successfully",
    date: "",
    address: "",
    items: "",
    totalprice: "",
    shippingcharges: 0,
    balance: "",
  });

  // Fetch products and cart data on page load
  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await getProducts();

      const cartData = await fetchCart(token);

      if (productsData && cartData) {
        const cartDetails = await generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
      }

      await getAddresses(token);
    };
    onLoadHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userData = async (items, address) => {
    setAddresses({ ...addresses, selected: address._id });
    const selectedAddress = address.address;
    const totalItems = getTotalItems(items);
    const totalPrice = getTotalCartValue(items);
    const totalbalance =
      localStorage.getItem("balance") - getTotalCartValue(items);
    const today = new Date();
    let tomorrow = new Date();
    tomorrow.setDate(today.getDate() + Math.floor(Math.random() * (7 - 3) + 3));
    const date = tomorrow.toDateString();

    setForm({
      ...form,
      name: localStorage.getItem("username"),
      date: date,
      address: selectedAddress,
      items: totalItems,
      totalprice: totalPrice,
      shippingcharges: 0,
      balance: totalbalance,
    });
    // console.log(form)
  };


  // Fetch the entire products list
  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);

      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  // Fetch cart data
  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  const getAddresses = async (token) => {
    if (!token) {
      history.push("./login");
      enqueueSnackbar("You must be logged in to access checkout page.", {
        variant: "error",
      });
      return;
    }
    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: response.data });

      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  ///function to get emails form dn on page load


  ///////////////////////////////////

  const addAddress = async (token, newAddress, updatedAddress_id) => {
    try {
      // TODO: CRIO_TASK_MODULE_CHECKOUT - Add new address to the backend and display the latest list of addresses
      const res = await axios.post(
        `${config.endpoint}/user/addresses`,
        { address: newAddress.value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (updatedAddress_id) {
        deleteAddress(token, updatedAddress_id);
      }
      setAddresses({ ...addresses, all: res.data });
      setNewAddress({ isAddingNewAddress: false, value: "" });
      setNewUpdatedAddress({ isAddingNewAddress: false, value: "" });
      return res.data;
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const deleteAddress = async (token, addressId) => {
    try {
      // TODO: CRIO_TASK_MODULE_CHECKOUT - Delete selected address from the backend and display the latest list of addresses
      const res = await axios.delete(
        `${config.endpoint}/user/addresses/${addressId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res.data);
      setAddresses({ ...addresses, all: res.data });
      return res.data;
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };
  const validateRequest = (items, addresses) => {
    if (getTotalCartValue(items) > localStorage.getItem("balance")) {
      enqueueSnackbar(
        "You do not have enough balance in your wallet for this purchase",
        { variant: "warning" }
      );
      return false;
    }
    if (addresses.all.length === 0) {
      enqueueSnackbar("Please add a new address before proceeding.", {
        variant: "warning",
      });
      return false;
    }
    if (!addresses.selected) {
      enqueueSnackbar("Please select one shipping address to proceed", {
        variant: "warning",
      });
      return false;
    }

    return true;
  };

  const performCheckout = async (token, items, addresses, form) => {
    const validationRequest = validateRequest(items, addresses);
    // console.log(boolean)
    // console.log(addresses);

    if (validationRequest) {
      try {
        await axios.post(
          `${config.endpoint}/cart/checkout`,
          { addressId: `${addresses.selected}` },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        enqueueSnackbar("Order placed successfully", { variant: "success" });
        // localStorage.setItem({...localStorage, "balance": "balance" = (balance - getTotalCartValue(items)) })
        localStorage.setItem(
          "balance",
          localStorage.getItem("balance") - getTotalCartValue(items)
        );

        // sendEmail(form);
        history.push("/thanks");
      } catch (error) {
        if (error.response && error.response.status === 400) {
          enqueueSnackbar("Wallet balance not sufficient to place order", {
            variant: "error",
          });
        } else {
          enqueueSnackbar(
            error.response.status + " " + error.response.statusText,
            {
              variant: "error",
            }
          );
        }
      }
    }
  };
  const updateAddress = (address) => {
    setNewUpdatedAddress((currNewAddress) => ({
      ...currNewAddress,
      isUpdatingAddress: true,
      value: address.address,
      _id: address._id,
    }));

    console.log(address);
  };

  // TODO: CRIO_TASK_MODULE_CHECKOUT - Fetch addressses if logged in, otherwise show info message and redirect to Products page

  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Display list of addresses and corresponding "Delete" buttons, if present, of which 1 can be selected */}

            {addresses.all &&
              addresses.all.map((address) => {
                return (
                  <Box
                    onClick={
                      () => userData(items, address)
                      // setAddresses({ ...addresses, selected: address._id })
                    }
                    className={
                      address._id === addresses.selected
                        ? "address-item selected"
                        : "address-item not-selected"
                    }
                  >
                    <Typography my="1rem">{address.address}</Typography>
                    <Box>
                      <Button
                        variant="text"
                        onClick={() => {
                          updateAddress(address);
                        }}
                      >
                        <EditIcon />
                      </Button>
                      <Button
                        variant="text"
                        startIcon={<Delete />}
                        onClick={() => deleteAddress(token, address._id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            {!addresses.all.length && (
              <Typography my="1rem">
                No addresses found for this account. Please add one to proceed
              </Typography>
            )}

            {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Dislay either "Add new address" button or the <AddNewAddressView> component to edit the currently selected address */}

            {!newAddress.isAddingNewAddress &&
              !updatedAddress.isUpdatingAddress && (
                <Button
                  color="primary"
                  variant="contained"
                  id="add-new-btn"
                  size="large"
                  onClick={() => {
                    setNewAddress((currNewAddress) => ({
                      ...currNewAddress,
                      isAddingNewAddress: true,
                    }));
                  }}
                >
                  Add new address
                </Button>
              )}
            {newAddress.isAddingNewAddress && (
              <AddNewAddressView
                token={token}
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={addAddress}
              />
            )}

            {updatedAddress.isUpdatingAddress && (
              <AddUpdateAddressView
                token={token}
                selectedAddress=""
                addAddress={addAddress}
                setNewUpdatedAddress={setNewUpdatedAddress}
                updatedAddress={updatedAddress}
              />
            )}
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
              onClick={() => performCheckout(token, items, addresses, form)}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly={true} products={products} items={items} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
