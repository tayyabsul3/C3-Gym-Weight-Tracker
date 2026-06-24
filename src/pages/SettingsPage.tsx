import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { User, Shield, Info, Download, Upload, Trash2, CheckCircle2 } from 'lucide-react';

interface Profile {
  name: string;
  goal: string;
}

interface SettingsPageProps {
  profile: Profile;
  updateProfile: (profile: Profile) => void;
  exportData: () => void;
  importData: (jsonData: any) => boolean;
  clearAllData: () => void;
  loadDemoSeedData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  profile,
  updateProfile,
  exportData,
  importData,
  clearAllData,
  loadDemoSeedData
}) => {
  const [profileName, setProfileName] = useState(profile.name);
  const [profileGoal, setProfileGoal] = useState(profile.goal);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profileName.trim() || 'Trainee',
      goal: profileGoal.trim() || 'Build muscle, get stronger'
    });
    alert('✅ Profile updated successfully!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        const success = importData(json);
        if (success) {
          alert('✅ Workout data imported successfully!');
        } else {
          alert('❌ Invalid workout backup file structure.');
        }
      } catch (err) {
        alert('❌ Failed to parse JSON. Ensure it\'s a valid backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input selection
  };

  const triggerImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleResetData = () => {
    if (window.confirm('⚠️ WARNING: This will permanently delete ALL your workout logs and attendance history. This action CANNOT be undone. Proceed?')) {
      if (window.confirm('Double checking: Are you absolutely sure you want to reset everything?')) {
        clearAllData();
        setProfileName('Trainee');
        setProfileGoal('Build muscle, get stronger');
        alert('🗑️ Database reset successfully.');
      }
    }
  };

  const handleLoadDemo = () => {
    if (window.confirm('💡 Load baseline demo seed data? This will merge/add logs for demonstration trends.')) {
      loadDemoSeedData();
      setProfileName('Trainee');
      setProfileGoal('Build muscle, get stronger');
      alert('✅ Demo data loaded! Check the workout list and progress dashboards.');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 font-body">
      
      {/* Header */}
      <div className="border-b border-border pb-4 mb-6 text-center md:text-left">
        <h2 className="font-display text-2xl font-black uppercase text-textPrimary tracking-wide">
          Settings Console
        </h2>
        <p className="text-xs text-textSecondary font-mono tracking-widest mt-1 uppercase">
          Profile &amp; Database Tools
        </p>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json"
        className="hidden" 
      />

      <div className="space-y-6">
        
        {/* Profile Card */}
        <Card className="border-border">
          <h3 className="font-display text-sm font-black uppercase text-textPrimary tracking-wide mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Profile configuration
          </h3>
          
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-textSecondary uppercase mb-1">
                Trainee Name
              </label>
              <Input
                placeholder="Trainee"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-mono font-bold text-textSecondary uppercase mb-1">
                Primary Goal
              </label>
              <textarea
                rows={2}
                placeholder="Build muscle, get stronger"
                value={profileGoal}
                onChange={(e) => setProfileGoal(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface2 px-3.5 py-2 text-sm text-textPrimary placeholder:text-textSecondary outline-none transition-all duration-200 focus:border-primary focus:shadow-focus"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full uppercase font-bold text-xs">
              Save Profile Changes
            </Button>
          </form>
        </Card>

        {/* Database backup / restore tools */}
        <Card className="border-border">
          <h3 className="font-display text-sm font-black uppercase text-textPrimary tracking-wide mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Database Sovereignty
          </h3>
          <p className="text-xs text-textSecondary leading-relaxed mb-4">
            Your workout logs are saved locally in this browser sandbox. Use these export options to backup logs before clearing data or moving between devices.
          </p>

          <div className="space-y-3">
            <Button 
              onClick={exportData} 
              variant="outline" 
              className="w-full uppercase font-bold text-xs justify-start"
            >
              <Download className="w-4.5 h-4.5 mr-2 text-primary" />
              Export Workout Database
            </Button>

            <Button 
              onClick={triggerImportClick} 
              variant="outline" 
              className="w-full uppercase font-bold text-xs justify-start"
            >
              <Upload className="w-4.5 h-4.5 mr-2 text-secondary" />
              Import Workout File
            </Button>

            <Button 
              onClick={handleLoadDemo} 
              variant="outline" 
              className="w-full uppercase font-bold text-xs justify-start border-success/35 text-success hover:border-success/60 hover:text-success"
            >
              <CheckCircle2 className="w-4.5 h-4.5 mr-2 text-success" />
              Load baseline demo seed logs
            </Button>

            <Button 
              onClick={handleResetData} 
              variant="danger" 
              className="w-full uppercase font-bold text-xs"
            >
              <Trash2 className="w-4.5 h-4.5 mr-2 text-black" />
              Clear all logs (Factory Reset)
            </Button>
          </div>
        </Card>

        {/* About Card */}
        <Card className="border-border bg-surface/50">
          <h3 className="font-display text-sm font-black uppercase text-textPrimary tracking-wide mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" /> LiftLog Info
          </h3>
          <div className="text-xs text-textSecondary space-y-1.5 leading-relaxed font-mono">
            <div>CONSOLE VERSION: 2.0 (REACT + TAILWIND PWA)</div>
            <div>TRACKING MODE: OFFLINE LOCALSTORAGE</div>
            <div>ACCESSIBILITY TARGET: 4.5:1 CONTRAST RATIO</div>
            <div>STATUS: RUNNING LOCAL SANDBOX</div>
          </div>
        </Card>

      </div>

    </div>
  );
};
