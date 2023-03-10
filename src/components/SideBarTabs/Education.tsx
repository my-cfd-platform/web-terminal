import React, { useEffect, useState } from 'react';
import { FlexContainer } from '../../styles/FlexContainer';
import styled from '@emotion/styled';
import { useStores } from '../../hooks/useStores';
import { PrimaryTextSpan } from '../../styles/TextsElements';
import { observer, Observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import EducationCourse from './EducationCourse';
import Colors from '../../constants/Colors';

const Education = observer(() => {
  const { educationStore, tabsStore } = useStores();

  const { t } = useTranslation();

  const [openTab, setOpenTab] = useState<string>('');

  useEffect(() => {
    tabsStore.setTabExpanded(false);
    educationStore.setActiveCourse(null);
    educationStore.setQuestionsList(null)
  }, []);

  const handleOpenTab = (id: string, counter: number) => {
    setOpenTab(`${id}_${counter}`);
  };

  if (
    (educationStore.activeCourse ||
    educationStore.coursesList === null) &&
    !educationStore.activeQuestion === null
  ) {
    return null;
  }

  return (
    <FlexContainer minWidth="320px" flexDirection="column" height="100%">
      <FlexContainer padding="12px 16px" margin="0 0 8px 0">
        <PrimaryTextSpan
          fontSize="12px"
          color={Colors.ACCENT}
          textTransform="uppercase"
        >
          {t('Education')}
        </PrimaryTextSpan>
      </FlexContainer>
      <HeadingWrapper
        backgroundColor="rgba(65,66,83,0.5)"
        padding="8px 16px"
        alignItems="center"
      >
        <FlexContainer
          marginRight="20px"
          width="54px"
        >
          <PrimaryTextSpan
            fontSize="10px"
            textTransform="uppercase"
            color={Colors.WHITE_LIGHT}
          >
            {t('progress')}
          </PrimaryTextSpan>
        </FlexContainer>
        <FlexContainer>
          <PrimaryTextSpan
            color={Colors.WHITE_LIGHT}
            fontSize="10px"
            textTransform="uppercase"
          >
            {t('topic')}
          </PrimaryTextSpan>
        </FlexContainer>
      </HeadingWrapper>
      <Observer>
        {() => (
          <EducationWrapper flexDirection="column">
            {educationStore.coursesList
              ?.filter((item) => item.id && !!item.totalQuestions)
              ?.map((item, counter) => (
              <EducationCourse
                key={item.id}
                on={openTab === `${item.id}_${counter}`}
                handleOpen={handleOpenTab}
                course={item}
                counter={counter}
              />
            ))}
          </EducationWrapper>
        )}
      </Observer>
    </FlexContainer>
  );
});

export default Education;

const HeadingWrapper = styled(FlexContainer)`
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
  border-top: 1px solid rgba(255, 255, 255, 0.16);
`;

const EducationWrapper = styled(FlexContainer)`
  overflow-y: auto;
  max-height: calc(100% - 160px);

  ::-webkit-scrollbar {
    width: 4px;
    border-radius: 2px;
  }

  ::-webkit-scrollbar-track-piece {
    background-color: transparent;
  }
  ::-webkit-scrollbar-thumb:vertical {
    background-color: rgba(0, 0, 0, 0.6);
  }
`;
