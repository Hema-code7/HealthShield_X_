import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, ShieldCheck, RefreshCw, ChevronRight } from 'lucide-react';
import type { MedicalDevice } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface HealthShieldAIAssistantProps {
  devices?: MedicalDevice[];
  isAttackActive?: boolean;
}

export const HealthShieldAIAssistant: React.FC<HealthShieldAIAssistantProps> = ({
  devices: _devices = [],
  isAttackActive = true
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Greetings Administrator. I am HealthShield AI, your autonomous cybersecurity analyst. How can I assist you with hospital telemetry, threat containment, or device security?',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const quickActions = [
    'WHY WAS DEVICE ISOLATED?',
    'CURRENT THREAT LEVEL',
    'LATEST INCIDENT',
    'AT-RISK DEVICES',
    'SECURITY SUMMARY'
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateAIResponse = (query: string): string => {
    const cleanQuery = query.toLowerCase();

    if (cleanQuery.includes('why') && (cleanQuery.includes('isolated') || cleanQuery.includes('admin-pc-07'))) {
      return 'ADMIN-PC-07 generated a high-risk behavioral anomaly. The device showed unusual authentication activity and unexpected lateral communication with EHR-SERVER-01. The AI engine assigned a 94% risk score and automated network isolation was triggered to preserve patient record confidentiality.';
    }

    if (cleanQuery.includes('threat level') || cleanQuery.includes('current threat')) {
      return isAttackActive
        ? 'CURRENT THREAT LEVEL: HIGH (EHR Lateral Movement Contained). 1 device isolated (ADMIN-PC-07), 5 forensic artifacts preserved. Hospital network infrastructure remains 100% operational.'
        : 'CURRENT THREAT LEVEL: LOW (System Secure). Continuous telemetry monitoring active across 247 network nodes.';
    }

    if (cleanQuery.includes('latest incident') || cleanQuery.includes('incident')) {
      return 'LATEST INCIDENT INC-0241: Suspicious Lateral Access from ADMIN-PC-07 to EHR-SERVER-01. Status: CONTAINED. Forensic Evidence Coverage (FEC) verified at 96% after automated containment.';
    }

    if (cleanQuery.includes('at-risk') || cleanQuery.includes('at risk') || cleanQuery.includes('devices')) {
      return 'DEVICE TELEMETRY AUDIT: ADMIN-PC-07 is currently QUARANTINED/ISOLATED (94% Risk Score). All medical IoT devices (ICU Monitors 01/02, Ventilators, Infusion Pumps, Lab Servers) are reporting 100% SECURE status on isolated VLANs.';
    }

    if (cleanQuery.includes('summary') || cleanQuery.includes('security summary')) {
      return 'HEALTHSHIELD-X SECURITY SUMMARY: Overall Security Score 94% (HEALTHY). Defense Loop Active: MONITOR → DETECT → ANALYZE → EXPLAIN → RESPOND → PRESERVE. Zero unauthorized patient record exfiltrations registered.';
    }

    return `Analyst Query Acknowledged: "${query}". All hospital telemetry logs and deterministic FEC audit rules indicate system containment. Would you like me to elaborate on device isolation logs or forensic artifact provenance?`;
  };

  const handleSend = (queryToSend?: string) => {
    const text = queryToSend || inputText;
    if (!text.trim()) return;

    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReply = generateAIResponse(text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto font-sans h-[calc(100vh-140px)] flex flex-col">
      {/* Top Banner */}
      <div className="bg-[#111827]/90 border border-[#1e293b] rounded-xl p-5 shadow-2xl flex items-center justify-between font-sans">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">HEALTHSHIELD AI</h1>
            <div className="text-xs text-cyan-400 font-mono flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI SECURITY ANALYST · CONTEXTUAL TELEMETRY ENGINE</span>
            </div>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold hidden sm:flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>AUTONOMOUS ANALYST ONLINE</span>
        </div>
      </div>

      {/* Quick Action Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
        <span className="text-slate-400 text-[11px] whitespace-nowrap">QUICK ANALYTICS:</span>
        {quickActions.map((act) => (
          <button
            key={act}
            onClick={() => handleSend(act)}
            className="px-3 py-1.5 rounded-lg bg-[#161b22] hover:bg-cyan-950/40 border border-[#1e293b] hover:border-cyan-500/50 text-cyan-300 font-bold whitespace-nowrap flex items-center gap-1 cursor-pointer transition-all"
          >
            <span>{act}</span>
            <ChevronRight className="w-3 h-3 text-cyan-400" />
          </button>
        ))}
      </div>

      {/* Chat Messages Log Area */}
      <div className="flex-1 bg-[#111827] border border-[#1e293b] rounded-xl p-5 overflow-y-auto space-y-4 font-mono shadow-2xl">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
              msg.sender === 'user'
                ? 'bg-indigo-600/30 border border-indigo-500 text-indigo-300'
                : 'bg-cyan-600/30 border border-cyan-500 text-cyan-300'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-xl rounded-xl p-4 space-y-1 text-xs shadow-md ${
              msg.sender === 'user'
                ? 'bg-indigo-950/40 border border-indigo-500/40 text-slate-100 font-sans'
                : 'bg-[#161b22] border border-[#1e293b] text-slate-200 font-sans'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-[#1e293b] pb-1 mb-1">
                <span>{msg.sender === 'user' ? 'SECURITY ADMINISTRATOR' : 'HEALTHSHIELD AI ENGINE'}</span>
                <span>{msg.timestamp}</span>
              </div>
              <p className="leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>HealthShield AI is analyzing telemetry data...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-3 flex items-center gap-3 shadow-xl">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask HealthShield AI (e.g. Why was ADMIN-PC-07 isolated?)..."
          className="flex-1 bg-[#161b22] border border-[#1e293b] text-xs text-slate-100 px-4 py-2.5 rounded-lg focus:outline-none focus:border-cyan-500 font-sans"
        />
        <button
          onClick={() => handleSend()}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs rounded-lg flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-cyan-600/30"
        >
          <span>TRANSMIT</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
