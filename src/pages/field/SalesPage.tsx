import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FieldLayout } from '@/components/layout/FieldLayout';
import { FieldButton } from '@/components/ui/FieldButton';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Plus, Building2, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Sale, SaleType } from '@/types/database';

export default function SalesPage() {
  const { user, isLoading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [saleType, setSaleType] = useState<SaleType>('b2c');
  const [sku, setSku] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSales();
    }
  }, [user]);

  const fetchSales = async () => {
    if (!user) return;
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', user.id)
      .order('sold_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setSales(data as Sale[]);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!user || !sku) {
      toast.error('Please enter SKU');
      return;
    }
    
    setIsSaving(true);
    const price = parseFloat(unitPrice) || 0;

    try {
      const { error } = await supabase.from('sales').insert({
        user_id: user.id,
        sale_type: saleType,
        sku,
        product_name: productName || null,
        quantity,
        unit_price: price,
        total_amount: price * quantity,
        customer_name: customerName || null,
        sold_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success('Sale recorded!');
      setShowForm(false);
      setSku('');
      setProductName('');
      setQuantity(1);
      setUnitPrice('');
      setCustomerName('');
      fetchSales();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <FieldLayout title="Sales">
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </FieldLayout>
    );
  }

  if (showForm) {
    return (
      <FieldLayout title="Record Sale" showNav={false}>
        <div className="py-4 space-y-5">
          {/* Sale Type Toggle */}
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              Sale Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSaleType('b2c')}
                className={`card-field flex items-center gap-3 ${
                  saleType === 'b2c' ? 'border-primary border-4' : ''
                }`}
              >
                <Users className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-bold">B2C</p>
                  <p className="text-xs text-muted-foreground">Consumer</p>
                </div>
              </button>
              <button
                onClick={() => setSaleType('b2b')}
                className={`card-field flex items-center gap-3 ${
                  saleType === 'b2b' ? 'border-secondary border-4' : ''
                }`}
              >
                <Building2 className="w-8 h-8 text-secondary" />
                <div className="text-left">
                  <p className="font-bold">B2B</p>
                  <p className="text-xs text-muted-foreground">Business</p>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              SKU / Product Code *
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="input-field"
              placeholder="e.g., PRD-001"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              Product Name
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="input-field"
              placeholder="Product name"
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
              Unit Price
            </label>
            <input
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="input-field"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              {saleType === 'b2b' ? 'Business Name' : 'Customer Name'}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input-field"
              placeholder="Name (optional)"
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
              Save Sale
            </FieldButton>
          </div>
        </div>
      </FieldLayout>
    );
  }

  return (
    <FieldLayout title="Sales">
      <div className="py-4 space-y-4">
        <FieldButton
          variant="primary"
          size="lg"
          className="w-full"
          icon={<Plus className="w-6 h-6" />}
          onClick={() => setShowForm(true)}
        >
          Record Sale
        </FieldButton>

        {sales.length === 0 ? (
          <div className="card-field text-center py-10">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold">No sales yet</p>
            <p className="text-muted-foreground">Record your first sale</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => (
              <div key={sale.id} className="card-field flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  sale.sale_type === 'b2b' ? 'bg-secondary/20' : 'bg-primary/10'
                }`}>
                  {sale.sale_type === 'b2b' ? (
                    <Building2 className="w-6 h-6 text-secondary" />
                  ) : (
                    <Users className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {sale.product_name || sale.sku}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(sale.sold_at), 'MMM d, h:mm a')}
                    <span className="ml-2">• Qty: {sale.quantity}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    ₹{sale.total_amount?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase">{sale.sale_type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FieldLayout>
  );
}
