import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  Search, Filter, Edit2, Trash2, 
  ShoppingBag, Plus, X, Upload, 
  Grid, List as ListIcon, Info, AlertTriangle
} from 'lucide-react';
export const Card = ({ children, className = '', padding = true, glass = false, hover = false, ...props }) => (
  <div 
    className={`admin-ui-card ${padding ? 'p-6' : ''} ${glass ? 'glass' : ''} ${hover ? 'hover-effect' : ''} ${className}`}
    {...props}
  >
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
  icon: Icon,
  ...props
}) => (
  <button 
    type={type}
    className={`admin-ui-btn btn-${variant} btn-${size} ${className}`} 
    onClick={onClick}
    disabled={disabled}
    {...props}
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
  icon: Icon,
  ...props
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
        {...props}
      />
    </div>
  </div>
);

export const Badge = ({ children, variant = 'default', className = '', ...props }) => (
  <span className={`admin-ui-badge badge-${variant} ${className}`} {...props}>
    {children}
  </span>
);

export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  confirmVariant = "primary",
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <Card className="modal-box" padding={false} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className={`header-icon-box bg-${confirmVariant === 'danger' ? 'danger' : 'tomato'}-soft`}>
            <AlertTriangle size={20} className={`text-${confirmVariant === 'danger' ? 'danger' : 'tomato'}`} />
          </div>
          <h2>{title}</h2>
          <button type="button" className="modal-close-x" onClick={onClose} disabled={isLoading}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-body-premium">
          <p className="modal-description">
            {message}
          </p>
        </div>
        <div className="modal-footer-modern">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel Action</Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={isLoading} className="confirm-main-btn">
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
};
import { useAdminAuth } from '../../context/AdminAuthContext';
import "./List.css";

const CATEGORIES = ["All", "Salad", "Rolls", "Desserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"];

const getCategoryVariant = (category) => {
  const map = {
    'Salad': 'success',
    'Desserts': 'primary',
    'Rolls': 'warning',
    'Sandwich': 'info',
    'Cake': 'danger',
    'Pure Veg': 'success',
    'Pasta': 'warning',
    'Noodles': 'info'
  };
  return map[category] || 'default';
};

const SkeletonRow = () => (
  <tr className="skeleton-row">
    <td><div className="skeleton skeleton-img"></div></td>
    <td><div className="skeleton skeleton-text short"></div></td>
    <td>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text short mt-2"></div>
    </td>
    <td><div className="skeleton skeleton-badge"></div></td>
    <td><div className="skeleton skeleton-text short"></div></td>
    <td><div className="skeleton skeleton-badge"></div></td>
    <td>
      <div className="table-actions">
        <div className="skeleton skeleton-btn"></div>
        <div className="skeleton skeleton-btn"></div>
      </div>
    </td>
  </tr>
);

const EditModal = ({ food, url, token, onClose, onSaved }) => {
  const [data, setData] = useState({
    name: food.name,
    description: food.description,
    price: food.price,
    category: food.category,
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", Number(data.price));
      formData.append("category", data.category);
      if (image) formData.append("image", image);

      const response = await axios.put(`${url}/api/foods/update/${food._id}`, formData, {
        headers: { token }
      });
      if (response.data.success) {
        toast.success("Food updated successfully");
        onSaved(response.data.data);
        onClose();
      } else {
        toast.error(response.data.message || "Update failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating food");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <Card className="modal-box edit-modal-premium" padding={false} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-icon-box bg-tomato-soft"><Edit2 size={20} className="text-tomato" /></div>
          <h2>Edit Food Item</h2>
          <button type="button" className="modal-close-x" onClick={onClose}><X size={24} /></button>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="modal-body-scrollable p-6">
            <div className="edit-grid-modern">
              <div className="image-upload-section">
                <label className="table-header-label">Item Visual</label>
                <div className="image-edit-preview">
                  <img
                    src={image ? URL.createObjectURL(image) : `${url}/images/${food.image}`}
                    alt={food.name}
                  />
                  <div className="image-overlay-btn">
                    <label htmlFor="edit-image-input">
                      <Upload size={18} />
                      <span>Replace Image</span>
                    </label>
                    <input id="edit-image-input" type="file" hidden onChange={(e) => setImage(e.target.files[0])} />
                  </div>
                </div>
              </div>
              
              <div className="form-fields-stack">
                <Input 
                  label="Product Name" 
                  name="name" 
                  value={data.name} 
                  onChange={onChange} 
                  required 
                />
                
                <div className="form-row-dual">
                  <div className="admin-ui-input-group">
                    <label className="admin-ui-label">Menu Category</label>
                    <select name="category" value={data.category} onChange={onChange} className="modern-select-field">
                      {CATEGORIES.slice(1).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <Input 
                    label="Price (Ksh)" 
                    name="price" 
                    type="number" 
                    value={data.price} 
                    onChange={onChange} 
                    required 
                  />
                </div>
                
                <div className="admin-ui-input-group">
                  <label className="admin-ui-label">Description</label>
                  <textarea 
                    name="description" 
                    rows={4} 
                    value={data.description} 
                    onChange={onChange} 
                    className="modern-textarea"
                    required 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer-modern">
            <Button variant="outline" onClick={onClose}>Cancel & Discard</Button>
            <Button variant="primary" type="submit" disabled={loading} className="save-item-btn">
              {loading ? "Applying Changes..." : "Update Menu Item"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const List = ({ url }) => {
  const { adminToken } = useAdminAuth();
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [editFood, setEditFood] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list');
  const itemsPerPage = 10;

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/foods/list`);
      if (response.data.success) setList(response.data.data);
    } catch (error) {
      toast.error("Failed to load menu list");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    
    setIsDeleting(true);
    try {
      const response = await axios.delete(`${url}/api/foods/remove/${deleteConfirmId}`, {
        headers: { token: adminToken }
      });
      if (response.data.success) {
        toast.success("Item removed from menu");
        setList((prev) => prev.filter((f) => f._id !== deleteConfirmId));
      }
    } catch (error) {
      toast.error("Error removing item");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const handleSaved = (updatedFood) => {
    setList((prev) => prev.map((f) => f._id === updatedFood._id ? updatedFood : f));
  };

  useEffect(() => { fetchList(); }, []);

  const filtered = useMemo(() =>
    list.filter((item) => {
      const matchCat = filterCat === "All" || item.category === filterCat;
      const searchLower = search.toLowerCase().replace('#', '');
      const matchSearch = !search || 
        item.name.toLowerCase().includes(searchLower) ||
        item._id.toLowerCase().includes(searchLower) ||
        (item.enterpriseId && item.enterpriseId.toLowerCase().includes(searchLower));
      return matchCat && matchSearch;
    }),
    [list, search, filterCat]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCat]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedList = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const categoryCounts = useMemo(() => {
    return CATEGORIES.slice(1).reduce((acc, cat) => {
      acc[cat] = list.filter((item) => item.category === cat).length;
      return acc;
    }, {});
  }, [list]);

  return (
    <div className="list-page-wrapper">
      <header className="premium-page-header">
        <div className="header-info-flex">
          <div className="header-icon-container">
            <ShoppingBag size={28} />
          </div>
          <div className="header-titles">
            <h1>Menu Overview</h1>
            <p>Manage your restaurant menu items and availability</p>
          </div>
        </div>
        <div className="header-action-items">
          <Button variant="primary" icon={Plus} onClick={() => window.location.href='/add'}>Add New Item</Button>
        </div>
      </header>

      <div className="modern-category-pills-container">
        <div className="modern-category-pills">
          <button 
            className={`cat-pill ${filterCat === "All" ? "active" : ""}`}
            onClick={() => setFilterCat("All")}
          >
            All <span className="cat-count">{list.length}</span>
          </button>
          {CATEGORIES.slice(1).map((cat) => (
            <button 
              key={cat} 
              className={`cat-pill ${filterCat === cat ? "active" : ""}`}
              onClick={() => setFilterCat(filterCat === cat ? "All" : cat)}
            >
              {cat} <span className="cat-count">{categoryCounts[cat] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <Card className="menu-list-card" padding={false}>
        <div className="floating-toolbar">
          <div className="search-pill">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="toolbar-actions">
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="list-content-area">
          {viewMode === 'list' ? (
            <div className="modern-table-container">
              <table className="modern-menu-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Item ID</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <>
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                    </>
                  ) : paginatedList.length > 0 ? (
                    paginatedList.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="table-img-box">
                            <img src={`${url}/images/${item.image}`} alt={item.name} />
                          </div>
                        </td>
                        <td>
                          <Badge variant="default" className="text-xs font-mono">
                            {item.enterpriseId || `#${item._id.slice(-6).toUpperCase()}`}
                          </Badge>
                        </td>
                        <td>
                          <div className="product-name-cell">
                            <p className="item-name">{item.name}</p>
                            <p className="text-xs text-muted line-clamp-1">{item.description}</p>
                          </div>
                        </td>
                        <td><Badge variant={getCategoryVariant(item.category)} className="category-badge">{item.category}</Badge></td>
                        <td className="price-cell">
                          <div className="price-tag">
                            <span className="currency">Ksh</span> {item.price}
                          </div>
                        </td>
                        <td><Badge variant="success">Available</Badge></td>
                        <td>
                          <div className="table-actions">
                            <button className="btn-icon-modern btn-ghost-primary" onClick={() => setEditFood(item)} title="Edit Item">
                              <Edit2 size={16} />
                            </button>
                            <button className="btn-icon-modern btn-ghost-danger" onClick={() => setDeleteConfirmId(item._id)} title="Delete Item">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty-state-cell">
                        <div className="modern-empty-state">
                          <div className="empty-state-icon">
                            <ShoppingBag size={48} />
                          </div>
                          <h3>No Products Found</h3>
                          <p>There are no items matching your current filters in this category.</p>
                          <Button variant="primary" icon={Plus} onClick={() => window.location.href='/add'} className="mt-4">
                            Add New Item
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="menu-grid-view">
              {loading ? (
                Array(6).fill(0).map((_, i) => <div key={i} className="skeleton grid-skeleton"></div>)
              ) : paginatedList.length > 0 ? (
                paginatedList.map((item) => (
                  <Card key={item._id} className="product-grid-card" padding={false}>
                    <div className="grid-card-img">
                      <img src={`${url}/images/${item.image}`} alt={item.name} />
                      <Badge variant={getCategoryVariant(item.category)} className="grid-cat-badge">{item.category}</Badge>
                      <div className="id-tag-subtle">#{item._id.slice(-6).toUpperCase()}</div>
                    </div>
                    <div className="grid-card-content">
                      <h3 className="grid-product-name">{item.name}</h3>
                      <p className="grid-description">{item.description}</p>
                      
                      <div className="grid-footer">
                        <div className="price-display-modern">
                          <span className="label">Price</span>
                          <span className="value">Ksh {item.price}</span>
                        </div>
                        <div className="grid-actions">
                          <button className="btn-icon-modern btn-ghost-primary" onClick={() => setEditFood(item)} title="Edit Item">
                            <Edit2 size={18} />
                          </button>
                          <button className="btn-icon-modern btn-ghost-danger" onClick={() => setDeleteConfirmId(item._id)} title="Delete Item">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="grid-empty-state">
                  <ShoppingBag size={48} className="text-muted" />
                  <h3>No Products Found</h3>
                  <p>Try adjusting your search or category filter</p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="list-footer-info">
          <p className="footer-stats">Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filtered.length)}</strong> of <strong>{filtered.length}</strong> products</p>
          
          {totalPages > 1 && (
            <div className="modern-pagination">
              <button 
                className="page-btn nav-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              
              <div className="page-numbers">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1} 
                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button 
                className="page-btn nav-btn" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </Card>

      {editFood && (
        <EditModal food={editFood} url={url} token={adminToken} onClose={() => setEditFood(null)} onSaved={handleSaved} />
      )}

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Menu Item"
        message="Are you sure you want to permanently remove this item from the menu? This action cannot be undone and will immediately reflect on the customer-facing platform."
        confirmText="Delete Item"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default List;