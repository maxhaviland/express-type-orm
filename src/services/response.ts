export const response = {
  auth: ({ user, token, code }: any): Object => {
    return { user, token, message: 'successfully requested', code, boolean: true }
  },

  error: ({ error, code }: any): Object => {
    return { error, message: 'Requested with error', code, boolean: false }
  },

  validateError: ({ error, code }: any): Object => {
    return { error, message: 'Requested with error', code, boolean: false }
  },

  validateSuccess: ({ message, code }: any): Object => {
    return { message, code, boolean: true }
  },
}