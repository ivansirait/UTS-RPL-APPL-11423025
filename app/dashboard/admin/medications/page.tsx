'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { User, Medication } from '@/types';

interface MedicationFormData {
  name: string;
  generic_name?: string;
  strength?: string;
  unit?: string;
  form?: string;
  manufacturer?: string;
  description?: string;
  price?: number;
  stock_quantity?: number;
  reorder_level?: number;
}

export default function AdminMedicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [formData, setFormData] = useState<MedicationFormData>({
    name: '',
    generic_name: '',
    strength: '',
    unit: '',
    form: '',
    manufacturer: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    reorder_level: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        router.push('/');
        return;
      }
      setUser(parsedUser);
      fetchMedications();
    } catch (error) {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchMedications = async () => {
    try {
      const response = await fetch('/api/pharmacy/medications');
      if (response.ok) {
        const data = await response.json();
        setMedications(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch medications:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingMedication ? `/api/pharmacy/medications/${editingMedication.id}` : '/api/pharmacy/medications';
      const method = editingMedication ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchMedications();
        setDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save medication:', error);
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      generic_name: medication.generic_name || '',
      strength: medication.strength || '',
      unit: medication.unit || '',
      form: medication.form || '',
      manufacturer: medication.manufacturer || '',
      description: medication.description || '',
      price: medication.price || 0,
      stock_quantity: medication.stock_quantity,
      reorder_level: medication.reorder_level,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (medicationId: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) return;

    try {
      const response = await fetch(`/api/pharmacy/medications/${medicationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMedications();
      }
    } catch (error) {
      console.error('Failed to delete medication:', error);
    }
  };

  const resetForm = () => {
    setEditingMedication(null);
    setFormData({
      name: '',
      generic_name: '',
      strength: '',
      unit: '',
      form: '',
      manufacturer: '',
      description: '',
      price: 0,
      stock_quantity: 0,
      reorder_level: 0,
    });
  };

  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock <= reorderLevel) return { status: 'Low Stock', color: 'bg-red-100 text-red-800' };
    if (stock <= reorderLevel * 1.5) return { status: 'Medium Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Good Stock', color: 'bg-green-100 text-green-800' };
  };

  if (loading || !user) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">MediTrack Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="font-medium text-foreground">{user.full_name}</div>
              <div className="text-muted-foreground capitalize">{user.role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Medications Management</h1>
            <p className="text-muted-foreground">Manage medication inventory and stock levels</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingMedication ? 'Edit Medication' : 'Add New Medication'}</DialogTitle>
                <DialogDescription>
                  {editingMedication ? 'Update medication information' : 'Add a new medication to inventory'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="generic_name">Generic Name</Label>
                    <Input
                      id="generic_name"
                      value={formData.generic_name}
                      onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="strength">Strength</Label>
                    <Input
                      id="strength"
                      value={formData.strength}
                      onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="form">Form</Label>
                    <Input
                      id="form"
                      value={formData.form}
                      onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reorder_level">Reorder Level *</Label>
                    <Input
                      id="reorder_level"
                      type="number"
                      value={formData.reorder_level}
                      onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingMedication ? 'Update' : 'Create'} Medication
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Medications Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Medications</CardTitle>
            <CardDescription>Total medications: {medications.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((medication) => {
                  const stockStatus = getStockStatus(medication.stock_quantity, medication.reorder_level);
                  return (
                    <TableRow key={medication.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{medication.name}</div>
                          {medication.generic_name && (
                            <div className="text-sm text-muted-foreground">{medication.generic_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{medication.strength} {medication.unit}</TableCell>
                      <TableCell>{medication.stock_quantity}</TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>
                          {stockStatus.status}
                        </Badge>
                      </TableCell>
                      <TableCell>${medication.price?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(medication)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(medication.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}