export type CitySettings = {
  id: string;
  city_name: string;
  city_hall_name: string;
  address: string;
  ibge_code: string;
  state: string;
  zip_code: string | null;
  phone: string | null;
  email: string | null;
  mayor_name: string | null;
  created_at: string;
  updated_at: string;
};

export type CitySettingsFormData = {
  city_name: string;
  city_hall_name: string;
  address: string;
  ibge_code: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  mayor_name: string;
};
