module.exports = {
  extends: ['@loopback/eslint-config'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/member-naming': [
      'error',
      {
        private: '^_',
        protected: '^_'
      }
    ],
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
  }
};
