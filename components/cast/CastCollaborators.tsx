"use client";

import React from 'react';
import { TMDBPerson, TMDBPersonCombinedCredits } from '@/features/shared/types';

interface CastCollaboratorsProps {
  person: TMDBPerson;
  credits?: TMDBPersonCombinedCredits;
}

export function CastCollaborators({ person, credits }: CastCollaboratorsProps) {
  // TMDB Person Combined Credits does not include co-star data by default.
  // To avoid making N+1 API calls for every movie the person was in,
  // we gracefully omit this section as per our production data strategy.
  
  return null;
}
