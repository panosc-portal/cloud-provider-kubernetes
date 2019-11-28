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
    ]
  }
};
