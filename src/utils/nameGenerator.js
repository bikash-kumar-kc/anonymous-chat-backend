const adjectives = [
    'Silent', 'Quiet', 'Calm', 'Gentle', 'Soft',
    'Misty', 'Sleepy', 'Mystic', 'Wandering', 'Hidden',
    'Distant', 'Lonely', 'Peaceful', 'Shy', 'Twilight'
  ]
  
  const nouns = [
    'Fox', 'Owl', 'Wolf', 'Bear', 'Hawk',
    'River', 'Cloud', 'Storm', 'Forest', 'Moon',
    'Star', 'Shadow', 'Echo', 'Breeze', 'Ember'
  ]
  
  export function generateDisplayName() {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const number = Math.floor(Math.random() * 99) + 1
    return `${adj}${noun}${number}` // e.g. SilentFox42
  };


  generateDisplayName()