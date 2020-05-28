import { validate as validateEmail } from 'email-validator'
import { query } from './user.query'

export const basic = async (field: string, value: string, minLength: number, maxLength: number, allowNull: boolean, allowNumbers: boolean, required: boolean = true): Promise<string> => {
  let result: string = '';
  if (!value.trim() && required)
    result = `Cannot be empty`;

  if (value.length < minLength || value.length > maxLength)
    result = `The ${field} must be between ${minLength} and ${maxLength} characters`;

  if (!allowNull && value.match(/[ ]/g))
    result = 'No spaces are allowed between characters';

  if (!allowNumbers && value.match(/[0-9]/g))
    result = `Numbers are not allowed in the ${field}`;

  if (field.toLocaleLowerCase() === 'username' && await query.usernameExists(value))
    result = `Username Already exists`;

return result;
}

export const sex = (field: string, value: string): string => {
  let result: string = ''
  const regex = /^[mf]$/
  if (!regex.test(value.toLocaleLowerCase()))
    result = ` Only allowed m or f`;
  return result;
}

export const email = async (value: string): Promise<string> => {
  let result: string = '';
  if (!value)
    result = `Email is empty`;

  if (await query.emailExists(value))
    result = `Email already exists`;

  if (!validateEmail(value))
    result = `Invalid email`;

  return result;
}

export const date = (value: string): string => {
  let result: string = '';
  const regex = /[0-9]{2}[\/-]{1}[0-9]{2}[\/-][0-9]{4}/g;
  if (!regex.test(value))
    result = `Invalid date`;
  return result;
}

export const validate = { basic, sex, email, date }