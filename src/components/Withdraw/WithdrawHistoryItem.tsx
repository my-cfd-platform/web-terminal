import React, { useRef, useEffect } from 'react';
import { DisplayContents, Td } from '../../styles/TableElements';
import { FlexContainer } from '../../styles/FlexContainer';
import { PrimaryTextSpan } from '../../styles/TextsElements';
import ClosePositionPopup from '../SideBarTabs/ClosePositionPopup';
import { WithdrawalHistoryModel } from '../../types/WithdrawalTypes';
import { WithdrawalStatusesEnum } from '../../enums/WithdrawalStatusesEnum';
import { WithdrawHistoryStatusName } from '../../enums/WithdrawHistoryStatusName';
import moment from 'moment';
import { PaymentNameEnum } from '../../enums/PaymentNameEnum';
import API from '../../helpers/API';
import { useStores } from '../../hooks/useStores';
import { WithdrawalHistoryResponseStatus } from '../../enums/WithdrawalHistoryResponseStatus';

interface Props {
  data?: WithdrawalHistoryModel;
  updateHistory: () => void;
}

const WithdrawHistoryItem = (props: Props) => {
  const { data, updateHistory } = props;
	const instrumentRef = useRef(null);
	const { mainAppStore } = useStores();
	
	const handleCancel = async (withdrawalId: string) => {
		try {
			const result = await API.cancelWithdrawal({
				authToken: mainAppStore.token,
				withdrawalId
      });
      if (result.status === WithdrawalHistoryResponseStatus.Successful) {
        updateHistory();
      }
		} catch (error) {
			
		}
  }
  

  const selectStatusColor = (status: WithdrawalStatusesEnum | null) => {
    switch (status) {
      case WithdrawalStatusesEnum.Pending:
        return '#FFFCCC';
      case WithdrawalStatusesEnum.Approved:
        return '#3CFF8A';
      case WithdrawalStatusesEnum.Canceled:
        return '#FF557E';
      case WithdrawalStatusesEnum.Declined:
        return '#FF557E';
      default:
        return 'rgba(255, 255, 255, 0.4)';
    }
  };

  

  return (
    <DisplayContents>
      <Td>
        <FlexContainer alignItems="center">
          <PrimaryTextSpan
            fontSize="12px"
            color="#FFFCCC"
            whiteSpace="nowrap"
            fontWeight="bold"
          >
            {PaymentNameEnum[data?.type || 0]}
          </PrimaryTextSpan>
        </FlexContainer>
      </Td>
      <Td>
        <FlexContainer alignItems="center">
          <PrimaryTextSpan
            fontSize="12px"
            color="rgba(255,255,255,0.4)"
            whiteSpace="nowrap"
          >
            {moment(data?.creationDate).format('MMMM Do YYYY, h:mm:ss a')}
          </PrimaryTextSpan>
        </FlexContainer>
      </Td>
      <Td>
        <FlexContainer
          alignItems="center"
          justifyContent="flex-end"
          width="100%"
        >
          <PrimaryTextSpan fontSize="12px" color={selectStatusColor(data?.status || null)} whiteSpace="nowrap">
            ${data?.amount.toFixed(2)}
          </PrimaryTextSpan>
        </FlexContainer>
      </Td>
      <Td>
        <FlexContainer
          alignItems="center"
          justifyContent="flex-end"
          width="100%"
        >
          <PrimaryTextSpan fontSize="12px" color={selectStatusColor(data?.status || null)} whiteSpace="nowrap">
            {WithdrawHistoryStatusName[data?.status || 0]}
          </PrimaryTextSpan>
        </FlexContainer>
      </Td>
      <Td>
        <FlexContainer
          alignItems="center"
          justifyContent="flex-end"
          width="100%"
          position="relative"
        >
          {data?.status === WithdrawalStatusesEnum.Pending && (
            <ClosePositionPopup
              applyHandler={() => handleCancel(data.id)}
              ref={instrumentRef}
							confirmText="Cancel the withdrawal request?"
              isButton
              alignPopup="right"
            />
          )}
        </FlexContainer>
      </Td>
    </DisplayContents>
  );
};

export default WithdrawHistoryItem;