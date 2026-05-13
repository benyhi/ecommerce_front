import { MantineThemeOverride } from '@mantine/core';

export const mantineTheme: MantineThemeOverride = {
  primaryColor: 'brand',
  fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  colors: {
    brand: [
      'var(--accent-50, #eef2ff)',
      'var(--accent-100, #e0e7ff)',
      'var(--accent-200, #c7d2fe)',
      'var(--accent-300, #a5b4fc)',
      'var(--accent-400, #818cf8)',
      'var(--accent, #6366f1)',
      'var(--accent-600, #4f46e5)',
      'var(--accent-700, #4338ca)',
      'var(--accent-800, #3730a3)',
      'var(--accent-900, #312e81)',
    ],
  },
  components: {
    Button: {
      styles: () => ({
        root: {
          fontWeight: 500,
        },
      }),
    },
    Input: {
      styles: () => ({
        input: {
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
          '&::placeholder': {
            color: 'var(--text-muted)',
          },
          '&:focus': {
            borderColor: 'var(--accent)',
            boxShadow: '0 0 0 3px rgba(99,102,241,.15)',
          },
        },
        label: {
          color: 'var(--text-primary)',
          fontWeight: 500,
        },
      }),
    },
    TextInput: {
      styles: () => ({
        input: {
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
          '&::placeholder': {
            color: 'var(--text-muted)',
          },
          '&:focus': {
            borderColor: 'var(--accent)',
            boxShadow: '0 0 0 3px rgba(99,102,241,.15)',
          },
        },
        label: {
          color: 'var(--text-primary)',
          fontWeight: 500,
        },
      }),
    },
    Textarea: {
      styles: () => ({
        input: {
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
          '&::placeholder': {
            color: 'var(--text-muted)',
          },
          '&:focus': {
            borderColor: 'var(--accent)',
            boxShadow: '0 0 0 3px rgba(99,102,241,.15)',
          },
        },
        label: {
          color: 'var(--text-primary)',
          fontWeight: 500,
        },
      }),
    },
    Select: {
      styles: () => ({
        input: {
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
          '&:focus': {
            borderColor: 'var(--accent)',
            boxShadow: '0 0 0 3px rgba(99,102,241,.15)',
          },
        },
        label: {
          color: 'var(--text-primary)',
          fontWeight: 500,
        },
      }),
    },
    Accordion: {
      styles: () => ({
        item: {
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg-card)',
        },
        control: {
          color: 'var(--text-primary)',
          '&:hover': {
            backgroundColor: 'var(--bg-elevated)',
          },
        },
        label: {
          color: 'var(--text-primary)',
          fontWeight: 500,
        },
        panel: {
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-card)',
        },
      }),
    },
    Title: {
      styles: () => ({
        root: {
          color: 'var(--text-primary)',
          fontWeight: 700,
        },
      }),
    },
    Text: {
      styles: () => ({
        root: {
          color: 'var(--text-secondary)',
        },
      }),
    },
    Paper: {
      styles: () => ({
        root: {
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
        },
      }),
    },
    Modal: {
      styles: () => ({
        content: {
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
        },
        header: {
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
        },
        title: {
          color: 'var(--text-primary)',
          fontWeight: 700,
        },
      }),
    },
  },
};
