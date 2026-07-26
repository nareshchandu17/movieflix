export interface ReactionUploadInput {
  file: File | null;
  movieId: string;
  caption?: string;
}

export function validateReactionUpload({ file, movieId, caption }: ReactionUploadInput) {
  if (!file) {
    return { ok: false as const, error: 'Please select a video file.' };
  }

  if (!file.type.startsWith('video/')) {
    return { ok: false as const, error: 'Only video files are supported.' };
  }

  if (file.size > 20 * 1024 * 1024) {
    return { ok: false as const, error: 'Video must be less than 20MB.' };
  }

  if (!movieId?.trim()) {
    return { ok: false as const, error: 'Please select a movie.' };
  }

  if (caption && caption.trim().length > 140) {
    return { ok: false as const, error: 'Caption must be 140 characters or fewer.' };
  }

  return { ok: true as const };
}
