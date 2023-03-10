import React, { FC } from 'react';
import Instrument from './Instrument';
import { useStores } from '../hooks/useStores';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import API from '../helpers/API';
import { AccountTypeEnum } from '../enums/AccountTypeEnum';

interface Props {}

const InstrumentsScrollWrapper: FC<Props> = observer(() => {
  const { instrumentsStore, mainAppStore, badRequestPopupStore } = useStores();

  const handleRemoveInstrument = (itemId: string) => async () => {
    let indexEl = instrumentsStore.activeInstrumentsIds.findIndex(
      (id) => id === itemId
    );

    const newInstruments = instrumentsStore.activeInstrumentsIds.filter(
      (id) => id !== itemId
    );
    try {
      const response = await API.postFavoriteInstrumets({
        accountId: mainAppStore.activeAccount!.id,
        type: mainAppStore.activeAccount!.isLive
          ? AccountTypeEnum.Live
          : AccountTypeEnum.Demo,
        instruments: newInstruments,
      });
      instrumentsStore.setActiveInstrumentsIds(response);

      if (instrumentsStore.activeInstrument?.instrumentItem.id === itemId) {
        indexEl = indexEl ? indexEl - 1 : 0;
        instrumentsStore.switchInstrument(response[indexEl]);
      }
    } catch (error) {}
  };

  return (
    <InstrumentsWrapper>
      {instrumentsStore.activeInstruments.map((item) => (
        <Instrument
          key={item.instrumentItem.id}
          instrument={item.instrumentItem}
          handleClose={handleRemoveInstrument(item.instrumentItem.id)}
        />
      ))}
    </InstrumentsWrapper>
  );
});

export default InstrumentsScrollWrapper;

const InstrumentsWrapper = styled.div`
  display: table;
  border-collapse: collapse;
  padding: 0 8px;
  margin: 10px 8px;
`;
