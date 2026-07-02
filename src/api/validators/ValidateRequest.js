import ValidationError from "../../core/errors/ValidationError.js";

const validateRequest = (schema) => {
    return (req, res, next) => {

        const result = schema.safeParse(req.body);

        if (!result.success) {

            return next(
                new ValidationError(
                    result.error.errors[0].message
                )
            );

        }

        req.body = result.data;

        next();
    };
};

export default validateRequest;