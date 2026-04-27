import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import { 
  CreditCard, Search, ArrowUpRight, ArrowDownLeft, 
  Filter, Download, Wallet, Clock, CheckCircle, XCircle 
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../../components/UI/UI';
import axios from 'axios';
import './Payments.css';

const Payments = () => {
  const { url, token } = useContext(StoreContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.post(url + "/api/order/user-orders", {}, {
          headers: { token }
        });
        if (response.data.success) {
          // Using orders as mock transactions for now
          setTransactions(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchTransactions();
  }, [token, url]);

  if (loading) {
    return <div className="p-20 text-center">Loading transactions...</div>;
  }

  return (
    <div className="payments-page">
      <div className="payments-header">
        <h1>Payment History</h1>
        <p className="text-muted">Track your transactions and payment status</p>
      </div>

      <div className="payments-stats-grid">
        <Card glass className="stat-card">
          <div className="stat-icon-box bg-tomato-soft"><Wallet className="text-tomato" /></div>
          <div>
            <label>Total Spent</label>
            <h3>Ksh {transactions.reduce((acc, curr) => acc + curr.amount, 0)}</h3>
          </div>
        </Card>
        <Card glass className="stat-card">
          <div className="stat-icon-box bg-blue-soft"><CreditCard className="text-blue" /></div>
          <div>
            <label>Saved Methods</label>
            <h3>1 Method (M-Pesa)</h3>
          </div>
        </Card>
        <Card glass className="stat-card">
          <div className="stat-icon-box bg-green-soft"><CheckCircle className="text-green" /></div>
          <div>
            <label>Success Rate</label>
            <h3>98.5%</h3>
          </div>
        </Card>
      </div>

      <Card className="transactions-card" padding={false}>
        <div className="card-toolbar">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Search transactions..." />
          </div>
          <div className="toolbar-actions">
            <Button variant="outline" size="sm" icon={Filter}>Filter</Button>
            <Button variant="outline" size="sm" icon={Download}>Export</Button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Method</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td className="payment-id-cell">{tx.paymentId || tx._id.substring(0, 12)}</td>
                    <td>
                      <div className="method-cell">
                        <div className="method-icon-small"><CreditCard size={14} /></div>
                        <span>M-Pesa</span>
                      </div>
                    </td>
                    <td className="text-muted">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="payment-amount-cell">Ksh {tx.amount}</td>
                    <td>
                      <Badge variant={tx.payment ? 'success' : tx.status === 'Cancelled' ? 'danger' : 'warning'}>
                        {tx.payment ? 'Paid' : tx.status === 'Cancelled' ? 'Failed' : 'Pending'}
                      </Badge>
                    </td>
                    <td>
                      <Button variant="outline" size="sm">Details</Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state-cell">
                    <div className="empty-state">
                      <Clock size={48} className="text-muted mb-4" />
                      <p>No transactions found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Payments;
