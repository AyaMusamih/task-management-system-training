import { faker } from "@faker-js/faker";

// export const generateRandomEmail = () => {
//   return `ansam${Math.floor(Math.random() * 1000)}@gmail.com`;
// };

export const UserDataGenerator = {
  generateUser() {
    // method reurn object contains name,email and password
    return {
      fullName: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 4 }) + "Aa1*",
    };
  },
};
