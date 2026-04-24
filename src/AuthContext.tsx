import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface Profile {
  role: 'admin' | 'staff' | 'manager' | 'cashier';
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const profileDoc = await getDoc(doc(db, 'profiles', u.uid));
        const isAdminEmail = u.email?.toLowerCase() === 'jesus.israel.lima.canaza@gmail.com';
        
        if (profileDoc.exists()) {
          const currentProfile = profileDoc.data() as Profile;
          // Force admin role if it's the admin user but role is different
          if (isAdminEmail && currentProfile.role !== 'admin') {
            const updatedProfile = { ...currentProfile, role: 'admin' as const };
            await setDoc(doc(db, 'profiles', u.uid), updatedProfile);
            setProfile(updatedProfile);
          } else {
            setProfile(currentProfile);
          }
        } else {
          // Create new profile
          const newProfile: Profile = {
            role: isAdminEmail ? 'admin' : 'staff',
            email: u.email || '',
            name: u.displayName || 'Staff'
          };
          await setDoc(doc(db, 'profiles', u.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
