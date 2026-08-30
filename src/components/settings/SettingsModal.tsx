import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { 
  Settings, 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  User, 
  Check 
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserProfile, exportDataJSON, importDataJSON, resetAllData } = useWorkout();

  const [name, setName] = useState(userProfile.name);
  const [age, setAge] = useState(userProfile.age);
  const [weightKg, setWeightKg] = useState(userProfile.weightKg);
  const [heightCm, setHeightCm] = useState(userProfile.heightCm);
  const [goal, setGoal] = useState(userProfile.goal);
  const [importText, setImportText] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      age,
      weightKg,
      heightCm,
      goal
    });
    showNotification('Perfil actualizado correctamente.');
  };

  const handleExport = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartfit_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Respaldo descargado exitosamente.');
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const success = importDataJSON(importText);
    if (success) {
      showNotification('Datos importados correctamente.');
      setImportText('');
    } else {
      alert('Error al importar el archivo JSON. Verifica el formato.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Configuración y Respaldos</h3>
              <p className="text-xs text-zinc-400">Personaliza tu perfil y gestiona tus datos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        {notification && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check size={16} />
            <span>{notification}</span>
          </div>
        )}

        {/* Profile Settings Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
            <User size={14} /> Datos de Usuario
          </h4>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Nombre / Alias</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Edad</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-yellow-400 font-mono font-bold focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Altura (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Objetivo Nutricional</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500"
            >
              <option value="hipertrofia_limpia">Hipertrofia Limpia (Superávit +10%)</option>
              <option value="mantenimiento">Mantenimiento (TDEE)</option>
              <option value="definicion">Definición (Déficit -20%)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Save size={14} /> Guardar Cambios de Perfil
          </button>
        </form>

        {/* Data Backup & Restore */}
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Download size={14} className="text-yellow-400" /> Copia de Seguridad & Sincronización
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExport}
              className="py-2.5 px-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-800 flex items-center justify-center gap-1.5 transition-all"
            >
              <Download size={14} /> Exportar JSON
            </button>

            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e: any) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const text = event.target?.result as string;
                      if (text && importDataJSON(text)) {
                        showNotification('Datos importados desde archivo.');
                      }
                    };
                    reader.readAsText(file);
                  }
                };
                input.click();
              }}
              className="py-2.5 px-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-800 flex items-center justify-center gap-1.5 transition-all"
            >
              <Upload size={14} /> Cargar Archivo JSON
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="O pega aquí el contenido JSON de tu respaldo..."
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-[11px] font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
            />
            {importText.trim() && (
              <button
                onClick={handleImport}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 text-xs font-bold rounded-xl"
              >
                Importar Texto Pegado
              </button>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-zinc-800">
          <button
            onClick={resetAllData}
            className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/30 flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCcw size={14} /> Restablecer Todos los Datos
          </button>
        </div>
      </div>
    </div>
  );
};
