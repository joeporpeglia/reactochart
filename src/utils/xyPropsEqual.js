import _ from 'lodash';
import shallowEqual from './shallowEqual';
import {scaleEqual} from './Scale';

// xyPropsEqual is a function used by XYPlot-type charts,
// in their `shouldComponentUpdate` methods, for determining whether next props are the same as previous props.
// in a perfect world this would just be a simple shallow equality check,
// however some props are almost always passed as object/array literals (so they never ===)
// or require special equality checks (eg. d3 scales)

// default list of props to check for *deep equality* using _.isEqual
// can be overridden by components by passing `propKeysToDeepCheck` argument
// todo: decide whether data really belongs on this list? deep-checking data can be slow, but re-rendering is even slower
export const defaultPropKeysToDeepCheck = [
  'margin', 'scaleType', 'spacing', 'domain', 'style', 'data'
];

export default function xyPropsEqual(propsA, propsB, customKeysToDeepCheck = [], includeDefaults = true) {
  const propKeysToDeepCheck = includeDefaults ?
    defaultPropKeysToDeepCheck.concat(customKeysToDeepCheck) :
    customKeysToDeepCheck;

  const propKeysToSkipShallowCheck = propKeysToDeepCheck.concat('scale');

  const isEqual =
    // most keys just get shallow-equality checked
    shallowEqual(_.omit(propsA, propKeysToSkipShallowCheck), _.omit(propsB, propKeysToSkipShallowCheck)) &&
    // propKeysToDeepCheck get deep-equality checked using _.isEqual
    _.every(propKeysToDeepCheck, (key) => _.isEqual(propsA[key], propsB[key])) &&
    // d3 scales are special, get deep-checked using custom `scaleEqual` utility
    _.every(['x', 'y'], (key) => {
      return scaleEqual(_.get(propsA, `scale[${key}]`), _.get(propsA, `scale[${key}]`));
    });

  return isEqual;
}

export function xyPropsEqualDebug(propsA, propsB, customKeysToDeepCheck = [], includeDefaults = true) {
  const propKeysToDeepCheck = includeDefaults ?
    defaultPropKeysToDeepCheck.concat(customKeysToDeepCheck) :
    customKeysToDeepCheck;
  // debug version of xyPropsEqual which console.logs, for figuring out which props are failing equality check
  // const start = performance.now();
  const propKeysToSkipShallowCheck = propKeysToDeepCheck.concat('scale');

  const isEqual =
    // most keys just get shallow-equality checked
    shallowEqual(_.omit(propsA, propKeysToSkipShallowCheck), _.omit(propsB, propKeysToSkipShallowCheck)) &&
    _.every(propKeysToDeepCheck, (key) => {
      const isDeepEqual = _.isEqual(propsA[key], propsB[key]);
      if(!isDeepEqual) console.log(`xyProps: ${key} not equal`);
      return isDeepEqual;
    }) &&
    _.every(['x', 'y'], (key) => {
      const isScaleEqual = scaleEqual(propsA.scale[key], propsB.scale[key]);
      if(!isScaleEqual) console.log(`xyProps: scale.${key} not equal`);
      return isScaleEqual;
    });

  // console.log('xyProps isEqual', isEqual);
  // console.log('took', performance.now() - start);
  return isEqual;
}
