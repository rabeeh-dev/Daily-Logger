'use client';

import React, { useState, useEffect } from 'react';
import { Target, Shield, Plus, X, Edit2, Zap } from 'lucide-react';


type VisionItem = { id: string; text: string; category: string; type: 'TARGET' | 'MANIFESTO' };

export default function VisionPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<VisionItem[]>([]);

  // Form State
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [inputCategory, setInputCategory] = useState('');
  const [inputType, setInputType] = useState<'TARGET' | 'MANIFESTO'>('TARGET');

  useEffect(() => {
    setMounted(true);
    fetchVision();
  }, []);

  const fetchVision = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vision');
      if (res.ok) {
        const data = await res.json();
        const normalizedItems = (data.items || []).map((item: any) => ({ ...item, id: item.id || item._id }));
        setItems(normalizedItems);
      }
    } catch (err) {
      console.error('Failed to fetch vision:', err);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const saveVision = async (updatedItems: VisionItem[]) => {
    try {
      await fetch('/api/vision', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems })
      });
    } catch (err) {
      console.error('Failed to save vision:', err);
    }
  };

  const handleSave = () => {
    if (!inputText.trim()) return;
    let newItems = [...items];
    if (editingId) {
      newItems = items.map(i => i.id === editingId ? { ...i, text: inputText, category: inputCategory.toUpperCase() } : i);
    } else {
      const newItem: VisionItem = {
        id: Date.now().toString(),
        text: inputText,
        category: inputCategory.toUpperCase() || 'GENERAL',
        type: inputType
      };
      newItems.push(newItem);
    }
    setItems(newItems);
    saveVision(newItems);
    resetForm();
  };

  const resetForm = () => {
    setInputText('');
    setInputCategory('');
    setEditingId(null);
    setShowAdd(false);
  };

  const startEdit = (item: VisionItem) => {
    setInputText(item.text);
    setInputCategory(item.category);
    setInputType(item.type);
    setEditingId(item.id);
    setShowAdd(true);
  };

  const removeItem = (id: string) => {
    const newItems = items.filter(i => i.id !== id);
    setItems(newItems);
    saveVision(newItems);
  };

  if (!mounted) return null;

  const targets = items.filter(i => i.type === 'TARGET');
  const manifesto = items.filter(i => i.type === 'MANIFESTO');

  return (
    <div className="flex flex-col gap-[32px] pb-[48px]">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#1A1A1A] pb-[24px] s1">
          <div>
            <div className="font-['IBM_Plex_Mono'] text-[18px] text-[#FFFFFF] font-bold uppercase tracking-[0.12em] mb-[4px]">
              VISION PROTOCOL
            </div>
            <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#555555] uppercase tracking-[0.12em]">
              LONG-TERM TRAJECTORY · CORE IDENTITY
            </div>
          </div>
          <div className="text-right">
            <div className="font-['IBM_Plex_Mono'] text-[28px] text-[#FFFFFF] font-bold leading-none mb-[4px]">
              {items.length}
            </div>
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.12em]">
              ACTIVE CONVICTIONS
            </div>
          </div>
        </div>

        {showAdd && (
          <div className="border border-[#1A1A1A] bg-[#0A0A0A] p-[24px] flex flex-col gap-[16px]">
            <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-[12px]">
              <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#FFFFFF] uppercase tracking-[0.16em]">
                {editingId ? 'REVISE VISION COMPONENT' : `INITIALIZE ${inputType}`}
              </span>
              <button onClick={resetForm} className="text-[#555555] hover:text-[#FFFFFF] transition-colors"><X size={16} /></button>
            </div>
            <textarea 
              placeholder="DEFINE THE VISION..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="bg-transparent border-b border-[#1A1A1A] text-[#FFFFFF] font-['Inter'] text-[16px] py-[12px] outline-none focus:border-[#FFFFFF] placeholder-[#2A2A2A] resize-none min-h-[80px]"
            />
            <div className="flex gap-[16px]">
              <input 
                type="text"
                placeholder="CATEGORY..."
                value={inputCategory}
                onChange={(e) => setInputCategory(e.target.value)}
                className="flex-1 bg-transparent border-b border-[#1A1A1A] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[11px] py-[8px] outline-none"
              />
              {!editingId && (
                <select 
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value as any)}
                  className="bg-transparent border-b border-[#1A1A1A] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[11px] py-[8px] outline-none appearance-none px-[8px]"
                >
                  <option value="TARGET" className="bg-[#000000]">LONG-TERM TARGET</option>
                  <option value="MANIFESTO" className="bg-[#000000]">CORE MANIFESTO</option>
                </select>
              )}
            </div>
            <button onClick={handleSave} className="w-full h-[44px] bg-[#FFFFFF] text-[#000000] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.12em] font-bold hover:bg-[#E0E0E0]">
              {editingId ? 'COMMIT REVISION' : 'LOG TO MISSION PROFILE'}
            </button>
          </div>
        )}

        <div className="flex gap-[24px]">
          <div className="w-[50%] flex flex-col gap-[20px]">
            <div className="flex justify-between items-center">
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">STRATEGIC TARGETS</div>
              <button onClick={() => { setInputType('TARGET'); setShowAdd(true); }} className="text-[#FFFFFF]"><Plus size={16} /></button>
            </div>
            <div className="flex flex-col gap-[1px] bg-[#1A1A1A] border border-[#1A1A1A]">
              {targets.map((item, idx) => (
                <div key={item.id || `t-${idx}`} className="bg-[#050505] p-[24px] group relative hover:bg-[#080808]">
                  <div className="absolute top-[12px] right-[12px] flex gap-[8px] opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => startEdit(item)} className="text-[#2A2A2A] hover:text-[#FFFFFF]"><Edit2 size={14} /></button>
                    <button onClick={() => removeItem(item.id)} className="text-[#2A2A2A] hover:text-[#F87171]"><X size={14} /></button>
                  </div>
                  <div className="font-['IBM_Plex_Mono'] text-[9px] text-[#555555] uppercase mb-[12px] flex items-center gap-[6px]">
                    <Target size={10} className="text-[#F87171]" /> {item.category}
                  </div>
                  <p className="font-['Inter'] text-[15px] text-[#FFFFFF] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-[50%] flex flex-col gap-[20px]">
            <div className="flex justify-between items-center">
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">IDENTITY MANIFESTO</div>
              <button onClick={() => { setInputType('MANIFESTO'); setShowAdd(true); }} className="text-[#FFFFFF]"><Plus size={16} /></button>
            </div>
            <div className="flex flex-col gap-[1px] bg-[#1A1A1A] border border-[#1A1A1A]">
              {manifesto.map((item, idx) => (
                <div key={item.id || `m-${idx}`} className="bg-[#050505] p-[24px] group relative hover:bg-[#0A0A0A] border-l-2 border-transparent hover:border-[#FFFFFF]">
                  <div className="absolute top-[12px] right-[12px] flex gap-[8px] opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => startEdit(item)} className="text-[#2A2A2A] hover:text-[#FFFFFF]"><Edit2 size={14} /></button>
                    <button onClick={() => removeItem(item.id)} className="text-[#2A2A2A] hover:text-[#F87171]"><X size={14} /></button>
                  </div>
                  <div className="font-['IBM_Plex_Mono'] text-[9px] text-[#555555] uppercase mb-[12px] flex items-center gap-[6px]">
                    <Shield size={10} className="text-[#FFFFFF]" /> {item.category}
                  </div>
                  <p className="font-['Inter'] text-[15px] text-[#FFFFFF] italic leading-relaxed">&quot;{item.text}&quot;</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}
