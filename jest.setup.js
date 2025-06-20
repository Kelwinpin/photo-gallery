import 'react-native-gesture-handler/jestSetup';

// Mock do Expo Vector Icons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
    MaterialIcons: 'MaterialIcons',
    FontAwesome: 'FontAwesome',
    AntDesign: 'AntDesign',
    Entypo: 'Entypo',
    EvilIcons: 'EvilIcons',
    Feather: 'Feather',
    Foundation: 'Foundation',
    MaterialCommunityIcons: 'MaterialCommunityIcons',
    Octicons: 'Octicons',
    SimpleLineIcons: 'SimpleLineIcons',
    Zocial: 'Zocial',
}));

// Mock do React Navigation
const mockNavigationObject = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    reset: jest.fn(),
    isFocused: jest.fn(() => true),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    canGoBack: jest.fn(() => false),
    getId: jest.fn(() => 'test'),
    getParent: jest.fn(),
    getState: jest.fn(() => ({ routes: [], index: 0 })),
    setOptions: jest.fn(),
    setParams: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
    NavigationContainer: ({ children }) => children,
    useNavigation: () => mockNavigationObject,
    useRoute: () => ({
        key: 'test',
        name: 'test',
        params: {},
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: jest.fn(() => true),
}));

// Mock do React Native Reanimated
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => { };
    return Reanimated;
});

// Mock global
global.__reanimatedWorkletInit = jest.fn();

// Silence console warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
    if (args[0]?.includes?.('Warning: ReactDOM.render is deprecated')) {
        return;
    }
    originalWarn(...args);
};