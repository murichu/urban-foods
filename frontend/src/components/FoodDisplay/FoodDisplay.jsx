/* eslint-disable react/prop-types */
import React, { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../Context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  // Filter the list of food items based on the selected category
  const filteredList =
    food_list?.filter((item) => category === "All" || item.category === category) || [];

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes near you</h2>
      {filteredList.length > 0 ? (
        <div className="food-display-list">
          {filteredList.map((item) => (
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
      ) : (
        <p className="no-items-message">No food items available for the selected category.</p>
      )}
    </div>
  );
};

export default FoodDisplay;
