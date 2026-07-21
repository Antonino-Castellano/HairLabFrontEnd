import { Role } from "./enums/role";

export interface User{

    id?: number;

    firstName: string;

    lastName: string;

    address: string;

    email: string;

    password: string;

    dob: Date;

    role: Role;
}