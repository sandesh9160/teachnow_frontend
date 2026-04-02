export type EducationPayload = {
  degree: string;
  institution: string;
  field_of_study: string;
  start_year: string;
  end_year: string;
  grade: string;
};

/** Record as returned on profile or education endpoints (may include legacy date fields). */
export type EducationRecord = {
  id: number | string;
  degree?: string;
  institution?: string;
  field_of_study?: string;
  start_year?: string;
  end_year?: string;
  grade?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
};
