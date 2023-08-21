import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Typography } from "@mui/material";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  let username;
  username = window.localStorage.getItem("username")
    ? window.localStorage.getItem("username")
    : null;
  const history = useHistory();

  function logout(e) {
    e.preventDefault();
    window.localStorage.clear();
    window.location.reload();
    // window.location.href = "/"
  }

  function redirectToLogin(e) {
    e.preventDefault();
    if (e.target.id === "login") {
      history.push("/login");
    }
    if (e.target.id === "register") {
      history.push("/register");
    }
    if (e.target.id === "explore") {
      history.push("/");
    }
  }

  if (hasHiddenAuthButtons) {
    return (
      <Box className="header">
        <Box className="header-title">
          <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          id="explore"
          onClick={(e)=>redirectToLogin(e)}
        >
          Back to explore
        </Button>
      </Box>
    );
  }
  if (!hasHiddenAuthButtons && window.localStorage.getItem("token") === null) {
    // HEADER FOR HOMEPAGE AND NO LOCAL STORAGE (NOT LOGGED IN)
    return (
      <Box className="header">
        <Box className="header-title">
          <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Box>{children}</Box>
        <Box>
          <Button id="login" onClick={(e) => redirectToLogin(e)}>
            Login
          </Button>
          <Button
            variant="contained"
            className="button"
            id="register"
            onClick={(e) => redirectToLogin(e)}
          >
            Register
          </Button>
        </Box>
      </Box>
    );
  }
  if (window.localStorage.getItem("token") !== null) {
    // HEADER FOR LOCAL STORAGE (LOGGED IN)
    return (
      <Box className="header">
        <Box className="header-title">
          <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Box>{children}</Box>
        <Box>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Avatar alt={username} src="avatar.png" />
            {/* <img src="avatar.png" alt={username} className="userImg"></img> */}
            <Typography variant="subtitle1">{username}</Typography>

            <Button variant="text" onClick={(e) => logout(e)}>
              Logout
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }
};

export default Header;
