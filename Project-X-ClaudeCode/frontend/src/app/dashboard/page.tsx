'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { GameState, User } from '@/types/chess';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [games, setGames] = useState<GameState[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    setUser(JSON.parse(stored));
    api.games.myGames().then((g: any) => setGames(g)).catch(console.error);
  }, [router]);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{user.username}</h1>
          <p className="text-gray-400">Rating: {user.rating}</p>
        </div>
        <button onClick={logout} className="text-gray-400 hover:text-white transition">Log out</button>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Games</h2>
        {games.length === 0 ? (
          <p className="text-gray-400">No games yet.</p>
        ) : (
          <div className="space-y-2">
            {games.map(game => (
              <Link key={game.id} href={`/game/${game.id}`}
                className="flex items-center justify-between bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition">
                <span className="text-white">{game.white.username} vs {game.black.username}</span>
                <span className="text-gray-400 text-sm">{game.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
