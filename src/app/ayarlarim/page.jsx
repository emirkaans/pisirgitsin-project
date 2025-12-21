"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  IconUser,
  IconAlertTriangle,
  IconX,
  IconLock,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ALLERGEN_OPTIONS } from "@/constants/constants";
import { supabase } from "@/lib/supabase";

const SettingsPage = () => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  console.log({ profile });
  const [formData, setFormData] = useState({
    name: profile?.full_name ?? "",
    email: user?.email ?? "",
    avatar: "",
    allergens: profile?.allergens ?? [],
    notifications: {
      email: true,
      push: true,
      weeklyDigest: false,
      newRecipes: true,
      comments: true,
    },
  });

  useEffect(() => {
    setFormData({
      name: profile?.full_name ?? "",
      email: user?.email ?? "",
      avatar: "",
      allergens: profile?.allergens ?? [],
      notifications: {
        email: true,
        push: true,
        weeklyDigest: false,
        newRecipes: true,
        comments: true,
      },
    });
  }, [profile, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
                value="allergies"
                className="flex items-center gap-2"
              >
                <IconAlertTriangle size={18} />
                Alerjiler
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-6">
              <form className="space-y-4">
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

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={async () => {
                      try {
                        setIsLoading(true);

                        await supabase
                          .from("profile")
                          .update({ full_name: formData.full_name })
                          .eq("id", user.id);

                        toast.success("Bilgileriniz başarıyla güncellendi.");
                      } catch (e) {
                        console.error(e);
                        toast.error("Bilgileriniz güncellenemedi.");
                      } finally {
                        setIsLoading(false);
                      }
                    }}
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
                    onClick={() => toast("Şifreniz başarıyla güncellendi!")}
                  >
                    Şifreyi Güncelle
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="allergies" className="space-y-4 mt-6">
              <div className="space-y-2">
                <h2 className="text-base font-medium text-gray-900">
                  Alerjilerinizi seçin
                </h2>
                <p className="text-sm text-gray-500">
                  Tariflerde sizi uyarmamız için alerjen maddeleri işaretleyin.
                </p>
              </div>

              {formData.allergens?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.allergens.map((a) => (
                    <Badge key={a} variant="secondary" className="gap-1">
                      {a}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            allergens: prev.allergens.filter((x) => x !== a),
                          }))
                        }
                        className="ml-1"
                        aria-label="Kaldır"
                      >
                        <IconX size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {ALLERGEN_OPTIONS.map((item) => {
                  const checked = formData.allergens?.includes(item);
                  return (
                    <label
                      key={item}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setFormData((prev) => {
                            const cur = Array.isArray(prev.allergens)
                              ? prev.allergens
                              : [];
                            return {
                              ...prev,
                              allergens: checked
                                ? cur.filter((x) => x !== item)
                                : [...cur, item],
                            };
                          });
                        }}
                      />
                      <span>{item}</span>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={async () => {
                    try {
                      setIsLoading(true);

                      await supabase
                        .from("profile")
                        .update({ allergens: formData.allergens })
                        .eq("id", user.id);

                      toast.success("Alerjileriniz kaydedildi.");
                    } catch (e) {
                      console.error(e);
                      toast.error("Alerjiler kaydedilemedi.");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
