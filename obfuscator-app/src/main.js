import './style.css'

const selectors = {
  sourceField: document.getElementById('sourceText'),
  originalPreview: document.getElementById('originalPreview'),
  transformedPreview: document.getElementById('transformedText'),
  charCount: document.getElementById('charCount'),
  intensitySlider: document.getElementById('intensity'),
  intensityValue: document.getElementById('intensityValue'),
  formMessage: document.getElementById('formMessage'),
  copyButton: document.getElementById('copyBtn'),
  copyFeedback: document.getElementById('copyFeedback'),
  generateButton: document.getElementById('generateBtn'),
  resetButton: document.getElementById('resetBtn')
}

const toggleInputs = Array.from(document.querySelectorAll('[data-transform]'))
const defaultOriginal = 'Start typing to preview the source content.'
const defaultTransformed = 'Run the generator to see obfuscated output.'

const setTransformedText = (text) => {
  if (selectors.transformedPreview) {
    selectors.transformedPreview.textContent = text
  }
}

const setCopyDisabled = (state) => {
  if (selectors.copyButton) {
    selectors.copyButton.disabled = state
  }
}

const state = {
  lastOutput: '',
  copyTimer: null
}

const intensityScale = {
  1: 0.18,
  2: 0.32,
  3: 0.48,
  4: 0.68,
  5: 0.85
}

const randomItem = (collection) =>
  collection[Math.floor(Math.random() * collection.length)]

const getChance = (level, weight = 1) =>
  Math.min(0.98, (intensityScale[level] || 0.32) * weight)

const shouldMutate = (level, weight = 1) => Math.random() < getChance(level, weight)

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

const transformations = {
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
  }
}

const updateCharCount = () => {
  if (!selectors.sourceField || !selectors.charCount) return
  const length = [...selectors.sourceField.value].length
  selectors.charCount.textContent = `${length} ${length === 1 ? 'character' : 'characters'}`
}

const syncOriginalPreview = () => {
  if (!selectors.originalPreview || !selectors.sourceField) return
  selectors.originalPreview.textContent =
    selectors.sourceField.value.trim().length > 0
      ? selectors.sourceField.value
      : defaultOriginal
}

const showMessage = (message, isError = false) => {
  if (!selectors.formMessage) return
  selectors.formMessage.textContent = message
  selectors.formMessage.classList.toggle('error', Boolean(isError))
}

const runTransformationPipeline = (text, level, enabledMethods) =>
  enabledMethods.reduce((output, method) => {
    const handler = transformations[method]
    return typeof handler === 'function' ? handler(output, level) : output
  }, text)

const getEnabledMethods = () =>
  toggleInputs.filter((toggle) => toggle.checked).map((toggle) => toggle.dataset.transform)

const updateIntensityReadout = () => {
  if (!selectors.intensitySlider || !selectors.intensityValue) return
  selectors.intensityValue.textContent = selectors.intensitySlider.value
}

const handleGenerate = () => {
  const text = selectors.sourceField?.value ?? ''
  const trimmed = text.trim()
  if (!trimmed) {
    showMessage('Add some text to transform.', true)
    setTransformedText(defaultTransformed)
    setCopyDisabled(true)
    state.lastOutput = ''
    return
  }

  const methods = getEnabledMethods().filter(Boolean)
  if (!methods.length) {
    showMessage('Enable at least one method to continue.', true)
    return
  }

  const level = Number(selectors.intensitySlider?.value ?? 3)
  const result = runTransformationPipeline(text, level, methods)
  setTransformedText(result)
  setCopyDisabled(false)
  state.lastOutput = result
  showMessage(`${methods.length} method${methods.length > 1 ? 's' : ''} applied.`)
}

const handleCopy = async () => {
  if (!state.lastOutput) return
  if (!navigator.clipboard) {
    showCopyFeedback('Clipboard unavailable')
    return
  }
  try {
    await navigator.clipboard.writeText(state.lastOutput)
    showCopyFeedback('Copied!')
  } catch (error) {
    console.error('Clipboard error', error)
    showCopyFeedback('Clipboard blocked')
  }
}

const showCopyFeedback = (text) => {
  if (!selectors.copyFeedback) return
  selectors.copyFeedback.textContent = text
  selectors.copyFeedback.classList.add('is-visible')
  window.clearTimeout(state.copyTimer)
  state.copyTimer = window.setTimeout(() => {
    selectors.copyFeedback?.classList.remove('is-visible')
  }, 1800)
}

const handleReset = () => {
  if (!selectors.sourceField) return
  selectors.sourceField.value = ''
  setTransformedText(defaultTransformed)
  setCopyDisabled(true)
  if (selectors.intensitySlider) {
    selectors.intensitySlider.value = '3'
  }
  updateIntensityReadout()
  toggleInputs.forEach((toggle) => {
    toggle.checked = true
  })
  state.lastOutput = ''
  showMessage('')
  updateCharCount()
  syncOriginalPreview()
}

const bindEvents = () => {
  selectors.sourceField?.addEventListener('input', () => {
    updateCharCount()
    syncOriginalPreview()
  })
  selectors.intensitySlider?.addEventListener('input', updateIntensityReadout)
  selectors.generateButton?.addEventListener('click', handleGenerate)
  selectors.copyButton?.addEventListener('click', handleCopy)
  selectors.resetButton?.addEventListener('click', handleReset)

  toggleInputs.forEach((toggle) => {
    toggle.addEventListener('change', () => {
      const enabled = getEnabledMethods().length
      if (!enabled) {
        showMessage('At least one technique must remain enabled.', true)
      } else if (selectors.formMessage?.classList.contains('error')) {
        showMessage('')
      }
    })
  })
}

// Initialize UI
updateCharCount()
syncOriginalPreview()
updateIntensityReadout()
bindEvents()
