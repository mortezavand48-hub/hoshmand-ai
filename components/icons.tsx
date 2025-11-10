import React from 'react';

const iconProps = {
  className: "w-5 h-5",
  strokeWidth: 1.5,
  stroke: "currentColor",
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const ChatIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

export const ImageIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

export const VideoIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
    </svg>
);

export const FilmIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line>
    </svg>
);

export const MicIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
);

export const SpeakerIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
);

export const DocumentTextIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

export const GeminiIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className || "w-6 h-6"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1.5C12 1.5 11.41 3.59 9.87 5.13C8.33 6.67 6.24 7.26 6.24 7.26C6.24 7.26 8.33 7.85 9.87 9.39C11.41 10.93 12 13.02 12 13.02C12 13.02 12.59 10.93 14.13 9.39C15.67 7.85 17.76 7.26 17.76 7.26C17.76 7.26 15.67 6.67 14.13 5.13C12.59 3.59 12 1.5 12 1.5Z" />
        <path d="M12 13.02C12 13.02 11.41 15.11 9.87 16.65C8.33 18.19 6.24 18.78 6.24 18.78C6.24 18.78 8.33 19.37 9.87 20.91C11.41 22.45 12 24.54 12 24.54C12 24.54 12.59 22.45 14.13 20.91C15.67 19.37 17.76 18.78 17.76 18.78C17.76 18.78 15.67 18.19 14.13 16.65C12.59 15.11 12 13.02 12 13.02Z" fillOpacity="0.6"/>
    </svg>
);

export const SendIcon: React.FC = () => (
  <svg {...iconProps} className="w-6 h-6" viewBox="0 0 24 24">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

export const StopIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="6" width="12" height="12"></rect>
    </svg>
);

export const PlayIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 3l14 9-14 9V3z"></path>
  </svg>
);

export const CodeIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>
    </svg>
);

export const PlusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className || "w-5 h-5"} viewBox="0 0 24 24">
        <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export const TrashIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps} className={className || "w-5 h-5"} viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

export const SettingsIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);