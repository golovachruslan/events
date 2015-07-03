App.setPreference('AutoHideSplashScreen' ,'true');

App.accessRule('http://cdn.funcheap.com/*');
App.accessRule('*google*');

// Pass preferences for a particular PhoneGap/Cordova plugin
App.configurePlugin('plugin.google.maps', {
 API_KEY_FOR_IOS: 'AIzaSyDpKX2Ov0cN03LLH0PK8qnKknaYdPTJTlI',
 API_KEY_FOR_ANDROID: 'AIzaSyDpKX2Ov0cN03LLH0PK8qnKknaYdPTJTlI'
});

App.configurePlugin('com.phonegap.plugins.facebookconnect', {
 APP_ID: '1616229415285614',
 APP_NAME: '40a0da18ade1f00a88eeb3e7f6070f8e'
});

/*
App.info({
  id: 'com.example.matt.uber',
  name: 'über',
  description: 'Get über power in one button click',
  author: 'Matt Development Group',
  email: 'contact@example.com',
  website: 'http://example.com'
});

// Set up resources such as icons and launch screens.
App.icons({
  'iphone': 'icons/icon-60.png',
  'iphone_2x': 'icons/icon-60@2x.png',
  // ... more screen sizes and platforms ...
});

App.launchScreens({
  'iphone': 'splash/Default~iphone.png',
  'iphone_2x': 'splash/Default@2x~iphone.png',
  // ... more screen sizes and platforms ...
});

// Set PhoneGap/Cordova preferences
App.setPreference('BackgroundColor', '0xff0000ff');
App.setPreference('HideKeyboardFormAccessoryBar', true);

// Pass preferences for a particular PhoneGap/Cordova plugin
App.configurePlugin('com.phonegap.plugins.facebookconnect', {
  APP_ID: '1234567890',
  API_KEY: 'supersecretapikey'
});
*/