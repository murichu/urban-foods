/* eslint-disable no-unused-vars */
import React from "react";
import "./About.css";
import { assets } from "../../assets/assets";
import { Truck, Star, Headphones, Search } from "lucide-react";

const About = () => {
  return (
    <div className="about">
      <div className="about-container">
        <h1>About Us</h1>
        
        <div className="about-hero">
          <div className="about-content">
            <h2>Welcome to Food Delivery</h2>
            <p>
              We are passionate about bringing delicious food right to your doorstep. 
              Founded in 2024, we have been committed to providing the best food 
              delivery experience with a wide variety of cuisines from top restaurants.
            </p>
          </div>
          <div className="about-image">
            <img src={assets.header_img} alt="About Us" />
          </div>
        </div>

        <div className="about-mission">
          <h2>Our Mission</h2>
          <p>
            Our mission is to connect people with their favorite meals quickly and 
            conveniently. We believe that everyone deserves access to great food, 
            regardless of how busy their schedule may be.
          </p>
        </div>

        <div className="about-features">
          <h2>Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <Truck size={40} color="var(--primary)" />
              <h3>Fast Delivery</h3>
              <p>Get your food delivered in record time with our efficient delivery network.</p>
            </div>
            <div className="feature-card">
              <Star size={40} color="var(--primary)" fill="var(--primary)" />
              <h3>Quality Food</h3>
              <p>We partner with only the best restaurants to ensure premium quality meals.</p>
            </div>
            <div className="feature-card">
              <Headphones size={40} color="var(--primary)" />
              <h3>Customer Care</h3>
              <p>Our dedicated support team is always ready to assist you 24/7.</p>
            </div>
            <div className="feature-card">
              <Search size={40} color="var(--primary)" />
              <h3>Wide Selection</h3>
              <p>Choose from hundreds of restaurants and thousands of menu items.</p>
            </div>
          </div>
        </div>

        <div className="about-stats">
          <h2>Our Achievements</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>50,000+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-item">
              <h3>500+</h3>
              <p>Partner Restaurants</p>
            </div>
            <div className="stat-item">
              <h3>100,000+</h3>
              <p>Orders Delivered</p>
            </div>
            <div className="stat-item">
              <h3>4.8</h3>
              <p>Average Rating</p>
            </div>
          </div>
        </div>

        <div className="about-team">
          <h2>Meet Our Team</h2>
          <p>
            Behind every successful delivery is a team of dedicated professionals 
            working tirelessly to ensure your satisfaction. Our team includes 
            experienced chefs, logistics experts, and customer service representatives.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
