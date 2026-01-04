import { Modal } from 'react-native';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import { Contact } from '@/db/schema';

interface EditContactModalProps {
  contact: Contact;
  visible: boolean;
  onClose: () => void;
  onSave: (newBucket: Contact['bucket']) => void;
}

const bucketLabels: Record<Contact['bucket'], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const bucketDescriptions: Record<Contact['bucket'], string> = {
  daily: 'Every day',
  weekly: 'Every 7 days',
  monthly: 'Every 30 days',
  yearly: 'Every 365 days',
};

export default function EditContactModal({ contact, visible, onClose, onSave }: EditContactModalProps) {
  const handleSave = (newBucket: Contact['bucket']) => {
    onSave(newBucket);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      presentationStyle="pageSheet"
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-cream">
        <View className="flex-1 px-6 pb-8 pt-6">
          <View className="mb-6 flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text className="font-semibold text-slate">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-slate">Contact Settings</Text>
            <View className="w-12" />
          </View>

          <Text className="mb-2 text-lg font-bold text-slate">{contact.name}</Text>
          <Text className="mb-6 text-base text-slate-500">How often would you like to check in with {contact.name}?</Text>

          <Text className="mb-3 text-base font-semibold text-slate">Contact Cadence</Text>

          <View className="mb-6 space-y-3">
            {(['daily', 'weekly', 'monthly', 'yearly'] as Contact['bucket'][]).map((bucket) => (
              <TouchableOpacity
                key={bucket}
                className={`rounded-2xl border-2 p-4 ${
                  contact.bucket === bucket
                    ? 'border-sage bg-sage-10'
                    : 'border-gray-200 bg-white'
                }`}
                onPress={() => handleSave(bucket)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text
                      className={`text-base font-semibold ${
                        contact.bucket === bucket ? 'text-slate' : 'text-slate-700'
                      }`}
                    >
                      {bucketLabels[bucket]}
                    </Text>
                    <Text className="mt-1 text-sm text-slate-500">{bucketDescriptions[bucket]}</Text>
                  </View>
                  <View
                    className={`h-6 w-6 rounded-full border-2 ${
                      contact.bucket === bucket
                        ? 'border-sage bg-sage'
                        : 'border-gray-300'
                    }`}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
