/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import "./Contact.css";
import { assets } from "../../assets/assets";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    alert("Thank you for contacting us! We will get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="contact">
      <div className="contact-container">
        <h1>Contact Us</h1>
        
        <div className="contact-content">
          <div className="contact-info">
            <h2>Get In Touch</h2>
            <p>Have a question or feedback? We'd love to hear from you!</p>
            
            <div className="info-item">
              <img src={assets.location_icon} alt="Location" />
              <div>
                <h3>Our Location</h3>
                <p>123 Food Street, Culinary City, FC 12345</p>
              </div>
            </div>

            <div className="info-item">
              <img src={assets.mail_icon} alt="Email" />
              <div>
                <h3>Email Us</h3>
                <p>support@fooddelivery.com</p>
              </div>
            </div>

            <div className="info-item">
              <img src={assets.phone_icon} alt="Phone" />
              <div>
                <h3>Call Us</h3>
                <p>+123 456 7890</p>
              </div>
            </div>

            <div className="social-links">
              <h3>Follow Us</h3>
              <div className="social-icons">
                <a href="#"><img src={assets.facebook_icon} alt="Facebook" /></a>
                <a href="#"><img src={assets.twitter_icon} alt="Twitter" /></a>
                <a href="#"><img src={assets.instagram_icon} alt="Instagram" /></a>
              </div>
            </div>
          </div>

          <div className="contact-form">
            <h2>Send Us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this regarding?"
                  required
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows="5"
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>What are your delivery hours?</h3>
              <p>We deliver from 10:00 AM to 11:00 PM, seven days a week.</p>
            </div>
            <div className="faq-item">
              <h3>How can I track my order?</h3>
              <p>You can track your order in real-time from the "My Orders" section after logging in.</p>
            </div>
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept all major credit cards, debit cards, and digital wallets.</p>
            </div>
            <div className="faq-item">
              <h3>How do I cancel an order?</h3>
              <p>You can cancel your order within 5 minutes of placing it from the "My Orders" section.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
