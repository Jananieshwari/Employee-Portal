import React, {useState} from 'react';
import api from '../api';


export default function ForgotPassword(){
const [email,setEmail] = useState('');
const [msg,setMsg] = useState(null);


async function submit(e){
e.preventDefault();
try{
const res = await api.post('/api/admin/forgot-password', { email });
setMsg(res.data.reset_link ? `Test link (dev): ${res.data.reset_link}` : res.data.msg);
}catch(err){ setMsg(err.response?.data?.msg || 'Failed'); }
}


return (
<div className="auth-card">
<h2>Forgot password (admin)</h2>
<form onSubmit={submit} className="form">
<input required placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)} />
<button className="btn" type="submit">Send reset link</button>
</form>
{msg && <div className="notice">{msg}</div>}
</div>
)
}