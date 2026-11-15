export interface DiagnosticRoute {
  condition: string;
  symptoms: string[];
  recommendedTests: string[];
  specialistType: string;
  department: string;
  severity: 'low' | 'medium' | 'high';
  homeCareTips: string[];
}

export const DIAGNOSTICS_DATABASE: DiagnosticRoute[] = [
  {
    condition: 'Diabetes Mellitus (Type 1 or 2)',
    symptoms: ['Excessive thirst', 'Frequent urination', 'Unexplained weight loss', 'Fatigue', 'Blurry vision'],
    recommendedTests: ['Fasting Blood Glucose', 'HbA1c test (A1C)', 'Oral Glucose Tolerance Test (OGTT)'],
    specialistType: 'Endocrinologist',
    department: 'Endocrinology & Diabetology',
    severity: 'medium',
    homeCareTips: ['Monitor carbohydrate intake', 'Maintain regular low-impact exercise', 'Stay hydrated', 'Keep a daily blood glucose log']
  },
  {
    condition: 'Hypertension (High Blood Pressure)',
    symptoms: ['Often asymptomatic ("silent killer")', 'Headaches', 'Shortness of breath', 'Nosebleeds', 'Dizziness'],
    recommendedTests: ['Ambulatory Blood Pressure Monitoring', 'Electrocardiogram (ECG/EKG)', 'Lipid Profile', 'Kidney Function Blood Tests'],
    specialistType: 'Cardiologist or General Practitioner',
    department: 'Cardiology / General Medicine',
    severity: 'medium',
    homeCareTips: ['Reduce sodium (salt) intake', 'Practice stress relief (meditation, deep breathing)', 'Avoid smoking and excessive alcohol', 'Engage in moderate aerobic activity']
  },
  {
    condition: 'Seasonal Allergies (Allergic Rhinitis)',
    symptoms: ['Sneezing', 'Runny or stuffy nose', 'Itchy, watery eyes', 'Scratchy throat', 'Mild fatigue'],
    recommendedTests: ['Allergy Skin Prick Test', 'Specific IgE Blood Test'],
    specialistType: 'Allergist / Immunologist',
    department: 'Allergy & Immunology',
    severity: 'low',
    homeCareTips: ['Keep windows closed during high pollen counts', 'Use saline nasal rinses', 'Dust and vacuum home frequently', 'Consider over-the-counter antihistamines']
  },
  {
    condition: 'Asthma',
    symptoms: ['Wheezing', 'Coughing (especially at night)', 'Shortness of breath', 'Chest tightness'],
    recommendedTests: ['Spirometry (Lung Function Test)', 'Peak Flow Meter Measurements', 'Methacholine Challenge Test'],
    specialistType: 'Pulmonologist or Allergist',
    department: 'Pulmonology / Respiratory Therapy',
    severity: 'medium',
    homeCareTips: ['Identify and avoid triggers (dust, cold air, smoke)', 'Carry your quick-relief (rescue) inhaler at all times', 'Get annual flu vaccinations']
  },
  {
    condition: 'Chest Pain (Coronary Artery Disease / Angina)',
    symptoms: ['Pressure, tightness, or squeezing pain in center of chest', 'Pain radiating to shoulder, arm, back, or jaw', 'Cold sweats', 'Nausea'],
    recommendedTests: ['Electrocardiogram (EKG)', 'Troponin Blood Tests (Cardiac Enzymes)', 'Echocardiogram', 'Coronary Angiogram'],
    specialistType: 'Cardiologist',
    department: 'Cardiology / Emergency Medicine',
    severity: 'high',
    homeCareTips: ['🚨 **DO NOT ATTEMPT HOME CARE.** If you or someone else has these symptoms, call 911 or emergency services immediately.', 'Rest quietly while waiting for emergency responders to arrive.']
  },
  {
    condition: 'Migraine or Severe Headaches',
    symptoms: ['Throbbing pain on one side of head', 'Sensitivity to light and sound', 'Nausea or vomiting', 'Visual disturbances (auras)'],
    recommendedTests: ['Brain MRI or CT Scan (to rule out other causes)', 'Neurological reflex tests'],
    specialistType: 'Neurologist',
    department: 'Neurology',
    severity: 'medium',
    homeCareTips: ['Rest in a dark, quiet room', 'Apply a cold compress to the forehead or neck', 'Avoid triggers (such as aged cheese, caffeine, lack of sleep)', 'Keep a headache diary']
  },
  {
    condition: 'Urinary Tract Infection (UTI)',
    symptoms: ['Burning sensation during urination', 'Strong, persistent urge to urinate', 'Cloudy or strong-smelling urine', 'Pelvic pain'],
    recommendedTests: ['Urinalysis (Urine Dipstick)', 'Urine Culture & Sensitivity'],
    specialistType: 'Urologist or General Practitioner',
    department: 'Urology / Family Medicine',
    severity: 'medium',
    homeCareTips: ['Drink plenty of water to flush bacteria', 'Avoid caffeine, alcohol, and carbonated soft drinks', 'Do not delay urination']
  },
  {
    condition: 'Eczema or Atopic Dermatitis',
    symptoms: ['Dry, red, itchy skin patches', 'Small raised bumps that may leak fluid', 'Thickened, cracked, or scaly skin'],
    recommendedTests: ['Skin Biopsy (rarely needed)', 'Patch Testing (for contact allergies)'],
    specialistType: 'Dermatologist',
    department: 'Dermatology',
    severity: 'low',
    homeCareTips: ['Moisturize skin at least twice daily', 'Use mild, fragrance-free soaps', 'Take short, lukewarm showers', 'Identify and avoid skin irritants']
  }
];
