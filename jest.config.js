const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    collectCoverage: true,
    collectCoverageFrom: ["./src/**"],
    coverageReporters: ['html', 'lcov'],
    coverageDirectory: './coverage',
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/src/Infrastructure/Logger/logger.ts',
        '/src/Routes/',
        '/src/Controller/',
        '/src/Repository',
    ],

};



export default config;
