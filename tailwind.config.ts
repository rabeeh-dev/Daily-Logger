import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base':       '#000000',
        'bg-surface':    '#050505',
        'bg-elevated':   '#0D0D0D',
        'bg-input':      '#0A0A0A',
        'border-default':'#1A1A1A',
        'border-active': '#FFFFFF',
        'border-subtle': '#111111',
        'text-primary':  '#FFFFFF',
        'text-secondary':'#666666',
        'text-muted':    '#333333',
        'text-inverse':  '#000000',
        'accent-white':  '#FFFFFF',
        'accent-success':'#4ADE80',
        'accent-warn':   '#FACC15',
        'accent-danger': '#F87171',
        'accent-xp':     '#A78BFA',
        'progress-track':'#1A1A1A',
        'progress-fill': '#FFFFFF',
        'progress-xp':   '#A78BFA',
        'heatmap-0':     '#0D0D0D',
        'heatmap-1':     '#1F2D1F',
        'heatmap-2':     '#2D4A2D',
        'heatmap-3':     '#3D6B3D',
        'heatmap-4':     '#4ADE80',
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
