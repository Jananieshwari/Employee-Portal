import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import LogoImg from '../assets/IDF logo.jpeg'; // ✅ put your logo inside src/assets folder

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_email');
    setOpen(false);
    navigate('/');
    window.location.reload();
  }

  // Smooth scroll helper
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setOpen(false);
    }
  };

  return (
    <header className="navbar">
      <div className="nav-inner container-lg">
        <Link to="/" className="brand">
          {/* ✅ Logo image */}
          <img src={LogoImg} alt="IDF Logo" className="nav-logo" />
          <div className="brand-text">
            <strong>ICONIC DREAM FOCUS</strong>
            <small>Employee Onboarding Portal</small>
          </div>
        </Link>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <Link to="/home" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>Home</Link>
          <Link to="/about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</Link>
          <Link to="/services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Services</Link>
          <Link to="/contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</Link>
          <Link to="/request-access">Request Access</Link>
        </nav>

        <div className="nav-actions">
          {token ? (
            <>
              <button className="btn ghost" onClick={() => { role === 'admin' ? navigate('/admin') : navigate('/user'); }}>Dashboard</button>
              <button className="btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn">Login</Link>
          )}

          <button className="burger" onClick={() => setOpen(!open)} aria-label="menu">☰</button>
        </div>
      </div>
    </header>
  );
}
