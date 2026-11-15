export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  availability: string;
  hospitalAffiliation: string;
  latitude?: number;
  longitude?: number;
}

export const NYC_DOCTORS_DATABASE: Doctor[] = [
  {
    id: 'doc-nyc-1',
    name: 'Dr. Sarah Jenkins',
    specialty: 'Endocrinologist',
    phone: '+1 (555) 019-2834',
    email: 's.jenkins@medibuddy.org',
    address: 'Suite 402, Metro Endocrinology Center, New York, NY',
    rating: 4.9,
    availability: 'Mon - Thu, 9:00 AM - 4:00 PM',
    hospitalAffiliation: 'Metro Health Hospital',
    latitude: 40.7306,
    longitude: -73.9352
  },
  {
    id: 'doc-nyc-2',
    name: 'Dr. Robert Chen',
    specialty: 'Cardiologist',
    phone: '+1 (555) 014-9821',
    email: 'r.chen@medibuddy.org',
    address: 'Cardiovascular Institute, 12 Broad St, New York, NY',
    rating: 4.8,
    availability: 'Mon, Wed, Fri, 8:00 AM - 2:00 PM',
    hospitalAffiliation: 'St. Jude Cardiac Center',
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    id: 'doc-nyc-3',
    name: 'Dr. Elena Rostova',
    specialty: 'Dermatologist',
    phone: '+1 (555) 018-4720',
    email: 'e.rostova@medibuddy.org',
    address: 'Dermatology & Skin Clinic, 45 Fifth Ave, New York, NY',
    rating: 4.7,
    availability: 'Tue - Fri, 10:00 AM - 6:00 PM',
    hospitalAffiliation: 'City Skin Hospital',
    latitude: 40.7589,
    longitude: -73.9851
  },
  {
    id: 'doc-nyc-4',
    name: 'Dr. Marcus Vance',
    specialty: 'Pediatrician',
    phone: '+1 (555) 012-7634',
    email: 'm.vance@medibuddy.org',
    address: 'Vance Pediatrics Care, 88 Park Ave, New York, NY',
    rating: 4.9,
    availability: 'Mon - Fri, 8:30 AM - 5:00 PM',
    hospitalAffiliation: 'Children\'s General Hospital',
    latitude: 40.7829,
    longitude: -73.9654
  },
  {
    id: 'doc-nyc-5',
    name: 'Dr. Emily Watson',
    specialty: 'General Practitioner',
    phone: '+1 (555) 015-3849',
    email: 'e.watson@medibuddy.org',
    address: 'Family Practice Clinic, 72 Pine St, New York, NY',
    rating: 4.6,
    availability: 'Mon - Fri, 9:00 AM - 5:00 PM',
    hospitalAffiliation: 'City General Hospital',
    latitude: 40.7061,
    longitude: -73.9969
  }
];

export const DELHI_DOCTORS_DATABASE: Doctor[] = [
  {
    id: 'doc-del-1',
    name: 'Dr. Sanjay Kalra',
    specialty: 'Endocrinologist',
    phone: '+91 98101 44556',
    email: 's.kalra@delhidiabetes.org',
    address: 'Delhi Diabetes Center, Sector 15, Rohini, Delhi',
    rating: 4.9,
    availability: 'Mon - Sat, 10:00 AM - 4:00 PM',
    hospitalAffiliation: 'Dr. Baba Saheb Ambedkar Hospital',
    latitude: 28.7188,
    longitude: 77.1062
  },
  {
    id: 'doc-del-2',
    name: 'Dr. Ashutosh Marwah',
    specialty: 'Cardiologist',
    phone: '+91 98111 65432',
    email: 'a.marwah@sarojhospital.com',
    address: 'Saroj Super Speciality Hospital, Sector 14, Rohini, Delhi',
    rating: 4.9,
    availability: 'Mon - Sat, 11:00 AM - 2:00 PM',
    hospitalAffiliation: 'Saroj Super Speciality Hospital',
    latitude: 28.7042,
    longitude: 77.1265
  },
  {
    id: 'doc-del-3',
    name: 'Dr. Vinod Sharma',
    specialty: 'Cardiologist',
    phone: '+91 98100 23456',
    email: 'v.sharma@jaipurgolden.com',
    address: 'Jaipur Golden Hospital, Sector 3, Rohini, Delhi',
    rating: 4.8,
    availability: 'Mon - Fri, 10:00 AM - 1:00 PM',
    hospitalAffiliation: 'Jaipur Golden Hospital',
    latitude: 28.6998,
    longitude: 77.1077
  },
  {
    id: 'doc-del-4',
    name: 'Dr. Monika Sharma',
    specialty: 'Dermatologist',
    phone: '+91 98990 12345',
    email: 'm.sharma@skinclinic.in',
    address: 'Dermatology & Skin Center, Sector 9, Rohini, Delhi',
    rating: 4.7,
    availability: 'Mon - Sat, 4:00 PM - 7:00 PM',
    hospitalAffiliation: 'Skin Clinic Rohini',
    latitude: 28.7092,
    longitude: 77.1189
  },
  {
    id: 'doc-del-5',
    name: 'Dr. R.S. Sethi',
    specialty: 'Pediatrician',
    phone: '+91 98110 98765',
    email: 'rs.sethi@sethiclinic.com',
    address: 'Sethi Pediatric Care, Sector 8, Rohini, Delhi',
    rating: 4.9,
    availability: 'Mon - Sat, 9:00 AM - 12:00 PM',
    hospitalAffiliation: 'Sethi Child Clinic',
    latitude: 28.7032,
    longitude: 77.1165
  },
  {
    id: 'doc-del-6',
    name: 'Dr. Anil Kumar',
    specialty: 'General Practitioner',
    phone: '+91 98180 54321',
    email: 'a.kumar@generalhealth.in',
    address: 'Kumar Medical Clinic, Sector 11, Rohini, Delhi',
    rating: 4.6,
    availability: 'Mon - Sat, 10:00 AM - 8:00 PM',
    hospitalAffiliation: 'Kumar Family Clinic',
    latitude: 28.7154,
    longitude: 77.1132
  },
  {
    id: 'doc-del-7',
    name: 'Dr. Alka Gupta',
    specialty: 'General Practitioner',
    phone: '+91 98112 34567',
    email: 'a.gupta@womenscare.in',
    address: 'Gupta Medical Center, Sector 13, Rohini, Delhi',
    rating: 4.7,
    availability: 'Mon - Sat, 5:00 PM - 8:00 PM',
    hospitalAffiliation: 'Gupta Clinic Rohini',
    latitude: 28.7121,
    longitude: 77.1215
  },
  {
    id: 'doc-del-8',
    name: 'Dr. Ashish Chaudhry',
    specialty: 'Orthopedist',
    phone: '+91 98114 99008',
    email: 'a.chaudhry@delhiortho.in',
    address: 'Chaudhry Joint & Ortho Clinic, Sector 12, Rohini, Delhi',
    rating: 4.8,
    availability: 'Mon, Tue, Thu, 8:00 AM - 4:30 PM',
    hospitalAffiliation: 'Jaipur Golden Hospital',
    latitude: 28.7081,
    longitude: 77.1235
  }
];

export function getDoctorDatabaseForLocation(lat: number | null, lon: number | null): Doctor[] {
  if (lat === null || lon === null) {
    return NYC_DOCTORS_DATABASE;
  }

  if (lat >= 28.0 && lat <= 29.5 && lon >= 76.5 && lon <= 78.0) {
    return DELHI_DOCTORS_DATABASE;
  }
  
  return NYC_DOCTORS_DATABASE;
}
export const DOCTORS_DATABASE = NYC_DOCTORS_DATABASE; 
