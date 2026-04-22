export type ApplicationAnswer = {
  question_id: number;
  candidate_answer: string;
};

export type ApplicationPayload = {
  job_id?: number | string;
  answers: ApplicationAnswer[];
  resume_id?: number | string;
  resume_type?: string;
};

export type ApplicationResponse = {
  status: boolean;
  message?: string;
  data?: any;
};
