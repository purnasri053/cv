import { useState, useRef, useEffect, useCallback } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaMicrophone, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Get logged-in user name from localStorage
function getLoggedInUser() {
  const candidate = JSON.parse(localStorage.getItem('candidateUser'));
  const hr = JSON.parse(localStorage.getItem('hrUser'));
  return candidate || hr || null;
}

const SYSTEM_CONTEXT = `You are CVScanner AI, a helpful assistant built into the CVScanner platform — an AI-powered resume screening and skill gap analysis tool.
You help candidates understand resume analysis, skill gaps, and improvement tips.
You help HR professionals interpret candidate rankings and shortlisting decisions.
Keep responses concise, friendly, and actionable. Use bullet points when listing things.`;

function AIChatBox() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm CVScanner AI. Ask me anything or tap the mic to speak." }
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const user = getLoggedInUser();
  const userName = user?.full_name?.split(' ')[0] || 'You';
  const userInitial = user?.full_name?.charAt(0).toUpperCase() || 'U';

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const recognitionRef = useRef(null);

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // ── Stop speech when chat closes ──────────────────────────────────────────
  useEffect(() => {
    if (!open) window.speechSynthesis?.cancel();
  }, [open]);

  // ── Text-to-Speech ────────────────────────────────────────────────────────
  const speak = useCallback((text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Strip markdown symbols for cleaner speech
    const clean = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/[*_`#]/g, '');
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate  = 1.0;
    utter.pitch = 1.0;
    utter.lang  = 'en-US';
    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.lang === 'en-US');
    if (preferred) utter.voice = preferred;
    utter.onstart = () => setSpeaking(true);
    utter.onend   = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, [ttsEnabled]);

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  // ── Speech-to-Text ────────────────────────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Speech recognition is not supported in this browser. Please use Chrome.' }]);
      return;
    }

    // Request mic permission explicitly first
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;

        let finalTranscript = '';

        recognition.onstart = () => {
          setListening(true);
          setInput('');
          finalTranscript = '';
        };

        recognition.onresult = (e) => {
          let interim = '';
          finalTranscript = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) {
              finalTranscript += e.results[i][0].transcript;
            } else {
              interim += e.results[i][0].transcript;
            }
          }
          setInput(finalTranscript || interim);
        };

        recognition.onend = () => {
          setListening(false);
          if (finalTranscript.trim()) {
            // Auto-send after speech ends
            setTimeout(() => {
              sendMessage(finalTranscript.trim());
            }, 300);
          }
        };

        recognition.onerror = (e) => {
          setListening(false);
          if (e.error === 'not-allowed') {
            setMessages(prev => [...prev, { role: 'assistant', text: 'Microphone access denied. Please allow microphone permission in your browser settings.' }]);
          } else if (e.error === 'no-speech') {
            setMessages(prev => [...prev, { role: 'assistant', text: 'No speech detected. Please try again.' }]);
          } else {
            setMessages(prev => [...prev, { role: 'assistant', text: `Mic error: ${e.error}. Please try again.` }]);
          }
        };

        recognition.start();
      })
      .catch(() => {
        setMessages(prev => [...prev, { role: 'assistant', text: 'Microphone access denied. Please click the camera/mic icon in your browser address bar and allow access.' }]);
      });
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const toggleMic = () => {
    if (listening) stopListening();
    else startListening();
  };

  // ── Send Message ──────────────────────────────────────────────────────────
  const sendMessage = async (overrideText) => {
    const text = typeof overrideText === 'string' ? overrideText.trim() : input.trim();
    if (!text || loading) return;

    stopSpeaking();
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(1)
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n');

      const fullPrompt = `${SYSTEM_CONTEXT}\n\n${history ? history + '\n' : ''}User: ${text}\nAssistant:`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
          })
        }
      );

      const data = await res.json();

      if (res.status === 429) {
        const msg = 'API limit reached. Please generate a new key at aistudio.google.com/app/apikey';
        setMessages(prev => [...prev, { role: 'assistant', text: msg }]);
        speak(msg);
        return;
      }

      if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      speak(reply);
    } catch (err) {
      const msg = `Error: ${err.message}`;
      setMessages(prev => [...prev, { role: 'assistant', text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  // ── Mic button click ──────────────────────────────────────────────────────
  const handleMicClick = () => {
    if (listening) stopListening();
    else startListening();
  };

  const formatText = (text) =>
    text.split('\n').map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      const isBullet = line.startsWith('* ') || line.startsWith('- ');
      const content = isBullet ? formatted.replace(/^[\*\-] /, '') : formatted;
      return (
        <span key={i} style={{ display: 'block', marginBottom: isBullet ? 4 : 2 }}>
          {isBullet && <span style={{ color: '#818cf8', marginRight: 6 }}>•</span>}
          <span dangerouslySetInnerHTML={{ __html: content }} />
        </span>
      );
    });

  return (
    <>
      {/* FAB */}
      <button className="chat-fab" onClick={() => setOpen(o => !o)} title="CVScanner AI">
        {open ? <FaTimes /> : <FaRobot />}
        {!open && <span className="chat-fab-label">AI Chat</span>}
      </button>

      {open && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className={`chat-header-avatar ${speaking ? 'avatar-speaking' : ''}`}><FaRobot /></div>
              <div>
                <div className="chat-header-name">{userName}</div>
                <div className="chat-header-status">
                  <span className="chat-online-dot" />
                  {speaking ? 'Speaking...' : listening ? 'Listening...' : 'Online'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {/* TTS toggle */}
              <button
                className="chat-close-btn"
                onClick={() => { setTtsEnabled(t => !t); stopSpeaking(); }}
                title={ttsEnabled ? 'Mute AI voice' : 'Unmute AI voice'}
              >
                {ttsEnabled ? <FaVolumeUp style={{ color: '#4ade80' }} /> : <FaVolumeMute style={{ color: '#f87171' }} />}
              </button>
              <button className="chat-close-btn" onClick={() => setOpen(false)}><FaTimes /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-ai'}`}>
                {msg.role === 'assistant' && <div className="chat-ai-avatar"><FaRobot /></div>}
                {msg.role === 'user' && <div className="chat-user-avatar">{userInitial}</div>}
                <div className="chat-msg-content">
                  <div className="chat-msg-sender">
                    {msg.role === 'assistant' ? 'AI' : userName}
                  </div>
                  <div className="chat-bubble">
                    {msg.role === 'assistant' ? formatText(msg.text) : msg.text}
                  </div>
                </div>
                {/* Replay TTS for assistant messages */}
                {msg.role === 'assistant' && i > 0 && (
                  <button className="chat-replay-btn" onClick={() => speak(msg.text)} title="Read aloud">
                    <FaVolumeUp />
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div className="chat-msg chat-msg-ai">
                <div className="chat-ai-avatar"><FaRobot /></div>
                <div className="chat-msg-content">
                  <div className="chat-msg-sender">AI</div>
                  <div className="chat-bubble chat-typing"><span /><span /><span /></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div className="chat-input-row">
            <button
              className={`chat-mic-btn ${listening ? 'mic-active' : ''}`}
              onClick={handleMicClick}
              title={listening ? 'Stop listening' : 'Speak your question'}
              disabled={loading}
            >
              <FaMicrophone />
            </button>

            <input
              ref={inputRef}
              className="chat-input"
              placeholder={listening ? 'Listening... click send or type' : 'Ask anything or tap mic...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
            />
            <button className="chat-send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              {loading ? <FaSpinner className="spin" /> : <FaPaperPlane />}
            </button>
          </div>

          {listening && (
            <div className="chat-listening-bar">
              <span className="mic-pulse" />
              Listening — speak now, it will auto-send when you stop
              <button className="chat-cancel-mic" onClick={stopListening}>Cancel</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default AIChatBox;
