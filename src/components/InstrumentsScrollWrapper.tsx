import React, { FC } from 'react';
import Instrument from './Instrument';
import { useStores } from '../hooks/useStores';
import { InstrumentModelWSDTO } from '../types/Instruments';
import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import API from '../helpers/API';
import KeysInApi from '../constants/keysInApi';

interface Props {}

const InstrumentsScrollWrapper: FC<Props> = observer(props => {
  const { instrumentsStore, tradingViewStore } = useStores();

  const handleRemoveInstrument = (itemId: string) => async () => {
    instrumentsStore.activeInstrumentsIds = instrumentsStore.activeInstrumentsIds.filter(
      id => id !== itemId
    );
    await API.setKeyValue({
      key: KeysInApi.SELECTED_INSTRUMENTS,
      value: JSON.stringify(instrumentsStore.activeInstrumentsIds),
    });
  };

  const switchInstrument = (instrument: InstrumentModelWSDTO) => () => {
    instrumentsStore.activeInstrument = instrument;
    tradingViewStore.tradingWidget?.chart().setSymbol(instrument.id, () => {});
  };

  return (
    <InstrumentsWrapper>
      {instrumentsStore.activeInstruments.map(item => (
        <Instrument
          instrument={item}
          key={item.id}
          isActive={item.id === instrumentsStore.activeInstrument?.id}
          handleClose={handleRemoveInstrument(item.id)}
          switchInstrument={switchInstrument(item)}
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
