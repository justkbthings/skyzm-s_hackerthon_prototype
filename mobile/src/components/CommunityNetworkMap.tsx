import React from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";
import { UserPublic } from "../services/api";

interface Props {
  members: UserPublic[];
  onSelect: (member: UserPublic) => void;
  width?: number;
  height?: number;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CommunityNetworkMap({
  members,
  onSelect,
  width = 320,
  height = 280,
}: Props) {
  const { colors } = useTheme();
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  const nodes = members.map((member, index) => {
    const angle = (index / members.length) * Math.PI * 2 - Math.PI / 2;
    const hasGeo = member.latitude != null && member.longitude != null;

    const x = hasGeo
      ? ((member.longitude! + 180) / 360) * (width - 60) + 30
      : centerX + Math.cos(angle) * radius;
    const y = hasGeo
      ? ((90 - member.latitude!) / 180) * (height - 60) + 30
      : centerY + Math.sin(angle) * radius;

    return { member, x, y };
  });

  return (
    <View>
      <Svg width={width} height={height}>
        {nodes.map((a, i) =>
          nodes.slice(i + 1).map((b) => (
            <Line
              key={`${a.member.id}-${b.member.id}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={colors.secondary}
              strokeWidth={2}
            />
          ))
        )}
        {nodes.map(({ member, x, y }) => (
          <Circle
            key={member.id}
            cx={x}
            cy={y}
            r={28}
            fill={colors.primary}
            onPress={() => onSelect(member)}
          />
        ))}
      </Svg>
      <View style={{ marginTop: 8 }}>
        {nodes.map(({ member }) => (
          <Pressable key={member.id} onPress={() => onSelect(member)}>
            <Text style={{ color: colors.text, marginBottom: 4 }}>
              ● {initials(member.displayName)} — {member.displayName}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
