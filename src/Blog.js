import React from 'react'



const Blog = () => {
  return (
    <div className='d-flex justify-content-center vh-100'>
     <h2> Welcome to the Dashboard { sessionStorage.getItem('username') } !!!</h2>
     
    </div>
  )
}

export default Blog