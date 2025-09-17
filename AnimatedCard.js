import React from 'react';


export default function AnimatedCard({children, className=''}){
return (
<div className={`card-3d ${className}`}>
{children}
</div>
)
}