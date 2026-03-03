export interface AppSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAppSettingDto {
  value: string;
}
