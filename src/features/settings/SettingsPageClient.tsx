"use client";

import * as React from "react";
import { Building2, Check, Loader2, MapPin, Phone, Mail, User, Hash, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchCitySettings, createCitySettings, updateCitySettings } from "./api";
import type { CitySettings, CitySettingsFormData } from "./types";

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export function SettingsPageClient() {
  const [settings, setSettings] = React.useState<CitySettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Form fields
  const [cityName, setCityName] = React.useState("");
  const [cityHallName, setCityHallName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [ibgeCode, setIbgeCode] = React.useState("");
  const [state, setState] = React.useState("");
  const [zipCode, setZipCode] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [mayorName, setMayorName] = React.useState("");

  // Load settings
  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const data = await fetchCitySettings();
        if (cancelled) return;

        if (data) {
          setSettings(data);
          setCityName(data.city_name);
          setCityHallName(data.city_hall_name);
          setAddress(data.address);
          setIbgeCode(data.ibge_code);
          setState(data.state);
          setZipCode(data.zip_code || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
          setMayorName(data.mayor_name || "");
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Erro ao carregar configurações");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const formData: CitySettingsFormData = {
        city_name: cityName,
        city_hall_name: cityHallName,
        address,
        ibge_code: ibgeCode,
        state,
        zip_code: zipCode,
        phone,
        email,
        mayor_name: mayorName,
      };

      let result: CitySettings;
      if (settings) {
        result = await updateCitySettings(settings.id, formData);
      } else {
        result = await createCitySettings(formData);
      }

      setSettings(result);
      setSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  };

  const formatZipCode = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{5})(\d{0,3})/, "$1-$2");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Configurações do Sistema</h1>
        <p className="mt-1 text-sm text-slate-600">
          Configure as informações da prefeitura que serão exibidas nos relatórios e documentos
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <Card className="border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="h-5 w-5" />
            <span className="font-medium">Configurações salvas com sucesso!</span>
          </div>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="border border-slate-200 bg-white p-6">
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
                <Building2 className="h-5 w-5 text-blue-600" />
                Informações Básicas
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cityName">
                    Nome do Município <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cityName"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="Ex: São Paulo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cityHallName">
                    Nome da Prefeitura <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cityHallName"
                    value={cityHallName}
                    onChange={(e) => setCityHallName(e.target.value)}
                    placeholder="Ex: Prefeitura Municipal de São Paulo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ibgeCode">
                    Código IBGE <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="ibgeCode"
                      value={ibgeCode}
                      onChange={(e) => setIbgeCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Ex: 3550308"
                      className="pl-10"
                      maxLength={7}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">
                    Estado (UF) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Map className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-10 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Selecione...</option>
                      {BRAZILIAN_STATES.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
                <MapPin className="h-5 w-5 text-blue-600" />
                Endereço
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">
                    Endereço Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Rua da Prefeitura, 123 - Centro"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(formatZipCode(e.target.value))}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
              </div>
            </div>

            {/* Contato */}
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
                <Phone className="h-5 w-5 text-blue-600" />
                Contato
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      className="pl-10"
                      maxLength={15}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contato@prefeitura.gov.br"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Gestor */}
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                Gestor Municipal
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mayorName">Nome do Prefeito(a)</Label>
                  <Input
                    id="mayorName"
                    value={mayorName}
                    onChange={(e) => setMayorName(e.target.value)}
                    placeholder="Ex: João da Silva"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="submit" disabled={saving} className="min-w-[150px]">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </form>

      {/* Info Card */}
      <Card className="border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Sobre as Configurações</p>
            <p className="text-blue-700">
              Estas informações serão utilizadas nos relatórios, documentos oficiais e no cabeçalho
              do sistema. Mantenha os dados sempre atualizados para garantir a conformidade dos
              documentos gerados.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
