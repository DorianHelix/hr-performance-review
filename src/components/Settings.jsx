import React, { useState, useEffect } from 'react';
import { Save, Check, AlertCircle, Store, Database, Bell, Shield, Globe, Palette, Key, Settings as SettingsIcon } from 'lucide-react';

function Settings() {
  const [activeTab, setActiveTab] = useState('shopify');
  const [settings, setSettings] = useState({
    shopify: {
      storeDomain: '',
      accessToken: '',
      autoSync: false,
      syncInterval: 60
    },
    general: {
      companyName: 'Helix Finance',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      language: 'en'
    },
    notifications: {
      emailAlerts: true,
      stockAlerts: true,
      alertThreshold: 10,
      emailAddress: ''
    }
  });
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Load settings from database
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/settings');
      const data = await response.json();
      
      // Check for Shopify credentials saved in individual keys
      const shopifySettings = {
        ...settings.shopify
      };
      
      if (data.shopify_store_domain) {
        shopifySettings.storeDomain = data.shopify_store_domain;
      }
      if (data.shopify_access_token) {
        shopifySettings.accessToken = data.shopify_access_token;
      }
      
      // Merge with default settings
      if (data.shopify) {
        Object.assign(shopifySettings, data.shopify);
      }
      
      setSettings(prev => ({
        ...prev,
        shopify: shopifySettings,
        general: data.general ? { ...prev.general, ...data.general } : prev.general,
        notifications: data.notifications ? { ...prev.notifications, ...data.notifications } : prev.notifications
      }));
    } catch (error) {
      // Fallback to localStorage if database fails
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Save to database
      const response = await fetch('http://localhost:3001/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        // Also save to localStorage as backup
        localStorage.setItem('appSettings', JSON.stringify(settings));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      // Fallback to localStorage
      localStorage.setItem('appSettings', JSON.stringify(settings));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const testShopifyConnection = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/shopify/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeDomain: settings.shopify.storeDomain,
          accessToken: settings.shopify.accessToken
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setTestResult({
          success: true,
          message: `Successfully connected to ${data.shop.name}`,
          details: data.shop
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Connection failed'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to connect: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const syncProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/shopify/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeDomain: settings.shopify.storeDomain,
          accessToken: settings.shopify.accessToken,
          saveToDb: true
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setTestResult({
          success: true,
          message: `Successfully synced ${data.count} products`
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Sync failed'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to sync: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'shopify', label: 'Shopify Integration', icon: Store },
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <header className="glass-card-large mb-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-white mb-2">
              <div className="glass-card p-2 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-600/20 border-blue-400/30">
                <SettingsIcon size={24} className="text-blue-300" />
              </div>
              Settings
            </h1>
            <p className="text-white/60 text-lg">
              Configure your application preferences and integrations
            </p>
          </div>
        </div>
      </header>
        
      <div className="glass-card-large rounded-3xl overflow-hidden flex-1">
          {/* Tab Navigation */}
          <div className="border-b border-white/10">
            <nav className="flex space-x-2 px-6 pt-4" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-t-2xl font-medium text-sm transition-all duration-300
                      ${activeTab === tab.id
                        ? 'glass-card bg-gradient-to-br from-blue-400/20 to-purple-600/20 text-white border-b-2 border-blue-400'
                        : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Shopify Integration Tab */}
            {activeTab === 'shopify' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Shopify API Configuration</h2>
                  <p className="text-sm text-white/60 mb-6">
                    Connect your Shopify store to sync products and inventory data.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Store Domain
                    </label>
                    <input
                      type="text"
                      value={settings.shopify.storeDomain}
                      onChange={(e) => setSettings({
                        ...settings,
                        shopify: { ...settings.shopify, storeDomain: e.target.value }
                      })}
                      placeholder="your-store-name"
                      className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder-white/40"
                    />
                    <p className="mt-1 text-xs text-white/50">
                      Enter only the store name without .myshopify.com
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Access Token
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                      <input
                        type="password"
                        value={settings.shopify.accessToken}
                        onChange={(e) => setSettings({
                          ...settings,
                          shopify: { ...settings.shopify, accessToken: e.target.value }
                        })}
                        placeholder="shpat_xxxxxxxxxxxxx"
                        className="w-full pl-10 pr-3 py-2 glass-input rounded-xl text-white placeholder-white/40"
                      />
                    </div>
                    <p className="mt-1 text-xs text-white/50">
                      Your private app access token from Shopify Admin
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 glass-card rounded-xl">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoSync"
                        checked={settings.shopify.autoSync}
                        onChange={(e) => setSettings({
                          ...settings,
                          shopify: { ...settings.shopify, autoSync: e.target.checked }
                        })}
                        className="h-4 w-4 text-blue-400 focus:ring-blue-500 border-white/20 rounded bg-white/10"
                      />
                      <label htmlFor="autoSync" className="ml-2 block text-sm text-white">
                        Enable automatic synchronization
                      </label>
                    </div>
                    {settings.shopify.autoSync && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-white/60">Sync every</label>
                        <input
                          type="number"
                          value={settings.shopify.syncInterval}
                          onChange={(e) => setSettings({
                            ...settings,
                            shopify: { ...settings.shopify, syncInterval: parseInt(e.target.value) }
                          })}
                          className="w-20 px-2 py-1 glass-input rounded text-sm text-white"
                          min="5"
                          max="1440"
                        />
                        <span className="text-sm text-white/60">minutes</span>
                      </div>
                    )}
                  </div>

                  {/* Test Connection Button */}
                  <div className="flex gap-3">
                    <button
                      onClick={testShopifyConnection}
                      disabled={loading || !settings.shopify.storeDomain || !settings.shopify.accessToken}
                      className="glass-button px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? 'Testing...' : 'Test Connection'}
                    </button>
                    
                    <button
                      onClick={syncProducts}
                      disabled={loading || !settings.shopify.storeDomain || !settings.shopify.accessToken}
                      className="glass-button-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? 'Syncing...' : 'Sync Products Now'}
                    </button>
                  </div>

                  {/* Clear Shopify Data */}
                  <div className="mt-6 p-4 glass-card rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-400/20">
                    <h3 className="text-sm font-semibold text-red-300 mb-2">Security</h3>
                    <p className="text-xs text-white/60 mb-3">
                      This will remove Shopify API credentials from the database. Product data will be preserved.
                    </p>
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to clear Shopify API credentials? You will need to re-enter them to sync again.')) {
                          setLoading(true);
                          try {
                            const response = await fetch('http://localhost:3001/api/shopify/clear', {
                              method: 'DELETE'
                            });
                            
                            if (response.ok) {
                              setSettings({
                                ...settings,
                                shopify: {
                                  storeDomain: '',
                                  accessToken: '',
                                  autoSync: false,
                                  syncInterval: 60
                                }
                              });
                              setTestResult({
                                success: true,
                                message: 'Shopify API credentials cleared successfully'
                              });
                              // Reload settings to confirm cleared from database
                              setTimeout(loadSettings, 1000);
                            } else {
                              throw new Error('Failed to clear data');
                            }
                          } catch (error) {
                            setTestResult({
                              success: false,
                              message: 'Failed to clear data: ' + error.message
                            });
                          } finally {
                            setLoading(false);
                          }
                        }
                      }}
                      disabled={loading}
                      className="glass-button px-4 py-2 bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <AlertCircle size={16} />
                      Clear Shopify Credentials
                    </button>
                  </div>

                  {/* Test Result */}
                  {testResult && (
                    <div className={`p-4 rounded-xl flex items-start gap-3 glass-card ${
                      testResult.success ? 'bg-gradient-to-br from-green-400/20 to-green-600/20 text-green-300' : 'bg-gradient-to-br from-red-400/20 to-red-600/20 text-red-300'
                    }`}>
                      {testResult.success ? (
                        <Check className="w-5 h-5 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">{testResult.message}</p>
                        {testResult.details && (
                          <div className="mt-2 text-sm">
                            <p>Domain: {testResult.details.domain}</p>
                            <p>Currency: {testResult.details.currency}</p>
                            <p>Timezone: {testResult.details.timezone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">General Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={settings.general.companyName}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, companyName: e.target.value }
                      })}
                      className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.general.currency}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, currency: e.target.value }
                      })}
                      className="w-full px-3 py-2 glass-input rounded-xl text-white bg-white/5"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Date Format
                    </label>
                    <select
                      value={settings.general.dateFormat}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, dateFormat: e.target.value }
                      })}
                      className="w-full px-3 py-2 glass-input rounded-xl text-white bg-white/5"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Language
                    </label>
                    <select
                      value={settings.general.language}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, language: e.target.value }
                      })}
                      className="w-full px-3 py-2 glass-input rounded-xl text-white bg-white/5"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Notification Preferences</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 glass-card rounded-xl">
                    <div>
                      <label className="font-medium text-white">Email Alerts</label>
                      <p className="text-sm text-white/60">Receive email notifications for important events</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailAlerts}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, emailAlerts: e.target.checked }
                      })}
                      className="h-5 w-5 text-blue-400 focus:ring-blue-500 border-white/20 rounded bg-white/10"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 glass-card rounded-xl">
                    <div>
                      <label className="font-medium text-white">Low Stock Alerts</label>
                      <p className="text-sm text-white/60">Get notified when inventory is running low</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.stockAlerts}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, stockAlerts: e.target.checked }
                      })}
                      className="h-5 w-5 text-blue-400 focus:ring-blue-500 border-white/20 rounded bg-white/10"
                    />
                  </div>

                  {settings.notifications.stockAlerts && (
                    <div className="ml-4 p-4 border-l-4 border-blue-400/50 glass-card rounded-xl">
                      <label className="block text-sm font-medium text-white mb-2">
                        Alert Threshold
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={settings.notifications.alertThreshold}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, alertThreshold: parseInt(e.target.value) }
                          })}
                          className="w-24 px-3 py-2 glass-input rounded-lg text-white"
                          min="1"
                        />
                        <span className="text-sm text-white/60">items or less</span>
                      </div>
                    </div>
                  )}

                  {settings.notifications.emailAlerts && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Notification Email Address
                      </label>
                      <input
                        type="email"
                        value={settings.notifications.emailAddress}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, emailAddress: e.target.value }
                        })}
                        placeholder="admin@example.com"
                        className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder-white/40"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Security Settings</h2>
                  <p className="text-sm text-white/60">Manage your application's security preferences.</p>
                </div>
                <div className="p-8 glass-card rounded-xl text-center">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-white/40" />
                  <p className="text-white/60">Security settings coming soon</p>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Appearance Settings</h2>
                  <p className="text-sm text-white/60">Customize the look and feel of your application.</p>
                </div>
                <div className="p-8 glass-card rounded-xl text-center">
                  <Palette className="w-12 h-12 mx-auto mb-3 text-white/40" />
                  <p className="text-white/60">Theme customization coming soon</p>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 glass-card border-t border-white/10 flex justify-between items-center">
            <div>
              {saveStatus === 'saved' && (
                <span className="text-green-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Settings saved successfully
                </span>
              )}
            </div>
            <button
              onClick={handleSaveSettings}
              className="glass-button-primary px-6 py-2 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
  );
}

export default Settings;