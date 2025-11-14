export const isValidFirstName = (name: string): boolean => {
    const validPattern = /^[\p{L} ]+$/u;
    return validPattern.test(name);
};

export const isValidLastName = (name: string): boolean => {
    const validPattern = /^[\p{L} ]+$/u;
    return validPattern.test(name);
};

export const isValidPassword = (password: string): boolean => {
    const validPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/;
    return validPattern.test(password);
};
