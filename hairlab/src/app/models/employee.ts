import { JobTitle } from './enums/job-title';
import { Specialization } from './enums/specialization';

export interface Employee {

  id?: number;

  firstName: string;
  lastName: string;

  email: string;
  telephoneNumber: string;

  jobTitle: JobTitle;

  specializations: Specialization[];

  hireDate: string;

  active: boolean;

  notes?: string;

  profileImage?: string;
}