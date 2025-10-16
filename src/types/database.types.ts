export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TournamentVariant = 'indoor_6x6' | 'beach_2x2';
export type TournamentCategory = 'mixed' | 'men' | 'women';
export type TournamentLevel = 'beginner' | 'intermediate' | 'advanced';
export type RegistrationMode = 'team' | 'solo' | 'solo_positional' | 'team_or_solo';
export type TournamentStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'waitlisted' | 'accepted_unpaid' | 'accepted_paid' | 'expired_unpaid' | 'payment_failed';
export type Gender = 'male' | 'female' | 'other';
export type PositionType = 'setter' | 'middle' | 'outside' | 'opposite' | 'libero';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'expired';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          gender: Gender | null;
          level: TournamentLevel | null;
          city: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          gender?: Gender | null;
          level?: TournamentLevel | null;
          city?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          gender?: Gender | null;
          level?: TournamentLevel | null;
          city?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tournaments: {
        Row: {
          id: string;
          organizer_id: string;
          title: string;
          description: string | null;
          variant: TournamentVariant;
          category: TournamentCategory;
          level: TournamentLevel;
          registration_mode: RegistrationMode;
          max_teams: number | null;
          price: number | null;
          start_date: string;
          end_date: string;
          registration_deadline: string;
          address: string;
          city: string;
          postal_code: string | null;
          country: string;
          is_public: boolean;
          access_token: string | null;
          status: TournamentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          title: string;
          description?: string | null;
          variant: TournamentVariant;
          category: TournamentCategory;
          level: TournamentLevel;
          registration_mode: RegistrationMode;
          max_teams?: number | null;
          price?: number | null;
          start_date: string;
          end_date: string;
          registration_deadline: string;
          address: string;
          city: string;
          postal_code?: string | null;
          country: string;
          is_public?: boolean;
          access_token?: string | null;
          status?: TournamentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          title?: string;
          description?: string | null;
          variant?: TournamentVariant;
          category?: TournamentCategory;
          level?: TournamentLevel;
          registration_mode?: RegistrationMode;
          max_teams?: number | null;
          price?: number | null;
          start_date?: string;
          end_date?: string;
          registration_deadline?: string;
          address?: string;
          city?: string;
          postal_code?: string | null;
          country?: string;
          is_public?: boolean;
          access_token?: string | null;
          status?: TournamentStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          tournament_id: string;
          user_id: string;
          status: RegistrationStatus;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          gender: Gender;
          level: TournamentLevel;
          position: PositionType | null;
          team_name: string | null;
          teammate_first_name: string | null;
          teammate_last_name: string | null;
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          payment_status: PaymentStatus | null;
          accepted_at: string | null;
          payment_deadline: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          user_id: string;
          status?: RegistrationStatus;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          gender: Gender;
          level: TournamentLevel;
          position?: PositionType | null;
          team_name?: string | null;
          teammate_first_name?: string | null;
          teammate_last_name?: string | null;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          payment_status?: PaymentStatus | null;
          accepted_at?: string | null;
          payment_deadline?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          user_id?: string;
          status?: RegistrationStatus;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          gender?: Gender;
          level?: TournamentLevel;
          position?: PositionType | null;
          team_name?: string | null;
          teammate_first_name?: string | null;
          teammate_last_name?: string | null;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          payment_status?: PaymentStatus | null;
          accepted_at?: string | null;
          payment_deadline?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}


