export interface User {
  id: string;
  username: string;
  email: string;
}

export interface NFCTag {
  id: string;
  user_id: string;
  token: string;
  tag_name: string;
  interaction_mode: 'profile' | 'redirect';
  redirect_url: string;
  status: 'active' | 'paused';
  created_at: string;
}

export interface ScanLog {
  id: string;
  tag_id: string;
  interaction_type: 'scan' | 'click' | 'share';
  device_type: string;
  geo_location: any;
  created_at: string;
}

export interface UserData {
  id: string;
  user_id: string;
  field_name: string;
  field_value: string;
}
