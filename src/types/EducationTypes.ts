import { EducationResponseEnum } from '../enums/EducationResponseEnum';

export interface IEducationCourses {
  id: string,
  title: string,
  description : string,
  lastQuestionNumber: number,
  totalQuestions: number
}

export interface IEducationCoursesDTO {
  responseCode: EducationResponseEnum;
  data: IEducationCourses[];
}

export interface IEducationQuestionPage {
  id: number,
  url: string
}

export interface IEducationQuestion {
  id: number,
  title: string,
  pages: IEducationQuestionPage[]
}

export interface IEducationQuestionsList {
  id: string,
  title: string,
  description : string,
  lastQuestionNumber: number,
  questions: IEducationQuestion[]
}

export interface IEducationQuestionsDTO {
  responseCode: EducationResponseEnum;
  data: IEducationQuestionsList;
}
