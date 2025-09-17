import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RequestAccess from './pages/RequestAccess';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import UserPersonalDetails from './pages/UserPersonalDetails';
import UserUpload from './pages/UserUpload';
import UserFiles from './pages/UserFiles';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';


function App(){
return (
<Router>
<div className="app-root">
<Navbar />
<main className="container">
<Routes>
<Route path="/" element={<Home/>} />
<Route path="/request-access" element={<RequestAccess/>} />
<Route path="/login" element={<Login/>} />
<Route path="/user" element={<UserDashboard/>} />
<Route path="/user/personal" element={<UserPersonalDetails/>} />
<Route path="/user/upload" element={<UserUpload/>} />
<Route path="/user/files" element={<UserFiles/>} />
<Route path="/admin" element={<AdminDashboard/>} />
<Route path="/forgot-password" element={<ForgotPassword/>} />
<Route path="/reset-password/:token" element={<ResetPassword/>} />
</Routes>
</main>
</div>
</Router>
)
}


export default App;