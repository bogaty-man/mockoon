export const IPCMainListenerChannels = [
  'APP_APPLY_UPDATE',
  'APP_DISABLE_ENVIRONMENT_MENU_ENTRIES',
  'APP_ENABLE_ENVIRONMENT_MENU_ENTRIES',
  'APP_DISABLE_ROUTE_MENU_ENTRIES',
  'APP_ENABLE_ROUTE_MENU_ENTRIES',
  'APP_LOGS',
  'APP_OPEN_EXTERNAL_LINK',
  'APP_QUIT',
  'APP_SET_FAKER_OPTIONS',
  'APP_UPDATE_ENVIRONMENT',
  'APP_WRITE_CLIPBOARD',
  'APP_SHOW_FILE'
];

export const IPCMainHandlerChannels = [
  'APP_GET_MIME_TYPE',
  'APP_GET_PLATFORM',
  'APP_BUILD_STORAGE_FILEPATH',
  'APP_OPENAPI_DEREFERENCE',
  'APP_OPENAPI_VALIDATE',
  'APP_READ_CLIPBOARD',
  'APP_READ_FILE',
  'APP_READ_JSON_DATA',
  'APP_SHOW_OPEN_DIALOG',
  'APP_SHOW_SAVE_DIALOG',
  'APP_START_SERVER',
  'APP_STOP_SERVER',
  'APP_WRITE_FILE',
  'APP_WRITE_JSON_DATA',
  'APP_NEW_STORAGE_MIGRATION',
  'APP_GET_OS'
];

export const IPCRendererHandlerChannels = [
  'APP_MENU',
  'APP_SERVER_EVENT',
  'APP_UPDATE_AVAILABLE'
];
