import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center px-4">
      <h1 className="text-6xl font-bold text-white mb-4">ChessAlive ♟️</h1>
      <p className="text-xl text-gray-400 mb-8 max-w-lg">
        Play chess online with players around the world. Real-time games, move history, and more.
      </p>
      <div className="flex gap-4">
        <Link href="/register" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition">
          Sign Up — It&apos;s Free
        </Link>
        <Link href="/login" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-8 py-3 rounded-lg transition">
          Log In
        </Link>
      </div>
    </div>
  );
}
