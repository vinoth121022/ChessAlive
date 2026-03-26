import { Player } from '@/types/chess';

interface Props {
  player: Player;
  color: 'w' | 'b';
}

export default function PlayerInfo({ player, color }: Props) {
  return (
    <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-2 w-full" style={{ maxWidth: '480px' }}>
      <div className={`w-6 h-6 rounded-sm border-2 border-gray-500 ${color === 'w' ? 'bg-white' : 'bg-gray-900'}`} />
      <span className="text-white font-semibold">{player.username}</span>
      <span className="text-gray-400 text-sm ml-auto">{player.rating}</span>
    </div>
  );
}
