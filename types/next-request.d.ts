declare global {
  interface NextRequest {
    user?: {
      userId: string;
    };
    profile?: {
      userId: string,
      profileId: string;
      profileName: string;
      isKids: boolean;
    };
    validatedBody?: any;
  }
}

export {};
