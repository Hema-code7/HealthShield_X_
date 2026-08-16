import React from 'react';
import AccordionGallery from './AccordionGallery';
import type { AccordionItem } from './AccordionGallery';

interface DashboardAccordionBarProps {
  activeTab: string;
  onSelectTab: (id: string) => void;
}

export const DashboardAccordionBar: React.FC<DashboardAccordionBarProps> = ({
  activeTab,
  onSelectTab
}) => {
  const dashboardItems: AccordionItem[] = [
    {
      id: 'command',
      label: '01 COMMAND CENTER',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80',
      alt: 'Command Center Dashboard Overview'
    },
    {
      id: 'investigation',
      label: '02 INCIDENT INVESTIGATION',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80',
      alt: 'Incident Investigation Timeline'
    },
    {
      id: 'graph',
      label: '03 ATTACK GRAPH',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80',
      alt: 'Interactive Attack Graph'
    },
    {
      id: 'evidence',
      label: '04 EVIDENCE & FORENSICS',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80',
      alt: 'Forensic Evidence Coverage FEC Audit'
    },
    {
      id: 'defense',
      label: '05 DEFENSE ARCHITECT',
      image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=900&q=80',
      alt: 'AI Defensive Control Recommendations'
    },
    {
      id: 'replay',
      label: '06 REPLAY & VALIDATION',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
      alt: 'Controlled Attack Replay Simulation'
    },
    {
      id: 'patient_portal',
      label: '07 HEALTHCARE PORTAL',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
      alt: 'Healthcare Portal & Patient Records'
    }
  ];

  return (
    <div className="w-full px-6 pt-4 pb-2 relative z-20">
      <div className="max-w-7xl mx-auto bg-[#0b0f19]/80 border border-white/10 rounded-2xl p-3 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between px-3 pb-2 border-b border-white/10 mb-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-wider uppercase text-[11px]">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>INVESTIGATION DASHBOARDS & HEALTHCARE PORTAL // ACCORDION GALLERY NAVIGATOR</span>
          </div>
          <span className="text-slate-400 text-[10px] hidden sm:block">
            CLICK OR HOVER PANEL TO EXPAND & SWITCH DASHBOARD
          </span>
        </div>

        <AccordionGallery
          items={dashboardItems}
          activeId={activeTab}
          onSelectTab={onSelectTab}
          height={140}
          expandRatio={0.42}
          accentColor="#6366f1"
          overlayColor="#060010"
          textColor="#ffffff"
          gap={8}
          radius={12}
          tilt={6}
          trigger="click"
        />
      </div>
    </div>
  );
};
