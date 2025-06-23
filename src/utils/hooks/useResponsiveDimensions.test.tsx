import { renderHook, act } from '@testing-library/react-hooks';
import { Dimensions } from 'react-native';
import useResponsiveDimensions from './useResponsiveDimensions';

jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(),
    addEventListener: jest.fn(),
  },
}));

const mockDimensions = Dimensions as jest.Mocked<typeof Dimensions>;

describe('useResponsiveDimensions', () => {
  let mockSubscription: { remove: jest.Mock };
  let mockEventListener: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the subscription
    mockSubscription = { remove: jest.fn() };
    mockEventListener = jest.fn();
    mockDimensions.addEventListener.mockReturnValue(mockSubscription);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should return initial device dimensions', () => {
      const initialDimensions = { width: 375, height: 667 };
      mockDimensions.get.mockReturnValue(initialDimensions);
      const { result } = renderHook(() => useResponsiveDimensions());
      expect(mockDimensions.get).toHaveBeenCalledWith('window');
      expect(result.current.width).toBe(375);
      expect(result.current.height).toBe(667);
    });

    it('should set up listener for dimension changes', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 667 });
      renderHook(() => useResponsiveDimensions());
      expect(mockDimensions.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });
  });

  describe('Screen Classifications', () => {
    it('should classify as small screen (width < 380)', () => {
      mockDimensions.get.mockReturnValue({ width: 360, height: 640 });
      const { result } = renderHook(() => useResponsiveDimensions());
      expect(result.current.isSmallScreen).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isLargeTablet).toBe(false);
      expect(result.current.isExtraLarge).toBe(false);
    });

    it('should classify as regular phone (380 <= width < 768)', () => {
      mockDimensions.get.mockReturnValue({ width: 414, height: 896 });
      const { result } = renderHook(() => useResponsiveDimensions());
      expect(result.current.isSmallScreen).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isLargeTablet).toBe(false);
      expect(result.current.isExtraLarge).toBe(false);
    });

    it('should classify as tablet (768 <= width < 1024)', () => {
      mockDimensions.get.mockReturnValue({ width: 768, height: 1024 });
      const { result } = renderHook(() => useResponsiveDimensions());
      expect(result.current.isSmallScreen).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isLargeTablet).toBe(false);
      expect(result.current.isExtraLarge).toBe(false);
    });

    it('should classify as large tablet (1024 <= width < 1200)', () => {
      mockDimensions.get.mockReturnValue({ width: 1024, height: 768 });
      const { result } = renderHook(() => useResponsiveDimensions());
      expect(result.current.isSmallScreen).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isLargeTablet).toBe(true);
      expect(result.current.isExtraLarge).toBe(false);
    });

    it('should classify as extra large (width >= 1200)', () => {
      mockDimensions.get.mockReturnValue({ width: 1440, height: 900 });
      const { result } = renderHook(() => useResponsiveDimensions());
      expect(result.current.isSmallScreen).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isLargeTablet).toBe(true);
      expect(result.current.isExtraLarge).toBe(true);
    });
  });

  describe('Orientation', () => {
    it('should detect portrait orientation (height > width)', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 667 });
      const { result } = renderHook(() => useResponsiveDimensions());
      expect(result.current.isLandscape).toBe(false);
    });

    it('should detect landscape orientation (width > height)', () => {
      mockDimensions.get.mockReturnValue({ width: 667, height: 375 });
      const { result } = renderHook(() => useResponsiveDimensions());
      expect(result.current.isLandscape).toBe(true);
    });

    it('should consider square as not landscape (width === height)', () => {
      mockDimensions.get.mockReturnValue({ width: 500, height: 500 });
      const { result } = renderHook(() => useResponsiveDimensions());
      expect(result.current.isLandscape).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle exact values at boundaries', () => {
      mockDimensions.get.mockReturnValue({ width: 380, height: 640 });
      const { result: result380 } = renderHook(() => useResponsiveDimensions());
      expect(result380.current.isSmallScreen).toBe(false);
      
      mockDimensions.get.mockReturnValue({ width: 768, height: 1024 });
      const { result: result768 } = renderHook(() => useResponsiveDimensions());
      expect(result768.current.isTablet).toBe(true);
      
      mockDimensions.get.mockReturnValue({ width: 1024, height: 768 });
      const { result: result1024 } = renderHook(() => useResponsiveDimensions());
      expect(result1024.current.isLargeTablet).toBe(true);
      
      mockDimensions.get.mockReturnValue({ width: 1200, height: 800 });
      const { result: result1200 } = renderHook(() => useResponsiveDimensions());
      expect(result1200.current.isExtraLarge).toBe(true);
    });

    it('should handle very small values', () => {
      mockDimensions.get.mockReturnValue({ width: 1, height: 1 });
      const { result } = renderHook(() => useResponsiveDimensions());
      expect(result.current.width).toBe(1);
      expect(result.current.height).toBe(1);
      expect(result.current.isSmallScreen).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isLandscape).toBe(false);
    });

    it('should handle very large values', () => {
      mockDimensions.get.mockReturnValue({ width: 5000, height: 3000 });
      const { result } = renderHook(() => useResponsiveDimensions());
      expect(result.current.width).toBe(5000);
      expect(result.current.height).toBe(3000);
      expect(result.current.isExtraLarge).toBe(true);
      expect(result.current.isLandscape).toBe(true);
    });
  });

  describe('Dimension Changes', () => {
    it('should update dimensions when change occurs', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 667 });
      const { result } = renderHook(() => useResponsiveDimensions());
      expect(result.current.width).toBe(375);
      expect(result.current.height).toBe(667);
      expect(result.current.isLandscape).toBe(false);

      const changeCallback = mockDimensions.addEventListener.mock.calls[0][1];
      
      act(() => {
        changeCallback({ window: { width: 667, height: 375 } });
      });
      
      expect(result.current.width).toBe(667);
      expect(result.current.height).toBe(375);
      expect(result.current.isLandscape).toBe(true);
    });

    it('should handle multiple consecutive changes', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 667 });
      const { result } = renderHook(() => useResponsiveDimensions());
      
      const changeCallback = mockDimensions.addEventListener.mock.calls[0][1];
      
      const dimensionsSequence = [
        { width: 768, height: 1024 },
        { width: 1024, height: 768 },
        { width: 360, height: 640 },
        { width: 1440, height: 900 },
      ];

      dimensionsSequence.forEach((dims) => {
        act(() => {
          changeCallback({ window: dims });
        });
        expect(result.current.width).toBe(dims.width);
        expect(result.current.height).toBe(dims.height);
      });
    });
  });

  describe('Cleanup', () => {
    it('should remove listener when component is unmounted', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 667 });
      const { unmount } = renderHook(() => useResponsiveDimensions());
      expect(mockDimensions.addEventListener).toHaveBeenCalled();
      unmount();
      expect(mockSubscription.remove).toHaveBeenCalled();
    });

    it('should handle undefined/null subscription', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 667 });
      mockDimensions.addEventListener.mockReturnValue(null);
      const { unmount } = renderHook(() => useResponsiveDimensions());
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Hook Return Value', () => {
    it('should return all expected properties', () => {
      mockDimensions.get.mockReturnValue({ width: 414, height: 896 });
      const { result } = renderHook(() => useResponsiveDimensions());
      expect(result.current).toHaveProperty('width');
      expect(result.current).toHaveProperty('height');
      expect(result.current).toHaveProperty('isTablet');
      expect(result.current).toHaveProperty('isLandscape');
      expect(result.current).toHaveProperty('isSmallScreen');
      expect(result.current).toHaveProperty('isLargeTablet');
      expect(result.current).toHaveProperty('isExtraLarge');
      expect(typeof result.current.width).toBe('number');
      expect(typeof result.current.height).toBe('number');
      expect(typeof result.current.isTablet).toBe('boolean');
      expect(typeof result.current.isLandscape).toBe('boolean');
      expect(typeof result.current.isSmallScreen).toBe('boolean');
      expect(typeof result.current.isLargeTablet).toBe('boolean');
      expect(typeof result.current.isExtraLarge).toBe('boolean');
    });

    it('should maintain consistency between related properties', () => {
      mockDimensions.get.mockReturnValue({ width: 1024, height: 768 });
      const { result: tabletResult } = renderHook(() => useResponsiveDimensions());
      if (tabletResult.current.isLargeTablet) {
        expect(tabletResult.current.isTablet).toBe(true);
      }
      
      mockDimensions.get.mockReturnValue({ width: 1440, height: 900 });
      const { result: extraLargeResult } = renderHook(() => useResponsiveDimensions());
      if (extraLargeResult.current.isExtraLarge) {
        expect(extraLargeResult.current.isTablet).toBe(true);
        expect(extraLargeResult.current.isLargeTablet).toBe(true);
      }
    });
  });
});