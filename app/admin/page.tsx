"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { fetchSettings, saveSettings } from "@/app/actions/admin-settings"
import { Loader2 } from "lucide-react"

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<any>({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await fetchSettings()
      if (data) {
        setSettings(data)
      }
    } catch (error) {
      toast.error("Gagal memuat pengaturan")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (path: string, value: any) => {
    const keys = path.split(".")
    const newSettings = JSON.parse(JSON.stringify(settings))
    let current = newSettings

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }

    current[keys[keys.length - 1]] = value
    setSettings(newSettings)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await saveSettings(settings)
      toast.success("Pengaturan berhasil disimpan")
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Kelola semua pengaturan aplikasi</p>
        </div>

        <Tabs defaultValue="pterodactyl" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pterodactyl">Pterodactyl</TabsTrigger>
            <TabsTrigger value="app">Aplikasi</TabsTrigger>
            <TabsTrigger value="payment">Pembayaran</TabsTrigger>
            <TabsTrigger value="services">Layanan</TabsTrigger>
          </TabsList>

          {/* Pterodactyl Settings */}
          <TabsContent value="pterodactyl" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Pterodactyl</CardTitle>
                <CardDescription>Konfigurasi API dan server Pterodactyl</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain Panel</Label>
                  <Input
                    id="domain"
                    placeholder="https://panel.example.com"
                    value={settings.pterodactylConfig?.domain || ""}
                    onChange={(e) => handleInputChange("pterodactylConfig.domain", e.target.value)}
                  />
                  <p className="text-sm text-gray-500">URL domain panel Pterodactyl Anda</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Masukkan API Key Pterodactyl"
                    value={settings.pterodactylConfig?.apiKey || ""}
                    onChange={(e) => handleInputChange("pterodactylConfig.apiKey", e.target.value)}
                  />
                  <p className="text-sm text-gray-500">API Key untuk authentikasi ke Pterodactyl Panel</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nests">Nests ID</Label>
                    <Input
                      id="nests"
                      placeholder="5"
                      value={settings.pterodactylConfig?.nests || ""}
                      onChange={(e) => handleInputChange("pterodactylConfig.nests", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="egg">Egg ID</Label>
                    <Input
                      id="egg"
                      placeholder="15"
                      value={settings.pterodactylConfig?.egg || ""}
                      onChange={(e) => handleInputChange("pterodactylConfig.egg", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nestsGame">Nests Game ID</Label>
                    <Input
                      id="nestsGame"
                      placeholder="2"
                      value={settings.pterodactylConfig?.nestsGame || ""}
                      onChange={(e) => handleInputChange("pterodactylConfig.nestsGame", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location ID</Label>
                    <Input
                      id="location"
                      placeholder="1"
                      value={settings.pterodactylConfig?.location || ""}
                      onChange={(e) => handleInputChange("pterodactylConfig.location", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Settings */}
          <TabsContent value="app" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Aplikasi</CardTitle>
                <CardDescription>Konfigurasi umum aplikasi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nameHost">Nama Host</Label>
                  <Input
                    id="nameHost"
                    placeholder="Nama Host"
                    value={settings.appConfig?.nameHost || ""}
                    onChange={(e) => handleInputChange("appConfig.nameHost", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappGroupLink">Link WhatsApp Group</Label>
                  <Input
                    id="whatsappGroupLink"
                    placeholder="https://whatsapp.com/channel/..."
                    value={settings.appConfig?.whatsappGroupLink || ""}
                    onChange={(e) => handleInputChange("appConfig.whatsappGroupLink", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="feeMin">Minimal Fee</Label>
                    <Input
                      id="feeMin"
                      type="number"
                      placeholder="10"
                      value={settings.appConfig?.feeMin || ""}
                      onChange={(e) => handleInputChange("appConfig.feeMin", parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feeMax">Maksimal Fee</Label>
                    <Input
                      id="feeMax"
                      type="number"
                      placeholder="50"
                      value={settings.appConfig?.feeMax || ""}
                      onChange={(e) => handleInputChange("appConfig.feeMax", parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Garansi</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warrantyDays">Hari Garansi</Label>
                      <Input
                        id="warrantyDays"
                        type="number"
                        placeholder="12"
                        value={settings.appConfig?.garansi?.warrantyDays || ""}
                        onChange={(e) => handleInputChange("appConfig.garansi.warrantyDays", parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="replaceLimit">Limit Replace/Claim</Label>
                      <Input
                        id="replaceLimit"
                        type="number"
                        placeholder="3"
                        value={settings.appConfig?.garansi?.replaceLimit || ""}
                        onChange={(e) => handleInputChange("appConfig.garansi.replaceLimit", parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Pembayaran</CardTitle>
                <CardDescription>Konfigurasi API pembayaran dan email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Payment Gateway API</h3>
                  <div className="space-y-2">
                    <Label htmlFor="api_key">API Key</Label>
                    <Input
                      id="api_key"
                      type="password"
                      placeholder="KEY-..."
                      value={settings.appConfig?.pay?.api_key || ""}
                      onChange={(e) => handleInputChange("appConfig.pay.api_key", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api_id">API ID</Label>
                    <Input
                      id="api_id"
                      type="password"
                      placeholder="ID-..."
                      value={settings.appConfig?.pay?.api_id || ""}
                      onChange={(e) => handleInputChange("appConfig.pay.api_id", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Email Configuration</h3>
                  <div className="space-y-2">
                    <Label htmlFor="emailHost">Email Host</Label>
                    <Input
                      id="emailHost"
                      placeholder="mail.example.com"
                      value={settings.appConfig?.emailSender?.host || ""}
                      onChange={(e) => handleInputChange("appConfig.emailSender.host", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailUser">Email User</Label>
                      <Input
                        id="emailUser"
                        type="email"
                        placeholder="your-email@gmail.com"
                        value={settings.appConfig?.emailSender?.auth?.user || ""}
                        onChange={(e) => handleInputChange("appConfig.emailSender.auth.user", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailPass">Email Password</Label>
                      <Input
                        id="emailPass"
                        type="password"
                        placeholder="your-app-password"
                        value={settings.appConfig?.emailSender?.auth?.pass || ""}
                        onChange={(e) => handleInputChange("appConfig.emailSender.auth.pass", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailFrom">Email From</Label>
                    <Input
                      id="emailFrom"
                      placeholder="Your Name <email@example.com>"
                      value={settings.appConfig?.emailSender?.from || ""}
                      onChange={(e) => handleInputChange("appConfig.emailSender.from", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Telegram Bot</h3>
                  <div className="space-y-2">
                    <Label htmlFor="botToken">Bot Token</Label>
                    <Input
                      id="botToken"
                      type="password"
                      placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                      value={settings.appConfig?.telegram?.botToken || ""}
                      onChange={(e) => handleInputChange("appConfig.telegram.botToken", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerId">Owner ID</Label>
                    <Input
                      id="ownerId"
                      placeholder="123456789"
                      value={settings.appConfig?.telegram?.ownerId || ""}
                      onChange={(e) => handleInputChange("appConfig.telegram.ownerId", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Settings */}
          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Layanan</CardTitle>
                <CardDescription>Konfigurasi media sosial dan database</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Media Sosial</h3>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      placeholder="https://wa.me/..."
                      value={settings.appConfig?.socialMedia?.whatsapp || ""}
                      onChange={(e) => handleInputChange("appConfig.socialMedia.whatsapp", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telegram">Telegram</Label>
                    <Input
                      id="telegram"
                      placeholder="https://t.me/..."
                      value={settings.appConfig?.socialMedia?.telegram || ""}
                      onChange={(e) => handleInputChange("appConfig.socialMedia.telegram", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tiktok">TikTok</Label>
                    <Input
                      id="tiktok"
                      placeholder="https://www.tiktok.com/@..."
                      value={settings.appConfig?.socialMedia?.tiktok || ""}
                      onChange={(e) => handleInputChange("appConfig.socialMedia.tiktok", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="https://www.instagram.com/..."
                      value={settings.appConfig?.socialMedia?.instagram || ""}
                      onChange={(e) => handleInputChange("appConfig.socialMedia.instagram", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">MongoDB</h3>
                  <div className="space-y-2">
                    <Label htmlFor="mongoUri">MongoDB URI</Label>
                    <Input
                      id="mongoUri"
                      type="password"
                      placeholder="mongodb+srv://user:pass@cluster.mongodb.net/..."
                      value={settings.appConfig?.mongodb?.uri || ""}
                      onChange={(e) => handleInputChange("appConfig.mongodb.uri", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dbName">Database Name</Label>
                    <Input
                      id="dbName"
                      placeholder="database-name"
                      value={settings.appConfig?.mongodb?.dbName || ""}
                      onChange={(e) => handleInputChange("appConfig.mongodb.dbName", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 mt-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Pengaturan"
            )}
          </Button>
          <Button
            onClick={loadSettings}
            variant="outline"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
