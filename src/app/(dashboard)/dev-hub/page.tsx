'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, GitBranch, Plus, X, Edit2 } from 'lucide-react';


type Project = { id: string; name: string; progress: number; status: string; stack: string[] };
type Journey = { id: string; name: string; status: string; progress: number; category: string };

const STATUS_OPTIONS = ['NOT STARTED', 'IN-PROGRESS', 'ACTIVE', 'RESEARCHING', 'STABLE', 'COMPLETED'];

export default function DevHubPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);

  // Project Form State
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectStatus, setProjectStatus] = useState('ACTIVE');
  const [projectProgress, setProjectProgress] = useState(0);
  const [projectStack, setProjectStack] = useState('');

  // Journey Form State
  const [showAddJourney, setShowAddJourney] = useState(false);
  const [editingJourneyId, setEditingJourneyId] = useState<string | null>(null);
  const [journeyName, setJourneyName] = useState('');
  const [journeyStatus, setJourneyStatus] = useState('IN-PROGRESS');
  const [journeyProgress, setJourneyProgress] = useState(0);
  const [journeyCategory, setJourneyCategory] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchDevProgress();
  }, []);

  const fetchDevProgress = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dev-progress');
      if (res.ok) {
        const data = await res.json();
        setProjects((data.projects || []).map((p: any) => ({ ...p, id: p.id || p._id })));
        setJourneys((data.journeys || []).map((j: any) => ({ ...j, id: j.id || j._id })));
      }
    } catch (err) {
      console.error('Failed to fetch dev progress:', err);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const saveDevProgress = async (updatedProjects: Project[], updatedJourneys: Journey[]) => {
    try {
      await fetch('/api/dev-progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projects: updatedProjects,
          journeys: updatedJourneys
        })
      });
    } catch (err) {
      console.error('Failed to save dev progress:', err);
    }
  };

  const handleSaveProject = () => {
    if (!projectName.trim()) return;
    let newProjects = [...projects];
    if (editingProjectId) {
      newProjects = projects.map(p => p.id === editingProjectId ? {
        ...p,
        name: projectName,
        status: projectStatus,
        progress: projectProgress,
        stack: projectStack.split(',').map(s => s.trim().toUpperCase()).filter(s => s)
      } : p);
    } else {
      const newProject: Project = {
        id: Date.now().toString(),
        name: projectName,
        status: projectStatus,
        progress: projectProgress,
        stack: projectStack.split(',').map(s => s.trim().toUpperCase()).filter(s => s)
      };
      newProjects.push(newProject);
    }
    setProjects(newProjects);
    saveDevProgress(newProjects, journeys);
    resetProjectForm();
  };

  const handleSaveJourney = () => {
    if (!journeyName.trim()) return;
    let newJourneys = [...journeys];
    if (editingJourneyId) {
      newJourneys = journeys.map(j => j.id === editingJourneyId ? {
        ...j,
        name: journeyName,
        status: journeyStatus,
        progress: journeyProgress,
        category: journeyCategory.toUpperCase() || 'GENERAL'
      } : j);
    } else {
      const newJourney: Journey = {
        id: Date.now().toString(),
        name: journeyName,
        status: journeyStatus,
        progress: journeyProgress,
        category: journeyCategory.toUpperCase() || 'GENERAL'
      };
      newJourneys.push(newJourney);
    }
    setJourneys(newJourneys);
    saveDevProgress(projects, newJourneys);
    resetJourneyForm();
  };

  const resetProjectForm = () => {
    setProjectName('');
    setProjectStack('');
    setProjectProgress(0);
    setEditingProjectId(null);
    setShowAddProject(false);
  };

  const resetJourneyForm = () => {
    setJourneyName('');
    setJourneyCategory('');
    setJourneyProgress(0);
    setEditingJourneyId(null);
    setShowAddJourney(false);
  };

  const startEditProject = (p: Project) => {
    setProjectName(p.name);
    setProjectStatus(p.status);
    setProjectProgress(p.progress);
    setProjectStack(p.stack.join(', '));
    setEditingProjectId(p.id);
    setShowAddProject(true);
  };

  const startEditJourney = (j: Journey) => {
    setJourneyName(j.name);
    setJourneyStatus(j.status);
    setJourneyProgress(j.progress);
    setJourneyCategory(j.category);
    setEditingJourneyId(j.id);
    setShowAddJourney(true);
  };

  const removeProject = (id: string) => {
    const newProjects = projects.filter(p => p.id !== id);
    setProjects(newProjects);
    saveDevProgress(newProjects, journeys);
  };

  const removeJourney = (id: string) => {
    const newJourneys = journeys.filter(j => j.id !== id);
    setJourneys(newJourneys);
    saveDevProgress(projects, newJourneys);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-[32px] pb-[48px]">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#1A1A1A] pb-[24px] s1">
          <div>
            <div className="font-['IBM_Plex_Mono'] text-[18px] text-[#FFFFFF] font-bold uppercase tracking-[0.12em] mb-[4px]">
              ENGINEERING HUB
            </div>
            <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#555555] uppercase tracking-[0.12em]">
              SYSTEM ARCHITECTURE · KNOWLEDGE ACQUISITION
            </div>
          </div>
          <div className="flex gap-[32px] text-right">
            <div>
              <div className="font-['IBM_Plex_Mono'] text-[28px] text-[#FFFFFF] font-bold leading-none mb-[4px]">
                {projects.length}
              </div>
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.12em]">
                ACTIVE REPOS
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-[24px]">
          {/* Left Column - Projects (50%) */}
          <div className="w-[50%] flex flex-col gap-[20px] s2">
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">PROJECT PIPELINE</div>
            
            {showAddProject && (
              <div className="border border-[#1A1A1A] bg-[#0A0A0A] p-[20px] flex flex-col gap-[16px] mb-[8px]">
                <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-[12px]">
                  <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#FFFFFF] uppercase tracking-[0.16em]">
                    {editingProjectId ? 'EDIT REPOSITORY' : 'INITIALIZE REPOSITORY'}
                  </span>
                  <button onClick={resetProjectForm} className="text-[#555555] hover:text-[#FFFFFF]"><X size={14} /></button>
                </div>
                
                <input 
                  type="text" 
                  placeholder="PROJECT NAME..." 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="bg-transparent border-b border-[#1A1A1A] text-[#FFFFFF] font-['Inter'] text-[14px] py-[8px] outline-none focus:border-[#FFFFFF] placeholder-[#2A2A2A]" 
                />
                <div className="grid grid-cols-2 gap-[16px]">
                  <select 
                    value={projectStatus} 
                    onChange={(e) => setProjectStatus(e.target.value)}
                    className="bg-[#050505] border border-[#1A1A1A] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[10px] p-[8px] outline-none"
                  >
                    {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <div className="flex items-center gap-[12px] bg-[#050505] border border-[#1A1A1A] px-[12px] py-[8px]">
                    <span className="text-[#555555] font-['IBM_Plex_Mono'] text-[10px]">PROG</span>
                    <input 
                      type="range" 
                      min="0" max="100"
                      value={projectProgress}
                      onChange={(e) => setProjectProgress(Number(e.target.value))}
                      className="flex-1 accent-[#FFFFFF]"
                    />
                    <span className="text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[10px] w-[24px] text-right">{projectProgress}%</span>
                  </div>
                </div>
                <button 
                  onClick={handleSaveProject}
                  className="w-full h-[40px] bg-[#FFFFFF] text-[#000000] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.12em] font-bold hover:bg-[#E0E0E0]"
                >
                  {editingProjectId ? 'UPDATE REPOSITORY' : 'DEPLOY PROJECT'}
                </button>
              </div>
            )}

            <div className="flex flex-col gap-[1px] bg-[#1A1A1A] border border-[#1A1A1A]">
              {projects.map((project, idx) => (
                <div key={project.id || `p-${idx}`} className="bg-[#050505] p-[24px] group relative hover:bg-[#080808]">
                  <div className="absolute top-[12px] right-[12px] flex gap-[8px] opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => startEditProject(project)} className="text-[#2A2A2A] hover:text-[#FFFFFF]"><Edit2 size={14} /></button>
                    <button onClick={() => removeProject(project.id)} className="text-[#2A2A2A] hover:text-[#F87171]"><X size={14} /></button>
                  </div>
                  <div className="flex justify-between items-start mb-[12px]">
                    <h3 className="font-['IBM_Plex_Mono'] text-[16px] text-[#FFFFFF] font-bold uppercase tracking-[0.05em]">{project.name}</h3>
                    <span className="font-['IBM_Plex_Mono'] text-[8px] uppercase tracking-[0.1em] px-[6px] py-[2px] border border-[#333333] text-[#AAAAAA]">{project.status}</span>
                  </div>
                  <div className="flex items-center gap-[16px]">
                    <div className="flex-1 h-[2px] bg-[#111111] overflow-hidden">
                      <div className="h-full bg-[#FFFFFF]" style={{ width: `${project.progress}%` }}></div>
                    </div>
                    <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#FFFFFF]">{project.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
            {!showAddProject && (
              <button onClick={() => setShowAddProject(true)} className="w-full h-[44px] border border-[#2A2A2A] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.12em] hover:border-[#FFFFFF] flex items-center justify-center gap-[8px]">
                <Plus size={14} /> INITIALIZE NEW REPOSITORY
              </button>
            )}
          </div>

          {/* Right Column - Journeys (50%) */}
          <div className="w-[50%] flex flex-col gap-[20px] s3">
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">TECH JOURNEY PIPELINE</div>
            
            {showAddJourney && (
              <div className="border border-[#1A1A1A] bg-[#0A0A0A] p-[20px] flex flex-col gap-[16px] mb-[8px]">
                <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-[12px]">
                  <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#FFFFFF] uppercase tracking-[0.16em]">
                    {editingJourneyId ? 'EDIT MODULE' : 'ADD MODULE'}
                  </span>
                  <button onClick={resetJourneyForm} className="text-[#555555] hover:text-[#FFFFFF]"><X size={14} /></button>
                </div>
                <input 
                  type="text" 
                  placeholder="MODULE NAME..." 
                  value={journeyName}
                  onChange={(e) => setJourneyName(e.target.value)}
                  className="bg-transparent border-b border-[#1A1A1A] text-[#FFFFFF] font-['Inter'] text-[14px] py-[8px] outline-none focus:border-[#FFFFFF] placeholder-[#2A2A2A]" 
                />
                <div className="grid grid-cols-2 gap-[16px]">
                  <select 
                    value={journeyStatus} 
                    onChange={(e) => setJourneyStatus(e.target.value)}
                    className="bg-[#050505] border border-[#1A1A1A] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[10px] p-[8px] outline-none"
                  >
                    {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <div className="flex items-center gap-[12px] bg-[#050505] border border-[#1A1A1A] px-[12px] py-[8px]">
                    <span className="text-[#555555] font-['IBM_Plex_Mono'] text-[10px]">PROG</span>
                    <input 
                      type="range" 
                      min="0" max="100"
                      value={journeyProgress}
                      onChange={(e) => setJourneyProgress(Number(e.target.value))}
                      className="flex-1 accent-[#4ADE80]"
                    />
                    <span className="text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[10px] w-[24px] text-right">{journeyProgress}%</span>
                  </div>
                </div>
                <button onClick={handleSaveJourney} className="w-full h-[40px] bg-[#FFFFFF] text-[#000000] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.12em] font-bold hover:bg-[#E0E0E0]">
                  {editingJourneyId ? 'UPDATE MODULE' : 'LINK MODULE'}
                </button>
              </div>
            )}

            <div className="flex flex-col gap-[1px] bg-[#1A1A1A] border border-[#1A1A1A]">
              {journeys.map((journey, idx) => (
                <div key={journey.id || `j-${idx}`} className="bg-[#050505] p-[24px] group relative hover:bg-[#080808]">
                  <div className="absolute top-[12px] right-[12px] flex gap-[8px] opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => startEditJourney(journey)} className="text-[#2A2A2A] hover:text-[#FFFFFF]"><Edit2 size={14} /></button>
                    <button onClick={() => removeJourney(journey.id)} className="text-[#2A2A2A] hover:text-[#F87171]"><X size={14} /></button>
                  </div>
                  <div className="flex justify-between items-start mb-[12px]">
                    <h3 className="font-['IBM_Plex_Mono'] text-[16px] text-[#FFFFFF] font-bold uppercase tracking-[0.05em]">{journey.name}</h3>
                    <span className="font-['IBM_Plex_Mono'] text-[8px] uppercase tracking-[0.1em] px-[6px] py-[2px] border border-[#333333] text-[#AAAAAA]">{journey.status}</span>
                  </div>
                  <div className="flex items-center gap-[16px]">
                    <div className="flex-1 h-[2px] bg-[#111111] overflow-hidden">
                      <div className="h-full bg-[#4ADE80]" style={{ width: `${journey.progress}%` }}></div>
                    </div>
                    <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#FFFFFF]">{journey.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
            {!showAddJourney && (
              <button onClick={() => setShowAddJourney(true)} className="w-full h-[44px] border border-[#2A2A2A] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.12em] hover:border-[#FFFFFF] flex items-center justify-center gap-[8px]">
                <Plus size={14} /> ADD LEARNING MODULE
              </button>
            )}
          </div>
        </div>
      </div>
  );
}
