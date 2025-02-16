/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Orders.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Orders = () => {
  // State Variables
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/orders', {
          params: { page, limit, sortBy, order, search: searchTerm, startDate, endDate },
        });
        setOrders(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        toast.success('Orders fetched successfully!');
      } catch (err) {
        setError('Failed to retrieve orders. Please try again.');
        toast.error('Error fetching orders!');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, limit, sortBy, order, searchTerm, startDate, endDate]);

  // Event Handlers
  const handlePageChange = (newPage) => setPage(newPage);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);
  const handleSortChange = (e) => setSortBy(e.target.value);
  const handleOrderChange = (e) => setOrder(e.target.value);

  // Export Functions
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(orders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, 'orders.xlsx');
    toast.success('Orders exported to Excel!');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['ID', 'Created At', 'Status']],
      body: orders.map(order => [
        order._id,
        new Date(order.createdAt).toLocaleString(),
        order.status,
      ]),
    });
    doc.save('orders.pdf');
    toast.success('Orders exported to PDF!');
  };

  // Conditional Rendering
  if (loading) return <div className="spinner"></div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="orders-container">
      <h1>Orders</h1>

      {/* Controls Section */}
      <div className="controls">
        <label>
          Search:
          <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search orders..." />
        </label>
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={handleStartDateChange} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} onChange={handleEndDateChange} />
        </label>
        <label>
          Sort By:
          <select value={sortBy} onChange={handleSortChange}>
            <option value="createdAt">Created At</option>
            <option value="updatedAt">Updated At</option>
          </select>
        </label>
        <label>
          Order:
          <select value={order} onChange={handleOrderChange}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
        <button onClick={exportToExcel}>Export to Excel</button>
        <button onClick={exportToPDF}>Export to PDF</button>
      </div>

      {/* Orders Table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Created At</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination">
        <button disabled={page <= 1} onClick={() => handlePageChange(1)}>First</button>
        <button disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}>Next</button>
        <button disabled={page >= totalPages} onClick={() => handlePageChange(totalPages)}>Last</button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Orders;
