import './App.css'
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Reports from './pages/admin/Reports';
import AllTickets from './pages/admin/AllTickets';
import TaskManagement from './pages/admin/TaskManagement';
import DeletedTickets from './pages/admin/DeletedTickets ';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import TicketDetailsModal from './components/tickets/TicketDetailsModal';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div>
      <Routes>
        {/* Routes without layout */}
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route element={<MainLayout />}>
          <Route path='/profile' element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path='/profile/password' element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />
          {/* User */}
          <Route path='/user/dashboard' element={
            <ProtectedRoute role="USER">
              <UserDashboard />
            </ProtectedRoute>
          }>
            <Route path='tickets/:id' element={<TicketDetailsModal />} />
          </Route>

          {/* Admin */}
          <Route path='/admin/dashboard' element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } >
            <Route path='tickets/:id' element={<TicketDetailsModal />} />
          </Route>
          <Route path='/reports' element={
            <ProtectedRoute role="ADMIN">
              <Reports />
            </ProtectedRoute>
          } />
          {/* <Route path='/all-tickets' element={
            <ProtectedRoute role="ADMIN">
              <AllTickets />
            </ProtectedRoute>
          } >
            <Route path='tickets/:id' element={<TicketDetailsModal />} />
          </Route> */}
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div >
  );
}

export default App;