interface Props {
  onResign: () => void;
  onOfferDraw: () => void;
  gameStatus: string;
}

export default function GameControls({ onResign, onOfferDraw, gameStatus }: Props) {
  const isActive = gameStatus === 'ACTIVE';

  return (
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col gap-3">
      <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Controls</h3>
      <button onClick={onOfferDraw} disabled={!isActive}
        className="bg-gray-600 hover:bg-gray-500 disabled:opacity-40 text-white py-2 rounded-lg transition text-sm font-medium">
        Offer Draw
      </button>
      <button onClick={onResign} disabled={!isActive}
        className="bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white py-2 rounded-lg transition text-sm font-medium">
        Resign
      </button>
      {!isActive && (
        <p className="text-center text-gray-400 text-sm">Game over: {gameStatus}</p>
      )}
    </div>
  );
}
