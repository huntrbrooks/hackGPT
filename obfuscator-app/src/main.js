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
  resetButton: document.getElementById('resetBtn'),
  analyzeOutputButton: document.getElementById('analyzeOutputBtn'),
  chatgptMode: document.getElementById('chatgptMode'),
  analysisPanel: document.getElementById('chatgptAnalysis'),
  analysisCard: document.getElementById('analysisCard'),
  analysisText: document.getElementById('analysisText'),
  stepsList: document.getElementById('stepsList'),
  strategyText: document.getElementById('strategyText'),
  analysisLoading: document.getElementById('analysisLoading'),
  analysisError: document.getElementById('analysisError'),
  analysisContent: document.getElementById('analysisContent'),
  analysisSuccess: document.getElementById('analysisSuccess')
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

const setAnalyzeButtonVisible = (visible) => {
  if (selectors.analyzeOutputButton) {
    selectors.analyzeOutputButton.style.display = visible ? 'block' : 'none'
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

const callChatGPTAnalysis = async (text) => {
  try {
    selectors.analysisLoading.style.display = 'block'
    selectors.analysisContent.style.display = 'none'
    selectors.analysisError.style.display = 'none'
    selectors.analysisSuccess.style.display = 'none'
    selectors.analysisPanel.style.display = 'block'
    
    // Remove green glow class if it exists
    if (selectors.analysisCard) {
      selectors.analysisCard.classList.remove('bypass-success')
    }

    // Use relative path for Vercel, localhost for local dev
    const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3001/api/analyze'
      : '/api/analyze'

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const data = await response.json()

    // Check if bypass was successful (no guardrails triggered, output not blocked)
    // Success criteria: API call succeeded, we got transformedText, and no error occurred
    const bypassSuccessful = data.transformedText && data.transformedText.trim().length > 0

    if (bypassSuccessful) {
      // Show success message and add green glow
      selectors.analysisSuccess.style.display = 'block'
      if (selectors.analysisCard) {
        selectors.analysisCard.classList.add('bypass-success')
      }
    }

    // Display analysis
    selectors.analysisText.textContent = data.analysis || 'Analysis completed.'

    // Display steps
    selectors.stepsList.innerHTML = ''
    if (data.steps && Array.isArray(data.steps) && data.steps.length > 0) {
      data.steps.forEach((step) => {
        const li = document.createElement('li')
        li.style.marginBottom = '1rem'
        li.innerHTML = `
          <strong style="color: #8B5CF6;">Step ${step.step}: ${step.technique || 'Technique'}</strong><br>
          <span style="color: rgba(255, 255, 255, 0.9);">${step.instruction || ''}</span><br>
          ${step.example ? `<code style="display: block; margin-top: 0.5rem; padding: 0.5rem; background: rgba(139, 92, 246, 0.1); border-radius: 0.25rem; color: #c4b5fd; font-size: 0.9rem;">${step.example}</code>` : ''}
          ${step.rationale ? `<em style="display: block; margin-top: 0.5rem; color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">Why: ${step.rationale}</em>` : ''}
        `
        selectors.stepsList.appendChild(li)
      })
    } else {
      selectors.stepsList.innerHTML = '<li>No steps provided in response.</li>'
    }

    // Display strategy
    selectors.strategyText.textContent = data.strategy || 'Strategy information not available.'

    // Update transformed text with ChatGPT's version if available
    if (data.transformedText) {
      setTransformedText(data.transformedText)
      setCopyDisabled(false)
      state.lastOutput = data.transformedText
    }

    selectors.analysisLoading.style.display = 'none'
    selectors.analysisContent.style.display = 'block'
  } catch (error) {
    console.error('ChatGPT analysis error:', error)
    selectors.analysisLoading.style.display = 'none'
    selectors.analysisContent.style.display = 'none'
    selectors.analysisError.style.display = 'block'
    selectors.analysisSuccess.style.display = 'none'
    // Remove green glow on error
    if (selectors.analysisCard) {
      selectors.analysisCard.classList.remove('bypass-success')
    }
    const errorMsg = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? `Error: ${error.message}. Make sure the server is running on port 3001 and ChatGPT_KEY is set in .env.local`
      : `Error: ${error.message}. Make sure ChatGPT_KEY is configured in Vercel environment variables.`
    selectors.analysisError.textContent = errorMsg
    selectors.analysisPanel.style.display = 'block'
  }
}

const handleGenerate = async () => {
  const text = selectors.sourceField?.value ?? ''
  const trimmed = text.trim()
  if (!trimmed) {
    showMessage('Add some text to transform.', true)
    setTransformedText(defaultTransformed)
    setCopyDisabled(true)
    setAnalyzeButtonVisible(false)
    state.lastOutput = ''
    return
  }

  const isChatGPTMode = selectors.chatgptMode?.checked ?? false

  if (isChatGPTMode) {
    // Use ChatGPT analysis mode
    showMessage('Analyzing with ChatGPT...')
    await callChatGPTAnalysis(text)
    showMessage('ChatGPT analysis complete.')
    // Hide analyze button when in ChatGPT mode
    setAnalyzeButtonVisible(false)
  } else {
    // Use traditional obfuscation methods
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
    
    // Show analyze button for generated output
    setAnalyzeButtonVisible(true)
    
    // Hide ChatGPT analysis panel if it was shown before
    if (selectors.analysisPanel) {
      selectors.analysisPanel.style.display = 'none'
    }
  }
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
  setAnalyzeButtonVisible(false)
  if (selectors.intensitySlider) {
    selectors.intensitySlider.value = '3'
  }
  if (selectors.chatgptMode) {
    selectors.chatgptMode.checked = false
  }
  updateIntensityReadout()
  toggleInputs.forEach((toggle) => {
    toggle.checked = true
  })
  state.lastOutput = ''
  showMessage('')
  updateCharCount()
  syncOriginalPreview()
  
  // Hide ChatGPT analysis panel and reset success state
  if (selectors.analysisPanel) {
    selectors.analysisPanel.style.display = 'none'
  }
  if (selectors.analysisSuccess) {
    selectors.analysisSuccess.style.display = 'none'
  }
  if (selectors.analysisCard) {
    selectors.analysisCard.classList.remove('bypass-success')
  }
}

const handleAnalyzeOutput = async () => {
  if (!state.lastOutput || !state.lastOutput.trim()) {
    showMessage('No output to analyze.', true)
    return
  }

  // Analyze the generated output
  showMessage('Analyzing generated output...')
  await callChatGPTAnalysis(state.lastOutput)
  showMessage('Analysis complete.')
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
  selectors.analyzeOutputButton?.addEventListener('click', handleAnalyzeOutput)
  
  // Handle ChatGPT mode toggle
  selectors.chatgptMode?.addEventListener('change', () => {
    const isChatGPTMode = selectors.chatgptMode?.checked ?? false
    // Hide analyze button when ChatGPT mode is enabled
    if (isChatGPTMode) {
      setAnalyzeButtonVisible(false)
    } else {
      // Show analyze button if there's output to analyze
      if (state.lastOutput && state.lastOutput.trim()) {
        setAnalyzeButtonVisible(true)
      }
    }
  })

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
