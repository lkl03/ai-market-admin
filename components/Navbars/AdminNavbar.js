import React from "react";
import { useRouter } from 'next/router';

import UserDropdown from "components/Dropdowns/UserDropdown.js";

export default function Navbar() {
  const router = useRouter();
  const handleLogout = () => {
    sessionStorage.removeItem('seedPhrase');
    router.push('/');
  };
  return (
    <>
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full z-10 bg-transparent md:flex-row md:flex-nowrap md:justify-start flex items-center p-4">
        <div className="w-full mx-autp items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">
          {/* Brand */}
          <a
            className="text-white text-sm uppercase hidden lg:inline-block font-semibold"
            href="#pablo"
            onClick={(e) => e.preventDefault()}
          >
            Dashboard
          </a>
        </div>
        <button className="w-full max-w-120-px get-started text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-blueGray-400 active:bg-blueGray-500 uppercase text-sm shadow hover:shadow-lg ease-linear transition-all duration-150" onClick={handleLogout}>Log Out</button>
      </nav>
      {/* End Navbar */}
    </>
  );
}
