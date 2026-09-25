// A small, static picture of a position. Unlike Board it has no chess
// engine or drag-and-drop, so it is cheap enough for the home page. It uses
// chess glyphs instead of the board's SVG pieces, which would add ~70 kB.
const GLYPHS: Record<string, string> = {
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
}
// Forces text (not emoji) presentation of chess glyphs.
const TEXT_STYLE = '︎'

function parsePlacement(fen: string): (string | null)[][] {
  return fen
    .split(' ')[0]!
    .split('/')
    .map((rank) =>
      [...rank].flatMap((char) =>
        /\d/.test(char) ? Array<null>(Number(char)).fill(null) : [char],
      ),
    )
}

export function MiniBoard({ fen, className = 'w-40' }: { fen: string; className?: string }) {
  const ranks = parsePlacement(fen)
  return (
    <div
      aria-hidden
      className={`grid aspect-square grid-cols-8 grid-rows-8 overflow-hidden rounded-md shadow-sm ring-1 ring-black/10 [container-type:inline-size] ${className}`}
    >
      {ranks.flatMap((rank, row) =>
        rank.map((piece, column) => (
          <span
            key={`${row}-${column}`}
            className={`flex items-center justify-center leading-none ${
              (row + column) % 2 === 0 ? 'bg-square-light' : 'bg-square-dark'
            }`}
            style={{
              fontSize: '11.5cqw',
              fontFamily:
                '"Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols 2", "DejaVu Sans", sans-serif',
            }}
          >
            {piece && (
              <span
                className={
                  piece === piece.toUpperCase()
                    ? 'text-white [-webkit-text-stroke:0.12em_var(--color-ink)] [paint-order:stroke_fill]'
                    : 'text-ink'
                }
              >
                {GLYPHS[piece.toLowerCase()]}
                {TEXT_STYLE}
              </span>
            )}
          </span>
        )),
      )}
    </div>
  )
}
