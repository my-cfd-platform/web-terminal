import React, { FC } from 'react';
import styled from '@emotion/styled';
import { FlexContainer } from '../styles/FlexContainer';
import ErropPopup from './ErropPopup';
import Colors from '../constants/Colors';

interface Props {
  id: string;
  checked?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: boolean;
  errorText?: string;
  isError?: boolean;
}

const Checkbox: FC<Props> = ({
  id,
  children,
  checked,
  onChange,
  hasError,
  errorText,
}) => (
  <>
    <Label htmlFor={id}>
      <InputCheckbox
        checkboxClass={id}
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <CheckboxElement
        className={`${id}-checkbox ${hasError && `hasError`}`}
      ></CheckboxElement>
      {children}

      {hasError && (
        <ErropPopup
          textColor={Colors.ACCENT}
          bgColor={Colors.DANGER}
          classNameTooltip={id}
          direction="right"
        >
          {errorText}
        </ErropPopup>
      )}
    </Label>
  </>
);

export default Checkbox;

const Label = styled.label`
  display: flex;
  align-items: center;
  margin: 0;
  position: relative;

  &:hover {
    cursor: pointer;
  }
`;

const CheckboxElement = styled(FlexContainer)`
  overflow: hidden;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.19);
  border-radius: 4px;
  width: 16px;
  min-width: 16px;
  height: 16px;
  margin-right: 8px;
  position: relative;
  transition: background-color 0.2s ease;
  will-change: background-color;

  &.hasError {
    border-color: ${Colors.DANGER};
  }

  &:before {
    content: '';
    background-color: rgba(255, 255, 255, 0.06);
    z-index: -1;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
`;

const InputCheckbox = styled.input<{ checkboxClass: string }>`
  display: none;

  &:checked + .${props => props.checkboxClass}-checkbox {
    background-color: ${Colors.PRIMARY};
  }
`;
