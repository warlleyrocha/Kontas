/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // Inter variants (nomes exatos do Expo Google Fonts)
        inter: ["Inter_400Regular"],
        "inter-light": ["Inter_300Light"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
        "inter-black": ["Inter_900Black"],

        // Mulish variants (nomes exatos do Expo Google Fonts)
        mulish: ["Mulish_400Regular"],
        "mulish-light": ["Mulish_300Light"],
        "mulish-medium": ["Mulish_500Medium"],
        "mulish-semibold": ["Mulish_600SemiBold"],
        "mulish-bold": ["Mulish_700Bold"],
        "mulish-black": ["Mulish_900Black"],

        // Aliases para facilitar o uso (opcional)
        primary: ["Inter_400Regular"],
        secondary: ["Mulish_400Regular"],
        heading: ["Inter_700Bold"],
        body: ["Mulish_400Regular"],
      },
    },
  },
  plugins: [],
};
