import { useState } from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Package } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// ✅ Helper function to sanitize timestamps and empty strings
// Generic sanitizer — preserves the input type so TS stays happy
const sanitizeTimestamps = <T extends Record<string, any>>(obj: T): T => {
  const out: Record<string, any> = { ...obj };
  for (const k of Object.keys(out)) {
    if (/(_at|_date|date|time)$/i.test(k) && (out[k] === '' || out[k] === undefined)) {
      out[k] = null;
    }
    if (out[k] === '') out[k] = null;
  }
  return out as T;
};


const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '' as 'chicken' | 'red_meat' | 'chilli_condiments' | 'other' | '',
    stock_quantity: '10',
    is_active: true,
    image_url: ''
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);

      setProductForm({ ...productForm, image_url: data.publicUrl });
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
      setImageFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!productForm.name.trim() || !productForm.price) {
        throw new Error('Product name and price are required');
      }

      let productData = {
        name: productForm.name.trim(),
        price: parseFloat(productForm.price),
        description: productForm.description.trim() || null,
        category: productForm.category || null,
        stock_quantity: parseInt(productForm.stock_quantity) || 10,
        is_active: productForm.is_active,
        image_url: productForm.image_url || null
        // add timestamp fields if needed later, e.g. created_at: new Date().toISOString()
      };

      // ✅ Sanitize before insert (fixes timestamptz "" error)
      productData = sanitizeTimestamps(productData);

      const { error } = await supabase.from('products').insert([productData]);
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product created successfully',
      });

      // Reset form
      setProductForm({
        name: '',
        price: '',
        description: '',
        category: '',
        stock_quantity: '10',
        is_active: true,
        image_url: ''
      });
      setImageFile(null);

    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {profile?.full_name || user?.email}</p>
            </div>
            <div className="flex space-x-4">
              <Link to="/admin/products">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Manage Products</span>
                </Button>
              </Link>
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Account Information</span>
                </CardTitle>
                <CardDescription>Your account details and role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-gray-900 font-medium">{user?.email}</p>
                </div>
                <div>
                  <Label>Full Name</Label>
                  <p className="text-gray-900 font-medium">{profile?.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <p className="text-gray-900 font-medium capitalize">{profile?.role || 'user'}</p>
                </div>
                <div>
                  <Label>Member Since</Label>
                  <p className="text-gray-900 font-medium">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Create Product Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add New Product</span>
                </CardTitle>
                <CardDescription>Create a new product for your shop</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={productForm.stock_quantity}
                        onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={productForm.category}
                      onValueChange={(value: 'chicken' | 'red_meat' | 'chilli_condiments' | 'other') =>
                        setProductForm({ ...productForm, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chicken">Chicken</SelectItem>
                        <SelectItem value="red_meat">Red Meat</SelectItem>
                        <SelectItem value="chilli_condiments">Chilli Condiments</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="image">Product Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    {uploading && (
                      <div className="flex items-center mt-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <p className="text-sm text-gray-500">Uploading...</p>
                      </div>
                    )}
                    {productForm.image_url && (
                      <div className="mt-2">
                        <img
                          src={productForm.image_url}
                          alt="Product preview"
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      rows={3}
                      placeholder="Describe your product..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={productForm.is_active}
                      onCheckedChange={(checked) => setProductForm({ ...productForm, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Product is active</Label>
                  </div>

                  <Button type="submit" disabled={loading || uploading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Product
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
