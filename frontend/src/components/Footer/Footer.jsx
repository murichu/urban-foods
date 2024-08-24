/* eslint-disable no-unused-vars */
import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Dynamically get the current year

  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.logo} alt="Company Logo" />
          <p>
            It is a pain, and yet, the pleasures are in accordance with the
            reason of easy fulfillment of one’s own life. Needs hold all the
            harshness of inconvenience with the exception of one, and such
            escape indeed.
          </p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="Facebook" />
            <img src={assets.twitter_icon} alt="Twitter" />
            <img src={assets.linkedin_icon} alt="LinkedIn" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About Us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>Email: 123@example.com</li>
            <li>Phone: +1 123-456-7890</li>
            <li>Address: 123 Main St, City, Country</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">Copyright © {currentYear} Tomato.com.</p>
    </div>
  );
};

export default Footer;
