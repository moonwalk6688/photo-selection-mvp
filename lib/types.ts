export type Album = {
  id: string;
  photographer_id: string;
  client_name: string;
  shoot_type: string;
  shoot_date: string | null;
  title: string;
  description: string | null;
  max_select_count: number;
  access_password_hash: string | null;
  share_token: string;
  allow_resubmit: boolean;
  is_submitted: boolean;
  submitted_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Photo = {
  id: string;
  album_id: string;
  display_filename: string;
  original_basename: string;
  camera_sequence: string | null;
  preview_url: string;
  thumb_url?: string;
  storage_path: string;
  sort_order: number;
  uploaded_at: string | null;
  created_at: string;
};

export type SelectionWithPhoto = {
  id: string;
  album_id: string;
  photo_id: string;
  is_selected: boolean;
  client_note: string | null;
  selected_at: string | null;
  created_at: string;
  updated_at: string;
  photos: Photo | null;
};
