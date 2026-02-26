import './App.css'
import { Routes, Route } from 'react-router-dom';
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from './pages/Login'
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
function App() {
  return (
    <div>
      <Routes>
        {/* Auth routes without Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* All other routes share the Layout */}
        <Route element={<MainLayout />}>
          <Route path='/' element={<Home />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/profile/password' element={<ChangePassword />} />
          <Route path='/reports' element={<Reports />} />
        </Route>
        {/* Not found route without Layout */}
        <Route path='*' element={<NotFound />} />
      </Routes>


    </div>
  )
}

export default App
