import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface ErrorDisplayProps {
  error: Error | string;
  context?: string;
}

export function ErrorDisplay({ error, context }: ErrorDisplayProps) {
  const errorMessage = error instanceof Error ? error.message : error;
  
  return (
    <View style={styles.container}>
      {context && <Text style={styles.context}>{context}</Text>}
      <Text style={styles.errorText}>{errorMessage}</Text>
      {error instanceof Error && error.stack && (
        <Text style={styles.stackTrace}>{error.stack}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    margin: 16,
  },
  context: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#c62828',
    marginBottom: 8,
  },
  stackTrace: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});