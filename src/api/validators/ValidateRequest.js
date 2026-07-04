import ValidationError from "../../core/errors/ValidationError.js";

const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const firstIssue = result.error.issues?.[0] ?? result.error.errors?.[0];

      return next(
        new ValidationError(firstIssue?.message ?? "Invalid request."),
      );
    }

    req.body = result.data;

    next();
  };
};

export default validateRequest;
