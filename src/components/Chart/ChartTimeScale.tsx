import React, { FC } from 'react';
import { FlexContainer } from '../../styles/FlexContainer';
import { supportedResolutions } from '../../constants/supportedResolutionsTimeScale';
import styled from '@emotion/styled';
import ColorsPallete from '../../styles/colorPallete';

interface Props {
  activeResolution: string;
  setTimeScale: (arg0: string) => void;
}

const ChartTimeScale: FC<Props> = props => {
  const { activeResolution, setTimeScale } = props;

  const handleChangeResolution = (resolution: string) => () => {
    setTimeScale(resolution);
  };

  const renderTextResolution = (resolution: string) => {
    switch (resolution) {
      case '1':
        return '1 MIN';

      case '60':
        return '1 HOUR';

      case '1D':
        return '1 DAY';

      case '1M':
        return '1 MONTH';

      default:
        return resolution;
    }
  };

  return (
    <ChartTimeScaleWrapper padding="2px" alignItems="center">
      {supportedResolutions.map(item => (
        <TimeScaleItem
          isActive={item === activeResolution}
          key={item}
          onClick={handleChangeResolution(item)}
        >
          {renderTextResolution(item)}
        </TimeScaleItem>
      ))}
    </ChartTimeScaleWrapper>
  );
};

export default ChartTimeScale;

const ChartTimeScaleWrapper = styled(FlexContainer)``;

export const TimeScaleItem = styled(FlexContainer)<{ isActive?: boolean }>`
  padding: 4px 12px;
  height: 28px;
  border-radius: 2px;
  justify-content: center;
  align-items: center;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 16px;
  text-transform: uppercase;
  color: ${props => (props.isActive ? '#21B3A4' : 'rgba(255, 255, 255, 0.6)')};
  border: ${props => (props.isActive ? '1px solid #21B3A4' : 'none')};
  backdrop-filter: blur(8px);
  background-color: ${props => props.isActive && 'rgba(33, 179, 164, 0.04);'};

  &:hover {
    background-color: rgba(33, 179, 164, 0.04);
    cursor: pointer;
  }
`;