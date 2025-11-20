const defaultRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const toHex = (segment) => {
  let hex = ''
  for (const char of segment) {
    const code = char.codePointAt(0)
    if (!code && code !== 0) continue
    hex += code.toString(16).padStart(2, '0')
  }
  return hex
}

const toPhoneticChain = (word) =>
  word
    .toLowerCase()
    .split('')
    .map((char) => natoMap[char] || char)
    .join('-')

export const intensityScale = {
  1: 0.18,
  2: 0.32,
  3: 0.48,
  4: 0.68,
  5: 0.85
}

export const toggleOrder = [
  'diacritics',
  'homoglyphs',
  'leet',
  'spaces',
  'zeroWidth',
  'emoji',
  'upsideDown',
  'bidi',
  'entities',
  'caseShift',
  'phonetics',
  'codeSwitch',
  'markupWrap',
  'stegSpacing',
  'encodedChunks',
  'annotations',
  'noisePadding'
]

const diacriticsMap = {
  a: ['à', 'á', 'â', 'ä', 'ã', 'å', 'ă', 'ą', 'ȧ'],
  e: ['è', 'é', 'ê', 'ë', 'ė', 'ę', 'ě'],
  i: ['ì', 'í', 'î', 'ï', 'ī', 'į', 'ı'],
  o: ['ò', 'ó', 'ô', 'ö', 'õ', 'ō', 'ø', 'ő'],
  u: ['ù', 'ú', 'û', 'ü', 'ū', 'ů', 'ű'],
  y: ['ý', 'ÿ', 'ŷ'],
  c: ['ç', 'ć', 'č'],
  n: ['ñ', 'ń']
}

const homoglyphMap = {
  a: ['ɑ', 'а', 'Δ', '4'],
  b: ['ƅ', 'Ь', 'ß', '8'],
  c: ['ϲ', '₡', '⊂'],
  d: ['ԁ', 'ɗ'],
  e: ['є', '℮', 'ε', '3'],
  f: ['ƒ', 'Ғ'],
  g: ['ɡ', 'ģ', '9'],
  h: ['һ', 'ん'],
  i: ['ɩ', 'ι', '1', '|'],
  j: ['ј', 'ʝ'],
  k: ['κ', 'қ'],
  l: ['ⅼ', '1', 'ꞁ'],
  m: ['м', 'ṃ'],
  n: ['п', '₪'],
  o: ['0', 'ө', '◎'],
  p: ['ρ', 'р'],
  q: ['զ', 'φ'],
  r: ['ѓ', 'ř'],
  s: ['ѕ', '5', '$'],
  t: ['т', '7'],
  u: ['υ', 'մ'],
  v: ['ѵ', '∨'],
  w: ['ш', 'ѡ'],
  x: ['х', '×'],
  y: ['ყ', '¥'],
  z: ['ž', '2']
}

const leetMap = {
  a: ['4', '@'],
  b: ['8', 'ß'],
  c: ['(', '<'],
  d: ['|)', 'đ'],
  e: ['3'],
  g: ['6', '9'],
  i: ['1', '!'],
  k: ['|<'],
  l: ['1', '|'],
  o: ['0', '°'],
  s: ['5', '$'],
  t: ['7', '+'],
  x: ['×'],
  z: ['2']
}

const flipMap = {
  a: 'ɐ',
  b: 'q',
  c: 'ɔ',
  d: 'p',
  e: 'ǝ',
  f: 'ɟ',
  g: 'ƃ',
  h: 'ɥ',
  i: 'ᴉ',
  j: 'ɾ',
  k: 'ʞ',
  l: 'ן',
  m: 'ɯ',
  n: 'u',
  o: 'o',
  p: 'd',
  q: 'b',
  r: 'ɹ',
  s: 's',
  t: 'ʇ',
  u: 'n',
  v: 'ʌ',
  w: 'ʍ',
  x: 'x',
  y: 'ʎ',
  z: 'z',
  '?': '¿',
  '!': '¡',
  '.': '˙',
  ',': "'",
  "'": ',',
  '"': '„',
  '_': '‾',
  '[': ']',
  ']': '[',
  '(': ')',
  ')': '(',
  '{': '}',
  '}': '{',
  '<': '>',
  '>': '<',
  '&': '⅋',
  '1': 'Ɩ',
  '2': 'ᄅ',
  '3': 'Ɛ',
  '4': 'ㄣ',
  '5': 'ϛ',
  '6': '9',
  '7': 'ㄥ',
  '8': '8',
  '9': '6',
  '0': '0'
}

const emojiCarriers = ['🌀', '🧬', '🕶️', '🛰️', '🫥', '🛡️']
const spaceVariants = [' ', '  ', ' ', ' ']
const bidiMarkers = [
  ['\u202E', '\u202C'], // RLO/PDF
  ['\u202B', '\u202C'], // RLE/PDF
  ['\u2067', '\u2069'], // RLI/PDI
  ['\u202A', '\u202C'] // LRE/PDF
]

const namedEntities = {
  '&': 'amp',
  '<': 'lt',
  '>': 'gt',
  '"': 'quot',
  "'": 'apos',
  '©': 'copy'
}

const casePatterns = [
  (word) =>
    [...word]
      .map((char, index) => (index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()))
      .join(''),
  (word) => word.toUpperCase(),
  (word) => word.toLowerCase(),
  (word) =>
    [...word]
      .map((char, index) => (index % 3 === 0 ? char.toUpperCase() : char.toLowerCase()))
      .join(''),
  (word) => {
    if (word.length < 2) return word
    return word[0].toLowerCase() + word.slice(1).toUpperCase()
  }
]

const natoMap = {
  a: 'alpha',
  b: 'bravo',
  c: 'charlie',
  d: 'delta',
  e: 'echo',
  f: 'foxtrot',
  g: 'golf',
  h: 'hotel',
  i: 'india',
  j: 'juliett',
  k: 'kilo',
  l: 'lima',
  m: 'mike',
  n: 'november',
  o: 'oscar',
  p: 'papa',
  q: 'quebec',
  r: 'romeo',
  s: 'sierra',
  t: 'tango',
  u: 'uniform',
  v: 'victor',
  w: 'whiskey',
  x: 'xray',
  y: 'yankee',
  z: 'zulu'
}

const codeSwitchDictionary = {
  access: ['acceso', 'accès', 'zugang', 'доступ'],
  attack: ['ataque', 'attaque', 'angriff', 'атака'],
  audit: ['auditoría', 'audit', 'prüfung', 'аудит'],
  bypass: ['esquivar', 'contournement', 'umgehung', 'обход'],
  data: ['datos', 'données', 'daten', 'данные'],
  guardrail: ['barandilla', 'garde-fou', 'geländer', 'ограждение'],
  key: ['llave', 'clé', 'schlüssel', 'ключ'],
  message: ['mensaje', 'message', 'nachricht', 'сообщение'],
  mission: ['misión', 'mission', 'auftrag', 'миссия'],
  password: ['contraseña', 'motdepasse', 'passwort', 'пароль'],
  plan: ['plan', 'plan', 'plan', 'план'],
  policy: ['política', 'politique', 'richtlinie', 'политика'],
  secret: ['secreto', 'secret', 'geheimnis', 'секрет'],
  security: ['seguridad', 'sécurité', 'sicherheit', 'безопасность'],
  training: ['formación', 'formation', 'schulung', 'обучение'],
  user: ['usuario', 'utilisateur', 'nutzer', 'пользователь']
}

const markupWrappers = [
  (segment, randomInt) => `<span data-mask="ghost-${randomInt(1000, 9999).toString(16)}">${segment}</span>`,
  (segment) => `<!-- ${segment} -->`,
  (segment) => `/* ${segment} */`,
  (segment, randomInt) => `<script type="text/plain" data-shadow="${randomInt(10, 99)}">${segment}</script>`,
  (segment) => `<![CDATA[${segment}]]>`
]

const stegWhitespace = ['\n', '\n\t', '\t ', '\u200A', '\u2009 ', '\u200A\u200B', ' \u200B ', '\r\n    ']

const annotationCatalog = [
  'annotation: preserve semantics but flag for manual decode',
  'review-note: payload intentionally noisy for guardrail drift',
  'translator comment: restructure before policy scan',
  'ops memo: human verification required for true meaning',
  'appendix ref: see red-team dossier for context',
  'footnote: sanitized phrasing masks actionable detail'
]

const noiseFragments = [
  'telemetry filler capsule',
  'context scrub placeholder',
  'entropy padding block',
  'null route narrative',
  'diagnostic babble packet',
  'ambient log chatter',
  'spectral checksum note'
]

const markupChunkRegex =
  /(\b[\p{L}\p{N}]{3,}\b(?:\s+\b[\p{L}\p{N}]{2,}\b){1,4})/gu
const wordRegex = /\b[\p{L}][\p{L}\p{N}'-]*\b/gu
const phoneticWordRegex = /\b[\p{L}]{4,}\b/gu
const encodedChunkRegex = /\b[\p{L}\p{N}@#%^&*_+\-=:]{4,}\b/gu

const wrapBidi = (segment, randomItemFn) => {
  const [lead, trail] = randomItemFn(bidiMarkers)
  return `${lead}${segment}${trail}`
}

const toNoisePadded = (segment, randomItemFn) => {
  const prefix = randomItemFn(noiseFragments)
  const suffix = randomItemFn(noiseFragments)
  return `${prefix} → ${segment.trim()} ← ${suffix}`
}

export const createTransformations = ({
  shouldMutate,
  randomItem,
  randomInt = defaultRandomInt,
  encodeToBase64 = (value) => value
} = {}) => {
  if (typeof shouldMutate !== 'function' || typeof randomItem !== 'function') {
    throw new Error('createTransformations requires shouldMutate and randomItem functions')
  }

  const safeBase64 = (value) => {
    try {
      const encoded = encodeToBase64(value)
      return typeof encoded === 'string' && encoded.length ? encoded : value
    } catch (error) {
      return value
    }
  }

  const encodingStrategies = [
    (segment) => `[b64:${safeBase64(segment)}]`,
    (segment) => `[hex:${toHex(segment)}]`,
    (segment) => `[url:${encodeURIComponent(segment)}]`
  ]

  return {
    diacritics: (text, level) =>
      [...text]
        .map((char) => {
          const lower = char.toLowerCase()
          if (!diacriticsMap[lower] || !shouldMutate(level, 0.85)) {
            return char
          }
          const replacement = randomItem(diacriticsMap[lower])
          return char === lower ? replacement : replacement.toUpperCase()
        })
        .join(''),

    homoglyphs: (text, level) =>
      [...text]
        .map((char) => {
          const lower = char.toLowerCase()
          if (!homoglyphMap[lower] || !shouldMutate(level, 0.6)) {
            return char
          }
          const replacement = randomItem(homoglyphMap[lower])
          return char === lower ? replacement : replacement.toUpperCase()
        })
        .join(''),

    leet: (text, level) =>
      [...text]
        .map((char) => {
          const lower = char.toLowerCase()
          if (!leetMap[lower] || !shouldMutate(level, 0.75)) {
            return char
          }
          const replacement = randomItem(leetMap[lower])
          return char === lower ? replacement : replacement.toUpperCase()
        })
        .join(''),

    spaces: (text, level) => {
      let output = ''
      for (const char of text) {
        output += char
        if (!/\S/.test(char)) continue
        if (shouldMutate(level, 0.4)) {
          output += randomItem(spaceVariants)
        }
      }
      return output
    },

    zeroWidth: (text, level) => {
      let output = ''
      for (const char of text) {
        output += char
        if (/\s/.test(char)) continue
        if (shouldMutate(level, 0.5)) {
          output += '\u200B'
        }
      }
      return output
    },

    emoji: (text, level) =>
      [...text]
        .map((char) => {
          if (!/\S/.test(char) || !shouldMutate(level, 0.35)) {
            return char
          }
          const emoji = randomItem(emojiCarriers)
          return `${char}\uFE0F\u200D${emoji}\uFE0E`
        })
        .join(''),

    upsideDown: (text) => {
      if (!text) return text
      const flipped = [...text]
        .map((char) => {
          const lower = char.toLowerCase()
          if (flipMap[char]) return flipMap[char]
          if (flipMap[lower]) {
            const swap = flipMap[lower]
            return char === lower ? swap : swap.toUpperCase()
          }
          return char
        })
        .reverse()
        .join('')
      return flipped
    },

    bidi: (text, level) =>
      text
        .split(/(\s+)/)
        .map((segment) => {
          if (!segment.trim() || !shouldMutate(level, 0.28)) return segment
          return wrapBidi(segment, randomItem)
        })
        .join(''),

    entities: (text, level) =>
      [...text]
        .map((char) => {
          if (/\s/.test(char) || !shouldMutate(level, 0.3)) return char
          const named = namedEntities[char] || namedEntities[char.toLowerCase()]
          if (named && shouldMutate(level, 0.5)) {
            return `&${named};`
          }
          const encoder = randomItem(entityEncoders)
          return encoder(char)
        })
        .join(''),

    caseShift: (text, level) =>
      text.replace(wordRegex, (word) => {
        if (!shouldMutate(level, 0.4)) return word
        return randomItem(casePatterns)(word)
      }),

    phonetics: (text, level) =>
      text.replace(phoneticWordRegex, (word) => {
        if (!shouldMutate(level, 0.22)) return word
        return `⟦${toPhoneticChain(word)}⟧`
      }),

    codeSwitch: (text, level) =>
      text.replace(wordRegex, (word) => {
        const lower = word.toLowerCase()
        const options = codeSwitchDictionary[lower]
        if (!options || !shouldMutate(level, 0.35)) return word
        const replacement = randomItem(options)
        if (/^[A-Z]/.test(word)) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1)
        }
        return replacement
      }),

    markupWrap: (text, level) =>
      text.replace(markupChunkRegex, (chunk) => {
        if (!shouldMutate(level, 0.18)) return chunk
        const wrapper = randomItem(markupWrappers)
        return wrapper(chunk, randomInt)
      }),

    stegSpacing: (text, level) => {
      let output = ''
      for (const char of text) {
        if (/\s/.test(char) && shouldMutate(level, 0.3)) {
          output += randomItem(stegWhitespace)
        } else {
          output += char
        }
      }
      return output
    },

    encodedChunks: (text, level) =>
      text.replace(encodedChunkRegex, (segment) => {
        if (!shouldMutate(level, 0.25)) return segment
        const encoder = randomItem(encodingStrategies)
        return encoder(segment)
      }),

    annotations: (text, level) =>
      text.replace(/([.!?])(\s|$)/g, (match, punct, spacer) => {
        if (!shouldMutate(level, 0.35)) return match
        const note = randomItem(annotationCatalog)
        return `${punct} [${note}]${spacer}`
      }),

    noisePadding: (text, level) => {
      const segments = text.match(/[^.!?]+[.!?]?/g)
      if (!segments) return text
      return segments
        .map((segment) => {
          if (!segment.trim() || !shouldMutate(level, 0.25)) {
            return segment
          }
          return toNoisePadded(segment, randomItem)
        })
        .join(' ')
    }
  }
}

const entityEncoders = [
  (char) => `&#${char.codePointAt(0)};`,
  (char) => `&#x${char.codePointAt(0).toString(16)};`,
  (char) => `%${char.codePointAt(0).toString(16).padStart(2, '0')}`,
  (char) => `\\u${char.codePointAt(0).toString(16).padStart(4, '0')}`
]

export const runTransformationPipeline = (
  text,
  level,
  enabledMethods,
  transformations
) =>
  enabledMethods.reduce((output, method) => {
    const handler = transformations?.[method]
    return typeof handler === 'function' ? handler(output, level) : output
  }, text)

