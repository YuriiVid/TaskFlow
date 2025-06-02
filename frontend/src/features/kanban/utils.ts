export function isShallowEqual(obj1: Record<string, unknown>, obj2: Record<string, unknown>): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }
  return keys1.every((key1) => Object.is(obj1[key1], obj2[key1]));
}

import { BoardMember, BoardMemberRole } from "@features/kanban/types";

export const getRoleColor = (role: string) => {
  const colors = {
    owner: "text-yellow-600 bg-yellow-100",
    admin: "text-teal-600 bg-teal-100",
    member: "text-blue-600 bg-blue-100",
    observer: "text-gray-600 bg-gray-100",
  };
  return colors[role as keyof typeof colors] || "text-gray-600 bg-gray-100";
};

export const getRoleOptions = (currentRole: BoardMemberRole) => {
  return [
    { value: BoardMemberRole.Observer, label: "Observer" },
    { value: BoardMemberRole.Member, label: "Member" },
    { value: BoardMemberRole.Admin, label: "Admin" },
    { value: BoardMemberRole.Owner, label: "Owner" },
  ].filter((option) => option.value !== currentRole);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateLabelTitle = (title: string): boolean => {
  return title.trim().length > 0 && title.length <= 50;
};

export function hasBoardAdminRights(member: BoardMember | undefined): boolean {
  if (!member) return false;
  return member.role === BoardMemberRole.Owner || member.role === BoardMemberRole.Admin;
}
