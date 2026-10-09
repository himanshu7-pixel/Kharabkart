const FACES = ['🤡', '👻', '💀', '👹', '🧟', '😱', '🤪', '👺', '🥴', '👽', '🎃', '😈', '🧛', '🫠', '🤓', '🙀', '🧌', '😵‍💫']
const MOVES = ['drift', 'wobble', 'peek', 'scare']

const pseudo = (i, salt) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const CARICATURES = FACES.map((face, i) => ({
  face,
  left: `${Math.round(pseudo(i, 1) * 92)}%`,
  top: `${Math.round(pseudo(i, 2) * 90)}%`,
  size: 54 + Math.round(pseudo(i, 3) * 70),
  move: MOVES[i % MOVES.length],
  duration: 9 + Math.round(pseudo(i, 4) * 12),
  delay: -Math.round(pseudo(i, 5) * 20),
}))

export default function CaricatureBackground() {
  return (
    <div className="caricatures" aria-hidden="true">
      {CARICATURES.map((c, i) => (
        <span
          key={i}
          className={`caricature ${c.move}`}
          style={{ left: c.left, top: c.top, '--size': c.size, animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s` }}
        >
          {c.face}
        </span>
      ))}
    </div>
  )
}
