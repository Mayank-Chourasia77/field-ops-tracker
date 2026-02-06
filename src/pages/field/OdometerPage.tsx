import { useEffect, useState } from 'react';
import { FieldLayout } from '@/components/layout/FieldLayout';
import { FieldButton } from '@/components/ui/FieldButton';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';
import type { OdometerLog } from '@/types/database';

export default function OdometerPage() {
  const [reading, setReading] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [photoFile]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPhotoFile(file);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save your odometer reading.');
      return;
    }

    const readingValue = Number(reading);
    if (!reading || !Number.isFinite(readingValue) || readingValue <= 0) {
      toast.error('Please enter a valid odometer reading.');
      return;
    }

    setIsSaving(true);

    try {
      let photoPath: string | null = null;
      if (photoFile) {
        const extension = photoFile.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('odometer-photos')
          .upload(filePath, photoFile, { upsert: false });

        if (uploadError) throw uploadError;
        photoPath = filePath;
      }

      const { data, error } = await supabase
        .from('odometer_logs')
        .insert({
          user_id: user.id,
          reading_km: readingValue,
          photo_url: photoPath,
          recorded_at: new Date().toISOString(),
        })
        .select('*');

      if (error) throw error;

      const saved = (data?.[0] as OdometerLog | undefined) ?? null;
      if (saved) {
        window.dispatchEvent(new CustomEvent('odometer:recorded', { detail: saved }));
      }

      toast.success('Odometer reading saved!');
      setReading('');
      setPhotoFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save odometer reading.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FieldLayout title="Odometer">
      <div className="py-4">
        <div className="card-field space-y-5">
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              Odometer Reading (km)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={reading}
              onChange={(e) => setReading(e.target.value)}
              className="input-field"
              placeholder="Enter current reading"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Used for daily travel verification.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              Odometer Photo
            </label>
            <label className="block card-field border-dashed border-2 bg-muted/30 text-center space-y-3 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoChange}
              />
              {photoPreviewUrl ? (
                <div className="space-y-3">
                  <img
                    src={photoPreviewUrl}
                    alt="Odometer preview"
                    className="w-full max-h-64 object-contain rounded-xl border border-border"
                  />
                  <p className="text-sm text-muted-foreground">Tap to replace</p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Camera className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Upload photo</p>
                    <p className="text-sm text-muted-foreground">
                      Clear image of the odometer reading
                    </p>
                  </div>
                </>
              )}
            </label>
          </div>

          <FieldButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSave}
            isLoading={isSaving}
          >
            Save Odometer Reading
          </FieldButton>
        </div>
      </div>
    </FieldLayout>
  );
}
