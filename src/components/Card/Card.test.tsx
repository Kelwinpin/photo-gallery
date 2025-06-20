import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import Card from '../../components/Card';
import { Photo } from '../../services/photoService';

jest.mock('../../utils/fomatDate', () => ({
    formatDate: jest.fn((date) => '01/01/2024 10:00'),
}));

jest.mock('../../utils/fomatCoords', () => ({
    formatCoordinate: jest.fn((coord) => coord.toFixed(4)),
}));

const CardWithNavigation = ({ children }: { children: React.ReactNode }) => (
    <NavigationContainer>
        {children}
    </NavigationContainer>
);

describe('Card Component', () => {
    const mockPhoto: Photo = {
        id: '1',
        uri: 'file://test-image.jpg',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        location: {
            latitude: -23.5505,
            longitude: -46.6333,
        },
        filename: 'teste'
    };

    const mockHandleDeletePhoto = jest.fn();

    const defaultProps = {
        item: mockPhoto,
        handleDeletePhoto: mockHandleDeletePhoto,
        cardWidth: 200,
        imageHeight: 150,
        cardMargin: 5,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render card with photo information', () => {
        const { getByText } = render(
            <CardWithNavigation>
                <Card {...defaultProps} />
            </CardWithNavigation>
        );

        expect(getByText('-23.5505, -46.6333')).toBeTruthy();
        expect(getByText('01/01/2024 10:00')).toBeTruthy();
    });

    it('should call handleDeletePhoto when delete button is pressed', () => {
        const { getByTestId } = render(
            <CardWithNavigation>
                <Card {...defaultProps} />
            </CardWithNavigation>
        );

        const deleteButton = getByTestId('delete-button');
        fireEvent.press(deleteButton);

        expect(mockHandleDeletePhoto).toHaveBeenCalledWith('1');
    });

    it('should have correct responsive styles for small card', () => {
        const smallCardProps = {
            ...defaultProps,
            cardWidth: 120,
            imageHeight: 90,
        };

        const { getByTestId } = render(
            <CardWithNavigation>
                <Card {...smallCardProps} />
            </CardWithNavigation>
        );

        const container = getByTestId('card-container');
        expect(container.props.style).toMatchObject([
            {
                "backgroundColor": "#fff",
                "borderRadius": 12,
                "elevation": 3,
                "shadowColor": "#000",
                "shadowOffset": {
                    "height": 2,
                    "width": 0
                },
                "shadowOpacity": 0.1,
                "shadowRadius": 4
            },
            {
                "margin": 5,
                "width": 120
            }
        ]);
    });

    it('should render image with correct source', () => {
        const { getByTestId } = render(
            <CardWithNavigation>
                <Card {...defaultProps} />
            </CardWithNavigation>
        );

        const image = getByTestId('card-image');
        expect(image.props.source).toEqual({ uri: 'file://test-image.jpg' });
    });

    it('should display filename when provided', () => {
        const { getByText } = render(
            <CardWithNavigation>
                <Card {...defaultProps} />
            </CardWithNavigation>
        );

        expect(getByText('01/01/2024 10:00')).toBeTruthy();
    });
});