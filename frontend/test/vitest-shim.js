const vi = {
  fn: jest.fn,
  spyOn: jest.spyOn,
  mock: jest.mock,
  clearAllMocks: jest.clearAllMocks,
  resetAllMocks: jest.resetAllMocks,
  restoreAllMocks: jest.restoreAllMocks,
};

module.exports = {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  test,
  vi,
};
