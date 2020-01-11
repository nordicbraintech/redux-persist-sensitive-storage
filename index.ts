import {Platform} from 'react-native';
import sensitiveInfo from 'react-native-sensitive-info';

export default function(options = {}) {
  // react-native-sensitive-info returns different a different structure on iOS
  // than it does on Android.
  //
  // iOS:
  // [
  //   [
  //     { service: 'app', key: 'foo', value: 'bar' },
  //     { service: 'app', key: 'baz', value: 'quux' }
  //   ]
  // ]
  //
  // Android:
  // {
  //   foo: 'bar',
  //   baz: 'quux'
  // }
  //
  // See https://github.com/mCodex/react-native-sensitive-info/issues/8
  //
  // `extractKeys` adapts for the different structure to return the list of
  // keys.
  const extractKeys = Platform.select({
    ios: (items: any) => items[0].map((item: any) => item.key),
    android: Object.keys,
  });

  const noop = (arg1?: any, arg2?: any) => null;

  return {
    async getItem(key: any, callback = noop) {
      try {
        // getItem() returns `null` on Android and `undefined` on iOS;
        // explicitly return `null` here as `undefined` causes an exception
        // upstream.
        let result: any = await sensitiveInfo.getItem(key, options);

        if (typeof result === 'undefined') {
          result = null;
        }

        callback(null, result);

        return result;
      } catch (error) {
        callback(error);
        throw error;
      }
    },

    async setItem(key: any, value: any, callback = noop) {
      try {
        await sensitiveInfo.setItem(key, value, options);
        callback(null);
      } catch (error) {
        callback(error);
        throw error;
      }
    },

    async removeItem(key: any, callback = noop) {
      try {
        await sensitiveInfo.deleteItem(key, options);
        callback(null);
      } catch (error) {
        callback(error);
        throw error;
      }
    },

    async getAllKeys(callback = noop) {
      try {
        const values = await sensitiveInfo.getAllItems(options);
        const result = (extractKeys !== undefined) ? extractKeys(values) : null;

        callback(null, result);

        return result;
      } catch (error) {
        callback(error);
        throw error;
      }
    },
  };
}
