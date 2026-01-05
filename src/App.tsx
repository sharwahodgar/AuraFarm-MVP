import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import BeejMitra from "./pages/BeejMitra";
import KrishiSaathi from "./pages/KrishiSaathi";
import Profile from "./pages/Profile";
import AppLayout from "./components/AppLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* App Layout */}
        <Route element={<AppLayout />}>
          <Route path="/feed" element={<Feed />} />
          <Route path="/beejmitra" element={<BeejMitra />} />
          <Route path="/krishisathi" element={<KrishiSaathi />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
