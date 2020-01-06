module.exports = {
  presets: ["@vue/app"],
  ignore: ["node_modules", "assets"],
  plugins: [
    [
      "component",
      {
        libraryName: "element-ui",
        styleLibraryName: "theme-chalk"
      }
    ]
  ]
};
