import type { CSSProperties } from 'react'
import { parseFen, play, squareIndex } from '../chess/scripted'

// A light board for pictures and scripted animations. Unlike Board it has no
// chess engine or drag-and-drop, so it is cheap enough for the home page. It
// uses chess glyphs instead of the board's SVG pieces, which would add ~70 kB.
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
const FILES = 'abcdefgh'

export type BoardMark = { square: number; capture: boolean }

// Places a square-sized layer on the square (0 = a8, 63 = h1).
function at(square: number): CSSProperties {
  return { transform: `translate(${(square % 8) * 100}%, ${Math.floor(square / 8) * 100}%)` }
}

export function MiniBoard({
  fen,
  moves = [],
  ply = moves.length,
  round = 0,
  marks = [],
  danger,
  coordinates = false,
  drop = false,
  label,
  className = 'w-40',
}: {
  fen: string
  // Scripted UCI moves; the board shows the position after `ply` of them.
  moves?: readonly string[]
  ply?: number
  // Changing it resets the pieces without sliding, e.g. when a replay starts.
  round?: number
  marks?: readonly BoardMark[]
  // A square to glow red, e.g. the king in check.
  danger?: number
  coordinates?: boolean
  // Pieces fall into place one by one when the board appears.
  drop?: boolean
  // Describes the board to screen readers; without it the board is hidden.
  label?: string
  className?: string
}) {
  const start = parseFen(fen)
  const pieces = play(start, moves.slice(0, ply))
  const last = ply > 0 ? moves[ply - 1] : undefined
  const highlighted = last ? [squareIndex(last.slice(0, 2)), squareIndex(last.slice(2, 4))] : []

  return (
    <div
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`relative grid aspect-square select-none grid-cols-8 grid-rows-8 overflow-hidden rounded-md [container-type:inline-size] ${className}`}
    >
      {Array.from({ length: 64 }, (_, square) => {
        const isLight = ((square % 8) + Math.floor(square / 8)) % 2 === 0
        return (
          <span
            key={square}
            className={`relative ${isLight ? 'bg-square-light text-square-dark' : 'bg-square-dark text-square-light'}`}
          >
            {coordinates && square % 8 === 0 && (
              <span className="absolute left-[4%] top-[2%] text-[2.6cqw] font-semibold leading-none">
                {8 - Math.floor(square / 8)}
              </span>
            )}
            {coordinates && square >= 56 && (
              <span className="absolute bottom-[3%] right-[6%] text-[2.6cqw] font-semibold leading-none">
                {FILES[square % 8]}
              </span>
            )}
          </span>
        )
      })}

      {highlighted.map((square) => (
        <span
          key={`last-${square}`}
          className="absolute left-0 top-0 size-[12.5%] bg-accent/45 transition-transform duration-300"
          style={at(square)}
        />
      ))}
      {danger !== undefined && (
        <span
          className="absolute left-0 top-0 size-[12.5%] bg-[radial-gradient(circle,rgb(220_38_38/0.9)_0%,rgb(220_38_38/0.45)_45%,transparent_75%)]"
          style={at(danger)}
        />
      )}
      {marks.map(({ square, capture }, index) => (
        <span
          key={`mark-${square}`}
          className="absolute left-0 top-0 flex size-[12.5%] items-center justify-center"
          style={at(square)}
        >
          <span
            className={`animate-mark rounded-full ${
              capture ? 'size-[86%] border-[length:0.9cqw] border-ink/35' : 'size-[32%] bg-ink/30'
            }`}
            style={{ animationDelay: `${index * 45}ms` }}
          />
        </span>
      ))}

      <div key={round} className="pointer-events-none absolute inset-0">
        {pieces.map((piece, index) => {
          const white = piece.code === piece.code.toUpperCase()
          const promoted = piece.code !== start[piece.id]!.code
          return (
            <span
              key={piece.id}
              className={`absolute left-0 top-0 flex size-[12.5%] items-center justify-center font-symbols text-[11.5cqw] leading-none transition-[transform,opacity,scale] duration-500 ease-out ${
                piece.captured ? 'scale-50 opacity-0 delay-200' : ''
              }`}
              style={at(piece.square)}
            >
              <span
                key={piece.code}
                className={`${
                  white
                    ? 'text-white [-webkit-text-stroke:0.12em_var(--color-ink)] [paint-order:stroke_fill]'
                    : 'text-ink'
                } drop-shadow-[0_0.5cqw_0.4cqw_rgb(0_0_0/0.25)] ${
                  promoted ? 'animate-pop' : drop ? 'animate-drop' : ''
                }`}
                style={drop && !promoted ? { animationDelay: `${index * 28}ms` } : undefined}
              >
                {GLYPHS[piece.code.toLowerCase()]}
                {TEXT_STYLE}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
