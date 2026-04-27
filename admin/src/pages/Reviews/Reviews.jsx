import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  MessageSquare, Star, Trash2, Calendar, 
  User, Package, Filter, Search, ShieldAlert,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { ConfirmModal } from '../List/List';
import './Reviews.css';

const Reviews = ({ url }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 8;
  const adminToken = localStorage.getItem('adminToken');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/review/list`, {
        headers: { token: adminToken }
      });
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [url]);

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const response = await axios.post(`${url}/api/review/remove`, { id: deleteConfirmId }, {
        headers: { token: adminToken }
      });
      if (response.data.success) {
        toast.success('Review removed');
        setReviews(reviews.filter(r => r._id !== deleteConfirmId));
      }
    } catch (error) {
      toast.error('Error deleting review');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, ratingFilter]);

  const filteredReviews = reviews.filter(rev => {
    const matchesSearch = 
      rev.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = ratingFilter === 'all' || rev.rating === parseInt(ratingFilter);
    
    return matchesSearch && matchesRating;
  });

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="reviews-page">
      <header className="premium-page-header">
        <div className="header-info-flex">
          <div className="header-icon-container">
            <MessageSquare size={28} />
          </div>
          <div className="header-titles">
            <h1>Product Reviews</h1>
            <p>Monitor and manage customer feedback</p>
          </div>
        </div>
        <div className="header-action-items">
          <div className="stats-badge">
            <Star size={16} fill="#ff6347" color="#ff6347" />
            <span>{reviews.length} Total Reviews</span>
          </div>
        </div>
      </header>

      <div className="reviews-container">
        <div className="toolbar-premium">
          <div className="search-box-premium">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search reviewer or comment..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
             <Filter size={18} />
             <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
             </select>
          </div>
        </div>

        <div className="reviews-list">
          {loading ? (
            <div className="loading-state-full">Loading reviews...</div>
          ) : paginatedReviews.length > 0 ? (
            paginatedReviews.map(rev => (
              <div key={rev._id} className="review-list-item">
                <div className="rev-user">
                  <div className="user-avatar-sm">{rev.userName[0]}</div>
                  <div>
                    <strong>{rev.userName}</strong>
                    <span className="rev-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="rev-content-wrapper">
                  <div className="rev-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < rev.rating ? "#ff6347" : "transparent"} 
                        color={i < rev.rating ? "#ff6347" : "#cbd5e1"} 
                      />
                    ))}
                  </div>
                  <div className="rev-comment">
                    <p>"{rev.comment}"</p>
                  </div>
                </div>

                <div className="rev-actions">
                  <div className="rev-target">
                    <Package size={14} />
                    <span>Product ID: {rev.foodId?.slice(-6) || '—'}</span>
                  </div>
                  <button className="rev-delete-btn" onClick={() => setDeleteConfirmId(rev._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-state">No reviews found matching your filters.</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination-controls">
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <div className="page-info">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </div>
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Review"
        message="Are you sure you want to permanently remove this review? This action cannot be undone."
        confirmText="Delete Review"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Reviews;
