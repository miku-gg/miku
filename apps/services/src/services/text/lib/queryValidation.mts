export interface GuidanceQuery {
  model: string;
  template: string;
  variables: Record<string, string[] | string>;
}

export const validateGuidanceQuery = (query: GuidanceQuery): void => {
  if (query.model === undefined) {
    throw { message: "model is required", status: 400 };
  }

  if (query.template === undefined) {
    throw { message: "template is required", status: 400 };
  }

  if (query.variables) {
    for (const key in query.variables) {
      if (typeof query.variables[key] !== "string") {
        if (!Array.isArray(query.variables[key])) {
          throw {
            message: `${key} must be a string or an array of strings`,
            status: 400,
          };
        } else {
          for (const value of query.variables[key]) {
            if (typeof value !== "string") {
              throw {
                message: `${key} must be a string or an array of strings`,
                status: 400,
              };
            }
          }
        }
      }
    }
  }
};
