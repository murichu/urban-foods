import React, { useContext } from 'react';
import './Favorites.css';
import { StoreContext } from '../../Context/StoreContext';
import FoodItem from '../../components/FoodItem/FoodItem';
import { Heart, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../../components/UI/UI';

const Favorites = () => {
  const { foodList, favorites } = useContext(StoreContext);
  const navigate = useNavigate();

  const favoriteItems = foodList.filter(item => favorites.includes(item._id));

  if (favoriteItems.length === 0) {
    return (
      <div className="favorites-empty-page">
        <Card glass className="empty-favorites-card text-center">
          <div className="empty-icon-wrapper">
            <Heart size={64} className="text-tomato" />
          </div>
          <h2>No Favorites Yet</h2>
          <p className="text-muted">Explore our menu and save the dishes you love. They'll appear here for quick access!</p>
          <Button variant="primary" size="lg" className="mt-8" onClick={() => navigate('/')}>
            Explore Menu
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className='favorites-page'>
      <div className="favorites-header">
        <div className="header-icon-box">
          <Heart size={32} fill="#FF6347" color="#FF6347" />
        </div>
        <h1>Your Favorites</h1>
        <p className="text-muted">Your must-have dishes, all in one place. Ready to order again?</p>
      </div>

      <div className="favorites-grid">
        {favoriteItems.map((item) => (
          <FoodItem
            key={item._id}
            id={item._id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default Favorites;
