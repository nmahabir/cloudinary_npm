const utils = require('./index');
const cloneDeep = require('lodash/cloneDeep');
const generateBreakPoints = require('./generateBreakpoints');
/**
 * Helper function. Generates a single srcset item url
 * @private
 *
 * @param {string} public_id  Public ID of the resource
 * @param {number} width      Width in pixels of the srcset item
 * @param {object} options    Additional options
 *
 * @return {string} Resulting URL of the item
 */
function srcsetUrl(public_id, width, options) {
  let configParams = utils.extractConfigParams(options);
  let transformation = options.srcset && options.srcset.transformation ? options.srcset.transformation : options;
  configParams.raw_transformation = utils.generate_transformation_string([utils.extend({}, transformation), {crop: 'scale', width: width}]);

  return utils.url(public_id, configParams);
}

/**
 * Helper function. Generates srcset attribute value of the HTML img tag
 * @private
 *
 * @param {string} public_id
 * @param {object} options
 * @param {(number[]|string[])}   [options.breakpoints] An array of breakpoints.
 * @param {number}                [options.min_width]   Minimal width of the srcset images.
 * @param {number}                [options.max_width]   Maximal width of the srcset images.
 * @param {number}                [options.max_images]  Number of srcset images to generate.
 *
 * @return string Resulting srcset attribute value
 */
function generateSrcsetAttribute(public_id, options) {
  let localOptions = cloneDeep(options);
  let breakpoints = generateBreakpoints(localOptions.srcset);
  if(localOptions.type === 'fetch'){
    localOptions.fetch_format = localOptions.type;
  }

  return breakpoints.map(width=>`${srcsetUrl(public_id, width, options)} ${width}w`).join(', ');
}

/**
 * Helper function. Generates sizes attribute value of the HTML img tag
 * @private
 * @param {object} srcsetData
 * @param {number[]} [srcsetData.breakpoints] An array of breakpoints.
 * @param {number}    [srcsetData.min_width]  Minimal width of the srcset images.
 * @param {number}    [srcsetData.max_width]  Maximal width of the srcset images.
 * @param {number}    [srcsetData.max_images] Number of srcset images to generate.
 *
 * @return {string} Resulting sizes attribute value
 */
function generateSizesAttribute(srcsetData){
  if (!srcsetData || utils.isString(srcsetData)) {
    return '';
  }
  let breakpoints = generateBreakPoints(srcsetData);
  return breakpoints.map(width=>`(max-width: ${width}px) ${width}px`).join(', ');
}


module.exports = {srcsetUrl, generateSrcsetAttribute, generateSizesAttribute};