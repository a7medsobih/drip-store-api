import bcrypt from "bcrypt";

export const hashValue = async (value, saltRounds = 10) => {
  return bcrypt.hash(value, saltRounds);
};

export const compareValue = async (value, hashedValue) => {
  return bcrypt.compare(value, hashedValue);
};
