/**
 * Pure detector and statistics business logic for ReelCounter.
 * Decoupled from UI and platform APIs for deterministic unit testing.
 */

export interface DetectionInput {
  packageName: string;
  timestamp: number;
  viewIdMatch?: string;
  creatorHandle?: string;
  soundOrTitleHash?: number;
  isInsideShortVideoFeed: boolean;
  isInCommentsOrProfile?: boolean;
}

export type Confidence = 'EXACT' | 'HIGH' | 'HEURISTIC' | 'UNCERTAIN';

export interface DetectionResult {
  isNewVideo: boolean;
  packageName: string;
  deduplicationKey: string | null;
  confidence: Confidence;
  reason: string;
  estimatedDurationMs: number;
}

export class DetectorEngineSimulator {
  private lastCountedTime = new Map<string, number>();
  private lastKey = new Map<string, string>();
  private minThresholdMs: number;

  constructor(minThresholdMs = 1500) {
    this.minThresholdMs = minThresholdMs;
  }

  public setMinThreshold(ms: number) {
    this.minThresholdMs = ms;
  }

  public isSupportedPackage(pkg: string): boolean {
    const supported = [
      'com.zhiliaoapp.musically',
      'com.ss.android.ugc.trill',
      'com.instagram.android',
      'com.facebook.katana',
      'com.google.android.youtube',
      'com.snapchat.android',
    ];
    return supported.includes(pkg);
  }

  public process(input: DetectionInput): DetectionResult {
    const { packageName, timestamp, isInsideShortVideoFeed, isInCommentsOrProfile } = input;

    if (!this.isSupportedPackage(packageName)) {
      return {
        isNewVideo: false,
        packageName,
        deduplicationKey: null,
        confidence: 'UNCERTAIN',
        reason: 'Unsupported package',
        estimatedDurationMs: 0,
      };
    }

    if (!isInsideShortVideoFeed) {
      return {
        isNewVideo: false,
        packageName,
        deduplicationKey: null,
        confidence: 'UNCERTAIN',
        reason: 'Not inside short-video player container',
        estimatedDurationMs: 0,
      };
    }

    if (isInCommentsOrProfile) {
      return {
        isNewVideo: false,
        packageName,
        deduplicationKey: null,
        confidence: 'UNCERTAIN',
        reason: 'Inside comments or profile sheet',
        estimatedDurationMs: 0,
      };
    }

    const lastTime = this.lastCountedTime.get(packageName) ?? 0;
    const elapsed = timestamp - lastTime;

    if (lastTime > 0 && elapsed < this.minThresholdMs) {
      return {
        isNewVideo: false,
        packageName,
        deduplicationKey: null,
        confidence: 'HEURISTIC',
        reason: `Filtered: viewing duration (${elapsed}ms) below threshold (${this.minThresholdMs}ms)`,
        estimatedDurationMs: 0,
      };
    }

    // Build deduplication key
    let dedupKey: string | null = null;
    let confidence: Confidence = 'HIGH';

    if (input.creatorHandle) {
      dedupKey = `${packageName}_${input.creatorHandle}_${input.soundOrTitleHash ?? 0}`;
      confidence = 'EXACT';
    } else if (input.viewIdMatch) {
      dedupKey = `${packageName}_${input.viewIdMatch}_${Math.floor(timestamp / 3000)}`;
      confidence = 'HIGH';
    } else {
      dedupKey = `${packageName}_scroll_${Math.floor(timestamp / 2000)}`;
      confidence = 'HEURISTIC';
    }

    const prevKey = this.lastKey.get(packageName);
    if (prevKey && prevKey === dedupKey) {
      return {
        isNewVideo: false,
        packageName,
        deduplicationKey: dedupKey,
        confidence,
        reason: 'Duplicate video key within active session',
        estimatedDurationMs: 0,
      };
    }

    // Update state
    this.lastCountedTime.set(packageName, timestamp);
    this.lastKey.set(packageName, dedupKey);

    const estimatedDuration = lastTime > 0 ? Math.min(elapsed, 90000) : 15000;

    return {
      isNewVideo: true,
      packageName,
      deduplicationKey: dedupKey,
      confidence,
      reason: 'Valid short video transition confirmed',
      estimatedDurationMs: estimatedDuration,
    };
  }

  public reset() {
    this.lastCountedTime.clear();
    this.lastKey.clear();
  }
}

export function shouldTriggerDailyGoalNotification(
  currentTotal: number,
  dailyGoal: number,
  todayDate: string,
  lastNotifiedDate: string | null
): boolean {
  if (dailyGoal <= 0) return false;
  if (currentTotal < dailyGoal) return false;
  return lastNotifiedDate !== todayDate;
}

export function generateCsvExport(
  records: Array<{
    date: string;
    packageName: string;
    appName: string;
    videoCount: number;
    estimatedMinutes: number;
    uncertainEvents: number;
  }>
): string {
  const header = 'Date,Package,AppName,VideoCount,EstimatedViewingMinutes,UncertainEvents\n';
  const rows = records.map(
    (r) =>
      `${r.date},"${r.packageName}","${r.appName}",${r.videoCount},${r.estimatedMinutes},${r.uncertainEvents}`
  );
  return header + rows.join('\n');
}
