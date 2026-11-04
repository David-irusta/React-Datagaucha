import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import NavBar from "./components/NavBar/NavBar";
import Home from "./components/Home/Home";
import Baneos from "./components/Baneos/Baneos";
import Users from "./components/Users/Users";
import Errors from "./components/Errors/Errors"
import Main from "./components/Main/Main";

function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/" element={<Main />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="bans" element={<Baneos />} />
          <Route path="bans/:idBan" element={<Baneos />} />
          <Route path="users/:idUser" element={<Users />} />
          <Route path="users" element={<Users />} />
          <Route path="error" element={<Errors />} />
          <Route path="*" element={<Navigate to="/error" replace />} />
          <Route path="home" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
