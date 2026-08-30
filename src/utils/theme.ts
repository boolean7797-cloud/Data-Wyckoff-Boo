import { ThemeConfig } from '../types';

export const hexToRgbString = (hex: string): string => {
  if (!hex || typeof hex !== 'string') return '239, 68, 68';
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16) || 0;
    const g = parseInt(cleanHex[1] + cleanHex[1], 16) || 0;
    const b = parseInt(cleanHex[2] + cleanHex[2], 16) || 0;
    return `${r}, ${g}, ${b}`;
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `${r}, ${g}, ${b}`;
};

export const applyTheme = (theme: ThemeConfig) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.style.setProperty('--primary-neon', theme.primary);
  root.style.setProperty('--primary-purple', theme.secondary);
  root.style.setProperty('--bg-main', theme.bgMain);
  root.style.setProperty('--surface', theme.bgSurface);
  root.style.setProperty('--surface-container', theme.bgSurfaceContainer);
  root.style.setProperty('--border-main', theme.border);
  root.style.setProperty('--text-main', theme.textMain);
  root.style.setProperty('--neon-green', theme.winColor);
  root.style.setProperty('--neon-red', theme.lossColor);

  document.body.style.backgroundColor = theme.bgMain;
  document.body.style.color = theme.textMain;

  let styleTag = document.getElementById('neon-theme-dynamic-styles') as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'neon-theme-dynamic-styles';
    document.head.appendChild(styleTag);
  }

  const primaryRgb = hexToRgbString(theme.primary);
  const surfaceRgb = hexToRgbString(theme.bgSurface);
  const containerRgb = hexToRgbString(theme.bgSurfaceContainer);
  const borderRgb = hexToRgbString(theme.border);
  const winRgb = hexToRgbString(theme.winColor);
  const lossRgb = hexToRgbString(theme.lossColor);

  styleTag.innerHTML = `
    :root {
      --color-primary: ${theme.primary};
      --color-secondary: ${theme.secondary};
      --color-bg-main: ${theme.bgMain};
      --color-bg-surface: ${theme.bgSurface};
      --color-bg-container: ${theme.bgSurfaceContainer};
      --color-border: ${theme.border};
      --color-text: ${theme.textMain};
      --color-win: ${theme.winColor};
      --color-loss: ${theme.lossColor};
    }
    body {
      background-color: ${theme.bgMain} !important;
      color: ${theme.textMain} !important;
    }
    .glass-panel {
      background: rgba(${containerRgb}, 0.85) !important;
      border-color: rgba(${borderRgb}, 0.9) !important;
    }
    .glass-panel-card {
      background: rgba(${surfaceRgb}, 0.88) !important;
      border-color: rgba(${borderRgb}, 0.95) !important;
    }
    .neon-glow-primary {
      text-shadow: 0 0 16px rgba(${primaryRgb}, 0.5);
    }
    .box-glow-primary {
      box-shadow: 0 0 16px rgba(${primaryRgb}, 0.35);
    }
    .neon-glow-green {
      text-shadow: 0 0 16px rgba(${winRgb}, 0.4) !important;
    }
    .box-glow-green {
      box-shadow: 0 0 14px rgba(${winRgb}, 0.3) !important;
    }
    .neon-glow-red {
      text-shadow: 0 0 16px rgba(${lossRgb}, 0.5) !important;
    }
    .box-glow-red {
      box-shadow: 0 0 14px rgba(${lossRgb}, 0.35) !important;
    }
    .input-glow:focus-within {
      border-color: ${theme.primary} !important;
      box-shadow: 0 0 12px rgba(${primaryRgb}, 0.4) !important;
    }
    input[type="range"]::-webkit-slider-thumb {
      background: ${theme.primary} !important;
      box-shadow: 0 0 10px rgba(${primaryRgb}, 0.8) !important;
    }
  `;
};
