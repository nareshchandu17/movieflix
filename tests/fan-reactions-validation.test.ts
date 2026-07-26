import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReactionUpload } from '../lib/fan-reactions/validation';

test('rejects unsupported video file types', () => {
  const result = validateReactionUpload({
    file: { size: 2 * 1024 * 1024, type: 'image/png' } as File,
    movieId: '550',
    caption: 'Great movie',
  });

  assert.equal(result.ok, false);
  assert.match(result.error || '', /video/i);
});

test('rejects files larger than 20MB', () => {
  const result = validateReactionUpload({
    file: { size: 21 * 1024 * 1024, type: 'video/mp4' } as File,
    movieId: '550',
    caption: 'Great movie',
  });

  assert.equal(result.ok, false);
  assert.match(result.error || '', /20MB/i);
});

test('accepts a valid upload payload', () => {
  const result = validateReactionUpload({
    file: { size: 5 * 1024 * 1024, type: 'video/mp4' } as File,
    movieId: '550',
    caption: 'Loved the ending',
  });

  assert.equal(result.ok, true);
});
