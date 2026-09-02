export type UserRole =
  | 'SUPER_ADMIN'
  | 'TREASURER'
  | 'COMMITTEE_MEMBER'
  | 'EVENT_COORDINATOR'
  | 'VOLUNTEER'
  | 'VIEWER';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  buildingId?: string;
  flatNumber?: string;
  phone?: string;
  photoURL?: string;
}

export interface Building {
  buildingId: string; // 'A', 'B', 'C'
  name: string; // 'A Building', etc.
  totalFlats: number;
  expectedPerFlat: number;
  targetAmount: number;
  collectedAmount?: number;
  pendingAmount?: number;
  paidFlatsCount?: number;
  pendingFlatsCount?: number;
}

export interface Flat {
  flatNumber: string; // 'A-101'
  buildingId: string; // 'A'
  floor: number;
  residentName: string;
  phone?: string;
  email?: string;
}

export type PaymentMode = 'ONLINE' | 'CASH';
export type ContributionStatus = 'PAID' | 'PENDING';

export interface Contribution {
  id: string;
  eventId: string;
  buildingId: string;
  flatNumber: string;
  residentName: string;
  expectedAmount: number;
  paidAmount: number;
  paymentMode?: PaymentMode;
  transactionId?: string;
  receiptNumber?: string;
  paymentDate?: string;
  status: ContributionStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type ExpenseCategory =
  | 'Decoration'
  | 'Sound & Light'
  | 'Stage & Mandap'
  | 'Catering & Food'
  | 'Artist & Performers'
  | 'Dhol Pathak / Band'
  | 'Prizes & Trophies'
  | 'Security & Bouncers'
  | 'Photography & Video'
  | 'Pooja & Rituals'
  | 'Cultural Events'
  | 'Misc & Contingency';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Expense {
  id: string;
  eventId: string;
  category: ExpenseCategory;
  vendor: string;
  description: string;
  amount: number;
  paymentMode: PaymentMode | 'CHEQUE' | 'NET_BANKING';
  invoiceNumber?: string;
  billUrl?: string;
  status: ExpenseStatus;
  expenseDate: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Program {
  id: string;
  eventId: string;
  title: string;
  date: string;
  time: string;
  stage: string;
  category: 'Ceremony' | 'Dance' | 'Music' | 'Drama' | 'Feast' | 'Games' | 'Award';
  description: string;
  durationMinutes: number;
  performers?: string[];
  order: number;
  isToday?: boolean;
}

export interface Performance {
  id: string;
  eventId: string;
  title: string;
  performer: string;
  groupName?: string;
  category: 'Traditional Dance' | 'Bollywood Dance' | 'Vocal Music' | 'Instrumental' | 'Drama/Skit' | 'Kids Special' | 'Fashion Show';
  description: string;
  time: string;
  stage: string;
  imageUrl: string;
  photos?: string[];
  videoUrl?: string;
  relatedProgramId?: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
}

export interface GalleryAlbum {
  id: string;
  eventId: string;
  name: string;
  coverImageUrl: string;
  itemCount: number;
  date: string;
}

export interface GalleryImage {
  id: string;
  eventId: string;
  albumId: string;
  title: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  programId?: string;
  performanceId?: string;
  uploadedAt: string;
  uploadedBy?: string;
  caption?: string;
  likes?: number;
}

export type SponsorTier = 'Title' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Community';

export interface Sponsor {
  id: string;
  eventId: string;
  name: string;
  tier: SponsorTier;
  amount: number;
  logoUrl: string;
  paymentStatus: 'PAID' | 'PENDING';
  contactPerson: string;
  contactPhone: string;
  website?: string;
  description?: string;
}

export interface Volunteer {
  id: string;
  eventId: string;
  name: string;
  role: string;
  buildingId: string;
  flatNumber: string;
  phone: string;
  shiftTime: string;
  status: 'ASSIGNED' | 'AVAILABLE' | 'ON_DUTY';
  tasksCount?: number;
  avatarUrl?: string;
}

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  eventId: string;
  title: string;
  assignedTo: string;
  volunteerId?: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: string;
  description?: string;
}

export interface EventInfo {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  venue: string;
  city: string;
  tagline: string;
  heroBannerUrl: string;
  totalTarget: number;
  expectedPerFlat: number;
  buildingsCount: number;
  totalFlats: number;
}

export interface FinancialSummary {
  totalCollected: number;
  totalSpent: number;
  balance: number;
  totalPending: number;
  onlineCollected: number;
  cashCollected: number;
  targetAmount: number;
  completionPercentage: number;
  pendingExpensesCount: number;
  pendingContributionsCount: number;
  otherIncome?: number;
  totalIncome?: number;
}

export interface CategoryBudget {
  category: string;
  budgetedAmount: number;
  notes?: string;
}

export interface OtherIncome {
  id: string;
  eventId: string;
  source: string;
  description: string;
  amount: number;
  date: string;
  receivedBy?: string;
  paymentMode?: string;
  referenceNumber?: string;
}

export interface FinancialReportData {
  totalCollected: number;
  totalPending: number;
  totalFlats: number;
  paidFlatsCount: number;
  pendingFlatsCount: number;
  totalExpenses: number;
  approvedExpensesCount: number;
  pendingExpensesCount: number;
  otherIncome: number;
  totalIncome: number;
  currentBalance: number;
  targetCollection: number;
  collectionPercentage: number;
  categoryExpenses: {
    category: string;
    amount: number;
    percentage: number;
    budget: number;
    difference: number;
    isOverBudget: boolean;
  }[];
  buildingSummaries: Building[];
  recentExpenses: Expense[];
}

export type CulturalEventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

export interface CulturalEvent {
  id: string;
  name: string;
  month: string;       // e.g. 'SEP', 'OCT'
  monthFull: string;   // e.g. 'September 2026'
  date: string;        // ISO date string of primary day
  endDate?: string;    // ISO end date for multi-day events
  tagline: string;
  emoji: string;
  imageUrl?: string;   // Optional real image (overrides emoji in displays)
  gradient: string;    // CSS gradient for the month badge
  cardBg: string;      // light bg for the row/card
  accentColor: string; // heading accent color
  status: CulturalEventStatus;
  scheduleItems?: {
    icon?: string;
    date: string;
    time: string;
    title: string;
    desc?: string;
    badge?: string;
  }[];
}

export type KalakritiActivityKey =
  | 'drawing'
  | 'skit1'
  | 'skit2'
  | 'dance'
  | 'fashionShow'
  | 'mimicry'
  | 'singing'
  | 'fancyDress';

export interface KalakritiEntry {
  id: string;
  sn: number;
  name: string;
  flatNumber?: string;
  phone?: string;
  ageGroup?: 'Kids' | 'Teens' | 'Adults' | 'Seniors';
  drawing: boolean;
  skit1: boolean;
  skit2: boolean;
  dance: boolean;
  fashionShow: boolean;
  mimicry: boolean;
  singing: boolean;
  fancyDress: boolean;
  remarks?: string;
  createdAt: string;
}

export interface PrasadBooking {
  id: string;              // unique booking id e.g. 'pb-1725330000000-xyz'
  flatNumber: string;      // e.g. 'A-304'
  residentName: string;    // e.g. 'Sharma Family'
  phone?: string;          // e.g. '+91 98231 10022'
  prasadItem?: string;     // e.g. 'Modak, Panchamrit, Fruits'
  notes?: string;          // e.g. 'Bringing 51 Ukadiche Modak'
  bookedAt?: string;       // ISO timestamp
}

export interface MahaPrasadRSVP {
  id: string;                    // e.g. 'rsvp-A-304'
  buildingId: 'A' | 'B' | 'C';
  flatNumber: string;            // e.g. 'A-304'
  residentName: string;          // e.g. 'Mr. Rajesh & Family'
  phone: string;                 // e.g. '9876543210'
  adultsCount: number;           // e.g. 2
  childrenCount: number;         // e.g. 1 (<12 yrs)
  totalHeadcount: number;        // adultsCount + childrenCount
  dietaryPreference?: string;    // 'SATVIK' / 'MAHAPRASAD'
  timeSlot?: string;             // e.g. '8:00 PM - 9:00 PM', '9:00 PM - 10:00 PM', or '8:00 PM - 10:00 PM'
  isVolunteering?: boolean;      // Ready to help in prasad distribution
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MahaPrasadSummary {
  totalHeadcount: number;
  totalAdults: number;
  totalChildren: number;
  totalFamilies: number;
  satvikCount: number;
  volunteersCount: number;
  buildingBreakdown: {
    A: { families: number; headcount: number };
    B: { families: number; headcount: number };
    C: { families: number; headcount: number };
  };
}


export interface PrasadSlot {
  id: string;              // e.g. '2026-09-14'
  dayNumber: number;       // 1 to 12
  date: string;            // '2026-09-14'
  dateDisplay: string;     // 'Mon, 14 Sep 2026'
  dayLabel: string;        // 'Day 1 - Ganesh Sthapana'
  time: string;            // '8:00 PM'
  aartiName: string;       // 'Evening Maha Aarti & Prasad'
  isBooked: boolean;
  bookings?: PrasadBooking[]; // Array of multiple families/devotees booked for this date
  flatNumber?: string;     // Legacy fallback / primary flat
  residentName?: string;   // Legacy fallback / primary name
  phone?: string;          // Legacy fallback
  prasadItem?: string;     // Legacy fallback
  coSponsors?: {
    flatNumber: string;
    residentName: string;
    phone?: string;
    prasadItem?: string;
  }[];
  bookedAt?: string;
  notes?: string;
}


