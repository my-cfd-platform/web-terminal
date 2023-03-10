import React, { FC } from 'react';
import { FlexContainer } from '../../styles/FlexContainer';
import { PrimaryTextSpan } from '../../styles/TextsElements';
import styled from '@emotion/styled';
import Colors from '../../constants/Colors';

interface Props {
  isActive: boolean;
  currencySymbol: string;
  value: number;
  handleClick: (value: number) => void;
}

const AmountPlaceholder: FC<Props> = ({ isActive, currencySymbol, value , handleClick}) => {
  const selectValue = () => {
    handleClick(value);
  }
  return (
    <AmountPlaceholderWrapper
      backgroundColor={isActive ? '#494C53' : '#23262F'}
      borderRadius="4px"
      padding="8px 20px"
      onClick={selectValue}
    >
      <PrimaryTextSpan color={isActive ? Colors.ACCENT : "rgba(196, 196, 196, 0.5)"} fontSize="10px" fontWeight="bold">
        {currencySymbol} (USD) {value}
      </PrimaryTextSpan>
    </AmountPlaceholderWrapper>
  );
};

export default AmountPlaceholder;

const AmountPlaceholderWrapper = styled(FlexContainer)`
  transition: all 0.2s ease;
  &:hover {
    cursor: pointer;
    background-color: #494C53;
    color: ${Colors.ACCENT};
  }
  &:not(:last-of-type) {
    margin-right: 8px;
  }
`;
