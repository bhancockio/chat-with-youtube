import Link from "next/link";
import React from "react";

function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-red-500 px-12 py-4">
      <div className="text-2xl font-bold text-white">Chat With YouTube</div>
      <div className="flex space-x-14 text-xl">
        <Link href="/transcript" className="text-white hover:text-gray-200">
          Transcript
        </Link>
        <Link href="/" className="text-white hover:text-gray-200">
          Chat
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
