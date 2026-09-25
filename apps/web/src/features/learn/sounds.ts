let context: AudioContext | null = null

// Short feedback chimes made with Web Audio, so no sound files are needed.
export function playTone(kind: 'correct' | 'wrong') {
  try {
    context ??= new AudioContext()
    const notes = kind === 'correct' ? [660, 880] : [220, 180]
    notes.forEach((frequency, index) => {
      const start = context!.currentTime + index * 0.12
      const oscillator = context!.createOscillator()
      const gain = context!.createGain()
      oscillator.type = kind === 'correct' ? 'sine' : 'triangle'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.18, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18)
      oscillator.connect(gain).connect(context!.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.2)
    })
  } catch {
    // Sound is optional; some browsers block audio until a user gesture.
  }
}
