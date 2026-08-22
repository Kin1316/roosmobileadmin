jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    API_BASE_URL: '',
  },
}));

import {normalizeApiBaseUrl} from '../src/services/api';

describe('normalizeApiBaseUrl', () => {
  it('preserves http URLs and trims trailing slashes', () => {
    expect(normalizeApiBaseUrl('http://example.com')).toBe('http://example.com');
    expect(normalizeApiBaseUrl('http://example.com:3000/api/')).toBe('http://example.com:3000/api');
  });

  it('preserves already secure https URLs', () => {
    expect(normalizeApiBaseUrl('https://example.com/api/')).toBe('https://example.com/api');
  });
});
