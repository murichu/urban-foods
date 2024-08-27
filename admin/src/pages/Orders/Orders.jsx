/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Orders.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for toastify

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/orders', {
          params: {
            page,
            limit,
            sortBy,
            order,
            search: searchTerm,
            startDate,
            endDate,
          },
        });
        setOrders(response.data.data);
        setTotalPages(response.data.totalPages);
        toast.success('Orders fetched successfully!');
      } catch (err) {
        setError('Error retrieving orders');
        toast.error('Error retrieving orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, limit, sortBy, order, searchTerm, startDate, endDate]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleOrderChange = (event) => {
    setOrder(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to the first page on search
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
    setPage(1); // Reset to the first page on date change
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
    setPage(1); // Reset to the first page on date change
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(orders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, 'orders.xlsx');
    toast.success('Exported to Excel successfully!');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['ID', 'Created At', 'Status']], // Table headers
      body: orders.map(order => [
        order._id,
        new Date(order.createdAt).toLocaleString(),
        order.status,
        // Add more fields as needed
      ]),
      margin: { top: 20 },
    });
    doc.save('orders.pdf');
    toast.success('Exported to PDF successfully!');
  };

  if (loading) return <div className="spinner"></div>;
  if (error) return <p>{error}</p>;

  return (
    <div className="orders-container">
      <h1>Orders</h1>
      <div className="controls">
        <label htmlFor="search">
          Search:
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search orders..."
          />
        </label>
        <label htmlFor="startDate">
          Start Date:
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
          />
        </label>
        <label htmlFor="endDate">
          End Date:
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </label>
        <label htmlFor="sortBy">
          Sort By:
          <select id="sortBy" value={sortBy} onChange={handleSortChange}>
            <option value="createdAt">Created At</option>
            <option value="updatedAt">Updated At</option>
            {/* Add more sort options if needed */}
          </select>
        </label>
        <label htmlFor="order">
          Order:
          <select id="order" value={order} onChange={handleOrderChange}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
        <button onClick={exportToExcel}>Export to Excel</button>
        <button onClick={exportToPDF}>Export to PDF</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Created At</th>
            <th>Status</th>
            {/* Add more columns as needed */}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              <td>{order.status}</td>
              {/* Add more cells as needed */}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button
          disabled={page <= 1}
          onClick={() => handlePageChange(1)} // Go to the first page
        >
          First
        </button>
        <button
          disabled={page <= 1}
          onClick={() => handlePageChange(page - 1)} // Previous page
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => handlePageChange(page + 1)} // Next page
        >
          Next
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => handlePageChange(totalPages)} // Go to the last page
        >
          Last
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Orders;
