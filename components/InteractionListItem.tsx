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

  if (days === 0) return `Today`;
  if (days === 1) return `Yesterday`;
  if (days < 7) return `${days} days ago`;

  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export interface InteractionListItemProps {
  interaction: Interaction;
  onEdit: (interaction: Interaction) => void;
  onDelete: () => void;
}

export default function InteractionListItem({ interaction, onEdit, onDelete }: InteractionListItemProps) {
  return (
    <TouchableOpacity
      className="rounded-2xl bg-surface p-5 shadow-sm shadow-slate-200/50 mb-3 border border-border/50"
      onPress={() => onEdit(interaction)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start gap-4">
        <View className="mt-1 h-10 w-10 items-center justify-center rounded-full bg-sage-100">
          <Ionicons name={typeIcons[interaction.type]} size={20} color="#5C6356" />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
             <Text className="text-base font-semibold text-slate-900">{formatInteractionDate(interaction.date)}</Text>
             <TouchableOpacity onPress={onDelete} hitSlop={10} activeOpacity={0.6}>
               <Ionicons name="trash-outline" size={18} color="#9CA986" />
             </TouchableOpacity>
          </View>
          
          <Text className="text-sm text-sage-muted mt-0.5 mb-2">{typeLabels[interaction.type]}</Text>

          {interaction.notes && (
            <Text className="text-base text-slate leading-relaxed">{interaction.notes}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
