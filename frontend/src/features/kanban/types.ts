import { AppUser } from "@shared/types";

export interface BriefBoard {
  id: number;
  title: string;
  description?: string;
  members: AppUser[];
  tasksCount: number;
}

export interface Board {
  id: number;
  title: string;
  description?: string;
  members: BoardMember[];
  columns: Column[];
  labels: Label[];
}

export interface BoardMember extends AppUser {
  role: BoardMemberRole;
}

export enum BoardMemberRole {
  Owner = "owner",
  Admin = "admin",
  Member = "member",
  Observer = "observer",
}

export interface Label {
  id: number;
  title?: string;
  color: string;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  cardId: number;
  user: AppUser;
}

export interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  sizeInBytes: number;
}

export interface BriefCard {
  id: number;
  title: string;
  description: string;
  dueDate?: string;
  labels: Label[];
  attachmentsCount: number;
  assignedUsers: AppUser[];
  commentsCount: number;
  hasDescription: boolean;
  position: number;
  isCompleted: boolean;
}

export interface Card {
  id: number;
  title: string;
  description: string;
  dueDate?: string;
  labels: Label[];
  attachments: Attachment[];
  assignedUsers: BoardMember[];
  comments: Comment[];
  hasDescription: boolean;
  position?: number;
  columnId: number;
  isCompleted: boolean;
}

export interface Column {
  id: number;
  title: string;
  position: number;
  cards: BriefCard[];
}
