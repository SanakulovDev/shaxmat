import { Chess, type Square } from 'chess.js'
import {
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { type Arrow, Chessboard } from 'react-chessboard'
import { useReducedMotion } from '../lib/useReducedMotion'
import { findTypedMove, moveFacts, namesPromotionPiece } from './moveText'

export type BoardMove = { from: string; to: string; promotion?: string }

// Lights a square green or red after a right or wrong move. A new id
// plays the flash again, even on the same square.
export type BoardFlash = { kind: 'good' | 'bad'; square: string; id: number }

type BoardProps = {
  fen: string
  orientation: 'white' | 'black'
  // Side the user may move, or null to lock the board.
  movableColor: 'w' | 'b' | null
  onMove: (move: BoardMove) => void
  lastMove?: { from: string; to: string } | null
  arrows?: Arrow[]
  squareStyles?: Record<string, CSSProperties>
  // A picture only: no typed-move field.
  readOnly?: boolean
  // Shown right under the board, above the typed-move field (a player bar).
  footer?: ReactNode
  flash?: BoardFlash | null
}

const PROMOTION_PIECES = ['q', 'r', 'b', 'n'] as const
const PROMOTION_SYMBOLS = {
  w: { q: '♕', r: '♖', b: '♗', n: '♘' },
  b: { q: '♛', r: '♜', b: '♝', n: '♞' },
}

const LAST_MOVE_STYLE = {
  backgroundColor: 'rgba(224, 165, 38, 0.45)',
  animation: 'square-in 250ms ease-out',
}
const SELECTED_STYLE = { backgroundColor: 'rgba(224, 165, 38, 0.65)' }
const TARGET_STYLE = {
  backgroundImage:
    'radial-gradient(circle, rgba(0,0,0,0.22) 22%, transparent 24%)',
}
const CAPTURE_STYLE = {
  backgroundImage:
    'radial-gradient(circle, transparent 58%, rgba(0,0,0,0.22) 60%)',
}
const CHECK_STYLE = {
  backgroundImage:
    'radial-gradient(circle, rgba(220,38,38,0.85) 25%, transparent 75%)',
  animation: 'check-pulse 900ms ease-in-out 2',
}
// Mate pulses a little longer.
const MATE_STYLE = { ...CHECK_STYLE, animation: 'check-pulse 900ms ease-in-out 4' }

// Sparks thrown out from a capture, one every 60 degrees.
const SPARKS = [0, 60, 120, 180, 240, 300].map((degrees) => {
  const angle = (degrees * Math.PI) / 180
  return {
    '--dx': `${(Math.cos(angle) * 1.6).toFixed(2)}rem`,
    '--dy': `${(Math.sin(angle) * 1.6).toFixed(2)}rem`,
  } as CSSProperties
})

// The box of a square on the board, for effects drawn over it.
function squareBox(square: string, orientation: 'white' | 'black'): CSSProperties {
  const file = square.charCodeAt(0) - 97
  const rank = Number(square[1]) - 1
  const column = orientation === 'white' ? file : 7 - file
  const row = orientation === 'white' ? 7 - rank : rank
  return {
    left: `${column * 12.5}%`,
    top: `${row * 12.5}%`,
    width: '12.5%',
    height: '12.5%',
  }
}

// The square where `lastMove` took a piece, if the step from `before` to
// `after` is that one move. A jump across several moves, or a move taken
// back, shows no capture.
function takenSquare(
  before: Chess,
  after: Chess,
  lastMove: { from: string; to: string } | null | undefined,
): string | null {
  if (!lastMove) return null
  const mover = before.get(lastMove.from as Square)
  const taken = before.get(lastMove.to as Square)
  const landed = after.get(lastMove.to as Square)
  if (!mover || !taken || !landed) return null
  if (taken.color === mover.color || landed.color !== mover.color) return null
  return after.get(lastMove.from as Square) ? null : lastMove.to
}

// Combines two square styles. Background images are stacked with the
// board's own marks (move dots, check) on top, so a move-target dot stays
// visible on a lesson star.
function mergeStyle(base: CSSProperties | undefined, extra: CSSProperties) {
  if (!base?.backgroundImage || !extra.backgroundImage) {
    return { ...base, ...extra }
  }
  return {
    ...base,
    ...extra,
    backgroundImage: `${base.backgroundImage}, ${extra.backgroundImage}`,
    backgroundSize: `${base.backgroundSize ?? 'auto'}, ${extra.backgroundSize ?? 'auto'}`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  }
}

// Chessboard with drag-and-drop, click-to-move and a typed-move field for
// keyboard and screen reader users. Legal moves come from the FEN; the
// parent decides what a move does.
export function Board({
  fen,
  orientation,
  movableColor,
  onMove,
  lastMove,
  arrows = [],
  squareStyles,
  readOnly = false,
  footer,
  flash,
}: BoardProps) {
  const { t } = useTranslation()
  const reducedMotion = useReducedMotion()
  const chess = useMemo(() => new Chess(fen, { skipValidation: true }), [fen])
  const [selected, setSelected] = useState<{
    fen: string
    square: string
  } | null>(null)
  const [promotion, setPromotion] = useState<{
    from: string
    to: string
  } | null>(null)

  // Each new position checks whether its move took a piece; a capture gets
  // a burst over its square. The id restarts the burst on every capture.
  const [seen, setSeen] = useState({
    fen,
    chess,
    capture: null as { square: string; id: number } | null,
  })
  if (seen.fen !== fen) {
    const square = takenSquare(seen.chess, chess, lastMove)
    setSeen({
      fen,
      chess,
      capture: square ? { square, id: (seen.capture?.id ?? 0) + 1 } : null,
    })
  }

  // A selection belongs to the position it was made in.
  const selectedSquare = selected?.fen === fen ? selected.square : null
  const canMove = movableColor !== null && chess.turn() === movableColor

  const targets = useMemo(
    () =>
      selectedSquare
        ? chess.moves({ square: selectedSquare as Square, verbose: true })
        : [],
    [chess, selectedSquare],
  )

  function tryMove(from: string, to: string): boolean {
    if (!canMove) return false
    const moves = chess
      .moves({ square: from as Square, verbose: true })
      .filter((move) => move.to === to)
    if (moves.length === 0) return false
    setSelected(null)
    if (moves.some((move) => move.isPromotion())) {
      setPromotion({ from, to })
    } else {
      onMove({ from, to })
    }
    return true
  }

  function onSquareClick(square: string) {
    if (selectedSquare && tryMove(selectedSquare, square)) return
    const piece = chess.get(square as Square)
    setSelected(
      canMove && piece?.color === movableColor ? { fen, square } : null,
    )
  }

  const styles: Record<string, CSSProperties> = {}
  if (lastMove) {
    styles[lastMove.from] = LAST_MOVE_STYLE
    styles[lastMove.to] = LAST_MOVE_STYLE
  }
  if (chess.inCheck()) {
    const king = chess.findPiece({ type: 'k', color: chess.turn() }).at(0)
    if (king) styles[king] = chess.isCheckmate() ? MATE_STYLE : CHECK_STYLE
  }
  if (selectedSquare) styles[selectedSquare] = SELECTED_STYLE
  for (const move of targets) {
    styles[move.to] = move.isCapture() ? CAPTURE_STYLE : TARGET_STYLE
  }
  for (const [square, style] of Object.entries(squareStyles ?? {})) {
    styles[square] = mergeStyle(styles[square], style)
  }

  const turn = chess.turn()
  const facts = lastMove ? moveFacts(chess, lastMove) : null
  const announcement = facts
    ? [
        t('board.announce', {
          side: t(`board.sides.${facts.side}`),
          piece: t(`board.pieceNames.${facts.piece}`),
          from: facts.from,
          to: facts.to,
        }),
        facts.mate ? t('board.mate') : facts.check ? t('board.check') : '',
      ].join(' ')
    : ''

  return (
    <div className="w-full">
      <div
        className="relative w-full select-none"
        role="group"
        aria-label={t('board.label')}
      >
        <Chessboard
          options={{
            position: fen,
            boardOrientation: orientation,
            arrows,
            squareStyles: styles,
            allowDrawingArrows: false,
            animationDurationInMs: reducedMotion ? 0 : 200,
            // Coordinates matter in lessons ("e4"), so both square colours
            // keep their labels at 4.5:1 contrast or more.
            darkSquareStyle: { backgroundColor: '#5f7f44' },
            lightSquareStyle: { backgroundColor: '#ebecd0' },
            darkSquareNotationStyle: { color: '#ffffff', fontWeight: 600 },
            lightSquareNotationStyle: { color: '#3d5a2a', fontWeight: 600 },
            boardStyle: { borderRadius: '8px', overflow: 'hidden' },
            canDragPiece: ({ piece }) =>
              canMove && piece.pieceType.startsWith(movableColor),
            onPieceDrop: ({ sourceSquare, targetSquare }) =>
              targetSquare !== null && tryMove(sourceSquare, targetSquare),
            onSquareClick: ({ square }) => onSquareClick(square),
          }}
        />
        {seen.capture && (
          <span
            key={`capture-${seen.capture.id}`}
            aria-hidden
            className="pointer-events-none absolute"
            style={squareBox(seen.capture.square, orientation)}
          >
            <span className="absolute inset-[12%] animate-burst rounded-full border-[3px] border-accent" />
            {SPARKS.map((spark, index) => (
              <span
                key={index}
                className="absolute left-1/2 top-1/2 size-1.5 animate-spark rounded-full bg-accent"
                style={spark}
              />
            ))}
          </span>
        )}
        {flash && (
          <>
            <span
              key={`square-${flash.id}`}
              aria-hidden
              className={`pointer-events-none absolute ${
                flash.kind === 'good' ? 'animate-square-good' : 'animate-square-bad'
              }`}
              style={squareBox(flash.square, orientation)}
            />
            <span
              key={`ring-${flash.id}`}
              aria-hidden
              className={`pointer-events-none absolute inset-0 rounded-lg ${
                flash.kind === 'good' ? 'animate-ring-good' : 'animate-ring-bad'
              }`}
            />
          </>
        )}
        {promotion && (
          <PromotionDialog
            color={turn}
            onChoose={(piece) => {
              setPromotion(null)
              onMove({ ...promotion, promotion: piece })
            }}
            onCancel={() => setPromotion(null)}
          />
        )}
      </div>
      {footer}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      {/* Stays mounted while the opponent moves, so keyboard focus is kept. */}
      {!readOnly && (
        <TypedMoveForm
          chess={chess}
          canMove={canMove}
          onMove={onMove}
          onNeedPromotion={(from, to) => setPromotion({ from, to })}
        />
      )}
    </div>
  )
}

function TypedMoveForm({
  chess,
  canMove,
  onMove,
  onNeedPromotion,
}: {
  chess: Chess
  canMove: boolean
  onMove: (move: BoardMove) => void
  onNeedPromotion: (from: string, to: string) => void
}) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [error, setError] = useState<'illegal' | 'notYourTurn' | null>(null)
  const inputId = useId()
  const hintId = useId()
  const errorId = useId()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canMove) {
      setError('notYourTurn')
      return
    }
    const move = findTypedMove(chess, text)
    if (!move) {
      setError('illegal')
      return
    }
    setError(null)
    setText('')
    if (move.isPromotion() && !namesPromotionPiece(text)) {
      onNeedPromotion(move.from, move.to)
    } else {
      onMove({ from: move.from, to: move.to, promotion: move.promotion })
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-3 flex flex-wrap items-center gap-2 text-sm"
    >
      <label htmlFor={inputId} className="font-medium text-ink">
        {t('board.typeMove')}
      </label>
      <input
        id={inputId}
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          setError(null)
        }}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={error === 'illegal'}
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        className="w-32 rounded-md border border-line px-2 py-1 font-mono text-base"
      />
      <button
        type="submit"
        className="rounded-md border border-line bg-surface px-3 py-1 font-medium hover:bg-paper"
      >
        {t('board.submitMove')}
      </button>
      <span id={hintId} className="text-muted">
        {t('board.typeMoveHint')}
      </span>
      {error && (
        <span id={errorId} role="alert" className="w-full text-red-700">
          {t(`board.${error}`)}
        </span>
      )}
    </form>
  )
}

function PromotionDialog({
  color,
  onChoose,
  onCancel,
}: {
  color: 'w' | 'b'
  onChoose: (piece: (typeof PROMOTION_PIECES)[number]) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const firstButton = useRef<HTMLButtonElement>(null)
  const titleId = useId()

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    firstButton.current?.focus()
    return () => previous?.focus()
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={(event) => event.key === 'Escape' && onCancel()}
      className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/40"
    >
      <div className="rounded-xl bg-surface p-3 shadow-xl">
        <p id={titleId} className="mb-2 text-center text-sm font-medium">
          {t('board.promotionTitle')}
        </p>
        <div className="flex gap-2">
          {PROMOTION_PIECES.map((piece, index) => (
            <button
              key={piece}
              ref={index === 0 ? firstButton : undefined}
              type="button"
              aria-label={t(`board.pieces.${piece}`)}
              onClick={() => onChoose(piece)}
              className="h-16 w-16 rounded-lg text-5xl leading-none hover:bg-paper"
            >
              <span aria-hidden>{PROMOTION_SYMBOLS[color][piece]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
