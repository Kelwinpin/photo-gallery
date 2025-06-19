import { useEffect, useState } from "react";
import { Dimensions } from "react-native";

const useResponsiveDimensions = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  const isTablet = dimensions.width >= 768;
  const isLandscape = dimensions.width > dimensions.height;
  const isSmallScreen = dimensions.width < 380;
  const isLargeTablet = dimensions.width >= 1024;
  const isExtraLarge = dimensions.width >= 1200;

  return {
    ...dimensions,
    isTablet,
    isLandscape,
    isSmallScreen,
    isLargeTablet,
    isExtraLarge,
  };
};


export default useResponsiveDimensions;
