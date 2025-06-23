import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { formatDate } from "../../utils/fomatDate";
import { Photo } from "../../services/photoService";
import useResponsiveDimensions from "../../utils/hooks/useResponsiveDimensions";

const getResponsiveValues = (dimensions: ReturnType<typeof useResponsiveDimensions>) => {
  const { isTablet, isLandscape, isSmallScreen, isLargeTablet } = dimensions;
  
  const titleFontSize = isLargeTablet ? 28 : isTablet ? 26 : isSmallScreen ? 20 : 24;
  const sectionTitleFontSize = isLargeTablet ? 22 : isTablet ? 21 : isSmallScreen ? 18 : 20;
  const primaryTextFontSize = isLargeTablet ? 20 : isTablet ? 19 : isSmallScreen ? 16 : 18;
  const coordinateValueFontSize = isLargeTablet ? 18 : isTablet ? 17 : isSmallScreen ? 14 : 16;
  const coordinateLabelFontSize = isLargeTablet ? 14 : isTablet ? 13 : isSmallScreen ? 11 : 13;
  
  const iconSize = isLargeTablet ? 28 : isTablet ? 26 : isSmallScreen ? 20 : 24;
  const closeIconSize = isLargeTablet ? 36 : isTablet ? 34 : isSmallScreen ? 28 : 32;
  
  const horizontalPadding = isLargeTablet ? 32 : isTablet ? 28 : isSmallScreen ? 16 : 24;
  const sectionMargin = isLargeTablet ? 32 : isTablet ? 30 : isSmallScreen ? 20 : 28;
  const sectionHeaderMargin = isLargeTablet ? 18 : isTablet ? 16 : isSmallScreen ? 10 : 14;
  const coordinatePadding = isLargeTablet ? 22 : isTablet ? 20 : isSmallScreen ? 14 : 18;
  const coordinateRadius = isLargeTablet ? 20 : isTablet ? 18 : isSmallScreen ? 12 : 16;
  
  const handleWidth = isTablet ? 50 : isSmallScreen ? 35 : 40;
  const handleHeight = isTablet ? 5 : 4;
  
  const closeButtonRight = isLargeTablet ? 28 : isTablet ? 24 : isSmallScreen ? 12 : 20;
  const closeButtonTop = isSmallScreen ? -5 : 0;
  
  const coordinatesLayout = isSmallScreen || (isTablet && isLandscape) ? 'column' : 'row';
  const coordinateGap = coordinatesLayout === 'column' ? 8 : 12;
  
  return {
    titleFontSize,
    sectionTitleFontSize,
    primaryTextFontSize,
    coordinateValueFontSize,
    coordinateLabelFontSize,
    iconSize,
    closeIconSize,
    horizontalPadding,
    sectionMargin,
    sectionHeaderMargin,
    coordinatePadding,
    coordinateRadius,
    handleWidth,
    handleHeight,
    closeButtonRight,
    closeButtonTop,
    coordinatesLayout,
    coordinateGap,
  };
};

export default function PhotoDetailsPanel({ 
  photo, 
  closePanel 
}: { 
  photo: Photo, 
  closePanel: () => void 
}) {
  const dimensions = useResponsiveDimensions();
  const responsiveValues = getResponsiveValues(dimensions);

  const dynamicStyles = StyleSheet.create({
    panelHandle: {
      width: responsiveValues.handleWidth,
      height: responsiveValues.handleHeight,
      marginTop: dimensions.isTablet ? 16 : 12,
      marginBottom: dimensions.isTablet ? 24 : 20,
    },
    panelContent: {
      paddingHorizontal: responsiveValues.horizontalPadding,
    },
    panelTitle: {
      fontSize: responsiveValues.titleFontSize,
      marginBottom: dimensions.isTablet ? 28 : 24,
    },
    closeButton: {
      right: responsiveValues.closeButtonRight,
      top: responsiveValues.closeButtonTop,
      padding: dimensions.isSmallScreen ? 4 : 8,
    },
    section: {
      marginBottom: responsiveValues.sectionMargin,
    },
    sectionHeader: {
      marginBottom: responsiveValues.sectionHeaderMargin,
      marginLeft: dimensions.isSmallScreen ? 8 : 12,
    },
    sectionTitle: {
      fontSize: responsiveValues.sectionTitleFontSize,
    },
    primaryText: {
      fontSize: responsiveValues.primaryTextFontSize,
      lineHeight: responsiveValues.primaryTextFontSize * 1.4,
      marginLeft: dimensions.isSmallScreen ? 8 : 12,
    },
    coordinatesDetails: {
      flexDirection: responsiveValues.coordinatesLayout as 'row' | 'column',
      gap: responsiveValues.coordinateGap,
      marginLeft: dimensions.isSmallScreen ? 8 : 12,
    },
    coordinateItem: {
      padding: responsiveValues.coordinatePadding,
      borderRadius: responsiveValues.coordinateRadius,
      flex: responsiveValues.coordinatesLayout === 'row' ? 1 : undefined,
      minHeight: dimensions.isTablet ? 80 : 70,
      justifyContent: 'center',
    },
    coordinateLabel: {
      fontSize: responsiveValues.coordinateLabelFontSize,
      marginBottom: dimensions.isTablet ? 8 : 6,
      letterSpacing: dimensions.isTablet ? 0.8 : 0.5,
    },
    coordinateValue: {
      fontSize: responsiveValues.coordinateValueFontSize,
      lineHeight: responsiveValues.coordinateValueFontSize * 1.3,
    },
  });

  return (
    <>
      <View style={[styles.panelHandle, dynamicStyles.panelHandle]} />
      <View style={[styles.panelContent, dynamicStyles.panelContent]}>
        <Text style={[styles.panelTitle, dynamicStyles.panelTitle]}>
          Detalhes da Foto
        </Text>
        
        <TouchableOpacity 
          style={[styles.closeButton, dynamicStyles.closeButton]} 
          onPress={closePanel}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID="close-button"
        >
          <Icon 
            name="arrow-down-circle-outline" 
            size={responsiveValues.closeIconSize} 
            color="#6200EE" 
            testID="icon-close"
          />
        </TouchableOpacity>
        
        <View style={[styles.section, dynamicStyles.section]}>
          <View style={[styles.sectionHeader, dynamicStyles.sectionHeader]}>
            <Icon 
              testID="icon-time-outline"
              name="time-outline" 
              size={responsiveValues.iconSize} 
              color="#6200EE" 
            />
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
              Data e Hora
            </Text>
          </View>
          <Text style={[styles.primaryText, dynamicStyles.primaryText]}>
            {formatDate(photo.timestamp)}
          </Text>
        </View>

        <View style={[styles.section, dynamicStyles.section]}>
          <View style={[styles.sectionHeader, dynamicStyles.sectionHeader]}>
            <Icon 
              testID="icon-location-outline"
              name="location-outline" 
              size={responsiveValues.iconSize} 
              color="#6200EE" 
            />
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
              Localização
            </Text>
          </View>
          <View style={[styles.coordinatesDetails, dynamicStyles.coordinatesDetails]} testID="coordinates-details">
            <View style={[styles.coordinateItem, dynamicStyles.coordinateItem]} testID="coordinate-item">
              <Text style={[styles.coordinateLabel, dynamicStyles.coordinateLabel]}>
                Latitude
              </Text>
              <Text style={[styles.coordinateValue, dynamicStyles.coordinateValue]}>
                {photo.location.latitude.toFixed(6)}
              </Text>
            </View>
            <View style={[styles.coordinateItem, dynamicStyles.coordinateItem]} testID="coordinate-item">
              <Text style={[styles.coordinateLabel, dynamicStyles.coordinateLabel]}>
                Longitude
              </Text>
              <Text style={[styles.coordinateValue, dynamicStyles.coordinateValue]}>
                {photo.location.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelHandle: {
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
  },
  panelContent: {
    flex: 1,
  },
  panelTitle: {
    fontWeight: '700',
    color: '#333',
  },
  section: {
    // marginBottom será aplicado dinamicamente
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  primaryText: {
    color: '#666',
  },
  coordinatesDetails: {
    justifyContent: 'space-between',
  },
  coordinateItem: {
    backgroundColor: '#f8f9fa',
  },
  coordinateLabel: {
    color: '#888',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  coordinateValue: {
    color: '#333',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});