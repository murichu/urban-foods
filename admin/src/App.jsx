import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Add from './pages/Add/Add';
import Orders from './pages/Orders/Orders';
import List from './pages/List/List';
import Login from './pages/Login/Login';
import Profile from './pages/Profile/Profile';
import Dashboard from './pages/Dashboard/Dashboard';
import AuditLogs from './pages/AuditLogs/AuditLogs';
import Users from './pages/Users/Users';
import Reviews from './pages/Reviews/Reviews';
import Settings from './pages/Settings/Settings';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

const url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const ProtectedLayout = () => {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar />
      <hr />
      <main className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add"     element={<Add url={url} />} />
          <Route path="/list"    element={<List url={url} />} />
          <Route path="/orders"  element={<Orders url={url} />} />
          <Route path="/audit-logs" element={<AuditLogs url={url} />} />
          <Route path="/users"   element={<Users url={url} />} />
          <Route path="/reviews" element={<Reviews url={url} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*"        element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </>
  );
};

const App = () => (
  <AdminAuthProvider>
    <Toaster position="top-right" />
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*"     element={<ProtectedLayout />} />
      </Routes>
    </div>
  </AdminAuthProvider>
);

export default App;

