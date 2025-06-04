import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Save, Building, Globe, AlertTriangle } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const SettingsPage = () => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    minStockThreshold: 10,
    company: {
      name: 'O.T.R.A FOOD DISTRIBUTION',
      address: '',
      phone: '',
      email: '',
      logo: '',
    },
    locale: {
      language: 'en',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
    },
  });
  
  // Fetch settings on initial load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_URL}/settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchSettings();
    }
  }, [token]);
  
  // Handle form input changes
  const handleChange = (e, section, field) => {
    const { value } = e.target;
    
    if (section) {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setSettings(prev => ({ ...prev, [field]: value }));
    }
  };
  
  // Handle select changes
  const handleSelectChange = (value, section, field) => {
    if (section) {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setSettings(prev => ({ ...prev, [field]: value }));
    }
  };
  
  // Save settings
  const saveSettings = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      
      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user is admin
  const isAdmin = user && user.role === 'admin';
  
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Settings</CardTitle>
          <CardDescription>Configure system-wide settings and preferences</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="general" className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                Company Details
              </TabsTrigger>
              <TabsTrigger value="locale" className="flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Localization
              </TabsTrigger>
            </TabsList>
            
            {/* General Settings */}
            <TabsContent value="general">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="minStockThreshold">Minimum Stock Threshold</Label>
                  <div className="flex items-center">
                    <Input
                      id="minStockThreshold"
                      type="number"
                      value={settings.minStockThreshold}
                      onChange={(e) => handleChange(e, null, 'minStockThreshold')}
                      disabled={!isAdmin || loading}
                      className="max-w-xs"
                    />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Products below this value will be flagged as low stock
                    </span>
                  </div>
                </div>
                
                {/* Add other general settings here */}
              </div>
            </TabsContent>
            
            {/* Company Details */}
            <TabsContent value="company">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={settings.company.name}
                    onChange={(e) => handleChange(e, 'company', 'name')}
                    disabled={!isAdmin || loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Input
                    id="companyAddress"
                    value={settings.company.address}
                    onChange={(e) => handleChange(e, 'company', 'address')}
                    disabled={!isAdmin || loading}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Phone Number</Label>
                    <Input
                      id="companyPhone"
                      value={settings.company.phone}
                      onChange={(e) => handleChange(e, 'company', 'phone')}
                      disabled={!isAdmin || loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Email Address</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={settings.company.email}
                      onChange={(e) => handleChange(e, 'company', 'email')}
                      disabled={!isAdmin || loading}
                    />
                  </div>
                </div>
                
                {/* Logo upload section - Simplified version */}
                <div className="space-y-2">
                  <Label htmlFor="companyLogo">Logo URL</Label>
                  <Input
                    id="companyLogo"
                    value={settings.company.logo}
                    onChange={(e) => handleChange(e, 'company', 'logo')}
                    placeholder="Enter logo URL"
                    disabled={!isAdmin || loading}
                  />
                  {settings.company.logo && (
                    <div className="mt-2">
                      <img 
                        src={settings.company.logo} 
                        alt="Company Logo" 
                        className="h-16 object-contain rounded border border-border"
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Localization Settings */}
            <TabsContent value="locale">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={settings.locale.language}
                    onValueChange={(value) => handleSelectChange(value, 'locale', 'language')}
                    disabled={!isAdmin || loading}
                  >
                    <SelectTrigger id="language" className="w-full max-w-xs">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.locale.currency}
                    onValueChange={(value) => handleSelectChange(value, 'locale', 'currency')}
                    disabled={!isAdmin || loading}
                  >
                    <SelectTrigger id="currency" className="w-full max-w-xs">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={settings.locale.dateFormat}
                    onValueChange={(value) => handleSelectChange(value, 'locale', 'dateFormat')}
                    disabled={!isAdmin || loading}
                  >
                    <SelectTrigger id="dateFormat" className="w-full max-w-xs">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <Separator />
        
        <CardFooter className="flex justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            {isAdmin ? 'Changes will apply system-wide' : 'Only administrators can modify settings'}
          </div>
          
          <Button
            onClick={saveSettings}
            disabled={loading || !isAdmin}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SettingsPage; 