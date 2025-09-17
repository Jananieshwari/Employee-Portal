import React from 'react';
import { Link } from 'react-router-dom';
import "../styless.css";


export default function UserDashboard(){
return (
<div className="user-dash">
<h2>User Dashboard</h2>
<div className="cards">
<Link className="card-3d" to="/user/personal">Fill Personal Details</Link>
<Link className="card-3d" to="/user/upload">Upload Documents</Link>
<Link className="card-3d" to="/user/files">My Files</Link>
</div>
</div>
)
}