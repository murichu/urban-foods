/* eslint-disable no-unused-vars */
import React, { useContext } from "react";
import "./Favorites.css";
import { StoreContext } from "../../Context/StoreContext";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";

const Favorites = () => {
  const { food_list, addToCart, removeFromCart, url } = useContext(StoreContext);
  const navigate = useNavigate();

  // Filter favorite items (you can implement actual favorites logic with context)
  const favoriteItems = food_list.filter(item => item.isFavorite || false);

  return (
    <div className="favorites">
      <div className="favorites-container">
        <h1>My Favorites</h1>
        
        {favoriteItems.length === 0 ? (
          <div className="empty-favorites">
            <img src={assets.rating_starts} alt="Empty" />
            <h2>No Favorites Yet</h2>
            <p>Start adding your favorite foods to this list!</p>
            <button onClick={() => navigate("/")}>Browse Menu</button>
          </div>
        ) : (
          <div className="favorites-grid">
            {favoriteItems.map((item) => (
              <div key={item._id} className="favorite-card">
                <div className="favorite-image">
                  <img src={url + "/images/" + item.image} alt={item.name} />
                  <button 
                    className="remove-favorite"
                    onClick={() => {/* Implement remove favorite logic */}}
                  >
                    <img src={assets.rating_starts} alt="Remove" />
                  </button>
                </div>
                <div className="favorite-info">
                  <h3>{item.name}</h3>
                  <p className="favorite-description">{item.description}</p>
                  <div className="favorite-price-action">
                    <p className="favorite-price">Ksh {item.price}</p>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(item._id)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
