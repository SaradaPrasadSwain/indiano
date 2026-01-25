import React from 'react'
import { Link } from 'react-router-dom'


const Navbar = () => {
  return (
    <>
      <div className='relative'>
        <div className='flex  relative justify-center items-center bg-white mx-auto px-2 py-2 mt-2'>
          <div className='bg-red-500'>Indiano</div>
          <div className='flex'>
            <Link to="/">Home</Link>
            <Link to="/contact">contact us</Link>
            <Link to="/xyz">xyz</Link>
            <Link to="/profile">profile</Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar