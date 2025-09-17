import React, {useState, useRef, useEffect} from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import "../styless.css";



export default function UserUpload(){
const navigate = useNavigate();
const [files,setFiles] = useState([]);
const [msg,setMsg] = useState(null);
const inputRef = useRef();


async function upload(e){
e.preventDefault();
const f = inputRef.current.files;
if(!f || f.length === 0) return setMsg({type:'err', text:'No files selected'});
const form = new FormData();
for (let i=0;i<f.length;i++) form.append('files', f[i]);
try{
const res = await api.post('/api/user/upload', form, { headers: {'Content-Type':'multipart/form-data'} });
setMsg({type:'ok', text: res.data.msg});
setFiles(res.data.files || []);
}catch(err){
setMsg({type:'err', text: err.response?.data?.msg || 'Upload failed'});
}
}


function goToFiles(){
navigate('/user/files');
}


return (
<div className="auth-card wide">
<h2>Upload Documents</h2>
<form onSubmit={upload} className="form">
<input ref={inputRef} type="file" multiple />
<div className="muted">Allowed: png, jpg, jpeg, gif, pdf, doc, docx, txt</div>
<div className="form-actions">
<button className="btn" type="submit">Upload</button>
<button type="button" onClick={goToFiles} className="btn ghost">View My Files</button>
<p className="muted">After Upload the documents, Automatically submitted</p>
</div>
</form>
{msg && <div className={`notice ${msg.type==='ok' ? 'success' : 'error'}`}>{msg.text}</div>}


{files.length > 0 && (
<div>
<h4>Recently saved</h4>
<ul className="file-list">
{files.map((f,i)=>(<li key={i}>{f.original} <small>({f.filename})</small></li>))}
</ul>
</div>
)}
</div>
)
}