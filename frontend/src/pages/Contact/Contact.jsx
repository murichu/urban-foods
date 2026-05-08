 
import React, { useState } from "react";
import "./Contact.css";
import {
  MapPin, Mail, Phone,
  HelpCircle, MessageSquare, Send
} from 'lucide-react';
import { assets } from "../../assets/assets";
import { Card, Button, Input } from '../../components/UI/UI';

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
    alert("Thank you for contacting us! We will get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="contact-page-refined">
      <div className="contact-hero">
        <div className="hero-content">
          <h1>Let's Start a Conversation</h1>
          <p>We're here to help and answer any question you might have. We look forward to hearing from you!</p>
        </div>
      </div>

      <div className="contact-grid-container">
        <div className="contact-info-panel">
          <Card className="info-glass-card">
            <h2 className="panel-title">Reach Out to Us</h2>
            <p className="panel-subtitle">Our team is available 24/7 to assist you with your culinary needs.</p>

            <div className="contact-methods-list">
              <div className="method-item">
                <div className="method-icon-box">
                  <MapPin size={24} className="text-tomato" />
                </div>
                <div className="method-text">
                  <h3>Headquarters</h3>
                  <p>123 Foodie Plaza, Culinary District<br />Nairobi, Kenya</p>
                </div>
              </div>

              <div className="method-item">
                <div className="method-icon-box">
                  <Mail size={24} className="text-tomato" />
                </div>
                <div className="method-text">
                  <h3>Email Support</h3>
                  <p>hello@urbanfoods.com<br />support@urbanfoods.com</p>
                </div>
              </div>

              <div className="method-item">
                <div className="method-icon-box">
                  <Phone size={24} className="text-tomato" />
                </div>
                <div className="method-text">
                  <h3>Phone Line</h3>
                  <p>+254 700 000 000<br />+254 711 111 111</p>
                </div>
              </div>
            </div>

            <div className="social-connect">
              <h3>Connect with us</h3>
              <div className="social-btn-group">
                <a href="#" className="social-link-btn"><img src={assets.facebook_icon} alt="Facebook" /></a>
                <a href="#" className="social-link-btn"><img src={assets.twitter_icon} alt="Twitter" /></a>
                <a href="#" className="social-link-btn"><img src={assets.linkedin_icon} alt="LinkedIn" /></a>
              </div>
            </div>
          </Card>
        </div>

        <div className="contact-form-panel">
          <Card className="form-premium-card">
            <div className="form-header">
              <MessageSquare size={20} className="text-tomato" />
              <h2>Drop us a Message</h2>
            </div>

            <form onSubmit={handleSubmit} className="refined-form">
              <div className="form-row-dual">
                <Input
                  label="Full Name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                label="Subject"
                name="subject"
                placeholder="How can we help?"
                value={formData.subject}
                onChange={handleChange}
                className="mt-4"
                required
              />

              <div className="admin-ui-input-group mt-4">
                <label className="admin-ui-label">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  rows="6"
                  className="modern-textarea"
                  required
                ></textarea>
              </div>

              <Button variant="primary" size="lg" type="submit" className="contact-submit-btn" icon={Send}>
                Transmit Message
              </Button>
            </form>
          </Card>
        </div>
      </div>

      <section className="faq-section-modern">
        <div className="section-title-box">
          <HelpCircle size={32} className="text-tomato mb-4" />
          <h2>Quick Answers</h2>
          <p className="text-muted">Maybe we've already answered your question</p>
        </div>

        <div className="faq-modern-grid">
          <Card hover className="faq-card">
            <h3>Delivery Coverage</h3>
            <p>We currently operate in all major districts of Nairobi with plans to expand nationwide soon.</p>
          </Card>
          <Card hover className="faq-card">
            <h3>Payment Security</h3>
            <p>All payments are processed through encrypted channels. We never store your full card details.</p>
          </Card>
          <Card hover className="faq-card">
            <h3>Order Modification</h3>
            <p>You can modify or cancel your order within 5 minutes of placement directly from your dashboard.</p>
          </Card>
          <Card hover className="faq-card">
            <h3>Quality Guarantee</h3>
            <p>If you're not satisfied with the food quality, contact us within 30 minutes for a full refund or replacement.</p>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Contact;
