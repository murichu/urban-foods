import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';
import { ArrowDownTrayIcon } from '../../components/icons/HeroIcons';
import './Orders.css';

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      sortBy,
      order: sortOrder,
      search: searchTerm,
      startDate,
      endDate,
    }),
    [page, limit, sortBy, sortOrder, searchTerm, startDate, endDate],
  );

  // Centralized request function keeps effect dependencies stable and predictable.
  const fetchOrders = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await axios.get(`${url}/api/order/list`, {
        params: queryParams,
        headers: token ? { token } : undefined,
      });

      if (!data?.success) {
        throw new Error(data?.message || 'Failed to load orders.');
      }

      setOrders(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to retrieve orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [queryParams, token, url]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const exportRows = useMemo(
    () =>
      orders.map((order) => ({
        ID: order._id,
        Customer: `${order.address?.firstName || ''} ${order.address?.lastName || ''}`.trim() || 'N/A',
        Amount: order.amount,
        PaymentStatus: order.paymentStatus || 'Pending',
        Status: order.status,
        CreatedAt: new Date(order.createdAt).toLocaleString(),
      })),
    [orders],
  );

  const exportToExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Orders');
    XLSX.writeFile(workbook, `orders-page-${page}.xlsx`);
    toast.success('Orders exported to Excel.');
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    doc.text('Orders Report', 40, 30);
    doc.autoTable({
      head: [['ID', 'Customer', 'Amount', 'Payment', 'Status', 'Created']],
      body: exportRows.map((row) => [
        row.ID,
        row.Customer,
        row.Amount,
        row.PaymentStatus,
        row.Status,
        row.CreatedAt,
      ]),
      startY: 45,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [249, 115, 22] },
    });

    doc.save(`orders-page-${page}.pdf`);
    toast.success('Orders exported to PDF.');
  };

  return (
    <section className="orders-container">
      <header className="orders-header">
        <h1>Orders</h1>
        <div className="orders-actions">
          <button type="button" onClick={exportToExcel}>
            <ArrowDownTrayIcon className="icon-sm" />
            <span>Excel</span>
          </button>
          <button type="button" onClick={exportToPDF}>
            <ArrowDownTrayIcon className="icon-sm" />
            <span>PDF</span>
          </button>
        </div>
      </header>

      <div className="controls" role="group" aria-label="Order filters">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by id or status"
        />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">Created</option>
          <option value="amount">Amount</option>
          <option value="status">Status</option>
          <option value="paymentStatus">Payment</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </select>
      </div>

      {loading ? (
        <div className="spinner" aria-label="Loading orders" />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{`${order.address?.firstName || ''} ${order.address?.lastName || ''}`.trim() || 'N/A'}</td>
                    <td>${Number(order.amount).toFixed(2)}</td>
                    <td>{order.paymentStatus || 'Pending'}</td>
                    <td>{order.status}</td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No orders found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <footer className="pagination">
        <button type="button" disabled={page <= 1} onClick={() => setPage(1)}>
          First
        </button>
        <button type="button" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button type="button" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
          Next
        </button>
        <button type="button" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>
          Last
        </button>
      </footer>
    </section>
  );
};

Orders.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Orders;
