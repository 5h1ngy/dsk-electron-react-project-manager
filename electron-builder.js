/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: "com.electron.project-manager",
  productName: "Project Manager",
  directories: {
    output: "release",
    buildResources: "build"
  },
  files: [
    "dist/**/*",
    "package.json"
  ],
  asar: true,
  extraMetadata: {
    main: "dist/electron/main/index.js"
  },
  mac: {
    category: "public.app-category.productivity"
  },
  win: {
    target: ["portable", "nsis"]
  },
  linux: {
    target: ["AppImage", "deb"]
  }
};

module.exports = config;
