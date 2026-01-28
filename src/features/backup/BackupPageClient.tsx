"use client";

import * as React from "react";
import { Database, Loader2, Plus, Trash2, AlertCircle, Calendar, Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BackupTable } from "./components/BackupTable";
import { CreateBackupDialog } from "./components/CreateBackupDialog";
import { RestoreConfirmDialog } from "./components/RestoreConfirmDialog";
import { ScheduleList } from "./components/ScheduleList";
import { ScheduleDialog } from "./components/ScheduleDialog";
import type { Backup, BackupFilters, BackupPageClientProps, BackupSchedule, CreateBackupOptions, CreateScheduleInput, TableInfo, UpdateScheduleInput } from "./types";
import { listBackups, createBackup, deleteBackup, restoreBackup, downloadBackup, getAvailableTables, listSchedules, createSchedule, updateSchedule, deleteSchedule } from "./api";
import { useMyProfile } from "@/features/adminUsers/useMyProfile";

export function BackupPageClient({ initialBackups = [], userRole: propUserRole }: BackupPageClientProps = {}) {
  const { profile, loading: profileLoading } = useMyProfile();
  const userRole = (propUserRole ?? (profile?.role === "operator" ? "user" : profile?.role) ?? "user") as "superadmin" | "admin" | "user";
  
  const [backups, setBackups] = React.useState<Backup[]>(initialBackups);
  const [isLoadingBackups, setIsLoadingBackups] = React.useState(initialBackups.length === 0);
  const [filters, setFilters] = React.useState<BackupFilters>({});
  const [showFilters, setShowFilters] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = React.useState(false);
  const [selectedBackup, setSelectedBackup] = React.useState<Backup | null>(null);
  const [selectedSchedule, setSelectedSchedule] = React.useState<BackupSchedule | null>(null);
  const [isCreatingBackup, setIsCreatingBackup] = React.useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = React.useState(false);
  const [isDeletingBackup, setIsDeletingBackup] = React.useState(false);
  const [availableTables, setAvailableTables] = React.useState<TableInfo[]>([]);
  const [schedules, setSchedules] = React.useState<BackupSchedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = React.useState(false);
  const [isSubmittingSchedule, setIsSubmittingSchedule] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = React.useState<"backups" | "schedules">("backups");

  const canPerformAdminOps = userRole === "admin" || userRole === "superadmin";

  React.useEffect(() => {
    if (initialBackups.length === 0 && !profileLoading) {
      void refreshBackups();
    }
  }, [profileLoading]);

  React.useEffect(() => {
    if (canPerformAdminOps) {
      void loadAvailableTables();
    }
  }, [canPerformAdminOps]);

  React.useEffect(() => {
    if (activeTab === "schedules" && schedules.length === 0) {
      void loadSchedules();
    }
  }, [activeTab]);

  React.useEffect(() => {
    if (toast && toast.type === "success") {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadAvailableTables = async () => {
    try {
      const tables = await getAvailableTables();
      setAvailableTables(tables);
    } catch (error) {
      console.error("Error loading tables:", error);
      showToast("Erro ao carregar tabelas disponíveis", "error");
    }
  };

  const loadSchedules = async () => {
    setIsLoadingSchedules(true);
    try {
      const schedulesList = await listSchedules();
      setSchedules(schedulesList);
    } catch (error) {
      console.error("Error loading schedules:", error);
      showToast("Erro ao carregar agendamentos", "error");
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const refreshBackups = async () => {
    setIsLoadingBackups(true);
    try {
      const backupsList = await listBackups(filters);
      setBackups(backupsList);
    } catch (error) {
      console.error("Error loading backups:", error);
      showToast("Erro ao carregar backups", "error");
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const handleCreateBackup = async (options: CreateBackupOptions) => {
    setIsCreatingBackup(true);
    try {
      await createBackup(options);
      showToast("Backup criado com sucesso", "success");
      setIsCreateDialogOpen(false);
      await refreshBackups();
    } catch (error) {
      console.error("Error creating backup:", error);
      const message = error instanceof Error ? error.message : "Erro ao criar backup";
      showToast(message, "error");
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;
    setIsRestoringBackup(true);
    try {
      await restoreBackup(selectedBackup.id);
      showToast("Backup restaurado com sucesso", "success");
      setIsRestoreDialogOpen(false);
      setSelectedBackup(null);
      await refreshBackups();
    } catch (error) {
      console.error("Error restoring backup:", error);
      const message = error instanceof Error ? error.message : "Erro ao restaurar backup";
      showToast(message, "error");
    } finally {
      setIsRestoringBackup(false);
    }
  };

  const handleDeleteBackup = async () => {
    if (!selectedBackup) return;
    setIsDeletingBackup(true);
    try {
      await deleteBackup(selectedBackup.id);
      showToast("Backup excluído com sucesso", "success");
      setIsDeleteDialogOpen(false);
      setSelectedBackup(null);
      await refreshBackups();
    } catch (error) {
      console.error("Error deleting backup:", error);
      const message = error instanceof Error ? error.message : "Erro ao excluir backup";
      showToast(message, "error");
    } finally {
      setIsDeletingBackup(false);
    }
  };

  const handleDownloadBackup = async (backup: Backup) => {
    try {
      const url = await downloadBackup(backup.id);
      window.open(url, "_blank");
      showToast("Download iniciado", "success");
    } catch (error) {
      console.error("Error downloading backup:", error);
      const message = error instanceof Error ? error.message : "Erro ao baixar backup";
      showToast(message, "error");
    }
  };

  const handleCreateSchedule = async (input: CreateScheduleInput) => {
    setIsSubmittingSchedule(true);
    try {
      await createSchedule(input);
      showToast("Agendamento criado com sucesso", "success");
      setIsScheduleDialogOpen(false);
      setSelectedSchedule(null);
      await loadSchedules();
    } catch (error) {
      console.error("Error creating schedule:", error);
      const message = error instanceof Error ? error.message : "Erro ao criar agendamento";
      showToast(message, "error");
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleUpdateSchedule = async (scheduleId: string, updates: UpdateScheduleInput) => {
    setIsSubmittingSchedule(true);
    try {
      await updateSchedule(scheduleId, updates);
      showToast("Agendamento atualizado com sucesso", "success");
      setIsScheduleDialogOpen(false);
      setSelectedSchedule(null);
      await loadSchedules();
    } catch (error) {
      console.error("Error updating schedule:", error);
      const message = error instanceof Error ? error.message : "Erro ao atualizar agendamento";
      showToast(message, "error");
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await deleteSchedule(scheduleId);
      showToast("Agendamento excluído com sucesso", "success");
      await loadSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      const message = error instanceof Error ? error.message : "Erro ao excluir agendamento";
      showToast(message, "error");
    }
  };

  const handleFilterChange = (newFilters: BackupFilters) => {
    setFilters(newFilters);
  };

  const applyFilters = () => {
    void refreshBackups();
  };

  const clearFilters = () => {
    setFilters({});
    setShowFilters(false);
  };

  if (profileLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-3 shadow-lg ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          <div className="flex items-center gap-2">
            {toast.type === "error" && <AlertCircle className="h-5 w-5" />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Backups</h1>
          <p className="text-sm text-slate-600">Gerenciamento de backups do banco de dados</p>
        </div>
        {canPerformAdminOps && (
          <Button onClick={() => setIsCreateDialogOpen(true)} disabled={isCreatingBackup}>
            {isCreatingBackup ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Criar Backup
              </>
            )}
          </Button>
        )}
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button onClick={() => setActiveTab("backups")} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "backups" ? "border-b-2 border-blue-500 text-blue-600" : "text-slate-600 hover:text-slate-900"}`}>
          <Database className="mr-2 inline-block h-4 w-4" />
          Backups
        </button>
        {canPerformAdminOps && (
          <button onClick={() => setActiveTab("schedules")} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "schedules" ? "border-b-2 border-blue-500 text-blue-600" : "text-slate-600 hover:text-slate-900"}`}>
            <Calendar className="mr-2 inline-block h-4 w-4" />
            Agendamentos
          </button>
        )}
      </div>

      {activeTab === "backups" ? (
        <>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>
              {Object.keys(filters).length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Input id="startDate" type="date" value={filters.startDate || ""} onChange={(e) => handleFilterChange({ ...filters, startDate: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input id="endDate" type="date" value={filters.endDate || ""} onChange={(e) => handleFilterChange({ ...filters, endDate: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="backupType">Tipo</Label>
                  <Select value={filters.backupType || "all"} onValueChange={(value) => handleFilterChange({ ...filters, backupType: value === "all" ? undefined : (value as "full" | "selective") })}>
                    <SelectTrigger id="backupType">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="full">Completo</SelectItem>
                      <SelectItem value="selective">Seletivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange({ ...filters, status: value === "all" ? undefined : (value as Backup["status"]) })}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                      <SelectItem value="in_progress">Em Progresso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 lg:col-span-4">
                  <Button onClick={applyFilters} className="w-full">
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {isLoadingBackups ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : backups.length === 0 ? (
            <Card className="p-12 text-center">
              <Database className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">Nenhum backup encontrado</h3>
              <p className="mt-2 text-sm text-slate-600">{canPerformAdminOps ? "Crie seu primeiro backup para começar." : "Não há backups disponíveis no momento."}</p>
            </Card>
          ) : (
            <BackupTable backups={backups} onRestore={(backup) => { setSelectedBackup(backup); setIsRestoreDialogOpen(true); }} onDelete={(backup) => { setSelectedBackup(backup); setIsDeleteDialogOpen(true); }} onDownload={handleDownloadBackup} userRole={userRole} />
          )}
        </>
      ) : (
        <>
          {canPerformAdminOps && (
            <div className="flex justify-end">
              <Button onClick={() => { setSelectedSchedule(null); setIsScheduleDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Agendamento
              </Button>
            </div>
          )}

          {isLoadingSchedules ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <ScheduleList schedules={schedules} onEdit={(schedule) => { setSelectedSchedule(schedule); setIsScheduleDialogOpen(true); }} onDelete={(schedule: BackupSchedule) => void handleDeleteSchedule(schedule.id)} onToggleEnabled={(schedule: BackupSchedule) => { void handleUpdateSchedule(schedule.id, { enabled: !schedule.enabled }); }} />
          )}
        </>
      )}

      <CreateBackupDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSubmit={handleCreateBackup} availableTables={availableTables} isSubmitting={isCreatingBackup} />

      {selectedBackup && (
        <RestoreConfirmDialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen} backup={selectedBackup} onConfirm={handleRestoreBackup} isRestoring={isRestoringBackup} />
      )}

      {selectedBackup && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>Tem certeza que deseja excluir este backup? Esta ação não pode ser desfeita.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeletingBackup}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteBackup} disabled={isDeletingBackup}>
                {isDeletingBackup ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {canPerformAdminOps && (
        <ScheduleDialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen} schedule={selectedSchedule} availableTables={availableTables} onSubmit={async (input) => { if (selectedSchedule) { await handleUpdateSchedule(selectedSchedule.id, input as UpdateScheduleInput); } else { await handleCreateSchedule(input as CreateScheduleInput); } }} isSubmitting={isSubmittingSchedule} />
      )}
    </div>
  );
}
