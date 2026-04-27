import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./FoodItem.css";
import { StoreContext } from "../../Context/StoreContext";
import { Plus, Minus, Heart, Star, MessageSquare, Send } from "lucide-react";
import { assets } from "../../assets/assets";
import axios from "axios";

const FoodItem = ({ id, name, price, description, image, category }) => {
  const { cartItems, addToCart, removeFromCart, url, favorites, toggleFavorite, token } =
    useContext(StoreContext);

  const [showReviews, setShowReviews] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const isFavorite = favorites.includes(id);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${url}/api/review/${id}`);
      if (response.data.success) {
        setReviewCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    if (showReviews) {
      fetchReviews();
    }
  }, [showReviews]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Please login to submit a review");
      return;
    }
    try {
      const response = await axios.post(
        `${url}/api/review/add`,
        {
          foodId: id,
          rating: newReview.rating,
          comment: newReview.comment,
          userName: localStorage.getItem("userName") || "Anonymous",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setNewReview({ rating: 5, comment: "" });
        fetchReviews();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  return (
    <div className="food-item" id={id}>
      <div className="food-item-img-container">
        <img
          className="food-item-image"
          src={url + "/images/" + image}
          alt={name}
        />
        <div className="favorite-icon" onClick={() => toggleFavorite(id)}>
          <Heart className={`icon-sm ${isFavorite ? "active" : ""}`} fill={isFavorite ? "var(--primary)" : "none"} />
        </div>
        {!cartItems[id] ? (
          <div className="add" onClick={() => addToCart(id)}>
            <Plus className="icon-sm" />
          </div>
        ) : (
          <div className="food-item-counter">
            <div className="counter-btn remove" onClick={() => removeFromCart(id)}>
              <Minus className="icon-xs" />
            </div>
            <p>{cartItems[id]}</p>
            <div className="counter-btn add-more" onClick={() => addToCart(id)}>
              <Plus className="icon-xs" />
            </div>
          </div>
        )}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <div className="food-item-rating" onClick={() => setShowReviews(!showReviews)}>
            <Star className="icon-xs fill-yellow" />
            <span className="rating-count">({reviewCount})</span>
            <MessageSquare className="icon-xs review-toggle" />
          </div>
        </div>
        <div className="food-item-badge">{category}</div>
        <p className="food-item-description">{description}</p>
        <p className="food-item-price">Ksh {price}</p>

        {showReviews && (
          <div className="review-section">
            <hr />
            <div className="review-info">
              <p className="review-policy-note">Reviews are private and only visible to administrators. Your rating helps us improve!</p>
            </div>

            <form className="add-review-form" onSubmit={handleReviewSubmit}>
              <div className="rating-select">
                {[1, 2, 3, 4, 5].map((num) => (
                  <Star
                    key={num}
                    size={16}
                    className="star-btn"
                    fill={num <= newReview.rating ? "#FBBF24" : "none"}
                    color={num <= newReview.rating ? "#FBBF24" : "#cbd5e1"}
                    onClick={() => setNewReview({ ...newReview, rating: num })}
                  />
                ))}
              </div>
              <div className="input-with-btn">
                <input
                  type="text"
                  placeholder="Write a review..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  required
                />
                <button type="submit"><Send size={14} /></button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

FoodItem.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  category: PropTypes.string,
};

export default FoodItem;
