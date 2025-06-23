// __mocks__/expo-file-system.ts
const mockReadAsStringAsync = jest.fn();
const mockWriteAsStringAsync = jest.fn();
const mockMoveAsync = jest.fn();
const mockDeleteAsync = jest.fn();
const mockInfoAsync = jest.fn();

export const documentDirectory = 'MOCK_DOCUMENT_DIRECTORY/';
export const cacheDirectory = 'MOCK_CACHE_DIRECTORY/';
export const bundledAssets = 'MOCK_BUNDLED_ASSETS/';
export const appSupportDirectory = 'MOCK_APP_SUPPORT/';
export const externalStorageDirectory = 'MOCK_EXTERNAL_STORAGE/';
export const downloadDirectory = 'MOCK_DOWNLOAD_DIR/';

export const getInfoAsync = mockInfoAsync;
export const readAsStringAsync = mockReadAsStringAsync;
export const writeAsStringAsync = mockWriteAsStringAsync;
export const moveAsync = mockMoveAsync;
export const deleteAsync = mockDeleteAsync;
export const makeDirectoryAsync = jest.fn();