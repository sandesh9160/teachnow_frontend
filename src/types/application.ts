export type ApplicationAnswer = {
  question_id: number;
  candidate_answer: string;
};

export type ApplicationPayload = {
  answers: ApplicationAnswer[];
};
