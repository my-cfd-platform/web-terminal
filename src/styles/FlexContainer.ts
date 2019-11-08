import styled from '@emotion/styled';

interface Props {
  justifyContent?: 'center' | 'flex-start' | 'flex-end' | 'space-between';
  flexDirection?: 'column' | 'row';
  alignItem?: 'center' | 'flex-start' | 'flex-end';
  flexWrap?: 'wrap' | 'nowrap';
  width?: string;
  height?: string;
}

export const FlexContainer = styled.div<Props>`
  display: flex;
  justify-content: ${props => props.justifyContent};
  align-items: ${props => props.alignItem};
  width: ${props => props.width};
  height: ${props => props.height};
  flex-wrap: ${props => props.flexWrap};
  flex-direction: ${props => props.flexDirection};
`;
