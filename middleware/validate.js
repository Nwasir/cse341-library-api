// Validation middleware. The routes run these before the controller, so a
// request with a bad id or body gets a 400 explaining what is wrong and
// never reaches the database.

// GET, PUT and DELETE /:id
// A MongoDB _id is a 24 character hex string.
const id = (req, res, next) => {
  if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) return next();

  res
    .status(400)
    .json({ message: `Invalid id ${req.params.id}. An id must be a 24 character hex string.` });
};

const stripIsbn = (value) => value.replace(/[\s-]/g, '');

// True for a real calendar date in YYYY-MM-DD format that isn't in the future.
// JavaScript turns dates like 2001-02-30 into a later day (March 2),
// so the parsed date is compared with the original text.
const isPastDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(value);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    date <= new Date()
  );
};

// The kinds of field a body can have. isValid checks a value, message says
// what a valid value looks like, and clean (if there is one) changes a valid
// value into the form that is saved.
const rules = {
  text: {
    isValid: (value) => typeof value === 'string' && value.trim() !== '',
    clean: (value) => value.trim(),
    message: 'must be a non-empty string',
  },
  isbn: {
    // An ISBN-10 is 9 digits plus a check digit that can be X; an ISBN-13 is 13 digits.
    isValid: (value) => typeof value === 'string' && /^(\d{9}[\dX]|\d{13})$/i.test(stripIsbn(value)),
    clean: (value) => stripIsbn(value).toUpperCase(),
    message:
      'must be an ISBN-10 or ISBN-13: 10 or 13 digits (an ISBN-10 can end in X), hyphens and spaces allowed',
  },
  year: {
    isValid: (value) =>
      Number.isInteger(value) && value >= 1 && value <= new Date().getFullYear(),
    message: 'must be a whole number from 1 to the current year',
  },
  count: {
    isValid: (value) => Number.isInteger(value) && value > 0,
    message: 'must be a whole number greater than 0',
  },
  pastDate: {
    isValid: isPastDate,
    message: 'must be a real date in YYYY-MM-DD format that is not in the future',
  },
};

// Every book and author needs all of their fields (POST and PUT).
const bookFields = {
  title: rules.text,
  author: rules.text,
  isbn: rules.isbn,
  genre: rules.text,
  publishedYear: rules.year,
  pageCount: rules.count,
  publisher: rules.text,
  language: rules.text,
};

const authorFields = {
  name: rules.text,
  birthDate: rules.pastDate,
  birthplace: rules.text,
  nationality: rules.text,
  biography: rules.text,
};

// Returns middleware that checks req.body against the fields.
// Responds 400 with an error for every missing or invalid field.
// Otherwise req.body is replaced with only these fields, so anything else
// in the body (including an _id) is never saved.
const body = (name, fields) => (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      message: `The ${name} must be sent as a JSON object with the header Content-Type: application/json.`,
    });
  }

  const doc = {};
  const errors = {};

  Object.entries(fields).forEach(([field, rule]) => {
    const value = req.body[field];
    if (value === undefined || value === null) {
      errors[field] = `${field} is required`;
    } else if (!rule.isValid(value)) {
      errors[field] = `${field} ${rule.message}`;
    } else {
      doc[field] = rule.clean ? rule.clean(value) : value;
    }
  });

  if (Object.keys(errors).length) {
    return res.status(400).json({ message: `The ${name} has missing or invalid fields.`, errors });
  }

  req.body = doc;
  next();
};

module.exports = {
  id,
  book: body('book', bookFields),
  author: body('author', authorFields),
};
