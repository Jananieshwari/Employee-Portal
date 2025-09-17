import React, {useState} from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import "../styless.css";


export default function UserPersonalDetails(){
const navigate = useNavigate();
const [form,setForm] = useState({
full_name:'', phone:'', address:'', department:'', college:'', state:'', pincode:'', nationality:'', blood_group:'', mother_name:'', father_name:'', tenth_percentage:'', twelfth_percentage:'', pg_percentage:''
});
const [msg,setMsg] = useState(null);


function change(e){
setForm({...form, [e.target.name]: e.target.value});
}


async function save(e){
e.preventDefault();
try{
const res = await api.post('/api/user/details', form);
setMsg({type:'ok', text: res.data.msg});
setTimeout(()=>navigate('/user/upload'),800);
}catch(err){
setMsg({type:'err', text: err.response?.data?.msg || 'Error saving'});
}
}


return (
<div className="auth-card wide">
<h2>Personal Details</h2>
<form className="form grid-form" onSubmit={save}>
<input name="full_name" placeholder="Full name" value={form.full_name} onChange={change} required />
<input name="phone" placeholder="Phone" value={form.phone} onChange={change} />
<input name="address" placeholder="Address" value={form.address} onChange={change} />
<input name="department" placeholder="Department" value={form.department} onChange={change} />
<input name="college" placeholder="College" value={form.college} onChange={change} />
<input name="state" placeholder="State" value={form.state} onChange={change} />
<input name="pincode" placeholder="Pincode" value={form.pincode} onChange={change} />
<input name="nationality" placeholder="Nationality" value={form.nationality} onChange={change} />
<input name="blood_group" placeholder="Blood Group" value={form.blood_group} onChange={change} />
<input name="mother_name" placeholder="Mother's name" value={form.mother_name} onChange={change} />
<input name="father_name" placeholder="Father's name" value={form.father_name} onChange={change} />
<input name="tenth_percentage" placeholder="10th %" value={form.tenth_percentage} onChange={change} />
<input name="twelfth_percentage" placeholder="12th %" value={form.twelfth_percentage} onChange={change} />
<input name="pg_percentage" placeholder="PG %" value={form.pg_percentage} onChange={change} />


<div className="form-actions">
<button className="btn" type="submit">Save & Continue</button>
</div>
</form>
{msg && <div className={`notice ${msg.type==='ok' ? 'success' : 'error'}`}>{msg.text}</div>}
</div>
)
}