import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { Interaction } from '@/db/schema';

type InteractionType = Interaction['type'];

const typeLabels: Record<InteractionType, string> = {
  call: 'Call',
  text: 'Text',
  meet: 'Meet',
  email: 'Email',
};

const typeIcons: Record<InteractionType, keyof typeof Ionicons.glyphMap> = {
  call: 'call-outline',
  text: 'chatbubble-outline',
  meet: 'people-outline',
  email: 'mail-outline',
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const formatInteractionDate = (date: number) => {
  const now = Date.now();
  const diff = now - date;
  const days = Math.floor(diff / DAY_IN_MS);

  const dateObj = new Date(date);
  const time = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (days === 0) return `Today at ${time}`;
  if (days === 1) return `Yesterday at ${time}`;
  if (days < 7) return `${days} days ago at ${time}`;

  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` at ${time}`;
};

export interface InteractionCardProps {
  interaction: Interaction;
  onEdit: (interaction: Interaction) => void;
  onDelete: () => void;
}

export default function InteractionCard({ interaction, onEdit, onDelete }: InteractionCardProps) {
  return (
    <TouchableOpacity
      className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
      onPress={() => onEdit(interaction)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start gap-3">
        <View className="mt-1">
          <Ionicons name={typeIcons[interaction.type]} size={24} color="#475569" />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-slate">{typeLabels[interaction.type]}</Text>
            <TouchableOpacity onPress={onDelete} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <Text className="text-base text-slate-500">{formatInteractionDate(interaction.date)}</Text>

          {interaction.notes && (
            <View className="mt-2 rounded-lg border border-sage-100 bg-cream p-3">
              <Text className="text-base text-slate">{interaction.notes}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
