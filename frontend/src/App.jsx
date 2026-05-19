import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup';
import Profile from './pages/Profile';
import AdminReports from './pages/admin/AdminReports';
import UserReports from './pages/user/UserReports';
import AllTickets from './pages/admin/AllTickets';
import TaskManagement from './pages/admin/TaskManagement';
import DeletedTickets from './pages/admin/DeletedTickets';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

function App() {
  return (
    <div>
      <Routes>
        {/* Routes without layout */}
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />

        {/* redirect root */}
        <Route path='/' element={<Navigate to="/login" />} />


        <Route element={<MainLayout />}>

          {/* Shared */}
          <Route path='/profile' element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          

          {/* User */}
          <Route path='/user/dashboard' element={
            <ProtectedRoute role="USER">
              <UserDashboard />
            </ProtectedRoute>
          } />

          <Route path='/user/dashboard/tickets/:id' element={
            <ProtectedRoute role="USER">
              <UserDashboard />
            </ProtectedRoute>
          } />

          <Route path='/user/reports' element={
            <ProtectedRoute role="USER">
              <UserReports />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path='/admin/dashboard' element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path='/admin/dashboard/tickets/:id' element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path='/all-tickets' element={
            <ProtectedRoute role="ADMIN">
              <AllTickets />
            </ProtectedRoute>
          } />

          <Route path='/all-tickets/tickets/:id' element={
            <ProtectedRoute role="ADMIN">
              <AllTickets />
            </ProtectedRoute>
          } />

          <Route path='/admin/reports' element={
            <ProtectedRoute role="ADMIN">
              <AdminReports />
            </ProtectedRoute>
          } />

          <Route path='/task-management' element={
            <ProtectedRoute role="ADMIN">
              <TaskManagement />
            </ProtectedRoute>
          } />

          <Route path='/deleted-tickets' element={
            <ProtectedRoute role="ADMIN">
              <DeletedTickets />
            </ProtectedRoute>
          } />

        </Route>

        <Route path='*' element={<NotFound />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        toastClassName={() =>
          "!w-[345px] mt-2 mr-2"
        }
      />
    </div>
  );
}

export default App;