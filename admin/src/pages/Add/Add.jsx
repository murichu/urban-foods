import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  UploadCloud,
  Package,
  Tag,
  FileText,
  DollarSign,
  Trash2,
  ArrowRight,
  ShoppingBag
} from "lucide-react";
export const Card = ({ children, className = '', padding = true, glass = false, hover = false }) => (
  <div className={`admin-ui-card ${padding ? 'p-6' : ''} ${glass ? 'glass' : ''} ${hover ? 'hover-effect' : ''} ${className}`}>
    {children}
  </div>
);

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick, 
  disabled = false,
  type = 'button',
  icon: Icon
}) => (
  <button 
    type={type}
    className={`admin-ui-btn btn-${variant} btn-${size} ${className}`} 
    onClick={onClick}
    disabled={disabled}
  >
    {Icon && <Icon size={size === 'sm' ? 16 : 18} className="btn-icon" />}
    {children}
  </button>
);

export const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  name, 
  required = false, 
  className = '',
  icon: Icon
}) => (
  <div className={`admin-ui-input-group ${className}`}>
    {label && <label className="admin-ui-label">{label}</label>}
    <div className="input-wrapper">
      {Icon && <Icon size={18} className="input-icon" />}
      <input 
        type={type} 
        name={name}
        placeholder={placeholder} 
        value={value} 
        onChange={onChange} 
        required={required}
        className={Icon ? 'with-icon' : ''}
      />
    </div>
  </div>
);
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./Add.css";

const Add = ({ url }) => {
  const { adminToken } = useAdminAuth();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (file) => {
    if (!file) return;
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return toast.error("Please upload an image");

    setLoading(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("image", image);

    try {
      const res = await axios.post(`${url}/api/foods/add`, formData, {
        headers: { token: adminToken }
      });

      if (res.data.success) {
        toast.success("Product added successfully 🚀");
        setData({
          name: "",
          description: "",
          price: "",
          category: "Salad",
        });
        setImage(null);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-page">
      {/* HEADER */}
      <header className="premium-page-header">
        <div className="header-info-flex">
          <div className="header-icon-container">
            <Package size={28} />
          </div>
          <div className="header-titles">
            <h1>Add New Product</h1>
            <p>Create and publish a new menu item</p>
          </div>
        </div>
      </header>

      {/* FORM */}
      <Card className="add-card">
        <form className="add-form" onSubmit={handleSubmit}>

          {/* IMAGE SECTION */}
          <div className="image-section">
            <span className="section-title">Product Image</span>

            <label
              htmlFor="imageUpload"
              className={`upload-box ${image ? "has-image" : ""}`}
            >
              {image ? (
                <div className="preview">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="preview"
                  />
                  <div className="overlay">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={(e) => {
                        e.preventDefault();
                        setImage(null);
                      }}
                      icon={Trash2}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <UploadCloud size={32} />
                  <p>Click or drag image</p>
                  <span>PNG, JPG, WEBP</span>
                </div>
              )}
            </label>

            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleImage(e.target.files[0])}
            />
          </div>

          {/* FORM SECTION */}
          <div className="form-section">
            <span className="section-title">Product Details</span>

            <Input
              label="Product Name"
              name="name"
              value={data.name}
              onChange={handleChange}
              placeholder="e.g. Truffle Pasta"
              icon={Package}
              required
            />

            <div className="row">
              <div className="field">
                <label><Tag size={14} /> Category</label>
                <select
                  name="category"
                  value={data.category}
                  onChange={handleChange}
                >
                  <option>Salad</option>
                  <option>Rolls</option>
                  <option>Desserts</option>
                  <option>Sandwich</option>
                  <option>Cake</option>
                  <option>Pure Veg</option>
                  <option>Pasta</option>
                  <option>Noodles</option>
                </select>
              </div>

              <Input
                label="Price (KSh)"
                name="price"
                type="number"
                value={data.price}
                onChange={handleChange}
                icon={DollarSign}
                required
              />
            </div>

            <div className="field">
              <label><FileText size={14} /> Description</label>
              <textarea
                name="description"
                value={data.description}
                onChange={handleChange}
                rows="5"
                placeholder="Describe taste, ingredients, and appeal..."
                required
              />
            </div>

            <div className="actions">
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? "Publishing..." : "Publish Product"}
                {!loading && <ArrowRight size={18} />}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* TIP */}
      <Card className="tip-card">
        <div className="tip">
          <ShoppingBag size={20} />
          <div>
            <h4>Pro Tip</h4>
            <p>Use clean, high-quality images for better conversions.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Add;