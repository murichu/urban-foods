/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [foodList, setFoodList] = useState([]);
  const [token, setToken] = useState(null);
  const url = "https://urban-foods-backend.vercel.app";

  // Add to cart
  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error("Failed to add to cart:", error);
      }
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId) => {
    if (cartItems[itemId] > 0) {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));

      if (token) {
        try {
          await axios.post(
            `${url}/api/cart/remove`,
            { itemId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (error) {
          console.error("Failed to remove from cart:", error);
        }
      }
    }
  };

  // Get total cart amount
  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
      if (quantity > 0) {
        const item = foodList.find((product) => product._id === itemId);
        return item ? total + item.price * quantity : total;
      }
      return total;
    }, 0);
  };

  // Fetch food list from server
  const fetchFoodList = async () => {  
    try {
      const response = await axios.get(`${url}/api/foods/list`);
      setFoodList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch food list:", error);
    }
  };

  // Load cart data for the user
  const loadCartData = async (token) => {
    try {
      const response = await axios.post(
        `${url}/api/cart/get`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCartItems(response.data.cartData || {});
    } catch (error) {
      console.error("Failed to load cart data:", error);
    }
  };

  // Load initial data and cart when component mounts
  useEffect(() => {
    const loadData = async () => {
      await fetchFoodList();

      const savedToken = localStorage?.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        await loadCartData(savedToken);
      }
    };

    loadData();
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = {
      foodList,
      cartItems,
      addToCart,
      removeFromCart,
      getTotalCartAmount,
      token,
      setToken,
      url,
   }

  return (
    <StoreContext.Provider value={value}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
