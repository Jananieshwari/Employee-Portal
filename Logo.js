import React from 'react';


export default function Logo({size=36}){
return (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="frontend/public/IDF logo.jpeg">
<rect x="1" y="1" width="22" height="22" rx="4" fill="#f5f7fa" stroke="#5b6b8a"/>
<path d="M6 12h12M6 7h12M6 17h12" stroke="#2b4865" strokeWidth="1.2" strokeLinecap="round"/>
</svg>
)
}