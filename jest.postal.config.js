/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/scripts', '<rootDir>/packages'],
  testMatch: [
    '**/scripts/__tests__/postal*.js',
    '**/scripts/__tests__/compile-postal*.js',
    '**/scripts/__tests__/update-postal*.js',
    '**/scripts/__tests__/countriesArg*.js',
    '**/scripts/__tests__/subsetCompile*.js',
    '**/packages/postal-*/__tests__/**/*.ts',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  verbose: true,
}
