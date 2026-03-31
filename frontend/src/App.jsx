import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
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
          } />

          <Route path='/user/dashboard/tickets/:id' element={
            <ProtectedRoute role="USER">
              <UserDashboard />
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

          <Route path='/reports' element={
            <ProtectedRoute role="ADMIN">
              <Reports />
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
   toastClassName={(context) =>
    `inline-flex items-center gap-2 px-4 py-3 rounded-xl border mb-2 shadow-lg bg-input-bg text-white w-auto max-w-[500px] whitespace-nowrap
    ${context?.type === "success"
        ? "border-[#22C55E]/60"
        : "border-[#ef4444]/60"
    }`
}
    bodyClassName={() => "flex items-center gap-2 text-hint font-inter text-white"}
   icon={({ type }) => (
    <span className={`flex items-center justify-center w-4 h-4 rounded-full border text-hint shrink-0
        ${type === "success" ? "border-[#22C55E] text-[#22C55E]" : "border-[#ef4444] text-[#ef4444]"}`}>
        {type === "success" ? "✓" : "✕"}
    </span>
)}
    closeButton={({ closeToast }) => (
        <button onClick={closeToast} className="ml-auto text-white opacity-60 hover:opacity-100 cursor-pointer">
            ✕
        </button>
    )}
/>
    </div>
  );
}

export default App;