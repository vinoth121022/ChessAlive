'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUsername(JSON.parse(stored).username);
  }, []);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUsername(null);
    window.location.href = '/';
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-700 h-16 flex items-center px-6">
      <Link href="/" className="text-white font-bold text-xl mr-8">ChessAlive ♟️</Link>
      <div className="flex items-center gap-6 ml-auto">
        {username ? (
          <>
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition text-sm">{username}</Link>
            <button onClick={logout} className="text-gray-400 hover:text-white transition text-sm">Log out</button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-300 hover:text-white transition text-sm">Log In</Link>
            <Link href="/register" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
