import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Add from './pages/Add/Add';
import Orders from './pages/Orders/Orders';
import List from './pages/List/List';

const App = () => {
  // Prefer explicit env configuration per deployment and keep safe local fallback.
  const url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  return (
    <>
      <ToastContainer />
      <div className="app-container">
        <Navbar />
        <hr />
        <main className="app-content">
          <Sidebar />
          <Routes>
            <Route path="/add" element={<Add url={url} />} />
            <Route path="/list" element={<List url={url} />} />
            <Route path="/orders" element={<Orders url={url} />} />
          </Routes>
        </main>
      </div>
    </>
  );
};

export default App;
