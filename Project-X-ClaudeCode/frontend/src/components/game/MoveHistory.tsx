interface Props {
  pgn: string;
}

export default function MoveHistory({ pgn }: Props) {
  const moves = pgn
    .replace(/\[.*?\]\n*/g, '')
    .replace(/\d+\.\s*/g, '')
    .replace(/\s*\*$/, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const pairs: string[][] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1] ?? '']);
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 h-64 overflow-y-auto">
      <h3 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wide">Moves</h3>
      {pairs.length === 0 ? (
        <p className="text-gray-500 text-sm">No moves yet</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {pairs.map((pair, i) => (
              <tr key={i} className="hover:bg-gray-700">
                <td className="text-gray-500 pr-3 py-1 w-8">{i + 1}.</td>
                <td className="text-white pr-3 py-1 font-mono">{pair[0]}</td>
                <td className="text-white py-1 font-mono">{pair[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
