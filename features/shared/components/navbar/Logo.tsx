import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link
      href="/"
      className="flex justify-center items-center w-32 md:w-36 text-lg md:text-xl my-5 font-extrabold text-center"
    >
      <div className="bg-gradient-to-br from-red-600 to-red-800 text-transparent bg-clip-text drop-shadow-lg">
        <p>MOVIEFLIX</p>
      </div>
      
    </Link>
  );
};

export default Logo;
