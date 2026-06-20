"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface TOCProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TableOfContents({ isOpen, onClose }: TOCProps) {
  const links = [
    { title: "Start Here", items: [
      { id: "welcome", num: "00", text: "Welcome & how to use this" },
      { id: "essentials", num: "01", text: "Know before you go" },
      { id: "belly", num: "02", text: "Beating 'Delhi Belly'" },
      { id: "scams", num: "03", text: "The Scam Shield" },
      { id: "safety", num: "04", text: "Safety & solo travel" },
      { id: "etiquette", num: "05", text: "Culture & etiquette" },
      { id: "routes", num: "06", text: "Plan your route" },
    ]},
    { title: "The Destinations", items: [
      { id: "delhi", num: "07", text: "Delhi" },
      { id: "agra", num: "08", text: "Agra" },
      { id: "jaipur", num: "09", text: "Jaipur" },
      { id: "udaipur", num: "10", text: "Udaipur" },
      { id: "jodhpur", num: "11", text: "Jodhpur" },
      { id: "varanasi", num: "12", text: "Varanasi" },
      { id: "goa", num: "13", text: "Goa" },
      { id: "kerala", num: "14", text: "Kerala" },
    ]}
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[120] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-heading font-bold text-xl text-slate-900">Contents</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-500" />
                </button>
              </div>

              <div className="space-y-8">
                {links.map((section, idx) => (
                  <div key={idx}>
                    <h4 className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-4">{section.title}</h4>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          onClick={onClose}
                          className="flex items-center gap-3 py-3 border-b border-slate-100 font-heading font-medium text-slate-700 hover:text-orange-500 hover:pl-2 transition-all"
                        >
                          <span className="font-mono text-xs text-slate-400">{item.num}</span>
                          {item.text}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
