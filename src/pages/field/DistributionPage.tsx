import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FieldLayout } from '@/components/layout/FieldLayout';
import { FieldButton } from '@/components/ui/FieldButton';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Package, Plus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Distribution } from '@/types/database';

export default function DistributionPage() {
  const { user, isLoading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [sampleName, setSampleName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDistributions();
    }
  }, [user]);

  const fetchDistributions = async () => {
    if (!user) return;
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('distributions')
      .select('*')
      .eq('user_id', user.id)
      .order('distributed_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setDistributions(data as Distribution[]);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!user || !sampleName) {
      toast.error('Please enter a sample name');
      return;
    }
    
    setIsSaving(true);

    try {
      const { error } = await supabase.from('distributions').insert({
        user_id: user.id,
        sample_name: sampleName,
        quantity,
        purpose: purpose || null,
        recipient_name: recipientName || null,
        distributed_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success('Distribution logged!');
      setShowForm(false);
      setSampleName('');
      setQuantity(1);
      setPurpose('');
      setRecipientName('');
      fetchDistributions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <FieldLayout title="Sample Distribution">
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </FieldLayout>
    );
  }

  if (showForm) {
    return (
      <FieldLayout title="Log Distribution" showNav={false}>
        <div className="py-4 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              Sample Name *
            </label>
            <input
              type="text"
              value={sampleName}
              onChange={(e) => setSampleName(e.target.value)}
              className="input-field"
              placeholder="e.g., Product A Sample"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-14 h-14 rounded-xl bg-muted text-2xl font-bold"
              >
                -
              </button>
              <span className="text-3xl font-bold w-16 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-14 h-14 rounded-xl bg-primary text-primary-foreground text-2xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              Recipient Name
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="input-field"
              placeholder="Who received it?"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              Purpose
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="input-field"
              placeholder="e.g., Demo, Trial"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <FieldButton
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </FieldButton>
            <FieldButton
              variant="success"
              size="lg"
              className="flex-1"
              onClick={handleSave}
              isLoading={isSaving}
            >
              Save
            </FieldButton>
          </div>
        </div>
      </FieldLayout>
    );
  }

  return (
    <FieldLayout title="Sample Distribution">
      <div className="py-4 space-y-4">
        <FieldButton
          variant="primary"
          size="lg"
          className="w-full"
          icon={<Plus className="w-6 h-6" />}
          onClick={() => setShowForm(true)}
        >
          Log Distribution
        </FieldButton>

        {distributions.length === 0 ? (
          <div className="card-field text-center py-10">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold">No distributions yet</p>
            <p className="text-muted-foreground">Log when you give out samples</p>
          </div>
        ) : (
          <div className="space-y-3">
            {distributions.map((dist) => (
              <div key={dist.id} className="card-field flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{dist.sample_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(dist.distributed_at), 'MMM d, h:mm a')}
                    <span className="ml-2">• Qty: {dist.quantity}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FieldLayout>
  );
}
