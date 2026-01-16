import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addContact } from "@/services/contactService";

type Step = "name" | "rhythm" | "birthday";
type Rhythm = "weekly" | "monthly" | "seasonally" | "custom";

export default function NewConnectionScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [rhythm, setRhythm] = useState<Rhythm>("monthly");
  const [birthday, setBirthday] = useState(""); // simplified for now

  const handleNext = () => {
    if (step === "name" && name.trim()) {
      setStep("rhythm");
    } else if (step === "rhythm") {
      setStep("birthday");
    }
  };

  const handleFinish = async () => {
    try {
      await addContact({
        name,
        bucket:
          rhythm === "seasonally"
            ? "every-six-months"
            : rhythm === "weekly"
              ? "weekly"
              : "monthly", // Mapping simplistically for now
        birthday: birthday || undefined,
      });
      router.back();
    } catch (e) {
      console.error(e);
    }
  };

  const handleImport = () => {
    router.push({ pathname: "/contacts/import", params: { autoRequest: "1" } });
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <Stack.Screen
        options={{
          title: "Add a connection",
          headerBackTitle: "Back",
          headerShadowVisible: false,
          headerTitleStyle: { fontSize: 18, fontWeight: "700" },
        }}
      />
      <View className="flex-1 px-6 pt-8">
        {/* Progress Dots */}
        <View className="flex-row justify-center gap-2 mb-12">
          <View
            className={`h-2 w-2 rounded-full ${step === "name" ? "bg-sage" : "bg-sage/30"}`}
          />
          <View
            className={`h-2 w-2 rounded-full ${step === "rhythm" ? "bg-sage" : "bg-sage/30"}`}
          />
          <View
            className={`h-2 w-2 rounded-full ${step === "birthday" ? "bg-sage" : "bg-sage/30"}`}
          />
        </View>

        {step === "name" && (
          <View className="flex-1">
            <Text className="text-3xl font-semibold text-slate-900 mb-4">
              Add a connection
            </Text>
            <Text className="text-lg text-slate-600 mb-8">
              Who would you like to stay connected with?
            </Text>

            <TextInput
              className="w-full bg-surface border border-border rounded-2xl p-5 text-xl text-slate-900 mb-6"
              placeholder="Name"
              placeholderTextColor="#8B9678"
              value={name}
              onChangeText={setName}
              autoFocus
            />

            <TouchableOpacity
              className={`w-full py-4 rounded-2xl items-center ${name.trim() ? "bg-sage" : "bg-sage/50"}`}
              onPress={handleNext}
              disabled={!name.trim()}
            >
              <Text className="text-white font-semibold text-lg">Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-6 items-center"
              onPress={handleImport}
            >
              <Text className="text-sage font-medium text-base">
                Or import from contacts ↗
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "rhythm" && (
          <View className="flex-1">
            <Text className="text-2xl font-semibold text-slate-900 mb-2">
              {name}
            </Text>
            <Text className="text-lg text-slate-600 mb-8">
              How often would you like a gentle reminder to connect?
            </Text>

            <View className="gap-3">
              {[
                { label: "Every week", value: "weekly" },
                { label: "Once a month", value: "monthly" },
                { label: "Seasonally", value: "seasonally" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  className={`p-5 rounded-2xl border ${rhythm === opt.value ? "bg-sage border-sage" : "bg-surface border-border"}`}
                  onPress={() => setRhythm(opt.value as Rhythm)}
                >
                  <Text
                    className={`text-lg font-medium ${rhythm === opt.value ? "text-white" : "text-slate-900"}`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mt-8">
              <TouchableOpacity
                className="w-full bg-sage py-4 rounded-2xl items-center"
                onPress={handleNext}
              >
                <Text className="text-white font-semibold text-lg">
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === "birthday" && (
          <View className="flex-1">
            <Text className="text-2xl font-semibold text-slate-900 mb-2">
              One more thing...
            </Text>
            <Text className="text-lg text-slate-600 mb-8">
              Would you like to remember {name}'s birthday?
            </Text>

            {/* Simple text input for MM/DD for now, could be a date picker */}
            <TextInput
              className="w-full bg-surface border border-border rounded-2xl p-5 text-xl text-slate-900 mb-6"
              placeholder="MM/DD (Optional)"
              placeholderTextColor="#8B9678"
              value={birthday}
              onChangeText={setBirthday}
              keyboardType="numbers-and-punctuation"
            />

            <View className="flex-row gap-4 mt-4">
              <TouchableOpacity
                className="flex-1 bg-transparent border border-border py-4 rounded-2xl items-center"
                onPress={handleFinish}
              >
                <Text className="text-slate-600 font-semibold text-lg">
                  Skip
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-sage py-4 rounded-2xl items-center"
                onPress={handleFinish}
              >
                <Text className="text-white font-semibold text-lg">Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
