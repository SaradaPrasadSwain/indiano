import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconMenu2, IconShoppingCart, IconUserCircle } from '@tabler/icons-react';

const Navbar = () => {
  const links = [
    { name: 'Mens', href: '/men' },
    { name: 'Womens', href: '/women' },
    { name: 'Children', href: '/children' },
    { name: 'Groceries', href: '/groceries' },
  ];

  const [open, setOpen] = useState(false);

  return (
    <>
      <div className='relative'>
        <div className='flex relative justify-between items-center bg-white mx-auto px-2 py-2 mt-2'>
          <button onClick={() => setOpen(!open)}>
            <IconMenu2 />
          </button>

          {open && (
            <div className='absolute inset-x-0 bg-blue-50 rounded-md top-10 px-2 py-2 mx-auto'>
              <div className='flex flex-col items-start gap-4 text-sm text-neutral-500 p-4'>
                {links.map((link, index) => (
                  <Link to={link.href} key={index}>
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Link to="/">Indiano</Link>

          <div className='flex gap-3'>
            <Link to='/profile'>
              <IconUserCircle />
            </Link>
            <Link to="/kart">
              <IconShoppingCart />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;