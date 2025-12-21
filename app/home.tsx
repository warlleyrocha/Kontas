import { AddAccountModal } from "@/components/Modals/AddAccountModal";
import { EditRepublicModal } from "@/components/Modals/EditRepublicModal";
import { MenuButton, SideMenu } from "@/components/SideMenu";
import Tabs from "@/components/Tabs";
import { AccountsTab } from "@/components/Tabs/Accounts";
import { ResidentsTab } from "@/components/Tabs/Residents";
import { ResumeTab } from "@/components/Tabs/Resume";

import { REPUBLIC_STORAGE_KEY } from "@/constants/storageKeys";

import { useAuth } from "@/contexts";

import { useAsyncStorage } from "@/hooks/useAsyncStorage";
import { useSideMenu } from "@/hooks/useSideMenu";

import type { Republica } from "@/types/resume";
import type { TabKey } from "@/types/tabs";

import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

const ImageHeader = require("@/assets/images/android/res/mipmap-xxxhdpi/ic_launcher.png");

const initialRepublica: Republica = {
  nome: "",
  moradores: [],
  contas: [],
};

interface RepublicImageProps {
  readonly imageUri?: string;
  readonly size?: number;
}

function RepublicImage({ imageUri, size = 50 }: RepublicImageProps) {
  const imageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={{ ...imageStyle, resizeMode: "cover" }}
      />
    );
  }

  return (
    <Image
      source={ImageHeader}
      style={{ ...imageStyle, resizeMode: "cover" }}
    />
  );
}

export default function Home() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<TabKey>("resumo");

  const { data: republica, setData: setRepublica } = useAsyncStorage<Republica>(
    REPUBLIC_STORAGE_KEY,
    initialRepublica
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      console.error("Erro ao fazer logout da conta:", error);
      Alert.alert(
        "Erro no Logout",
        "Não foi possível fazer logout da conta. Tente novamente."
      );
    }
  }, [signOut, router]);

  const { menuItems, footerItems } = useSideMenu("home", handleSignOut);

  const handleSaveRepublica = useCallback(
    (nome: string, imagem?: string) => {
      setRepublica((prev) => ({ ...prev, nome, imagemRepublica: imagem }));
    },
    [setRepublica]
  );

  const userMenu = useMemo(
    () => ({
      name: user?.user?.name ?? "Usuário",
      photo: user?.user?.photo,
      email: user?.user?.email,
    }),
    [user?.user?.name, user?.user?.photo, user?.user?.email]
  );

  const renderHeader = () => (
    <View className="mt-[32px] flex-row gap-3 border-b border-b-black/10 bg-[#FAFAFA] px-[16px] py-4">
      <View className="h-[50px] w-[50px] items-center justify-center rounded-full bg-black">
        <RepublicImage imageUri={republica.imagemRepublica} />
      </View>

      <TouchableOpacity
        onPress={() => setShowEditModal(true)}
        className="flex-1 justify-center"
      >
        <Text className="text-base font-semibold">
          {republica.nome || "República"}
        </Text>
        <Text className="text-sm text-gray-500">
          {republica.moradores?.length || 0} moradores
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
        className="self-center rounded-md bg-indigo-600 px-4 py-2"
      >
        <Text className="text-white">+ Nova Conta</Text>
      </TouchableOpacity>

      <MenuButton onPress={() => setIsMenuOpen(true)} />
    </View>
  );

  const renderTabContent = () => {
    switch (tab) {
      case "resumo":
        return <ResumeTab republica={republica} />;
      case "contas":
        return (
          <AccountsTab republica={republica} setRepublica={setRepublica} />
        );
      case "moradores":
        return (
          <ResidentsTab republica={republica} setRepublica={setRepublica} />
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      {renderHeader()}

      <View style={{ padding: 16, flex: 1 }}>
        <Tabs value={tab} onChange={setTab} />
        {renderTabContent()}
      </View>

      <AddAccountModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        republica={republica}
        setRepublica={setRepublica}
      />

      <EditRepublicModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentName={republica.nome}
        currentImage={republica.imagemRepublica}
        onSave={handleSaveRepublica}
      />

      {isMenuOpen && (
        <SideMenu
          onRequestClose={() => setIsMenuOpen(false)}
          user={userMenu}
          menuItems={menuItems}
          footerItems={footerItems}
        />
      )}
    </View>
  );
}
