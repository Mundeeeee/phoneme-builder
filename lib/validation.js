import { PHONEME_MAP } from "./phonemeData";

// Central place for input validation, used by every API route. Every
// function returns { valid: true } or { valid: false, errors: [...] } so
// route handlers can respond with a consistent 400 + error list instead of
// letting bad data reach Prisma / the database.

export function validateWordListInput(body) {
  const errors = [];
  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["Request body must be a JSON object."] };
  }
  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    errors.push("name is required and must be a non-empty string.");
  } else if (body.name.length > 120) {
    errors.push("name must be 120 characters or fewer.");
  }
  if (body.description !== undefined && body.description !== null && typeof body.description !== "string") {
    errors.push("description must be a string if provided.");
  }
  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateWordInput(body) {
  const errors = [];
  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["Request body must be a JSON object."] };
  }
  if (typeof body.englishWord !== "string" || body.englishWord.trim().length === 0) {
    errors.push("englishWord is required and must be a non-empty string.");
  }
  if (!Array.isArray(body.phonemes) || body.phonemes.length === 0) {
    errors.push("phonemes is required and must be a non-empty array of phoneme symbols.");
  } else {
    body.phonemes.forEach((symbol, i) => {
      if (typeof symbol !== "string" || symbol.length === 0) {
        errors.push(`phonemes[${i}] must be a non-empty string.`);
      } else if (!PHONEME_MAP[symbol]) {
        errors.push(`phonemes[${i}] ("${symbol}") is not a recognised HCE phoneme symbol.`);
      }
    });
    if (body.phonemes.length > 12) {
      errors.push("phonemes must contain 12 symbols or fewer.");
    }
  }
  return errors.length ? { valid: false, errors } : { valid: true };
}

const ACTIVITY_TYPES = ["WORDLE", "WORD_SEARCH"];
const DIFFICULTY_LEVELS = ["EASY", "MEDIUM", "HARD"];

export function validateActivityConfigInput(body) {
  const errors = [];
  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["Request body must be a JSON object."] };
  }
  if (!ACTIVITY_TYPES.includes(body.type)) {
    errors.push(`type is required and must be one of: ${ACTIVITY_TYPES.join(", ")}.`);
  }
  if (typeof body.title !== "string" || body.title.trim().length === 0) {
    errors.push("title is required and must be a non-empty string.");
  }
  if (typeof body.wordListId !== "string" || body.wordListId.trim().length === 0) {
    errors.push("wordListId is required and must reference an existing word list.");
  }
  if (body.showHints !== undefined && typeof body.showHints !== "boolean") {
    errors.push("showHints must be a boolean if provided.");
  }
  if (body.difficulty !== undefined && !DIFFICULTY_LEVELS.includes(body.difficulty)) {
    errors.push(`difficulty must be one of: ${DIFFICULTY_LEVELS.join(", ")}.`);
  }

  if (body.type === "WORDLE") {
    if (body.maxGuesses !== undefined) {
      if (!Number.isInteger(body.maxGuesses) || body.maxGuesses < 1 || body.maxGuesses > 15) {
        errors.push("maxGuesses must be an integer between 1 and 15.");
      }
    }
  }

  if (body.type === "WORD_SEARCH") {
    if (body.gridRows !== undefined) {
      if (!Number.isInteger(body.gridRows) || body.gridRows < 4 || body.gridRows > 24) {
        errors.push("gridRows must be an integer between 4 and 24.");
      }
    }
    if (body.gridCols !== undefined) {
      if (!Number.isInteger(body.gridCols) || body.gridCols < 4 || body.gridCols > 24) {
        errors.push("gridCols must be an integer between 4 and 24.");
      }
    }
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}
