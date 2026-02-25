export interface Profile {
  id: string
  username: string          // immutable, derived from email, used internally
  slug: string              // public URL handle — editable, unique
  email: string
  form_title: string
  intro_message: string | null
  submit_label: string
  thankyou_message: string
  destination_email: string
  privacy_url: string | null
  using_default_privacy: boolean
  form_primary_color: string   // hex, default '#0c7b5f'
  form_bg_color: string        // hex, default '#fffcf1'
  submission_count: number
  monthly_submission_count: number
  monthly_reset_at: string
  is_live: boolean
  created_at: string
  updated_at: string
}

export const MONTHLY_LIMIT = 100
