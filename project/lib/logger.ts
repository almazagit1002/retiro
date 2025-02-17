import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const LOG_FILE = FileSystem.documentDirectory + 'app.log';

const writeToFile = async (message: string) => {
  if (Platform.OS === 'web') return;
  
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  
  try {
    await FileSystem.writeAsStringAsync(LOG_FILE, logMessage, {
      encoding: FileSystem.EncodingType.UTF8,
      append: true,
    });
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
};

const formatConsoleMessage = (type: string, message: string, data?: any): string => {
  const timestamp = new Date().toISOString();
  let formattedMessage = `${timestamp} - ${type}: ${message}`;
  if (data) {
    formattedMessage += `\n   Data: ${JSON.stringify(data, null, 2)}`;
  }
  return formattedMessage;
};

// CSS styles for web console
const webStyles = {
  error: 'color: #ff3b30; font-weight: bold',
  warn: 'color: #ff9500; font-weight: bold',
  info: 'color: #007aff; font-weight: bold',
};

const logToConsole = (type: 'error' | 'warn' | 'info', message: string) => {
  if (Platform.OS === 'web') {
    console.log(`%c${message}`, webStyles[type]);
  } else {
    console.log(message);
  }
};

export const logger = {
  error: async (message: string, error?: any) => {
    const logMessage = formatConsoleMessage('ERROR', message, error);
    logToConsole('error', logMessage);
    await writeToFile(logMessage);
    
    if (error?.message) {
      const errorDetails = `   Details: ${error.message}`;
      logToConsole('error', errorDetails);
      await writeToFile(errorDetails);
    }
    if (error?.stack) {
      const stackTrace = `   Stack: ${error.stack}`;
      logToConsole('error', stackTrace);
      await writeToFile(stackTrace);
    }
  },
  
  warn: async (message: string, data?: any) => {
    const logMessage = formatConsoleMessage('WARN', message, data);
    logToConsole('warn', logMessage);
    await writeToFile(logMessage);
  },
  
  info: async (message: string, data?: any) => {
    const logMessage = formatConsoleMessage('INFO', message, data);
    logToConsole('info', logMessage);
    await writeToFile(logMessage);
  },

  viewLogs: async (): Promise<string> => {
    if (Platform.OS === 'web') return 'Logs not available on web platform';
    
    try {
      const logs = await FileSystem.readAsStringAsync(LOG_FILE);
      return logs;
    } catch (error) {
      console.error('Error reading log file:', error);
      return 'Error reading logs';
    }
  },

  clearLogs: async (): Promise<void> => {
    if (Platform.OS === 'web') return;
    
    try {
      await FileSystem.writeAsStringAsync(LOG_FILE, '');
    } catch (error) {
      console.error('Error clearing log file:', error);
    }
  }
};