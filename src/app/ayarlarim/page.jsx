"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { IconUser, IconBell, IconLock } from "@tabler/icons-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MediaUploader from "@/components/ui/media-uploader";

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "",
    notifications: {
      email: true,
      push: true,
      weeklyDigest: false,
      newRecipes: true,
      comments: true,
    },
  });
  console.log(user, "user");
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        setFormData({
          name: userData.name || user.displayName || "",
          email: userData.email || user.email || "",
          avatar: userData.avatar || user.photoURL || "",
          notifications: {
            email: userData.notifications?.email ?? true,
            push: userData.notifications?.push ?? true,
            weeklyDigest: userData.notifications?.weeklyDigest ?? false,
            newRecipes: userData.notifications?.newRecipes ?? true,
            comments: userData.notifications?.comments ?? true,
          },
        });
      } catch (error) {
        console.error("Kullanıcı verileri yüklenirken hata:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (name) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: !prev.notifications[name],
      },
    }));
  };

  const handleSubmit = async (message) => {
    setIsLoading(true);

    try {
      const updatedUserData = {
        ...formData,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem("userData", JSON.stringify(updatedUserData));

      if (updateUser) {
        await updateUser({
          displayName: formData.name,
          email: formData.email,
          photoURL: formData.avatar,
        });
      }

      toast.success(message);
    } catch (error) {
      console.error("Ayarlar kaydedilirken hata:", error);
      toast.error("Ayarlar kaydedilirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-green-200 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-green-500 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-xl font-medium text-gray-900 mb-6">Ayarlarım</h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 border border-gray-200">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <IconUser size={18} />
                Profil
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <IconLock size={18} />
                Şifre
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <IconBell size={18} />
                Bildirimler
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">İsim</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    disabled
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Profil Fotoğrafı</Label>
                  <MediaUploader
                    value={formData.avatar}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, avatar: value }))
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() =>
                      handleSubmit("Bilgileriniz başarıyla güncellendi!")
                    }
                    disabled={isLoading}
                  >
                    {isLoading ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="password" className="space-y-4 mt-6">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Mevcut şifrenizi girin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Yeni şifrenizi girin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Yeni şifrenizi tekrar girin"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() =>
                      handleSubmit("Şifreniz başarıyla güncellendi!")
                    }
                  >
                    Şifreyi Güncelle
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>E-posta bildirimleri</Label>
                    <p className="text-sm text-gray-500">
                      Önemli güncellemeler için e-posta alın
                    </p>
                  </div>
                  <Switch
                    className="data-[state=checked]:bg-orange-700 data-[state=unchecked]:bg-gray-900"
                    checked={formData.notifications.email}
                    onCheckedChange={() => handleNotificationChange("email")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Haftalık özet</Label>
                    <p className="text-sm text-gray-500">
                      Haftalık tarif özetlerini alın
                    </p>
                  </div>
                  <Switch
                    className="data-[state=checked]:bg-orange-700 data-[state=unchecked]:bg-gray-900"
                    checked={formData.notifications.weeklyDigest}
                    onCheckedChange={() =>
                      handleNotificationChange("weeklyDigest")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Yeni tarifler</Label>
                    <p className="text-sm text-gray-500">
                      Yeni tarifler hakkında bilgilendiril
                    </p>
                  </div>
                  <Switch
                    className="data-[state=checked]:bg-orange-700 data-[state=unchecked]:bg-gray-900"
                    checked={formData.notifications.newRecipes}
                    onCheckedChange={() =>
                      handleNotificationChange("newRecipes")
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() =>
                      handleSubmit("Tercihleriniz başarıyla kaydedildi.")
                    }
                    disabled={isLoading}
                  >
                    {isLoading ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
