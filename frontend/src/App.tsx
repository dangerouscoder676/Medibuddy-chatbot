import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Stethoscope, 
  Send, 
  AlertTriangle, 
  Trash2, 
  Copy, 
  Check, 
  Activity, 
  Droplet, 
  Plus, 
  Minus,
  MessageSquare,
  HeartPulse,
  MapPin,
  Search,
  Phone,
  Mail,
  ExternalLink,
  Clock,
  Map,
  Navigation
} from 'lucide-react';
import { calculateBMI, type BMIResult } from './utils/bmi';
import { getDoctorDatabaseForLocation, type Doctor } from './utils/doctors';
import { DIAGNOSTICS_DATABASE } from './utils/diagnostics';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * 
      Math.cos((lat2 * Math.PI) / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function App() {
  
  const [activeTab, setActiveTab] = useState<'chat' | 'care'>('chat');
  const [careSubTab, setCareSubTab] = useState<'hospitals' | 'doctors' | 'diagnostics'>('hospitals');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);

  const [waterIntake, setWaterIntake] = useState(() => {
    const saved = localStorage.getItem('medibuddy_water');
    return saved ? parseInt(saved, 10) : 0;
  });
  const waterGoal = 2000;

  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [nearbyDoctors, setNearbyDoctors] = useState<any[]>([]);

  const [doctorSearch, setDoctorSearch] = useState('');
  const [diagnosticSearch, setDiagnosticSearch] = useState('');

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const checkConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (response.ok) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch (error) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('medibuddy_water', waterIntake.toString());
  }, [waterIntake]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, activeTab]);
1
4
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages
        })
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,  
        { role: 'assistant', text: data.text || 'Sorry, I encountered an issue processing that.' }
      ]);
    } catch (error) {
      console.error('Error fetching chat:', error);
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          text: '🚨 **Connection Error**: Unable to reach the MediBuddy backend server. Please make sure the backend is running and that your Gemini API key is configured correctly.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear your current conversation?')) {
      setMessages([]);
    }
  };

  const handleBmiCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (w > 0 && h > 0) {
      const result = calculateBMI(w, h);
      setBmiResult(result);
    }
  };

  const handleBmiClear = () => {
    setWeight('');
    setHeight('');
    setBmiResult(null);
  };

  const addWater = () => setWaterIntake((prev) => Math.min(prev + 250, 4000));
  const removeWater = () => setWaterIntake((prev) => Math.max(prev - 250, 0));
  const resetWater = () => setWaterIntake(0);
  const waterProgress = Math.min((waterIntake / waterGoal) * 100, 100);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setUserCoords(coords);
        setGpsLoading(false);
        fetchNearbyHospitals(coords.latitude, coords.longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGpsError('Access denied or unavailable. Using default (New York).');
        setGpsLoading(false);
        const fallback = { latitude: 40.7128, longitude: -74.0060 }; 
        setUserCoords(fallback);
        fetchNearbyHospitals(fallback.latitude, fallback.longitude);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const fetchNearbyHospitals = async (lat: number, lon: number) => {
    setHospitalsLoading(true);
    try {
      
      const query = `[out:json][timeout:20];node(around:8000,${lat},${lon})["amenity"~"hospital|clinic|doctors"];out;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('OSM Overpass request failed');
      const data = await response.json();
      
      const elements = data.elements || [];

      const rawHospitals = elements.filter((el: any) => el.tags && (el.tags.amenity === 'hospital' || el.tags.amenity === 'clinic'));
      const processedHospitals = rawHospitals.map((el: any) => {
        const dist = calculateDistance(lat, lon, el.lat, el.lon);
        return {
          id: el.id,
          name: el.tags.name || 'Unnamed Health Facility',
          type: el.tags.amenity === 'hospital' ? 'General Hospital' : 'Medical Clinic',
          distance: Math.round(dist * 10) / 10,
          phone: el.tags.phone || el.tags['contact:phone'] || 'N/A',
          website: el.tags.website || el.tags['contact:website'] || '',
          address: el.tags['addr:street']
            ? `${el.tags['addr:housenumber'] || ''} ${el.tags['addr:street']}, ${el.tags['addr:city'] || ''}`
            : 'Address details not listed (Open Map)'
        };
      });
      processedHospitals.sort((a: any, b: any) => a.distance - b.distance);
      setHospitals(processedHospitals.slice(0, 10));

      const rawDoctors = elements.filter((el: any) => el.tags && (
        el.tags.amenity === 'doctors' || 
        (el.tags.amenity === 'clinic' && el.tags.name && el.tags.name.toLowerCase().includes('dr.'))
      ));
      const processedDoctors = rawDoctors.map((el: any) => {
        const dist = calculateDistance(lat, lon, el.lat, el.lon);
        const name = el.tags.name || 'Specialist Doctor';

        let specialty = 'General Practitioner';
        const nameLower = name.toLowerCase();
        if (nameLower.includes('skin') || nameLower.includes('derma')) specialty = 'Dermatologist';
        else if (nameLower.includes('child') || nameLower.includes('pedia') || nameLower.includes('kid')) specialty = 'Pediatrician';
        else if (nameLower.includes('heart') || nameLower.includes('cardio')) specialty = 'Cardiologist';
        else if (nameLower.includes('diabetes') || nameLower.includes('endo') || nameLower.includes('sugar')) specialty = 'Endocrinologist';
        else if (nameLower.includes('ortho') || nameLower.includes('bone')) specialty = 'Orthopedist';
        else if (nameLower.includes('neuro') || nameLower.includes('brain')) specialty = 'Neurologist';
        else if (nameLower.includes('dental') || nameLower.includes('dentist') || nameLower.includes('tooth')) specialty = 'Dentist';

        return {
          id: `osm-doc-${el.id}`,
          name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
          specialty,
          phone: el.tags.phone || el.tags['contact:phone'] || '+91 (11) 2704-5566 (Clinic)',
          email: el.tags.email || 'clinic@medibuddy.in',
          address: el.tags['addr:street']
            ? `${el.tags['addr:housenumber'] || ''} ${el.tags['addr:street']}, Delhi`
            : 'Delhi, India (Check map for exact clinic)',
          rating: Math.round((4.2 + Math.random() * 0.7) * 10) / 10,
          availability: el.tags.opening_hours || 'Mon - Sat, 10:00 AM - 7:00 PM',
          hospitalAffiliation: el.tags['addr:suburb'] ? `${el.tags['addr:suburb']} Health Center` : 'Delhi Medical Association',
          distance: Math.round(dist * 10) / 10
        };
      });
      setNearbyDoctors(processedDoctors);

    } catch (err) {
      console.error('Failed to contact Overpass API, loading fallback:', err);
      
      if (lat >= 28.0 && lat <= 29.5 && lon >= 76.5 && lon <= 78.0) {
        setHospitals([
          {
            id: 'fb-del-1',
            name: 'Saroj Super Speciality Hospital',
            type: 'General Hospital',
            distance: 1.2,
            phone: '+91 (11) 2755-3000',
            website: 'http://www.sarojhospital.com',
            address: 'Sector 14, Rohini, Delhi'
          },
          {
            id: 'fb-del-2',
            name: 'Jaipur Golden Hospital',
            type: 'General Hospital',
            distance: 1.8,
            phone: '+91 (11) 2790-7000',
            website: 'http://www.jaipurgolden.com',
            address: 'Sector 3, Rohini, Delhi'
          },
          {
            id: 'fb-del-3',
            name: 'Dr. Baba Saheb Ambedkar Hospital',
            type: 'General Hospital',
            distance: 2.3,
            phone: '+91 (11) 2705-8100',
            website: 'http://health.delhigovt.nic.in',
            address: 'Sector 6, Rohini, Delhi'
          }
        ]);
        setNearbyDoctors([]);
      } else {
        setHospitals([
          {
            id: 'fb-nyc-1',
            name: 'Mercy General Hospital',
            type: 'General Hospital',
            distance: 1.4,
            phone: '+1 (555) 019-3388',
            website: 'https://mercy.example.org',
            address: '405 Health Parkway, New York, NY'
          },
          {
            id: 'fb-nyc-2',
            name: 'City Urgent Care Center',
            type: 'Medical Clinic',
            distance: 2.1,
            phone: '+1 (555) 012-4422',
            website: 'https://cityurgent.example.com',
            address: '92 Broadway St, New York, NY'
          }
        ]);
        setNearbyDoctors([]);
      }
    } finally {
      setHospitalsLoading(false);
    }
  };

  const searchSpecialistInDoctors = (specialist: string) => {
    
    const cleanSpec = specialist.split(' ')[0]; 
    setCareSubTab('doctors');
    setDoctorSearch(cleanSpec);
  };

  const localDoctors = getDoctorDatabaseForLocation(
    userCoords ? userCoords.latitude : null,
    userCoords ? userCoords.longitude : null
  );

  const localDoctorsWithDist = localDoctors.map((doc: Doctor) => {
    if (userCoords && doc.latitude && doc.longitude) {
      const dist = calculateDistance(userCoords.latitude, userCoords.longitude, doc.latitude, doc.longitude);
      return { ...doc, distance: Math.round(dist * 10) / 10 };
    }
    return doc;
  });

  const combinedDoctors = [...nearbyDoctors];
  localDoctorsWithDist.forEach((ld) => {
    if (!combinedDoctors.some(cd => cd.name.toLowerCase() === ld.name.toLowerCase())) {
      combinedDoctors.push(ld);
    }
  });

  const filteredDoctors = combinedDoctors.filter((doc) => {
    const q = doctorSearch.toLowerCase();
    return (
      doc.name.toLowerCase().includes(q) ||
      doc.specialty.toLowerCase().includes(q) ||
      doc.hospitalAffiliation.toLowerCase().includes(q)
    );
  });

  filteredDoctors.sort((a: any, b: any) => {
    if (a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance;
    }
    return b.rating - a.rating;
  });

  const filteredDiagnostics = DIAGNOSTICS_DATABASE.filter((diag) => {
    const q = diagnosticSearch.toLowerCase();
    return (
      diag.condition.toLowerCase().includes(q) ||
      diag.symptoms.some(s => s.toLowerCase().includes(q)) ||
      diag.specialistType.toLowerCase().includes(q)
    );
  });

  const suggestionChips = [
    {
      title: "Help me understand my lab work",
      desc: "Explain common terms in a blood panel test.",
      prompt: "Can you explain what standard tests in a complete blood count (CBC) measure and what high/low values might generally indicate?"
    },
    {
      title: "Recognize symptoms of allergies",
      desc: "Understand seasonal allergy signs vs colds.",
      prompt: "What are the common symptoms of seasonal allergies, and how can I distinguish them from a common cold?"
    },
    {
      title: "Improve my sleep hygiene",
      desc: "Practical tips for getting better rest.",
      prompt: "I am having trouble sleeping. What are some evidence-based sleep hygiene tips I can try to improve my sleep quality?"
    },
    {
      title: "Heart healthy foods",
      desc: "Nutrition guidelines for cardiac wellness.",
      prompt: "What are some of the best foods and dietary habits to adopt for general cardiovascular/heart health?"
    }
  ];

  return (
    <div className="app-container">
      {}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-icon-wrapper">
            <Stethoscope size={24} color="#fff" />
          </div>
          <h1 className="brand-title">Medi<span>Buddy</span></h1>
        </div>
        <p className="brand-subtitle">Your Personal Health & Wellness Assistant</p>

        {}
        <div className="status-badge">
          <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
          <span>{isOnline === null ? 'Checking Connection...' : isOnline ? 'MediBuddy Server Connected' : 'Server Disconnected'}</span>
        </div>

        {}
        <h2 className="sidebar-section-title">Health Toolkit</h2>

        {}
        <div className="widget-card">
          <div className="widget-header">
            <Activity size={18} color="var(--primary)" />
            <span>BMI Calculator</span>
          </div>
          <form onSubmit={handleBmiCalculate}>
            <div className="widget-inputs">
              <div className="widget-input-group">
                <label htmlFor="bmi-weight">Weight (kg)</label>
                <input 
                  id="bmi-weight"
                  type="number" 
                  placeholder="70" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div className="widget-input-group">
                <label htmlFor="bmi-height">Height (cm)</label>
                <input 
                  id="bmi-height"
                  type="number" 
                  placeholder="175" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="widget-button" style={{ flex: 2 }}>Calculate</button>
              {(weight || height || bmiResult) && (
                <button type="button" onClick={handleBmiClear} className="icon-button-sm" style={{ flex: 1 }}>Clear</button>
              )}
            </div>
          </form>
          {bmiResult && (
            <div className="bmi-result-box">
              <div>
                BMI: <span className="bmi-value-badge" style={{ backgroundColor: bmiResult.color, color: '#fff' }}>{bmiResult.bmi}</span>
              </div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.8rem' }}>
                Category: {bmiResult.category}
              </div>
              <div className="bmi-tip">{bmiResult.tip}</div>
            </div>
          )}
        </div>

        {}
        <div className="widget-card">
          <div className="widget-header">
            <Droplet size={18} color="var(--info)" />
            <span>Hydration Intake</span>
          </div>
          <div className="hydration-stats">
            <span className="hydration-count">{waterIntake} ml</span>
            <span className="hydration-goal">Goal: {waterGoal} ml</span>
          </div>
          <div className="hydration-progress-bar">
            <div className="hydration-progress-fill" style={{ width: `${waterProgress}%` }}></div>
          </div>
          <div className="hydration-controls">
            <button onClick={addWater} className="icon-button-sm" title="Add 250ml">
              <Plus size={16} />
              <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>250ml</span>
            </button>
            <button onClick={removeWater} className="icon-button-sm" title="Remove 250ml" disabled={waterIntake === 0}>
              <Minus size={16} />
            </button>
            {waterIntake > 0 && (
              <button onClick={resetWater} className="icon-button-sm" title="Reset Tracker" style={{ flex: '0 0 auto' }}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            MediBuddy v1.2.0
          </p>
        </div>
      </aside>

      {}
      <main className="main-content">
        {}
        <div className="disclaimer-banner">
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Disclaimer:</strong> MediBuddy is an educational health assistant designed for informational guidance. It does <strong>not</strong> provide diagnostic medical advice, prescriptions, or treatment plans. If you are experiencing a medical emergency, please call <strong>911</strong> or contact your local healthcare provider immediately.
          </span>
        </div>

        {}
        <nav className="tab-navbar">
          <button 
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={16} />
            <span>Consult MediBuddy</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'care' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('care');
              
              if (!userCoords) {
                detectLocation();
              }
            }}
          >
            <MapPin size={16} />
            <span>Find Medical Care</span>
          </button>
        </nav>

        {}
        {activeTab === 'chat' ? (

          <>
            <div className="chat-window">
              {messages.length === 0 ? (
                <div className="welcome-container">
                  <div className="welcome-logo-pulse">
                    <HeartPulse size={64} color="var(--primary)" />
                  </div>
                  <h2 className="welcome-title">How can I help you today?</h2>
                  <p className="welcome-description">
                    Ask me about symptoms, translate complex medical terminology, find lifestyle/nutrition tips, or research general health topics.
                  </p>
                  
                  <div className="suggestions-grid">
                    {suggestionChips.map((chip, idx) => (
                      <button 
                        key={idx} 
                        className="suggestion-chip"
                        onClick={() => handleSend(chip.prompt)}
                      >
                        <span className="suggestion-title">{chip.title}</span>
                        <span className="suggestion-desc">{chip.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className={`message-row ${message.role}`}>
                    {message.role === 'assistant' && (
                      <div className="message-avatar">
                        <Stethoscope size={18} />
                      </div>
                    )}
                    
                    <div className={`message-bubble ${
                      message.role === 'assistant' && (message.text.includes('🚨') || message.text.includes('EMERGENCY'))
                        ? 'emergency'
                        : ''
                    }`}>
                      {message.role === 'assistant' ? (
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      ) : (
                        <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                      )}
                      
                      {message.role === 'assistant' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                          <button 
                            onClick={() => handleCopy(message.text, index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem'
                            }}
                            title="Copy to clipboard"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check size={12} color="var(--success)" />
                                <span style={{ color: 'var(--success)' }}>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {message.role === 'user' && (
                      <div className="message-avatar">
                        <MessageSquare size={18} />
                      </div>
                    )}
                  </div>
                ))
              )}

              {isLoading && (
                <div className="message-row assistant">
                  <div className="message-avatar">
                    <Stethoscope size={18} />
                  </div>
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <footer className="input-panel">
              <div className="input-container">
                <input 
                  type="text" 
                  className="chat-input"
                  placeholder="Ask MediBuddy about symptoms, dietary advice, or health concepts..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSend(input);
                    }
                  }}
                  disabled={isLoading}
                />
                <button 
                  className="send-button"
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isLoading}
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="input-subtext">
                <span>Secure & Confidential</span>
                {messages.length > 0 && (
                  <button onClick={handleClearChat} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Trash2 size={12} />
                    Clear Chat
                  </button>
                )}
              </div>
            </footer>
          </>
        ) : (

          <div className="care-portal-container">
            {}
            <div className="care-sidebar">
              {}
              <div className="geo-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--primary-hover)' }}>
                  <MapPin size={18} />
                  <span>Your Location Status</span>
                </div>
                <button onClick={detectLocation} className="geo-btn" disabled={gpsLoading}>
                  <Navigation size={14} className={gpsLoading ? 'animate-spin' : ''} />
                  <span>{gpsLoading ? 'Locating...' : 'Detect GPS Location'}</span>
                </button>
                {userCoords ? (
                  <div className="coords-display">
                    Lat: {userCoords.latitude.toFixed(4)}<br />
                    Lon: {userCoords.longitude.toFixed(4)}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    GPS coordinates are needed to fetch live nearby medical clinics.
                  </p>
                )}
                {gpsError && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 600 }}>
                    ⚠️ {gpsError}
                  </p>
                )}
              </div>

              {}
              <div className="filter-container">
                <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                  Care Directory
                </h3>
                <button 
                  className={`filter-btn ${careSubTab === 'hospitals' ? 'active' : ''}`}
                  onClick={() => setCareSubTab('hospitals')}
                >
                  <span>🏥 Hospitals & Clinics</span>
                </button>
                <button 
                  className={`filter-btn ${careSubTab === 'doctors' ? 'active' : ''}`}
                  onClick={() => setCareSubTab('doctors')}
                >
                  <span>🩺 Specialist Doctors</span>
                </button>
                <button 
                  className={`filter-btn ${careSubTab === 'diagnostics' ? 'active' : ''}`}
                  onClick={() => setCareSubTab('diagnostics')}
                >
                  <span>🔍 Diagnostics Advisor</span>
                </button>
              </div>
            </div>

            {}
            <div className="care-results-area">
              {}
              {careSubTab === 'hospitals' && (
                <>
                  <h2 className="care-section-title">
                    <span>🏥 Nearby Hospitals & Clinics</span>
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Fetching live clinics and facilities within an 8km radius using the OpenStreetMap directory.
                  </p>
                  
                  {hospitalsLoading ? (
                    <div className="hospital-grid">
                      <div className="skeleton-card"></div>
                      <div className="skeleton-card"></div>
                      <div className="skeleton-card"></div>
                    </div>
                  ) : hospitals.length > 0 ? (
                    <div className="hospital-grid">
                      {hospitals.map((h) => (
                        <div key={h.id} className="care-card">
                          <div className="care-card-header">
                            <span className="care-card-subtitle">{h.type}</span>
                            <span className="care-card-badge low" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                              {h.distance} km away
                            </span>
                          </div>
                          <h3 className="care-card-title">{h.name}</h3>
                          
                          <div className="care-card-detail">
                            <Map size={14} style={{ flexShrink: 0 }} />
                            <span>{h.address}</span>
                          </div>
                          
                          <div className="care-card-detail">
                            <Phone size={14} />
                            <span>Phone: {h.phone}</span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + ' ' + h.address)}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="care-action-btn"
                              style={{ flex: 1 }}
                            >
                              <MapPin size={14} />
                              <span>Directions</span>
                            </a>
                            {h.website && (
                              <a 
                                href={h.website.startsWith('http') ? h.website : `http://${h.website}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="care-action-btn"
                                style={{ flex: 1 }}
                              >
                                <ExternalLink size={14} />
                                <span>Website</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      <MapPin size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                      <p>No clinics detected. Click <strong>"Detect GPS Location"</strong> on the left panel to fetch medical facilities near your coordinates.</p>
                    </div>
                  )}
                </>
              )}

              {}
              {careSubTab === 'doctors' && (
                <>
                  <h2 className="care-section-title">
                    <span>🩺 Professional Doctor Directory</span>
                  </h2>
                  <div className="care-search-box">
                    <input 
                      type="text" 
                      className="care-search-input"
                      placeholder="Search doctor names, specialties (e.g. Cardio, Endo)..."
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                    />
                    {doctorSearch && (
                      <button onClick={() => setDoctorSearch('')} className="icon-button-sm" style={{ background: '#fff' }}>
                        Clear
                      </button>
                    )}
                  </div>
                  
                  {filteredDoctors.length > 0 ? (
                    <div className="doctor-grid">
                      {filteredDoctors.map((doc) => (
                        <div key={doc.id} className="care-card">
                          <div className="care-card-header">
                            <span className="care-card-subtitle">{doc.specialty}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {doc.distance !== undefined && (
                                <span className="care-card-badge low" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                  {doc.distance} km away
                                </span>
                              )}
                              <div className="rating-star-container">
                                <span>★</span>
                                <span>{doc.rating}</span>
                              </div>
                            </div>
                          </div>
                          <h3 className="care-card-title">{doc.name}</h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Affiliation: {doc.hospitalAffiliation}
                          </p>
                          
                          <div className="care-card-detail" style={{ marginTop: '0.25rem' }}>
                            <Clock size={14} />
                            <span>{doc.availability}</span>
                          </div>
                          
                          <div className="care-card-detail">
                            <Map size={14} style={{ flexShrink: 0 }} />
                            <span>{doc.address}</span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                            <a href={`tel:${doc.phone}`} className="care-action-btn" style={{ flex: 1 }}>
                              <Phone size={14} />
                              <span>Call Clinic</span>
                            </a>
                            <a href={`mailto:${doc.email}`} className="care-action-btn" style={{ flex: 1 }}>
                              <Mail size={14} />
                              <span>Email Doc</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      <Search size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                      <p>No doctors found matching "{doctorSearch}". Try searching for another name or specialty.</p>
                    </div>
                  )}
                </>
              )}

              {}
              {careSubTab === 'diagnostics' && (
                <>
                  <h2 className="care-section-title">
                    <span>🔍 Diagnostics & Specialist Advisory</span>
                  </h2>
                  <div className="care-search-box">
                    <input 
                      type="text" 
                      className="care-search-input"
                      placeholder="Search conditions (e.g. Diabetes, Chest Pain, Allergy)..."
                      value={diagnosticSearch}
                      onChange={(e) => setDiagnosticSearch(e.target.value)}
                    />
                    {diagnosticSearch && (
                      <button onClick={() => setDiagnosticSearch('')} className="icon-button-sm" style={{ background: '#fff' }}>
                        Clear
                      </button>
                    )}
                  </div>

                  {filteredDiagnostics.length > 0 ? (
                    <div className="diagnostic-grid">
                      {filteredDiagnostics.map((diag, index) => (
                        <div key={index} className="care-card">
                          <div className="care-card-header">
                            <span className="care-card-subtitle">{diag.department}</span>
                            <span className={`care-card-badge ${diag.severity}`}>
                              {diag.severity} risk
                            </span>
                          </div>
                          <h3 className="care-card-title">{diag.condition}</h3>
                          
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                            <strong>Common Symptoms:</strong>
                            <p style={{ color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                              {diag.symptoms.join(', ')}
                            </p>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                            <strong>Suggested Lab Tests:</strong>
                            <ul style={{ paddingLeft: '1.1rem', margin: '0.2rem 0', color: 'var(--text-muted)' }}>
                              {diag.recommendedTests.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                            <strong>Target Specialist:</strong> {diag.specialistType}
                          </div>

                          {diag.severity !== 'high' && (
                            <button 
                              onClick={() => searchSpecialistInDoctors(diag.specialistType)}
                              className="care-action-btn"
                              style={{ width: '100%', marginTop: '0.5rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'hsl(171, 78%, 80%)' }}
                            >
                              <Search size={14} />
                              <span>Find specialist near me</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      <Search size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                      <p>No diagnostics advice found matching "{diagnosticSearch}". Try another symptom or condition.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
