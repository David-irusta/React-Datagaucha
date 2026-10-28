import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./NavBar.css"

import { logout } from "../../services/authService";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const estaEnLogin = location.pathname === "/login";

  const cerrarSesion = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (estaEnLogin) {
    return null;
  }

  return (
    <Navbar expand="lg" className="navbar-datagaucha">
      <Container>
        <Navbar.Brand as={Link} to="/">
          DataGaucha
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/home">
              Inicio
            </Nav.Link>

            <Nav.Link as={Link} to="/bans">
              Baneos
            </Nav.Link>
          </Nav>

          <Nav>
            <Nav.Link as="button" onClick={cerrarSesion}>
              Cerrar sesión
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;