import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import NavBar from "./components/NavBar/NavBar";
import Home from "./components/Home/Home";
import Baneos from "./components/Baneos/Baneos";
import Users from "./components/Users/Users";
import Error from "./components/Error/Error";
import Main from "./components/Main/Main";
import Login from "./components/Login/Login";

function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Main />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="bans" element={<Baneos />} />
          <Route path="users/:idUser" element={<Users />} />
          <Route path="users" element={<Users />} />
          <Route path="error" element={<Error />} />
          <Route path="*" element={<Navigate to="/error" replace />} />
          <Route path="home" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
