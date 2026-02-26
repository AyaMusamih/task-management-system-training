import './App.css'
import { Routes, Route } from 'react-router-dom';
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from './pages/Login'
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Reports from "./pages/admin/Reports";
import AllTickets from "./pages/admin/AllTickets";
import TaskManagement from "./pages/admin/TaskManagement";
import MyTasks from "./pages/user/MyTasks";
import NotFound from "./pages/NotFound";
function App() {
  return (
    <div>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path='/' element={<Home />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/profile/password' element={<ChangePassword />} />
          {/* User */}
          <Route path='/my-tasks' element={<MyTasks />} />

          {/* Admin */}
          <Route path='/reports' element={<Reports />} />
          <Route path='/all-tickets' element={<AllTickets />} />
          <Route path='/task-management' element={<TaskManagement />} />
        </Route>
        {/* Not found route without Layout */}
        <Route path='*' element={<NotFound />} />
      </Routes>


    </div>
  )
}

export default App
