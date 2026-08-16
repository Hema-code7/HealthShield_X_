import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: 'INVESTIGATOR' | 'DOCTOR' | 'SECURITY_ADMIN' | 'UNAUTHORIZED';
  authorized: boolean;
  token?: string;
}

export interface UnauthorizedErrorPayload {
  isUnauthorizedAttempt: true;
  account: string;
  status: string;
  timestamp: string;
  source: string;
  severity: string;
}

const TOKEN_KEY = 'hsx_jwt_token';
const USER_KEY = 'hsx_user_profile';

export const auth = {
  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getCurrentUser(): UserProfile | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        // ignore
      }
    }
    return null;
  },

  async loginWithCredentials(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (error || !data.user || !data.session) {
      return this._handleUnauthorizedAttempt(cleanEmail);
    }

    // Extract profile info from user_metadata (default to INVESTIGATOR if missing)
    const metadata = data.user.user_metadata || {};
    const isAuthorized = metadata.authorized !== undefined ? metadata.authorized : true;
    const role = metadata.role || 'INVESTIGATOR';

    if (!isAuthorized) {
      await supabase.auth.signOut();
      return this._handleUnauthorizedAttempt(cleanEmail);
    }

    const profile: UserProfile = {
      id: data.user.id,
      email: data.user.email || cleanEmail,
      name: metadata.name || data.user.email || 'Authorized User',
      role: role as UserProfile['role'],
      authorized: true,
      token: data.session.access_token
    };

    localStorage.setItem(TOKEN_KEY, data.session.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));

    return profile;
  },

  async _handleUnauthorizedAttempt(email: string): Promise<never> {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    // Asynchronously log to security access-attempts audit endpoint
    try {
      await fetch('/api/v1/security/access-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'UNAUTHORIZED_LOGIN_ATTEMPT',
          source: 'External Public IP via Supabase',
          timestamp,
          email_attempted: email || 'unknown_user'
        })
      });
    } catch {
      // ignore offline fallback
    }

    const unauthPayload: UnauthorizedErrorPayload = {
      isUnauthorizedAttempt: true,
      account: email || 'unknown_user',
      status: 'ACCESS DENIED',
      timestamp,
      source: 'External Public IP via Supabase',
      severity: 'HIGH'
    };

    const err = new Error(`UNAUTHORIZED ACCESS ATTEMPT DETECTED: Access denied for ${email || 'unknown_user'}`);
    (err as any).unauthPayload = unauthPayload;
    throw err;
  },

  async checkPersistedSession(): Promise<UserProfile | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session && session.user) {
      const metadata = session.user.user_metadata || {};
      const profile: UserProfile = {
        id: session.user.id,
        email: session.user.email || '',
        name: metadata.name || session.user.email || 'Authorized User',
        role: metadata.role || 'INVESTIGATOR',
        authorized: metadata.authorized !== undefined ? metadata.authorized : true,
        token: session.access_token
      };
      
      localStorage.setItem(TOKEN_KEY, session.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
      return profile;
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
