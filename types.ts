export enum NeedStatus {
  REQUESTED = 'pending',
  PARTIALLY_PLEDGED = 'partially_pledged',
  FULLY_PLEDGED = 'fully_pledged',
  RECEIVED = 'completed',
}

export enum District {
  AMPARA = 'Ampara',
  ANURADHAPURA = 'Anuradhapura',
  BADULLA = 'Badulla',
  BATTICALOA = 'Batticaloa',
  COLOMBO = 'Colombo',
  GALLE = 'Galle',
  GAMPAHA = 'Gampaha',
  HAMBANTOTA = 'Hambantota',
  JAFFNA = 'Jaffna',
  KALUTARA = 'Kalutara',
  KANDY = 'Kandy',
  KEGALLE = 'Kegalle',
  KILINOCHCHI = 'Kilinochchi',
  KURUNEGALA = 'Kurunegala',
  MANNAAR = 'Mannar',
  MATALE = 'Matale',
  MATARA = 'Matara',
  MONARAGALA = 'Monaragala',
  MULLAITIVU = 'Mullaitivu',
  NUWARA_ELIYA = 'Nuwara Eliya',
  POLONNARUWA = 'Polonnaruwa',
  PUTTALAM = 'Puttalam',
  RATNAPURA = 'Ratnapura',
  TRINCOMALEE = 'Trincomalee',
  VAVUNIYA = 'Vavuniya',
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type NeedCategory =
  | 'FOOD' | 'MEDICINE' | 'WATER' | 'CLOTHING' | 'BABY_ITEMS' | 'OTHER' // Goods
  | 'CLEANUP' | 'MEDICAL_AID' | 'RESCUE' | 'LOGISTICS' | 'TECH_SUPPORT'; // Services

export type NeedType = 'GOODS' | 'SERVICE';

export interface Need {
  id: string;
  type?: NeedType; // Optional for backward compatibility, default to 'GOODS'
  item: string;
  category: NeedCategory;
  urgency: UrgencyLevel;
  affectedCount: number;
  demographics?: {
    men: number;
    women: number;
    children: number;
  };
  quantity?: number;
  pledgedAmount?: number;
  receivedAmount?: number;
  unit?: string;
  district: District;
  location: string;
  coordinates?: Coordinates;
  contactName: string;
  contactNumber: string;
  description?: string;
  status: NeedStatus;
  createdAt: number;
  pledgedBy?: string;
  peopleNeeded?: number; // For Service Requests
  secretPin?: string; // For deletion
  donorPin?: string; // For donor to manage pledge
  pledgedAt?: number; // Timestamp when pledged
}

export interface Person {
  id: string;
  name: string;
  nic?: string;
  district: District;
  status: 'SAFE' | 'MISSING';
  lastSeenLocation: string;
  lastSeenDate?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  physicalDescription?: string;
  image?: string; // Base64 string
  coordinates?: Coordinates;
  contactNumber?: string; // Contact number of the missing person (if any)
  reporterName?: string;
  reporterContact?: string;
  reportedBy: string;
  updatedAt: number;
  message?: string;
  secretPin?: string; // For deletion
}

export interface Event {
  id: string;
  title: string;
  description: string;
  district: District;
  location: string;
  coordinates?: Coordinates;
  date: string;
  time: string;
  requiredVolunteers: number;
  registeredVolunteers: number;
  type: 'CLEANUP' | 'DISTRIBUTION' | 'MEDICAL' | 'RESCUE';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export type SkillType = 'GOODS' | 'SERVICES' | 'LABOR';

export interface Volunteer {
  id: string;
  name: string;
  contactNumber: string;
  district: District;
  location: string;
  coordinates?: Coordinates;
  skills: SkillType[];
  coverageArea: string; // e.g., "Whole District", "5km Radius"
  status: 'AVAILABLE' | 'BUSY';
  joinedAt: number;
  secretPin?: string; // For deletion
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user';
  createdAt: number;
}

export type ServiceCategory = 'RESCUE' | 'MEDICAL' | 'EVACUATION' | 'CLEANUP' | 'OTHER';

export interface ServiceRequest {
  id: string;
  category: ServiceCategory;
  details: {
    // Rescue
    waterLevel?: 'LOW' | 'RISING' | 'HIGH' | 'EXTREME';
    buildingType?: string;
    floorLevel?: number;
    safeForHours?: number;
    phoneBattery?: number;
    peopleCount?: {
      men: number;
      women: number;
      children: number;
      elderly: number;
    };
    // Medical
    urgency?: 'CRITICAL' | 'MODERATE' | 'LOW';
    condition?: string;
    ambulanceNeeded?: boolean;
    // Cleanup
    peopleNeeded?: number;
    taskType?: 'WELL_CLEANING' | 'HOUSE_CLEANING' | 'DEBRIS_REMOVAL';
    // Evacuation/Other
    description?: string;
    headcount?: number;
  };
  location: {
    coordinates: Coordinates;
    district: District;
    address?: string;
  };
  contact: {
    name: string;
    phone: string;
  };
  secretPin: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: number;
}