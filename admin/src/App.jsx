/* eslint-disable no-unused-vars */
import React from 'react';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import { Route, Routes } from 'react-router-dom';
import Add from './pages/Add/Add';
import Orders from './pages/Orders/Orders';
import List from './pages/List/List';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {

  const url = "https://urban-foods-backend.vercel.app";
  return (
    <>
      {/* Toast container for notifications */}
      <ToastContainer />

      {/* Main application layout */}
      <div className="app-container">
        {/* Navbar at the top */}
        <Navbar />
        <hr />

        {/* Main content area */}
        <main className="app-content">
          {/* Sidebar for navigation */}
          <Sidebar />

          {/* Routes for different pages */}
          <Routes>
            <Route path="/add" element={<Add  url={url} />} />
            <Route path="/list" element={<List url={url}/>} />
            <Route path="/orders" element={<Orders url={url}/>} />
          </Routes>
        </main>
      </div>
    </>
  );
};

export default App;
