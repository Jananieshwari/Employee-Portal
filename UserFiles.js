import React, {useEffect, useState} from 'react';
import api from '../api';
import "../styless.css";


export default function UserFiles(){
const [files,setFiles] = useState([]);
const [msg,setMsg] = useState(null);


useEffect(()=>{ fetchFiles(); },[]);


async function fetchFiles(){
try{
const res = await api.get('/api/user/files');
setFiles(res.data || []);
}catch(err){ setMsg('Failed to load files'); }
}


async function delFile(filename){
if(!window.confirm('Delete this file?')) return;
try{
await api.post('/api/user/delete-file', { filename });
setMsg('File deleted');
fetchFiles();
}catch(err){ setMsg('Delete failed'); }
}


return (
<div className="auth-card wide">
<h2>My Files</h2>
{msg && <div className="notice">{msg}</div>}
<table className="table">
<thead><tr><th>Original</th><th>Stored</th><th>Actions</th></tr></thead>
<tbody>
{files.map(f=> (
<tr key={f.id}>
<td>{f.original}</td>
<td>{f.filename}</td>
<td>
<button className="btn danger" onClick={()=>delFile(f.filename)}>Delete</button>
</td>
</tr>
))}
</tbody>
</table>
</div>
)
}