import styled from '@emotion/styled';

import { FlexContainer } from './FlexContainer';

export const Td = styled(FlexContainer)`
  transition: background-color 0.2s ease;
  padding: 12px 0;
  height: 60px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
`;

export const DisplayContents = styled.div`
  display: contents;

  &:hover > div {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export const Th = styled(FlexContainer)`
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
`;

export const TableGrid = styled.div<{ columnsCount: number }>`
  display: grid;
  grid-template-columns: minmax(300px, 1fr) repeat(
      ${props => props.columnsCount - 1},
      minmax(100px, 1fr)
    );
`;
