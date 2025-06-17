import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
`;

export const ButtonContainer = styled.View`
    display: flex;
    flex: 1;
    flex-direction: row;
    justify-content: end;
    align-items: center;
    gap: 64px;
    margin: 64px;
`;

export const Button = styled.TouchableOpacity`
    flex: 1;
    flex-direction: row;
    margin-bottom: 64px;
`;