import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Stethoscope, 
  Pill, 
  BookOpen, 
  ClipboardList, 
  FileText, 
  ChevronRight,
  Heart,
  AlertCircle,
  CheckCircle2,
  Info,
  Plus,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type TriageLevel = 'Immediate' | 'Very Urgent' | 'Urgent' | 'Non-Urgent';

interface VitalSigns {
  heartRate: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  respiratoryRate: number;
  temperature: number;
  consciousness: 'Alert' | 'Verbal' | 'Pain' | 'Unresponsive';
  painScale: number;
}

interface Drug {
  name: string;
  dosage: string;
  indications: string;
  contraindications: string;
  nursingNotes: string;
}

interface Case {
  id: number;
  scenario: string;
  vitals: Partial<VitalSigns>;
  correctLevel: TriageLevel;
}

// --- Constants ---

const DRUGS: Drug[] = [
  {
    name: 'Epinephrine',
    dosage: 'Cardiac Arrest: 1mg IV/IO every 3-5 mins. Anaphylaxis: 0.3-0.5mg IM.',
    indications: 'Cardiac arrest, anaphylaxis, severe symptomatic bradycardia.',
    contraindications: 'None in emergency cardiac arrest situations.',
    nursingNotes: 'Monitor HR and BP closely. High alert medication.'
  },
  {
    name: 'Atropine',
    dosage: 'Bradycardia: 1mg IV every 3-5 mins (Max 3mg).',
    indications: 'Symptomatic bradycardia, organophosphate poisoning.',
    contraindications: 'Hypothermic bradycardia.',
    nursingNotes: 'Use with caution in myocardial ischemia and hypoxia.'
  },
  {
    name: 'Amiodarone',
    dosage: 'VF/pVT: 300mg IV/IO bolus, then 150mg. Stable VT: 150mg over 10 mins.',
    indications: 'VF, pulseless VT, stable VT, atrial fibrillation.',
    contraindications: 'Severe sinus node dysfunction, 2nd/3rd degree AV block.',
    nursingNotes: 'Monitor for hypotension and bradycardia.'
  },
  {
    name: 'Adenosine',
    dosage: '6mg rapid IV push, then 12mg if needed.',
    indications: 'PSVT, including WPW syndrome.',
    contraindications: '2nd/3rd degree AV block, sick sinus syndrome, asthma.',
    nursingNotes: 'Warn patient about transient chest pain/flushing. Use large bore IV in antecubital.'
  },
  {
    name: 'Dopamine',
    dosage: '2-20 mcg/kg/min IV infusion.',
    indications: 'Shock, symptomatic bradycardia (second line).',
    contraindications: 'Pheochromocytoma, uncorrected tachyarrhythmias.',
    nursingNotes: 'Ensure adequate volume resuscitation first. Monitor for extravasation.'
  }
];

const LEARNING_TOPICS = [
  {
    title: 'ABCDE Assessment',
    content: 'Airway, Breathing, Circulation, Disability, Exposure. The systematic approach to the immediate assessment and treatment of critically ill or injured patients.'
  },
  {
    title: 'CPR Basics',
    content: 'High-quality chest compressions (100-120/min), depth 5-6cm, full recoil, minimize interruptions. 30:2 ratio or continuous with advanced airway.'
  },
  {
    title: 'Trauma Management',
    content: 'Primary survey (ABCDE), secondary survey (head-to-toe), hemorrhage control, spinal immobilization where indicated.'
  },
  {
    title: 'Shock Management',
    content: 'Identify type (Hypovolemic, Cardiogenic, Obstructive, Distributive). Fluid resuscitation, vasopressors, and treating the underlying cause.'
  },
  {
    title: 'Airway Management',
    content: 'Basic (Head tilt/Chin lift, OPA, NPA) to Advanced (LMA, ETT). Always have suction and BVM ready.'
  }
];

const CASES: Case[] = [
  {
    id: 1,
    scenario: 'A 45-year-old male presents with crushing central chest pain radiating to the left arm, diaphoretic and pale.',
    vitals: { heartRate: 110, bloodPressureSys: 90, bloodPressureDia: 60, respiratoryRate: 24, consciousness: 'Alert' },
    correctLevel: 'Immediate'
  },
  {
    id: 2,
    scenario: 'A 22-year-old female with a sprained ankle, walking with a slight limp, minimal swelling.',
    vitals: { heartRate: 75, bloodPressureSys: 120, bloodPressureDia: 80, respiratoryRate: 16, consciousness: 'Alert' },
    correctLevel: 'Non-Urgent'
  },
  {
    id: 3,
    scenario: 'A 60-year-old male with persistent cough for 3 days, fever of 38.5°C, but breathing comfortably.',
    vitals: { heartRate: 90, bloodPressureSys: 135, bloodPressureDia: 85, respiratoryRate: 18, consciousness: 'Alert' },
    correctLevel: 'Urgent'
  }
];

// --- Components ---

const SplashScreen = ({ onFinish, key }: { onFinish: () => void, key?: string }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-col items-center"
      >
        <div className="relative w-32 h-32 mb-8">
          <svg viewBox="0 0 100 100" className="w-full h-full pulse-svg">
            <path 
              d="M0 50 L20 50 L25 30 L35 70 L45 10 L55 90 L65 50 L100 50" 
              fill="none" 
              stroke="#EF4444" 
              strokeWidth="3"
            />
          </svg>
          <Heart className="absolute inset-0 m-auto text-emergency-red animate-heartbeat" size={40} />
        </div>
        <h1 className="text-3xl font-bold tracking-tighter text-medical-grey">
          MEDI<span className="text-emergency-red">TRIAGE</span> PRO
        </h1>
        <p className="text-sm text-medical-grey/60 mt-2 uppercase tracking-widest">Emergency Clinical System</p>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const cards = [
    { id: 'triage', title: 'Start Triage', icon: <Activity className="text-emergency-red" />, desc: 'Patient assessment & classification' },
    { id: 'vitals', title: 'Vital Signs Checker', icon: <Stethoscope className="text-blue-500" />, desc: 'Instant parameter analysis' },
    { id: 'drugs', title: 'Emergency Drug Guide', icon: <Pill className="text-emerald-500" />, desc: 'Dosage & indications database' },
    { id: 'learning', title: 'Learning Center', icon: <BookOpen className="text-amber-500" />, desc: 'Clinical protocols & education' },
    { id: 'cases', title: 'Clinical Cases', icon: <ClipboardList className="text-purple-500" />, desc: 'Interactive triage practice' },
    { id: 'notes', title: 'Emergency Notes', icon: <FileText className="text-slate-500" />, desc: 'Secure clinical observations' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-sm font-bold text-emergency-red uppercase tracking-widest mb-1">Command Center</h2>
          <h1 className="text-4xl font-light text-medical-grey">Emergency Dashboard</h1>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs text-medical-grey/60 uppercase">System Status</p>
          <p className="text-sm font-medium text-emerald-500 flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Operational
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(card.id)}
            className="glass-card p-6 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-light-grey flex items-center justify-center mb-4 group-hover:bg-white transition-colors">
              {card.icon}
            </div>
            <h3 className="text-xl font-semibold text-medical-grey mb-2">{card.title}</h3>
            <p className="text-sm text-medical-grey/60 leading-relaxed">{card.desc}</p>
            <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-wider text-medical-grey/40 group-hover:text-emergency-red transition-colors">
              Access Module <ChevronRight size={14} className="ml-1" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const TriageSystem = ({ onBack }: { onBack: () => void }) => {
  const [vitals, setVitals] = useState<VitalSigns>({
    heartRate: 80,
    bloodPressureSys: 120,
    bloodPressureDia: 80,
    respiratoryRate: 16,
    temperature: 36.6,
    consciousness: 'Alert',
    painScale: 0
  });

  const [result, setResult] = useState<TriageLevel | null>(null);

  const calculateTriage = () => {
    let level: TriageLevel = 'Non-Urgent';

    // Simplified Triage Logic (Example)
    if (vitals.consciousness === 'Unresponsive' || vitals.consciousness === 'Pain' || vitals.heartRate > 140 || vitals.heartRate < 40 || vitals.bloodPressureSys < 80 || vitals.respiratoryRate > 30 || vitals.respiratoryRate < 8) {
      level = 'Immediate';
    } else if (vitals.consciousness === 'Verbal' || vitals.heartRate > 120 || vitals.bloodPressureSys > 180 || vitals.painScale >= 8 || vitals.temperature > 39.5) {
      level = 'Very Urgent';
    } else if (vitals.heartRate > 100 || vitals.respiratoryRate > 22 || vitals.painScale >= 5 || vitals.temperature > 38) {
      level = 'Urgent';
    }

    setResult(level);
  };

  const getLevelColor = (l: TriageLevel) => {
    switch (l) {
      case 'Immediate': return 'bg-emergency-red text-white';
      case 'Very Urgent': return 'bg-orange-500 text-white';
      case 'Urgent': return 'bg-amber-400 text-white';
      case 'Non-Urgent': return 'bg-emerald-500 text-white';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center text-sm font-bold text-medical-grey/60 hover:text-emergency-red mb-8 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> BACK TO DASHBOARD
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <h2 className="text-2xl font-light mb-6">Patient Assessment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-medical-grey/60 mb-1">Heart Rate (BPM)</label>
              <input 
                type="number" 
                value={vitals.heartRate} 
                onChange={e => setVitals({...vitals, heartRate: Number(e.target.value)})}
                className="w-full p-3 bg-light-grey rounded-lg focus:ring-2 focus:ring-emergency-red outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-medical-grey/60 mb-1">BP Systolic</label>
                <input 
                  type="number" 
                  value={vitals.bloodPressureSys} 
                  onChange={e => setVitals({...vitals, bloodPressureSys: Number(e.target.value)})}
                  className="w-full p-3 bg-light-grey rounded-lg focus:ring-2 focus:ring-emergency-red outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-medical-grey/60 mb-1">BP Diastolic</label>
                <input 
                  type="number" 
                  value={vitals.bloodPressureDia} 
                  onChange={e => setVitals({...vitals, bloodPressureDia: Number(e.target.value)})}
                  className="w-full p-3 bg-light-grey rounded-lg focus:ring-2 focus:ring-emergency-red outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-medical-grey/60 mb-1">Respiratory Rate</label>
              <input 
                type="number" 
                value={vitals.respiratoryRate} 
                onChange={e => setVitals({...vitals, respiratoryRate: Number(e.target.value)})}
                className="w-full p-3 bg-light-grey rounded-lg focus:ring-2 focus:ring-emergency-red outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-medical-grey/60 mb-1">Consciousness (AVPU)</label>
              <select 
                value={vitals.consciousness} 
                onChange={e => setVitals({...vitals, consciousness: e.target.value as any})}
                className="w-full p-3 bg-light-grey rounded-lg focus:ring-2 focus:ring-emergency-red outline-none transition-all"
              >
                <option value="Alert">Alert</option>
                <option value="Verbal">Verbal</option>
                <option value="Pain">Pain</option>
                <option value="Unresponsive">Unresponsive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-medical-grey/60 mb-1">Pain Scale (0-10)</label>
              <input 
                type="range" min="0" max="10" 
                value={vitals.painScale} 
                onChange={e => setVitals({...vitals, painScale: Number(e.target.value)})}
                className="w-full h-2 bg-light-grey rounded-lg appearance-none cursor-pointer accent-emergency-red"
              />
              <div className="flex justify-between text-[10px] font-bold text-medical-grey/40 mt-1">
                <span>NO PAIN</span>
                <span>MODERATE</span>
                <span>SEVERE</span>
              </div>
            </div>
            <button 
              onClick={calculateTriage}
              className="w-full py-4 bg-medical-grey text-white font-bold rounded-xl hover:bg-emergency-red transition-colors mt-4 shadow-lg active:scale-95"
            >
              GENERATE CLASSIFICATION
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-8 flex flex-col items-center text-center"
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${getLevelColor(result)}`}>
                  <AlertCircle size={40} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-medical-grey/40 mb-1">Recommended Triage Level</h3>
                <h2 className={`text-3xl font-bold mb-4 ${result === 'Immediate' ? 'text-emergency-red' : 'text-medical-grey'}`}>{result}</h2>
                <div className="w-full h-1 bg-light-grey rounded-full overflow-hidden mb-6">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1 }}
                    className={`h-full ${getLevelColor(result)}`}
                  />
                </div>
                <p className="text-sm text-medical-grey/60 leading-relaxed">
                  {result === 'Immediate' ? 'Patient requires immediate life-saving intervention. Move to Resus area now.' : 
                   result === 'Very Urgent' ? 'Patient should be seen by a physician within 10 minutes.' :
                   result === 'Urgent' ? 'Patient should be seen within 30-60 minutes.' :
                   'Routine assessment. Patient is stable for waiting area.'}
                </p>
              </motion.div>
            ) : (
              <div className="glass-card p-8 flex flex-col items-center justify-center text-center h-full border-dashed border-2 border-medical-grey/20 bg-transparent">
                <Activity size={48} className="text-medical-grey/20 mb-4" />
                <p className="text-medical-grey/40 font-medium">Complete the assessment form to see triage results</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const VitalsAnalyzer = ({ onBack }: { onBack: () => void }) => {
  const [hr, setHr] = useState(80);
  const [rr, setRr] = useState(16);
  const [temp, setTemp] = useState(36.6);

  const getStatus = (val: number, type: 'hr' | 'rr' | 'temp') => {
    if (type === 'hr') {
      if (val < 50 || val > 120) return { label: 'Dangerous', color: 'bg-emergency-red' };
      if (val < 60 || val > 100) return { label: 'Warning', color: 'bg-amber-400' };
      return { label: 'Normal', color: 'bg-emerald-500' };
    }
    if (type === 'rr') {
      if (val < 8 || val > 25) return { label: 'Dangerous', color: 'bg-emergency-red' };
      if (val < 12 || val > 20) return { label: 'Warning', color: 'bg-amber-400' };
      return { label: 'Normal', color: 'bg-emerald-500' };
    }
    if (type === 'temp') {
      if (val < 35 || val > 39) return { label: 'Dangerous', color: 'bg-emergency-red' };
      if (val < 36 || val > 37.5) return { label: 'Warning', color: 'bg-amber-400' };
      return { label: 'Normal', color: 'bg-emerald-500' };
    }
    return { label: 'Normal', color: 'bg-emerald-500' };
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center text-sm font-bold text-medical-grey/60 hover:text-emergency-red mb-8 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> BACK TO DASHBOARD
      </button>

      <h2 className="text-3xl font-light mb-8">Vital Signs Analyzer</h2>

      <div className="space-y-8">
        {[
          { label: 'Heart Rate', val: hr, set: setHr, min: 30, max: 200, unit: 'BPM', type: 'hr' as const },
          { label: 'Respiratory Rate', val: rr, set: setRr, min: 0, max: 50, unit: 'RPM', type: 'rr' as const },
          { label: 'Temperature', val: temp, set: setTemp, min: 34, max: 42, unit: '°C', type: 'temp' as const },
        ].map((item) => {
          const status = getStatus(item.val, item.type);
          return (
            <div key={item.label} className="glass-card p-6">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase text-medical-grey/60">{item.label}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-medical-grey">{item.val}</span>
                    <span className="text-sm text-medical-grey/40">{item.unit}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase text-white ${status.color}`}>
                  {status.label}
                </div>
              </div>
              <input 
                type="range" min={item.min} max={item.max} step={item.type === 'temp' ? 0.1 : 1}
                value={item.val} 
                onChange={e => item.set(Number(e.target.value))}
                className="w-full h-2 bg-light-grey rounded-lg appearance-none cursor-pointer accent-medical-grey"
              />
              <div className="mt-4 h-2 w-full bg-light-grey rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500/20 w-1/3 border-r border-white/50"></div>
                <div className="h-full bg-amber-400/20 w-1/3 border-r border-white/50"></div>
                <div className="h-full bg-emergency-red/20 w-1/3"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DrugGuide = ({ onBack }: { onBack: () => void }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center text-sm font-bold text-medical-grey/60 hover:text-emergency-red mb-8 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> BACK TO DASHBOARD
      </button>

      <h2 className="text-3xl font-light mb-8">Emergency Drug Guide</h2>

      <div className="space-y-4">
        {DRUGS.map((drug) => (
          <div key={drug.name} className="glass-card overflow-hidden">
            <button 
              onClick={() => setExpanded(expanded === drug.name ? null : drug.name)}
              className="w-full p-6 flex justify-between items-center hover:bg-light-grey/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Pill size={20} />
                </div>
                <span className="text-xl font-semibold text-medical-grey">{drug.name}</span>
              </div>
              <ChevronRight className={`transition-transform duration-300 ${expanded === drug.name ? 'rotate-90' : ''}`} />
            </button>
            <AnimatePresence>
              {expanded === drug.name && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6"
                >
                  <div className="pt-4 border-t border-light-grey grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-emerald-600 mb-2">Dosage & Administration</h4>
                      <p className="text-sm text-medical-grey leading-relaxed">{drug.dosage}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-blue-600 mb-2">Indications</h4>
                      <p className="text-sm text-medical-grey leading-relaxed">{drug.indications}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-emergency-red mb-2">Contraindications</h4>
                      <p className="text-sm text-medical-grey leading-relaxed">{drug.contraindications}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-amber-600 mb-2">Nursing Considerations</h4>
                      <p className="text-sm text-medical-grey leading-relaxed italic">{drug.nursingNotes}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

const LearningCenter = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center text-sm font-bold text-medical-grey/60 hover:text-emergency-red mb-8 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> BACK TO DASHBOARD
      </button>

      <h2 className="text-3xl font-light mb-8">Learning Center</h2>

      <div className="grid grid-cols-1 gap-6">
        {LEARNING_TOPICS.map((topic, idx) => (
          <motion.div 
            key={topic.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-8 group"
          >
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-medical-grey mb-3 group-hover:text-emergency-red transition-colors">{topic.title}</h3>
                <p className="text-medical-grey/60 leading-relaxed">{topic.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ClinicalCases = ({ onBack }: { onBack: () => void }) => {
  const [currentCaseIdx, setCurrentCaseIdx] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<TriageLevel | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentCase = CASES[currentCaseIdx];

  const handleCheck = () => {
    setShowFeedback(true);
  };

  const nextCase = () => {
    setSelectedLevel(null);
    setShowFeedback(false);
    setCurrentCaseIdx((currentCaseIdx + 1) % CASES.length);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center text-sm font-bold text-medical-grey/60 hover:text-emergency-red mb-8 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> BACK TO DASHBOARD
      </button>

      <h2 className="text-3xl font-light mb-8">Clinical Cases</h2>

      <div className="glass-card p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold uppercase text-purple-500">Case Study #{currentCase.id}</span>
          <span className="text-xs text-medical-grey/40">Scenario Practice</span>
        </div>
        <p className="text-xl text-medical-grey leading-relaxed mb-8">{currentCase.scenario}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(currentCase.vitals).map(([key, val]) => (
            <div key={key} className="bg-light-grey p-3 rounded-lg">
              <span className="block text-[10px] font-bold uppercase text-medical-grey/40">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className="text-sm font-bold text-medical-grey">{val}</span>
            </div>
          ))}
        </div>

        <h4 className="text-xs font-bold uppercase text-medical-grey/60 mb-4">Select Triage Level:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['Immediate', 'Very Urgent', 'Urgent', 'Non-Urgent'] as TriageLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => !showFeedback && setSelectedLevel(level)}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                selectedLevel === level 
                  ? 'bg-medical-grey text-white shadow-lg scale-105' 
                  : 'bg-light-grey text-medical-grey hover:bg-white border border-transparent hover:border-medical-grey/20'
              } ${showFeedback ? 'opacity-50 cursor-default' : ''}`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          {!showFeedback ? (
            <button 
              disabled={!selectedLevel}
              onClick={handleCheck}
              className="px-10 py-4 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 disabled:opacity-30 transition-all shadow-lg"
            >
              CHECK ASSESSMENT
            </button>
          ) : (
            <div className="w-full text-center">
              <div className={`p-6 rounded-2xl mb-6 flex items-center justify-center gap-3 ${selectedLevel === currentCase.correctLevel ? 'bg-emerald-50 text-emerald-600' : 'bg-emergency-red/10 text-emergency-red'}`}>
                {selectedLevel === currentCase.correctLevel ? <CheckCircle2 /> : <AlertCircle />}
                <span className="font-bold">
                  {selectedLevel === currentCase.correctLevel 
                    ? 'Correct! Excellent clinical judgment.' 
                    : `Incorrect. The correct level was ${currentCase.correctLevel}.`}
                </span>
              </div>
              <button 
                onClick={nextCase}
                className="px-10 py-4 bg-medical-grey text-white font-bold rounded-xl hover:bg-black transition-all"
              >
                NEXT CASE STUDY
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmergencyNotes = ({ onBack }: { onBack: () => void }) => {
  const [notes, setNotes] = useState<{id: number, text: string, date: string}[]>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('meditriage_notes');
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  const saveNote = () => {
    if (!newNote.trim()) return;
    const updated = [{ id: Date.now(), text: newNote, date: new Date().toLocaleString() }, ...notes];
    setNotes(updated);
    localStorage.setItem('meditriage_notes', JSON.stringify(updated));
    setNewNote('');
  };

  const deleteNote = (id: number) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('meditriage_notes', JSON.stringify(updated));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center text-sm font-bold text-medical-grey/60 hover:text-emergency-red mb-8 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> BACK TO DASHBOARD
      </button>

      <h2 className="text-3xl font-light mb-8">Emergency Notes</h2>

      <div className="glass-card p-6 mb-8">
        <textarea 
          placeholder="Type clinical observations or reminders here..."
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          className="w-full h-32 p-4 bg-light-grey rounded-xl outline-none focus:ring-2 focus:ring-slate-400 transition-all resize-none text-medical-grey"
        />
        <div className="flex justify-end mt-4">
          <button 
            onClick={saveNote}
            className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md"
          >
            <Plus size={18} /> SAVE OBSERVATION
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {notes.length === 0 && (
          <div className="text-center py-20 text-medical-grey/20">
            <FileText size={48} className="mx-auto mb-4" />
            <p>No saved notes yet</p>
          </div>
        )}
        {notes.map((note) => (
          <motion.div 
            key={note.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 flex justify-between items-start"
          >
            <div className="flex-1 mr-4">
              <p className="text-xs font-bold text-medical-grey/40 mb-2 uppercase tracking-tighter">{note.date}</p>
              <p className="text-medical-grey leading-relaxed">{note.text}</p>
            </div>
            <button 
              onClick={() => deleteNote(note.id)}
              className="p-2 text-medical-grey/20 hover:text-emergency-red transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'triage': return <TriageSystem onBack={() => setCurrentPage('dashboard')} />;
      case 'vitals': return <VitalsAnalyzer onBack={() => setCurrentPage('dashboard')} />;
      case 'drugs': return <DrugGuide onBack={() => setCurrentPage('dashboard')} />;
      case 'learning': return <LearningCenter onBack={() => setCurrentPage('dashboard')} />;
      case 'cases': return <ClinicalCases onBack={() => setCurrentPage('dashboard')} />;
      case 'notes': return <EmergencyNotes onBack={() => setCurrentPage('dashboard')} />;
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-light-grey selection:bg-emergency-red/10 selection:text-emergency-red">
      <AnimatePresence>
        {loading ? (
          <SplashScreen key="splash" onFinish={() => setLoading(false)} />
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="pb-20"
          >
            {/* Navigation Bar */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-medical-grey/10 px-6 py-4">
              <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div 
                  className="flex items-center gap-2 cursor-pointer" 
                  onClick={() => setCurrentPage('dashboard')}
                >
                  <div className="w-8 h-8 rounded-lg bg-emergency-red flex items-center justify-center text-white">
                    <Activity size={18} />
                  </div>
                  <span className="font-bold tracking-tighter text-medical-grey">MEDI<span className="text-emergency-red">TRIAGE</span></span>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-medical-grey/60">
                  <span className="hidden sm:inline">Emergency Unit 4</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span>Live Sync</span>
                  </div>
                </div>
              </div>
            </nav>

            <main className="mt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderPage()}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Footer / Status Bar */}
            <footer className="fixed bottom-0 left-0 right-0 bg-medical-grey text-white/40 text-[9px] uppercase tracking-widest py-2 px-6 flex justify-between items-center z-40">
              <span>MediTriage Pro v2.4.0 // Clinical Decision Support</span>
              <span className="flex items-center gap-4">
                <span className="flex items-center gap-1"><Info size={10} /> Protocols Updated</span>
                <span className="text-white/60">{new Date().toLocaleDateString()}</span>
              </span>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
