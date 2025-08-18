/**
 * useUnifiedProfile Hook
 * React hook for accessing and managing unified user profiles
 */

import { useState, useEffect } from "react";
import { ProfileService } from "../lib/ProfileService";
import { UnifiedUserProfile, CreateProfileData, UpdateProfileData } from "../types/profile";

interface UseUnifiedProfileReturn {
  profile: UnifiedUserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  createProfile: (data: CreateProfileData) => UnifiedUserProfile;
  updateProfile: (data: UpdateProfileData) => boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  migrateLegacyProfiles: () => boolean;
}

/**
 * Hook for managing unified user profiles
 */
export function useUnifiedProfile(): UseUnifiedProfileReturn {
  const [profile, setProfile] = useState<UnifiedUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const profileService = ProfileService.getInstance();

  useEffect(() => {
    // Load initial profile
    const loadProfile = () => {
      const currentProfile = profileService.getUnifiedProfile();
      setProfile(currentProfile);
      setIsLoading(false);

      // Auto-migrate legacy profiles if needed
      if (!currentProfile) {
        const migrated = profileService.migrateLegacyProfiles();
        if (migrated) {
          const migratedProfile = profileService.getUnifiedProfile();
          setProfile(migratedProfile);
        }
      }
    };

    loadProfile();

    // Listen for profile changes
    const handleProfileChange = () => {
      const updatedProfile = profileService.getUnifiedProfile();
      setProfile(updatedProfile);
    };

    profileService.addListener(handleProfileChange);

    return () => {
      profileService.removeListener(handleProfileChange);
    };
  }, [profileService]);

  const createProfile = (data: CreateProfileData): UnifiedUserProfile => {
    return profileService.createUnifiedProfile(data);
  };

  const updateProfile = (data: UpdateProfileData): boolean => {
    return profileService.updateUnifiedProfile(data);
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    return profileService.signInWithGoogle();
  };

  const signOut = async (): Promise<void> => {
    return profileService.signOut();
  };

  const migrateLegacyProfiles = (): boolean => {
    return profileService.migrateLegacyProfiles();
  };

  return {
    profile,
    isLoading,
    isAuthenticated: profileService.isAuthenticated(),
    createProfile,
    updateProfile,
    signInWithGoogle,
    signOut,
    migrateLegacyProfiles,
  };
}