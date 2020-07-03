import { ApplicationStatus } from "../../utils/enums/application-status.enum";

export interface ApplicationRequest {
    eventId: number;
    vkUserId: number;
}

export interface EventApplications {
    eventId: number;
    applications: Application[]
}

export interface Application {
    id: number;
    userId: number;
    vkUserId: number;
    userFullName: string;
    vkUserAvatarUrl: string;
    date: Date;
    status: ApplicationStatus;
    distance: number;
    eventId: number;
}

export interface EventsApplications {
    [key:number]: Application[]
}