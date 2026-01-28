import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { CitySettings, CitySettingsFormData } from "./types";

export async function fetchCitySettings(): Promise<CitySettings | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase não configurado");
  }

  const { data, error } = await supabase
    .from("city_settings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao buscar configurações: ${error.message}`);
  }

  if (!data) return null;

  return {
    id: String(data.id),
    city_name: data.city_name,
    city_hall_name: data.city_hall_name,
    address: data.address,
    ibge_code: data.ibge_code,
    state: data.state,
    zip_code: data.zip_code,
    phone: data.phone,
    email: data.email,
    mayor_name: data.mayor_name,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function createCitySettings(
  formData: CitySettingsFormData
): Promise<CitySettings> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase não configurado");
  }

  const payload = {
    city_name: formData.city_name,
    city_hall_name: formData.city_hall_name,
    address: formData.address,
    ibge_code: formData.ibge_code,
    state: formData.state,
    zip_code: formData.zip_code || null,
    phone: formData.phone || null,
    email: formData.email || null,
    mayor_name: formData.mayor_name || null,
  };

  const { data, error } = await supabase
    .from("city_settings")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar configurações: ${error.message}`);
  }

  return {
    id: String(data.id),
    city_name: data.city_name,
    city_hall_name: data.city_hall_name,
    address: data.address,
    ibge_code: data.ibge_code,
    state: data.state,
    zip_code: data.zip_code,
    phone: data.phone,
    email: data.email,
    mayor_name: data.mayor_name,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function updateCitySettings(
  id: string,
  formData: CitySettingsFormData
): Promise<CitySettings> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase não configurado");
  }

  const payload = {
    city_name: formData.city_name,
    city_hall_name: formData.city_hall_name,
    address: formData.address,
    ibge_code: formData.ibge_code,
    state: formData.state,
    zip_code: formData.zip_code || null,
    phone: formData.phone || null,
    email: formData.email || null,
    mayor_name: formData.mayor_name || null,
  };

  const { data, error } = await supabase
    .from("city_settings")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar configurações: ${error.message}`);
  }

  return {
    id: String(data.id),
    city_name: data.city_name,
    city_hall_name: data.city_hall_name,
    address: data.address,
    ibge_code: data.ibge_code,
    state: data.state,
    zip_code: data.zip_code,
    phone: data.phone,
    email: data.email,
    mayor_name: data.mayor_name,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}
