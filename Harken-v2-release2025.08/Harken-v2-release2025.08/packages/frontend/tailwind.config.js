export default {
  corePlugins: {
    preflight: false,
  },
  important: '#harken',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        customBlue: '#0da1c7',
        customGray: 'rgba(90, 90, 90, 1)',
        customLightGray: 'rgb(249, 249, 249)',
        loginGray: 'rgba(255, 255, 255, 0.3019607843)',
        customSkyBlue: '#26a69a',
        customDeeperSkyBlue: 'rgba(13, 161, 199, 1)',
        lightRed: '#f2dede',
        darkRed: '#a94442',
        Customwhite: '#fff',
        customBlack: 'rgba(28, 54, 67, 1)',
        silverGray: 'rgba(249, 249, 249, 1)',
        lightBlack: '#B1BAC0',
        black: '#000',
        limeGreen : 'limegreen',
        dodgerblue:'dodgerblue',
        white: '#ffffff',
        redError: '#a94442',
        greyApproch: '#abadac',
        darkgray: 'darkgray'
      },
    },
  },
  plugins: [],
};
