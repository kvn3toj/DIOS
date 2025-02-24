declare global {
    namespace NodeJS {
        interface Global {
            createTestingModule: typeof createTestingModule;
            createMockAnalytics: typeof createMockAnalytics;
        }
    }
}
export {};
