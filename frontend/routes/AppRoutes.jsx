import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing/Landing";
import CreatePaste from "../pages/CreatePaste/CreatePaste.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create/paste" element={<CreatePaste />} />
      </Routes>
    </BrowserRouter>
  );
}