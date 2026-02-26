import './App.css'
import { useState } from "react";
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
import Button from "./components/shared/Button";
import Input from "./components/shared/Input";
import Modal from "./components/shared/Modal";

function App() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-10 flex flex-col gap-6 w-full max-w-md">

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button onClick={() => setOpen(true)}>Open Modal</Button>

        <Modal isOpen={open} onClose={() => setOpen(false)}>
          <h2 className="text-xl font-bold mb-2">Modal</h2>
          <p className="text-gray-500 text-sm mb-6">Choose Cancel or Confirm.</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </div>
        </Modal>
      </div>

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
  );
}

export default App;