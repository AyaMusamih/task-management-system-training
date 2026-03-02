import './App.css'
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login'
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Reports from './pages/admin/Reports';
import AllTickets from './pages/admin/AllTickets';
import TaskManagement from './pages/admin/TaskManagement';
import DeletedTickets from './pages/admin/DeletedTickets ';
import MyTasks from './pages/user/MyTasks';
import TicketDetailsModal from './components/TicketDetailsModal';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div>
      <Routes>
        {/* Routes without layout */}
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route element={<MainLayout />}>
          <Route path='/' element={<Home />} />
          <Route path='/dashboard' element={<Dashboard />} >
            <Route path='tickets/:id' element={<TicketDetailsModal />} />
          </Route>
          <Route path='/profile' element={<Profile />} />
          <Route path='/profile/password' element={<ChangePassword />} />
          {/* User */}
          <Route path='/my-tasks' element={<MyTasks />} />

          {/* Admin */}
          <Route path='/reports' element={<Reports />} />
          <Route path='/all-tickets' element={<AllTickets />} >
            <Route path='tickets/:id' element={<TicketDetailsModal />} />
          </Route>
          <Route path='/task-management' element={<TaskManagement />} />
          <Route path='/deleted-tickets' element={<DeletedTickets />} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div >
  );
}

export default App;