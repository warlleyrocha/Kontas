import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { AccountsTab } from "@/components/Accounts";
import { AddAccountModal } from "@/components/AddAccountModal";
import { EditRepublicModal } from "@/components/EditRepublicModal";

import { ResidentsTab } from "@/components/ResidentsPage";
import { ResumeTab } from "@/components/Resume";
import Tabs from "@/components/Tabs";
import { useAsyncStorage } from "@/hooks/useAsyncStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Republica } from "@/types/resume";
import type { TabKey } from "@/types/tabs";

const ImageHeader = require("@/assets/images/icon.png");

const initialRepublica: Republica = {
  nome: "",
  moradores: [],
  contas: [],
};

export default function Dashboard() {
  const [tab, setTab] = useState<TabKey>("resumo");
  const [republicImage, setRepublicImage] = useState<string | undefined>(
    undefined
  );

  // Usar AsyncStorage para persistir dados
  const { data: republica, setData: setRepublica } =
    useAsyncStorage<Republica>(initialRepublica);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Carregar imagem da república
  useEffect(() => {
    const loadImage = async () => {
      const image = await AsyncStorage.getItem("@republica_imagem");
      if (image) setRepublicImage(image);
    };
    loadImage();
  }, []);

  // Função para salvar edições da república
  const handleSaveRepublica = (nome: string, imagem?: string) => {
    setRepublica({ ...republica, nome, imagemRepublica: imagem });
    setRepublicImage(imagem);
  };

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      {/* HEADER */}
      <View className="mt-[32px] flex-row gap-3 border-b border-b-black/10 bg-[#FAFAFA] px-[16px] py-4">
        <View className="h-[50px] w-[50px] items-center justify-center rounded-full bg-black">
          {republicImage ? (
            <Image
              source={{ uri: republicImage }}
              style={{
                width: 50,
                height: 50,
                resizeMode: "cover",
                borderRadius: 25,
              }}
            />
          ) : (
            <Image
              source={ImageHeader}
              style={{ width: 50, height: 50, resizeMode: "contain" }}
            />
          )}
        </View>

        <TouchableOpacity
          onPress={() => setShowEditModal(true)}
          className="flex-1 justify-center"
        >
          <Text className="text-base font-semibold">
            {republica.nome || "República"}
          </Text>
          <Text className="text-sm text-gray-500">
            {republica.moradores.length} moradores
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="self-center rounded-md bg-indigo-600 px-4 py-2"
        >
          <Text className="text-white">+ Nova Conta</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <View style={{ padding: 16, flex: 1 }}>
        <Tabs value={tab} onChange={setTab} />

        {/* cada tab controla seu próprio scroll internamente */}
        {tab === "resumo" && <ResumeTab republica={republica} />}

        {tab === "contas" && (
          <AccountsTab republica={republica} setRepublica={setRepublica} />
        )}

        {tab === "moradores" && (
          <ResidentsTab republica={republica} setRepublica={setRepublica} />
        )}
      </View>

      {/* Modais */}
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
        currentImage={republicImage}
        onSave={handleSaveRepublica}
      />
    </View>
  );
}
