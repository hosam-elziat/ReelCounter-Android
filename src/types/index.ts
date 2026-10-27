export type Language = 'en' | 'ar';

export type TabId = 'dashboard' | 'statistics' | 'applications' | 'settings' | 'permissions';

export interface AppStat {
  packageId: string;
  name: string;
  nameAr: string;
  videoCount: number;
  estimatedMinutes: number;
  uncertainCount: number;
  isEnabled: boolean;
  color: string;
  confidence: 'EXACT' | 'HIGH' | 'HEURISTIC' | 'UNCERTAIN';
}

export interface VideoEventRecord {
  id: string;
  packageName: string;
  appName: string;
  timestamp: number;
  timeString: string;
  confidence: 'EXACT' | 'HIGH' | 'HEURISTIC' | 'UNCERTAIN';
  method: string;
  creatorHandle?: string;
  dedupKey?: string;
  status: 'COUNTED' | 'FILTERED' | 'DUPLICATE';
  reason: string;
}

export interface DayRecord {
  date: string;
  dayLabel: string;
  dayLabelAr: string;
  totalVideos: number;
  estimatedMinutes: number;
}
