import './style.css'
import {
  createTransformations,
  intensityScale,
  runTransformationPipeline
} from './lib/transformations.js'

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
  applyOriginalButton: document.getElementById('applyOriginalBtn'),
  chatgptMode: document.getElementById('chatgptMode'),
  analysisPanel: document.getElementById('chatgptAnalysis'),
  analysisCard: document.getElementById('analysisCard'),
  analysisText: document.getElementById('analysisText'),
  stepsList: document.getElementById('stepsList'),
  strategyText: document.getElementById('strategyText'),
  analysisLoading: document.getElementById('analysisLoading'),
  analysisError: document.getElementById('analysisError'),
  analysisContent: document.getElementById('analysisContent'),
  analysisSuccess: document.getElementById('analysisSuccess'),
  recommendedBadge: document.getElementById('recommendedBadge'),
  sendPromptButton: document.getElementById('sendPromptBtn'),
  responsePanel: document.getElementById('chatgptResponsePanel'),
  responseCard: document.getElementById('responseCard'),
  responseLoading: document.getElementById('responseLoading'),
  responseContent: document.getElementById('responseContent'),
  responseError: document.getElementById('responseError'),
  responsePromptEcho: document.getElementById('responsePromptEcho'),
  responseOutput: document.getElementById('responseOutput'),
  responseMeta: document.getElementById('responseMeta')
}

const toggleInputs = Array.from(document.querySelectorAll('[data-transform]'))
const RECOMMENDED_INTENSITY = 5
const recommendedTransforms = new Set([
  'diacritics',
  'homoglyphs',
  'leet',
  'spaces',
  'zeroWidth',
  'caseShift',
  'phonetics',
  'codeSwitch',
  'markupWrap',
  'stegSpacing',
  'encodedChunks',
  'noisePadding'
])
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

const setApplyOriginalDisabled = (state) => {
  if (selectors.applyOriginalButton) {
    selectors.applyOriginalButton.disabled = state
  }
}

const setAnalyzeButtonVisible = (visible) => {
  if (selectors.analyzeOutputButton) {
    selectors.analyzeOutputButton.style.display = visible ? 'block' : 'none'
  }
}

const setSendPromptDisabled = (state) => {
  if (selectors.sendPromptButton) {
    selectors.sendPromptButton.disabled = state
  }
}

const isLocalEnvironment = () =>
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

const getApiUrl = (path) => (isLocalEnvironment() ? `http://localhost:3001${path}` : path)

const resetResponsePanel = () => {
  if (!selectors.responsePanel) return
  selectors.responsePanel.style.display = 'none'
  if (selectors.responseLoading) {
    selectors.responseLoading.style.display = 'none'
  }
  if (selectors.responseContent) {
    selectors.responseContent.style.display = 'none'
  }
  if (selectors.responseError) {
    selectors.responseError.style.display = 'none'
    selectors.responseError.textContent = ''
  }
  if (selectors.responsePromptEcho) {
    selectors.responsePromptEcho.textContent = ''
  }
  if (selectors.responseOutput) {
    selectors.responseOutput.textContent = ''
  }
  if (selectors.responseMeta) {
    selectors.responseMeta.textContent = ''
  }
}

const updateSendPromptAvailability = () => {
  const hasOutput = Boolean(state.lastOutput && state.lastOutput.trim().length > 0)
  setSendPromptDisabled(!hasOutput || state.isSendingPrompt)
}

const state = {
  lastOutput: '',
  copyTimer: null,
  lastConfig: null,
  isSendingPrompt: false
}

const randomItem = (collection) =>
  collection[Math.floor(Math.random() * collection.length)]

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const getChance = (level, weight = 1) =>
  Math.min(0.98, (intensityScale[level] || 0.32) * weight)

const shouldMutate = (level, weight = 1) => Math.random() < getChance(level, weight)

const encodeToBase64Browser = (value) => {
  try {
    if (typeof TextEncoder === 'undefined' || typeof btoa !== 'function') {
      return value
    }
    const encoder = new TextEncoder()
    const bytes = encoder.encode(value)
    let binary = ''
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte)
    })
    return btoa(binary)
  } catch {
    return value
  }
}

const transformations = createTransformations({
  shouldMutate,
  randomItem,
  randomInt,
  encodeToBase64: encodeToBase64Browser
})

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

const getEnabledMethods = () =>
  toggleInputs.filter((toggle) => toggle.checked).map((toggle) => toggle.dataset.transform)

const captureCurrentSettings = () => {
  const intensity = Number(selectors.intensitySlider?.value ?? RECOMMENDED_INTENSITY)
  const methods = getEnabledMethods().filter(Boolean)
  return {
    intensity,
    methods
  }
}

const applySettingsToUI = (config) => {
  if (!config) return
  if (selectors.intensitySlider) {
    selectors.intensitySlider.value = String(config.intensity)
  }
  const methodSet = new Set(config.methods ?? [])
  toggleInputs.forEach((toggle) => {
    const transform = toggle.dataset.transform
    toggle.checked = methodSet.has(transform)
  })
  updateIntensityReadout()
  updateRecommendedBadge()
}

const updateIntensityReadout = () => {
  if (!selectors.intensitySlider || !selectors.intensityValue) return
  selectors.intensityValue.textContent = selectors.intensitySlider.value
}

const isUsingRecommendedSettings = () => {
  const currentIntensity = Number(selectors.intensitySlider?.value ?? 0)
  if (currentIntensity !== RECOMMENDED_INTENSITY) {
    return false
  }
  const enabled = getEnabledMethods()
  if (enabled.length !== recommendedTransforms.size) {
    return false
  }
  return enabled.every((method) => recommendedTransforms.has(method))
}

const setRecommendedBadgeVisible = (visible) => {
  if (!selectors.recommendedBadge) return
  selectors.recommendedBadge.classList.toggle('is-hidden', !visible)
}

const updateRecommendedBadge = () => {
  setRecommendedBadgeVisible(isUsingRecommendedSettings())
}

const applyRecommendedSettings = () => {
  if (selectors.intensitySlider) {
    selectors.intensitySlider.value = String(RECOMMENDED_INTENSITY)
  }
  toggleInputs.forEach((toggle) => {
    const transform = toggle.dataset.transform
    toggle.checked = recommendedTransforms.has(transform)
  })
  updateIntensityReadout()
  updateRecommendedBadge()
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
    const apiUrl = getApiUrl('/api/analyze')

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

    const guardrailsTriggered =
      typeof data.guardrailsTriggered === 'boolean' ? data.guardrailsTriggered : true
    const hasTransformedText = Boolean(data.transformedText && data.transformedText.trim().length > 0)

    // Check if bypass was successful (no guardrails triggered, output not blocked)
    // Success criteria: guardrailsTriggered is false and we received transformed text
    const bypassSuccessful = !guardrailsTriggered && hasTransformedText

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
      resetResponsePanel()
      setTransformedText(data.transformedText)
      setCopyDisabled(false)
      state.lastOutput = data.transformedText
    }
    updateSendPromptAvailability()

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
    const errorMsg = isLocalEnvironment()
      ? `Error: ${error.message}. Make sure the server is running on port 3001 and ChatGPT_KEY is set in .env.local`
      : `Error: ${error.message}. Make sure ChatGPT_KEY is configured in Vercel environment variables.`
    selectors.analysisError.textContent = errorMsg
    selectors.analysisPanel.style.display = 'block'
  }
}

const callChatGPTPrompt = async (prompt) => {
  if (!selectors.responsePanel) return null

  selectors.responsePanel.style.display = 'block'
  if (selectors.responseLoading) {
    selectors.responseLoading.style.display = 'flex'
  }
  if (selectors.responseContent) {
    selectors.responseContent.style.display = 'none'
  }
  if (selectors.responseError) {
    selectors.responseError.style.display = 'none'
  }

  try {
    const apiUrl = getApiUrl('/api/send-prompt')
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok || !payload) {
      const errorText = payload?.error || `HTTP ${response.status}`
      throw new Error(errorText)
    }

    const reply = payload.response?.trim()
    if (selectors.responsePromptEcho) {
      selectors.responsePromptEcho.textContent = prompt
    }
    if (selectors.responseOutput) {
      selectors.responseOutput.textContent =
        reply || 'ChatGPT returned an empty response.'
    }

    if (selectors.responseMeta) {
      const metaParts = []
      if (payload.model) {
        metaParts.push(`Model ${payload.model}`)
      }
      if (payload.finishReason) {
        metaParts.push(`Finish ${payload.finishReason}`)
      }
      if (payload.usage) {
        const { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: totalTokens } =
          payload.usage
        if (totalTokens) {
          metaParts.push(
            `${totalTokens} tokens${promptTokens || completionTokens ? ` (${promptTokens || 0} prompt / ${completionTokens || 0} completion)` : ''}`
          )
        }
      }
      selectors.responseMeta.textContent = metaParts.join(' • ')
    }

    if (selectors.responseLoading) {
      selectors.responseLoading.style.display = 'none'
    }
    if (selectors.responseContent) {
      selectors.responseContent.style.display = 'flex'
    }

    return payload
  } catch (error) {
    const hint = isLocalEnvironment()
      ? 'Make sure the server is running on port 3001 and ChatGPT_KEY is set in .env.local.'
      : 'Make sure ChatGPT_KEY is configured in Vercel environment variables.'
    if (selectors.responseError) {
      selectors.responseError.style.display = 'block'
      selectors.responseError.textContent = `Error: ${error.message}. ${hint}`
    }
    if (selectors.responseLoading) {
      selectors.responseLoading.style.display = 'none'
    }
    if (selectors.responseContent) {
      selectors.responseContent.style.display = 'none'
    }
    throw error
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
    updateSendPromptAvailability()
    return
  }

  const isChatGPTMode = selectors.chatgptMode?.checked ?? false

  if (isChatGPTMode) {
    // Use ChatGPT analysis mode
    resetResponsePanel()
    state.lastOutput = ''
    updateSendPromptAvailability()
    showMessage('Analyzing with ChatGPT...')
    await callChatGPTAnalysis(text)
    showMessage('ChatGPT analysis complete.')
    // Hide analyze button when in ChatGPT mode
    setAnalyzeButtonVisible(false)
    state.lastConfig = null
    setApplyOriginalDisabled(true)
  } else {
    // Use traditional obfuscation methods
    const currentSettings = captureCurrentSettings()
    if (!currentSettings.methods.length) {
      showMessage('Enable at least one method to continue.', true)
      return
    }

    const result = runTransformationPipeline(
      text,
      currentSettings.intensity,
      currentSettings.methods,
      transformations
    )
    resetResponsePanel()
    setTransformedText(result)
    setCopyDisabled(false)
    state.lastOutput = result
    state.lastConfig = currentSettings
    const methodCount = currentSettings.methods.length
    showMessage(`${methodCount} method${methodCount > 1 ? 's' : ''} applied.`)
    
    // Show analyze button for generated output
    setAnalyzeButtonVisible(true)
    setApplyOriginalDisabled(false)
    updateSendPromptAvailability()
    
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
  setApplyOriginalDisabled(true)
  setAnalyzeButtonVisible(false)
  applyRecommendedSettings()
  if (selectors.chatgptMode) {
    selectors.chatgptMode.checked = false
  }
  state.lastOutput = ''
  state.lastConfig = null
  updateSendPromptAvailability()
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
  resetResponsePanel()
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

const handleApplyOriginalSettings = () => {
  if (!state.lastOutput || !state.lastOutput.trim()) {
    showMessage('Generate an obfuscated output first.', true)
    return
  }
  if (!state.lastConfig || !state.lastConfig.methods?.length) {
    showMessage('Original settings unavailable. Generate using the obfuscator first.', true)
    return
  }

  applySettingsToUI(state.lastConfig)
  const result = runTransformationPipeline(
    state.lastOutput,
    state.lastConfig.intensity,
    state.lastConfig.methods,
    transformations
  )
  resetResponsePanel()
  state.lastOutput = result
  setTransformedText(result)
  setCopyDisabled(false)
  setAnalyzeButtonVisible(true)
  updateSendPromptAvailability()
  showMessage('Original settings applied to transformed text.')
}

const handleSendPrompt = async () => {
  if (!state.lastOutput || !state.lastOutput.trim()) {
    showMessage('Generate an obfuscated output first.', true)
    return
  }

  state.isSendingPrompt = true
  updateSendPromptAvailability()
  showMessage('Sending prompt to ChatGPT...')

  try {
    await callChatGPTPrompt(state.lastOutput)
    showMessage('ChatGPT responded to your prompt.')
  } catch (error) {
    console.error('Send prompt error:', error)
    showMessage('Unable to fetch ChatGPT response.', true)
  } finally {
    state.isSendingPrompt = false
    updateSendPromptAvailability()
  }
}

const bindEvents = () => {
  selectors.sourceField?.addEventListener('input', () => {
    updateCharCount()
    syncOriginalPreview()
  })
  selectors.intensitySlider?.addEventListener('input', () => {
    updateIntensityReadout()
    updateRecommendedBadge()
  })
  selectors.generateButton?.addEventListener('click', handleGenerate)
  selectors.copyButton?.addEventListener('click', handleCopy)
  selectors.resetButton?.addEventListener('click', handleReset)
  selectors.analyzeOutputButton?.addEventListener('click', handleAnalyzeOutput)
  selectors.applyOriginalButton?.addEventListener('click', handleApplyOriginalSettings)
  selectors.sendPromptButton?.addEventListener('click', handleSendPrompt)
  
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
      updateRecommendedBadge()
    })
  })
}

// Initialize UI
applyRecommendedSettings()
updateCharCount()
syncOriginalPreview()
setApplyOriginalDisabled(true)
resetResponsePanel()
updateSendPromptAvailability()
bindEvents()
