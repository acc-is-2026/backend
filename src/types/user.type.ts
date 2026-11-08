export type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type UpdateUserInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
};
