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
      setError(null);
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

        setOrders(response.data?.data || []);
        setTotalPages(response.data?.totalPages || 1);
        toast.success('Orders fetched successfully!');
      } catch (err) {
        setOrders([]); // Reset orders in case of an error
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

  const exportToExcel = () => {
    if (!orders.length) {
      toast.warn('No orders to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(orders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, 'orders.xlsx');
    toast.success('Exported to Excel successfully!');
  };

  const exportToPDF = () => {
    if (!orders.length) {
      toast.warn('No orders to export');
      return;
    }

    const doc = new jsPDF();
    doc.autoTable({
      head: [['ID', 'Created At', 'Status']],
      body: orders.map((order) => [
        order._id,
        new Date(order.createdAt).toLocaleString(),
        order.status,
      ]),
    });
    doc.save('orders.pdf');
    toast.success('Exported to PDF successfully!');
  };

  if (loading) return <div className="spinner">Loading...</div>;

  return (
    <div className="orders-container">
      <h1>Orders</h1>
      {error && <p className="error">{error}</p>}

      <div className="controls">
        <label>
          Search:
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders..."
          />
        </label>
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <label>
          Sort By:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Created At</option>
            <option value="updatedAt">Updated At</option>
          </select>
        </label>
        <label>
          Order:
          <select value={order} onChange={(e) => setOrder(e.target.value)}>
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
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>{order.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No orders found</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => handlePageChange(1)}>
          First
        </button>
        <button
          disabled={page <= 1}
          onClick={() => handlePageChange(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => handlePageChange(page + 1)}
        >
          Next
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          Last
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Orders;
