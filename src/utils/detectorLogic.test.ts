import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DetectorEngineSimulator,
  shouldTriggerDailyGoalNotification,
  generateCsvExport,
} from './detectorLogic.ts';

test('DetectorEngineSimulator identifies supported apps and rejects unknown packages', () => {
  const engine = new DetectorEngineSimulator(1500);

  assert.equal(engine.isSupportedPackage('com.zhiliaoapp.musically'), true);
  assert.equal(engine.isSupportedPackage('com.instagram.android'), true);
  assert.equal(engine.isSupportedPackage('com.google.android.youtube'), true);
  assert.equal(engine.isSupportedPackage('com.facebook.katana'), true);
  assert.equal(engine.isSupportedPackage('com.snapchat.android'), true);
  assert.equal(engine.isSupportedPackage('com.android.calculator'), false);

  const unknownResult = engine.process({
    packageName: 'com.android.calculator',
    timestamp: 1000,
    isInsideShortVideoFeed: true,
  });
  assert.equal(unknownResult.isNewVideo, false);
  assert.equal(unknownResult.reason, 'Unsupported package');
});

test('DetectorEngineSimulator rejects events when not inside short-video player container', () => {
  const engine = new DetectorEngineSimulator(1500);

  // E.g. Standard YouTube video watch page vs Shorts
  const result = engine.process({
    packageName: 'com.google.android.youtube',
    timestamp: 1000,
    isInsideShortVideoFeed: false, // ordinary video
  });
  assert.equal(result.isNewVideo, false);
  assert.equal(result.reason, 'Not inside short-video player container');
});

test('DetectorEngineSimulator rejects events when inside comments or profile drawer', () => {
  const engine = new DetectorEngineSimulator(1500);

  const result = engine.process({
    packageName: 'com.instagram.android',
    timestamp: 1000,
    isInsideShortVideoFeed: true,
    isInCommentsOrProfile: true,
  });
  assert.equal(result.isNewVideo, false);
  assert.equal(result.reason, 'Inside comments or profile sheet');
});

test('DetectorEngineSimulator enforces minimum duration threshold to filter rapid scroll flings', () => {
  const engine = new DetectorEngineSimulator(1500);

  // First video at t=1000ms
  const first = engine.process({
    packageName: 'com.zhiliaoapp.musically',
    timestamp: 1000,
    creatorHandle: 'creator1',
    isInsideShortVideoFeed: true,
  });
  assert.equal(first.isNewVideo, true);

  // Rapid swipe after only 400ms (t=1400ms)
  const rapidSwipe = engine.process({
    packageName: 'com.zhiliaoapp.musically',
    timestamp: 1400,
    creatorHandle: 'creator2',
    isInsideShortVideoFeed: true,
  });
  assert.equal(rapidSwipe.isNewVideo, false);
  assert.match(rapidSwipe.reason, /below threshold/);

  // Normal watch after 2500ms (t=3500ms)
  const normalSwipe = engine.process({
    packageName: 'com.zhiliaoapp.musically',
    timestamp: 3500,
    creatorHandle: 'creator3',
    isInsideShortVideoFeed: true,
  });
  assert.equal(normalSwipe.isNewVideo, true);
});

test('DetectorEngineSimulator deduplicates repeated accessibility events with the same key', () => {
  const engine = new DetectorEngineSimulator(1500);

  const initial = engine.process({
    packageName: 'com.facebook.katana',
    timestamp: 1000,
    creatorHandle: 'popular_reels_creator',
    isInsideShortVideoFeed: true,
  });
  assert.equal(initial.isNewVideo, true);

  // Same key arrives 2000ms later (e.g. accessibility scroll rebound or UI relayout)
  const duplicate = engine.process({
    packageName: 'com.facebook.katana',
    timestamp: 3000,
    creatorHandle: 'popular_reels_creator',
    isInsideShortVideoFeed: true,
  });
  assert.equal(duplicate.isNewVideo, false);
  assert.equal(duplicate.reason, 'Duplicate video key within active session');
});

test('shouldTriggerDailyGoalNotification fires once per day per threshold', () => {
  const today = '2026-10-26';

  // Under limit: no trigger
  assert.equal(shouldTriggerDailyGoalNotification(40, 100, today, null), false);

  // Crosses limit: triggers!
  assert.equal(shouldTriggerDailyGoalNotification(100, 100, today, null), true);

  // Already notified today: does NOT re-trigger!
  assert.equal(shouldTriggerDailyGoalNotification(105, 100, today, '2026-10-26'), false);

  // New day arrives: triggers again if over goal!
  assert.equal(shouldTriggerDailyGoalNotification(110, 100, '2026-10-27', '2026-10-26'), true);
});

test('generateCsvExport produces correctly formatted CSV with headers', () => {
  const data = [
    {
      date: '2026-10-26',
      packageName: 'com.zhiliaoapp.musically',
      appName: 'TikTok',
      videoCount: 45,
      estimatedMinutes: 18,
      uncertainEvents: 1,
    },
    {
      date: '2026-10-26',
      packageName: 'com.instagram.android',
      appName: 'Instagram Reels',
      videoCount: 32,
      estimatedMinutes: 14,
      uncertainEvents: 0,
    },
  ];

  const csv = generateCsvExport(data);
  assert.match(csv, /^Date,Package,AppName,VideoCount,EstimatedViewingMinutes,UncertainEvents/);
  assert.match(csv, /2026-10-26,"com.zhiliaoapp.musically","TikTok",45,18,1/);
  assert.match(csv, /2026-10-26,"com.instagram.android","Instagram Reels",32,14,0/);
});
