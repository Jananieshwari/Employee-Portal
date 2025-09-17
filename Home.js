// src/pages/Home.js
import React from "react";

import '../styles/home.css';


const Home = () => {
  return (
    <div>
     

      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">Welcome to Iconic Dream Focus</h1>
        <p className="hero-subtitle">Where Innovation Meets Strategy</p>
      </section>

      {/* About Us */}
      <section id="about" className="about">
        <div className="about-left">
          <img src="https://concepto.de/wp-content/uploads/2015/03/software-1-e1550080097569.jpg" alt="About" />
        </div>
        <div className="about-right">
          <h1>About Us</h1>
          <p>
            <strong>We Are Increasing Business Success With Technology
            Welcome to Iconic Dream Focus Pvt Ltd.,</strong> – where innovation meets expertise in app development, 
            data science, and Technology services. Whether you're a startup or an established business, 
            we provide end-to-end digital solutions that drive growth and efficiency.
            We are a technology-driven company offering app development, AI solutions,
            and digital transformation. Our focus is on delivering impactful and scalable
            solutions that help businesses thrive.
          </p>
        </div>
      </section>

      {/* Future & Vision */}
      <section className="cards">
        <div className="card">
          <h1>Future Source</h1>
          <p>To create robust, scalable, and secure solutions that help businesses thrive in the digital age.</p>
        </div>
        <div className="card">
          <h1>Our Vision</h1>
          <p>Our goal is to become a global technology leader known for innovative solutions.</p>
        </div>
      </section>

      {/* Leadership */}
      <section className="leadership">
        <h1>Our Leadership</h1>
        <p>
          John Kiran E. is the Founder and Director of Iconic Dream Focus Pvt. Ltd. He is driven by a vision
          to integrate innovation and strategy in building sustainable business solutions. With expertise in finance,
          technology, and leadership, he has guided the organization toward consistent growth.
        </p>
      </section>

      {/* Services */}
<section id="services" className="services">
  <h1>Our Services</h1>
  <div className="service-grid">
    
    {/* Tech Services */}
    <div className="service-card">
      <h3>Tech Services</h3>
      <ul>
        <li>Cyber Security</li>
        <li>AI Engineering Buddy</li>
        <li>Digital Engineering</li>
        <li>Accelerated Generative AI</li>
      </ul>
    </div>

    {/* Data Engineering & Analytics */}
    <div className="service-card">
      <h3>Data Engineering & Analytics</h3>
      <ul>
        <li>AI & ML</li>
        <li>Automation</li>
        <li>Visualization & Analytics</li>
      </ul>
    </div>

    {/* Application */}
    <div className="service-card">
      <h3>Application</h3>
      <ul>
        <li>Mobile Apps Dev</li>
        <li>Web Apps Dev</li>
        <li>SaaS</li>
      </ul>
    </div>

  </div>
</section>

      {/* Contact */}
      <footer id="contact" className="footer">
        <p>📞 +91 9176080075 | 📧 info@icondf.com</p>
        <p>© 2025 All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default Home;
