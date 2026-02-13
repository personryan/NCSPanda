import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email?: string;
}

@Injectable()
export class SupabaseAuthService {
  private client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
    }
    this.client = createClient(url, key);
  }

  async validateAccessToken(accessToken: string): Promise<AuthUser | null> {
    const { data: { user }, error } = await this.client.auth.getUser(accessToken);
    if (error || !user) return null;
    return { id: user.id, email: user.email };
  }
}
