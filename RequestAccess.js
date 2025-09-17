import React, {useState} from 'react';
import api from '../api';
import "../styless.css";


export default function RequestAccess(){
const [name,setName] = useState('');
const [email,setEmail] = useState('');
const [password,setPassword] = useState('');
const [msg,setMsg] = useState(null);


const submit = async (e)=>{
e.preventDefault();
try{
const res = await api.post('/api/request-access',{name,email,password});
setMsg({type:'ok', text: res.data.msg});
setName(''); setEmail(''); setPassword('');
}catch(err){
setMsg({type:'err', text: err.response?.data?.msg || 'Error'});
}
}


return (
<div className="auth-card">
<h2>Request Access</h2>
<form onSubmit={submit} className="form">
<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" />
<input required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
<input required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" />
<button className="btn" type="submit">Submit request</button>
</form>
{msg && <div className={`notice ${msg.type==='ok' ? 'success' : 'error'}`}>{msg.text}</div>}
<p className="muted">After request admin will approve</p>
</div>
)
}