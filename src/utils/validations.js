import * as yup from 'yup';

export const signUpValidationSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  confirmPassword: yup.string().min(6).required(),
});

export const signInValidationSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

export const dateChecker = yup.object().shape({
  dateOfBirth: yup.string()
    .required('Date of birth is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format') // Ensure year exists
    .test('is-valid-date', 'Invalid date', function (value) {
      const [year, month, day] = value.split('-').map(Number);
      const date = new Date(value);
      // Check if it's a real date
      console.log('dateOfBirth', yup.string())
      return (
        !isNaN(date.getTime()) &&
        date.getFullYear() === year &&
        date.getMonth() + 1 === month &&
        date.getDate() === day
      );
    })
    .test('not-in-future', 'Date cannot be in the future', function (value) {
      return new Date(value) <= new Date();
    })
    .test('year-check', 'Year must be less than current year', function (value) {
      const inputYear = parseInt(value.split('-')[0]);
      const currentYear = new Date().getFullYear();
      return inputYear < currentYear;
    }),
});


