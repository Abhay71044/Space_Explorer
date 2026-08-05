import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, RotateCcw, X, Sparkles, Loader2, MessageSquare, Compass, Zap } from 'lucide-react';
import { playBeep } from '../utils/audioSynthesizer';

const SPACE_KNOWLEDGE = [
  {
    triggers: ["hi", "hello", "hey", "greetings", "hi there", "hey there", "good morning", "good evening"],
    reply: "Hello there! 👋 I'm T.A.R.S., your friendly space assistant on COSMA! What space topic or planet are you looking to explore today?",
    suggestions: ["What is a Black Hole?", "Tell me about Mars", "How fast does ISS orbit?", "What is JWST?"]
  },
  {
    triggers: ["who created you", "who made you", "who built you", "creator", "developer"],
    reply: "I was created by Abhay Singh as the onboard conversational AI companion for COSMA NASA & Earth Explorer! 👨‍💻",
    suggestions: ["What can you do?", "Tell me a space fact"]
  },
  {
    triggers: ["what can you do", "help", "options", "capabilities", "features"],
    reply: "I can answer any question about the universe! 🌌 Try asking me about Black Holes, Mars Rovers, the James Webb Space Telescope, the Solar System, ISS live tracking, eclipses, or how stars die!",
    suggestions: ["What is a Supernova?", "How old is the Universe?", "What is an Exoplanet?"]
  },
  {
    triggers: ["black hole", "event horizon", "singularity"],
    reply: "A black hole is a region of space where gravity is so strong that nothing—not even light—can escape! 🕳️ At the center lies a singularity of infinite density, surrounded by an Event Horizon.",
    suggestions: ["What is the Big Bang?", "What is a Supernova?"]
  },
  {
    triggers: ["jwst", "james webb", "webb telescope"],
    reply: "The James Webb Space Telescope (JWST) is NASA's premier space observatory! 🔭 Orbiting 1.5 million km away at L2, its 6.5-meter golden mirror uses infrared sensors to see stars formed 13.5 billion years ago.",
    suggestions: ["What is Hubble?", "What is an Exoplanet?"]
  },
  {
    triggers: ["iss", "space station", "international space station"],
    reply: "The International Space Station (ISS) orbits 420 km above Earth at a blistering 27,600 km/h (7.66 km/s)! 🛰️ It circles Earth every 90 minutes, allowing astronauts to witness 16 sunrises every single day.",
    suggestions: ["Can I see ISS tonight?", "Tell me about Apollo"]
  },
  {
    triggers: ["mars", "red planet", "curiosity", "perseverance"],
    reply: "Mars is the Red Planet! 🔴 It's home to Olympus Mons, the tallest volcano in the solar system (21.9 km high—nearly 3x taller than Mt. Everest!), and dried riverbeds where NASA rovers are searching for ancient signs of life.",
    suggestions: ["Is there water on Mars?", "Tell me about Jupiter"]
  },
  {
    triggers: ["jupiter", "great red spot"],
    reply: "Jupiter is the giant king of our solar system! 🪐 It's so big that over 1,300 Earths could fit inside it. Its famous Great Red Spot is a giant storm that has been raging for over 300 years!",
    suggestions: ["Does Jupiter have rings?", "Tell me about Saturn"]
  },
  {
    triggers: ["saturn", "rings"],
    reply: "Saturn is famous for its breathtaking ring system! 🪐 Made of billions of ice chunks and rocky debris ranging from microscopic dust to mountain-sized ice boulders. It also has 146 moons!",
    suggestions: ["Tell me about Titan", "Tell me about Uranus"]
  },
  {
    triggers: ["sun", "solar flare", "sunspot"],
    reply: "The Sun is a yellow dwarf star (G2V) at the center of our solar system! ☀️ It holds 99.86% of all mass in our solar system and burns hydrogen into helium at a core temperature of 15 Million °C.",
    suggestions: ["What is a Solar Eclipse?", "How old is the Sun?"]
  },
  {
    triggers: ["moon", "lunar", "artemis", "apollo"],
    reply: "Earth's Moon is 384,400 km away! 🌙 NASA's Apollo 11 landed the first humans on the Moon in 1969, and the upcoming Artemis program is returning astronauts to build a permanent lunar base.",
    suggestions: ["What causes Moon phases?", "When is the next Full Moon?"]
  },
  {
    triggers: ["galaxy", "milky way", "andromeda"],
    reply: "Our Milky Way is a barred spiral galaxy with over 100 billion stars! 🌌 Fun fact: The Milky Way and the Andromeda Galaxy are moving toward each other at 400,000 km/h and will collide in 4.5 billion years.",
    suggestions: ["What is a Nebula?", "What is a Light-Year?"]
  },
  {
    triggers: ["supernova", "star death", "neutron star"],
    reply: "A supernova is the catastrophic explosion of a dying massive star! 💥 The explosion scatters heavy elements like iron, gold, and platinum across space, which eventually form new planets and life.",
    suggestions: ["What is a Pulsar?", "What is a Black Hole?"]
  },
  {
    triggers: ["exoplanet", "trappist", "kepler"],
    reply: "An exoplanet is any planet orbiting a star outside our solar system! 🪐 NASA has confirmed over 5,500 exoplanets, including Earth-sized worlds like TRAPPIST-1e and Kepler-186f in the habitable zone.",
    suggestions: ["Can we live on Exoplanets?", "Tell me about K2-18 b"]
  },
  {
    triggers: ["fact", "space fact", "surprise me"],
    reply: "Here's a mind-blowing space fact: 🌟 One day on Venus is longer than one year on Venus! Venus takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.",
    suggestions: ["Tell me another fact", "What is a Light-Year?"]
  }
];

export default function TarsChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! 👋 I'm T.A.R.S., your AI space companion on COSMA. What space topic or planet are you looking to explore today?",
      keywords: ["What is a Black Hole?", "Tell me about Mars", "ISS Live Status", "What is JWST?"]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend = inputMsg) => {
    const query = textToSend.trim();
    if (!query) return;
    playBeep(580, 0.05);

    const newMsgs = [...messages, { sender: 'user', text: query }];
    setMessages(newMsgs);
    setInputMsg('');
    setIsTyping(true);

    const qLower = query.toLowerCase();

    // 1. Search local high-accuracy space knowledge engine
    const match = SPACE_KNOWLEDGE.find(item => 
      item.triggers.some(t => qLower.includes(t) || qLower === t)
    );

    if (match) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev, 
          { sender: 'bot', text: match.reply, keywords: match.suggestions }
        ]);
        playBeep(700, 0.08, 'square');
      }, 400);
      return;
    }

    // 2. Dynamic Pollinations AI fallback for open questions
    try {
      const response = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { 
              role: "system", 
              content: "You are T.A.R.S., a warm, intelligent, human-like space AI assistant on the COSMA NASA Explorer platform. Answer naturally and enthusiastically in 2-3 sentences. Use emojis." 
            },
            { role: "user", content: query }
          ],
          model: "openai"
        })
      });

      if (!response.ok) throw new Error();
      const replyText = await response.text();
      
      setIsTyping(false);
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'bot', 
          text: replyText.trim(),
          keywords: ["Tell me a space fact", "What is an Exoplanet?"]
        }
      ]);
      playBeep(700, 0.08, 'square');
    } catch (e) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'bot', 
          text: "That's a fascinating cosmic question! 🌌 Space is vast—try asking me about Mars, Black Holes, the James Webb Space Telescope, or our Solar System!",
          keywords: ["Tell me about Mars", "What is a Black Hole?"]
        }
      ]);
      playBeep(700, 0.08, 'square');
    }
  };

  const handleClearChat = () => {
    playBeep(330);
    setMessages([
      {
        sender: 'bot',
        text: "Chat cleared! 🚀 I'm ready for your next space question. What are you looking to explore?",
        keywords: ["What is a Black Hole?", "Tell me about Mars"]
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      <button 
        onClick={() => { playBeep(440); setIsOpen(!isOpen); }}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple p-0.5 shadow-glow-cyan flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        title="Open T.A.R.S. AI Space Chatbot"
      >
        <div className="w-full h-full rounded-full bg-space-bg flex items-center justify-center text-neon-cyan">
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6 animate-bounce" />}
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 glass-card border border-neon-cyan/40 rounded-2xl shadow-glow-cyan flex flex-col overflow-hidden font-inter animate-scale-up">
          {/* Header */}
          <div className="p-3.5 bg-black/60 border-b border-white/10 flex items-center justify-between font-orbitron">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center text-neon-cyan shadow-glow-cyan">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                  T.A.R.S. Space Assistant <Sparkles className="w-3 h-3 text-neon-cyan" />
                </h4>
                <span className="text-[9px] text-neon-green font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-ping"></span> ONLINE / READY TO ANSWER
                </span>
              </div>
            </div>

            <button 
              onClick={handleClearChat} 
              title="Clear Chat History" 
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="p-4 space-y-3.5 h-84 overflow-y-auto text-xs no-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center text-neon-cyan shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className={`p-3 rounded-xl max-w-[82%] leading-relaxed ${
                  m.sender === 'user' 
                    ? 'bg-gradient-to-r from-neon-cyan to-neon-blue text-black font-semibold shadow-glow-cyan' 
                    : 'bg-white/10 text-slate-200 border border-white/10'
                }`}>
                  <p>{m.text}</p>

                  {m.keywords && m.keywords.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1">
                      <span className="text-[9px] font-orbitron text-slate-400 block mb-1">SUGGESTED QUESTIONS:</span>
                      {m.keywords.map((kw, kIdx) => (
                        <button 
                          key={kIdx} 
                          onClick={() => handleSendMessage(kw)}
                          className="block w-full text-left text-[10px] font-orbitron text-neon-cyan hover:text-white hover:underline transition cursor-pointer"
                        >
                          💬 "{kw}"
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-slate-400 text-[11px] font-orbitron pt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-neon-cyan" />
                <span>T.A.R.S. thinking...</span>
              </div>
            )}
          </div>

          {/* Input Row */}
          <div className="p-3 bg-black/60 border-t border-white/10 flex gap-2">
            <input 
              type="text" 
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about space..."
              className="flex-1 bg-black/60 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-neon-cyan font-inter"
            />
            <button 
              onClick={() => handleSendMessage()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-blue text-black font-bold hover:shadow-glow-cyan transition flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
