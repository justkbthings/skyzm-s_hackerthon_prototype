import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { LanguagePicker } from "../components/LanguagePicker";
import { CommunityNetworkMap } from "../components/CommunityNetworkMap";
import { createStyles } from "../theme/styles";
import { api, Community, CommunityRequest, UserPublic } from "../services/api";

export function CommunityScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [communities, setCommunities] = useState<Community[]>([]);
  const [selected, setSelected] = useState<Community | null>(null);
  const [members, setMembers] = useState<UserPublic[]>([]);
  const [allUsers, setAllUsers] = useState<UserPublic[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [requests, setRequests] = useState<CommunityRequest[]>([]);
  const [communityName, setCommunityName] = useState("");
  const [requestTitle, setRequestTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [expiryDate, setExpiryDate] = useState("2026-12-31");
  const [createMessage, setCreateMessage] = useState("");

  const load = () => api.communities.list().then(setCommunities);

  useEffect(() => {
    load();
    api.users().then(setAllUsers);
  }, []);

  const selectCommunity = async (c: Community) => {
    setSelected(c);
    const [m, r] = await Promise.all([
      api.communities.members(c.id),
      api.communities.requests(c.id),
    ]);
    setMembers(m);
    setRequests(r);
  };

  const toggleMember = (userId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const createCommunity = async () => {
    if (!communityName.trim()) return;
    await api.communities.create(communityName, selectedMemberIds);
    setCommunityName("");
    setSelectedMemberIds([]);
    setCreateMessage(t("community.create"));
    load();
  };

  const createRequest = async () => {
    if (!selected) return;
    await api.communities.createRequest(selected.id, {
      title: requestTitle,
      targetAmount: Number(targetAmount),
      currency: "USD",
      expiryDate,
    });
    selectCommunity(selected);
    setRequestTitle("");
    setTargetAmount("");
  };

  return (
    <ScrollView testID="community-screen" style={styles.screen}>
      <View style={styles.header}>
        <LanguagePicker />
        <Text style={styles.headerTitle}>{t("community.title")}</Text>
      </View>

      <View style={styles.content}>
        {!selected ? (
          <>
            {communities.map((c) => (
              <Pressable
                key={c.id}
                testID={`community-item-${c.name.replace(/\s+/g, "-").toLowerCase()}`}
                style={styles.listItem}
                onPress={() => selectCommunity(c)}
              >
                <Text style={styles.listItemTitle}>{c.name}</Text>
                <Text testID={`community-members-count-${c.id}`} style={styles.listItemSubtitle}>
                  {c.memberIds.length} members
                </Text>
              </Pressable>
            ))}

            <Text style={styles.label}>{t("community.create")}</Text>
            <TextInput
              testID="community-name-input"
              style={styles.input}
              placeholder={t("community.communityName")}
              value={communityName}
              onChangeText={setCommunityName}
            />

            <Text style={styles.label}>Add members</Text>
            {allUsers.map((u) => (
              <Pressable
                key={u.id}
                testID={`community-member-option-${u.displayName.toLowerCase()}`}
                style={styles.listItem}
                onPress={() => toggleMember(u.id)}
              >
                <Text style={styles.listItemTitle}>
                  {selectedMemberIds.includes(u.id) ? "● " : "○ "}
                  {u.displayName}
                </Text>
              </Pressable>
            ))}

            <Pressable testID="community-create-button" style={styles.primaryButton} onPress={createCommunity}>
              <Text style={styles.primaryButtonText}>{t("community.create")}</Text>
            </Pressable>

            {createMessage ? (
              <Text testID="community-create-success" style={{ color: colors.success, marginTop: 12 }}>
                {createMessage}
              </Text>
            ) : null}
          </>
        ) : (
          <>
            <Pressable testID="community-back" onPress={() => setSelected(null)}>
              <Text style={{ color: colors.primary, marginBottom: 12 }}>← Back</Text>
            </Pressable>
            <Text testID="community-detail-name" style={styles.listItemTitle}>
              {selected.name}
            </Text>

            <CommunityNetworkMap
              members={members}
              onSelect={() => undefined}
            />

            <Text testID="community-member-list" style={[styles.label, { marginTop: 16 }]}>
              Members: {members.map((m) => m.displayName).join(", ")}
            </Text>

            <Text style={[styles.label, { marginTop: 16 }]}>{t("community.newRequest")}</Text>
            <TextInput testID="community-request-title" style={styles.input} placeholder={t("community.requestTitle")} value={requestTitle} onChangeText={setRequestTitle} />
            <TextInput testID="community-request-amount" style={styles.input} placeholder={t("community.targetAmount")} value={targetAmount} onChangeText={setTargetAmount} keyboardType="decimal-pad" />
            <TextInput style={styles.input} placeholder={t("community.expiry")} value={expiryDate} onChangeText={setExpiryDate} />
            <Pressable testID="community-request-submit" style={styles.primaryButton} onPress={createRequest}>
              <Text style={styles.primaryButtonText}>{t("community.newRequest")}</Text>
            </Pressable>

            {requests.map((r) => (
              <View key={r.id} testID={`community-request-${r.id}`} style={styles.card}>
                <Text style={styles.listItemTitle}>{r.title}</Text>
                <Text style={styles.listItemSubtitle}>
                  {t("community.raised", {
                    raised: r.raisedAmount,
                    target: r.targetAmount,
                  })}{" "}
                  {r.currency}
                </Text>
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}
