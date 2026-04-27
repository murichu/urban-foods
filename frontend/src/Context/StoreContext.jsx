import { createContext, useEffect, useState, useMemo } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const [foodList, setFoodList] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [token, setToken] = useState("");

  const url = import.meta.env.VITE_API_BASE_URL;

  // Axios instance (cleaner API calls)
  const api = useMemo(() => {
    return axios.create({
      baseURL: url,
    });
  }, [url]);

  // Add to cart
  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    if (!token) return;

    try {
      await api.post(
        "/api/cart/add",
        { itemId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId) => {
    const currentQty = cartItems[itemId] || 0;

    if (currentQty <= 0) return;

    setCartItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] - 1,
    }));

    if (!token) return;

    try {
      await api.post(
        "/api/cart/remove",
        { itemId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  // Total cart amount
  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, qty]) => {
      if (qty > 0) {
        const item = foodList.find((f) => f._id === itemId);
        return item ? total + item.price * qty : total;
      }
      return total;
    }, 0);
  };

  // Fetch food list
  const fetchFoodList = async () => {
    try {
      const response = await api.get("/api/foods/list");
      setFoodList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch food list:", error);
    }
  };

  // Favorites logic
  const fetchFavorites = async (authToken) => {
    try {
      const response = await api.get("/api/favorite/list", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.data.success) {
        setFavorites(response.data.data.map(item => item._id));
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  };

  const toggleFavorite = async (foodId) => {
    if (!token) {
      alert("Please login to add favorites");
      return;
    }
    try {
      const response = await api.post(
        "/api/favorite/toggle",
        { foodId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setFavorites(response.data.favorites);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  // Load cart data
  const loadCartData = async (authToken) => {
    try {
      const response = await api.post(
        "/api/cart/get",
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setCartItems(response.data.cartData || {});
    } catch (error) {
      console.error("Failed to load cart data:", error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      await fetchFoodList();

      const savedToken = localStorage.getItem("token");

      if (savedToken) {
        setToken(savedToken);
        await loadCartData(savedToken);
        await fetchFavorites(savedToken);
      }
    };

    loadData();
  }, [url]);

  const value = {
    foodList,
    cartItems,
    favorites,
    toggleFavorite,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
    setToken,
    url,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;