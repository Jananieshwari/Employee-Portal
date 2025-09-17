import React, {useState} from 'react';
import api from '../api';
import { useParams } from 'react-router-dom';


export default function ResetPassword(){
const { token } = useParams();
const [password,setPassword] = useState('');
const [msg,setMsg] = useState(null);


async function submit(e){
e.preventDefault();
try{
const res = await api.post(`/api/admin/reset-password/${token}`, { password });
setMsg(res.data.msg);
}catch(err){ setMsg(err.response?.data?.msg || 'Failed'); }
}


return (
<div className="auth-card">
<h2>Reset Password</h2>
<form onSubmit={submit} className="form">
<input type="password" required placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)} />
<button className="btn" type="submit">Change password</button>
</form>
{msg && <div className="notice">{msg}</div>}
</div>
)
}