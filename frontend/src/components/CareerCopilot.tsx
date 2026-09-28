import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, User, HelpCircle, Loader2 } from "lucide-react";
import { api } from "../services/api";

export const CareerCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: "Hi Ashwin! I am your AI Career Copilot. I have full context of your 78% Placement Readiness, your Power BI / Statistics skill gaps, and current market demand across 112 job descriptions. How can I help you get hired?"
    }
  ]);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    "Why is my Power BI score low?",
    "What should I learn this week?",
    "Am I ready for Data Analyst interviews?",
    "Which skills are trending?",
    "How can I improve my resume?",
    "Give me a SQL practice question."
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = query.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.copilotChat(userMsg);
      setMessages((prev) => [...prev, { sender: "bot", text: res.reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Based on your live profile, closing your Statistics and Power BI gaps in Week 2 will elevate your market alignment from 82% to 91%!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs px-4 py-3 rounded-full shadow-2xl shadow-blue-500/30 border border-blue-400/40 transition-all hover:scale-105"
        >
          <Bot className="w-4 h-4 text-blue-200 animate-bounce" />
          <span>AI Career Copilot</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[520px] bg-[#0F172A] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-slate-900 p-3.5 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white">AI Career Copilot</h4>
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 rounded font-mono">Live</span>
                </div>
                <p className="text-[10px] text-slate-300">Grounded in Ashwin's profile & market data</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 text-xs ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                  </div>
                )}
                <div
                  className={`p-2.5 rounded-xl max-w-[82%] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                      : "bg-slate-800/80 text-slate-200 border border-slate-700/80 rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 text-xs items-center text-slate-400">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                </div>
                <span>Copilot is analyzing your profile...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 border-t border-slate-800 bg-slate-900/40">
            <div className="text-[10px] font-semibold text-slate-400 mb-1.5 px-1">Suggested Questions:</div>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(qp)}
                  className="text-[10px] bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded-md border border-slate-700/80 transition-all text-left"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your readiness..."
              className="flex-1 bg-slate-800/90 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
