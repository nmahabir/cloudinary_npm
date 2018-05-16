var _ = require('lodash'),  cloudinary = module.exports;
exports.config = require("./lib/config");
exports.utils = utils = require("./lib/utils");
exports.uploader = require("./lib/uploader");
exports.api = require("./lib/api");
exports.PreloadedFile = require("./lib/preloaded_file");
const optionConsume = cloudinary.utils.option_consume;
exports.url = function(public_id, options) {
  options = _.extend({}, options);
  return cloudinary.utils.url(public_id, options);
};
generateBreakpoints = require('./lib/utils/generateBreakpoints');
const {srcsetUrl, generateSrcsetAttribute, generateSizesAttribute} = require('./lib/utils/srcsetUtils');

exports.image = function (source, options) {
  var responsive, html, current_class, classes;
  let localOptions = _.extend({}, options);
  let srcsetParam = optionConsume(localOptions, 'srcset');
  let attributes = optionConsume(localOptions, 'attributes', {});
  let src = cloudinary.utils.url(source, localOptions);
  if ("html_width" in localOptions) localOptions["width"] = optionConsume(localOptions, "html_width");
  if ("html_height" in localOptions) localOptions["height"] = optionConsume(localOptions, "html_height");

  client_hints = optionConsume(localOptions, "client_hints", cloudinary.config().client_hints);
  responsive = optionConsume(localOptions, "responsive");
  hidpi = optionConsume(localOptions, "hidpi");

  if ((responsive || hidpi) && !client_hints) {
    localOptions["data-src"] = src;
    classes = [responsive ? "cld-responsive" : "cld-hidpi"];
    current_class = optionConsume(localOptions, "class");
    if (current_class) classes.push(current_class);
    localOptions["class"] = classes.join(" ");
    src = optionConsume(localOptions, "responsive_placeholder", cloudinary.config().responsive_placeholder);
    if (src == "blank") {
      src = cloudinary.BLANK;
    }
  }
  html = "<img ";
  if (src) html += "src='" + src + "' ";
  if(srcsetParam) {
    if(_.isString(srcsetParam)){
      attributes.srcset = srcsetParam;
    } else if(_.isObject(srcsetParam) && !_.isEmpty(srcsetParam)){
      attributes.srcset = generateSrcsetAttribute(source, options);
      if(srcsetParam.sizes === true){
        attributes.sizes = generateSizesAttribute(srcsetParam);
      }
    }
    delete localOptions.width;
    delete localOptions.height;
  }
  html += cloudinary.utils.html_attrs(_.extend(localOptions, attributes)) + "/>";
  return html;
};

/**
 * Creates an HTML video tag for the provided public_id
 * @param {String} public_id the resource public ID
 * @param {Object} [options] options for the resource and HTML tag
 * @param {(String|Array<String>)} [options.source_types] Specify which
 *        source type the tag should include. defaults to webm, mp4 and ogv.
 * @param {String} [options.source_transformation] specific transformations
 *        to use for a specific source type.
 * @param {(String|Object)} [options.poster] image URL or
 *        poster options that may include a <tt>public_id</tt> key and
 *        poster-specific transformations
 * @example <caption>Example of generating a video tag:</caption>
 * $.cloudinary.video("mymovie.mp4");
 * $.cloudinary.video("mymovie.mp4", {source_types: 'webm'});
 * $.cloudinary.video("mymovie.ogv", {poster: "myspecialplaceholder.jpg"});
 * $.cloudinary.video("mymovie.webm", {source_types: ['webm', 'mp4'], poster: {effect: 'sepia'}});
 * @return {string} HTML video tag
 */
exports.video = function (public_id, options) {
  var src, video_options, fallback, source_transformation, source_types, source, multi_source, html;
  options = _.extend({}, options);
  public_id = public_id.replace(/\.(mp4|ogv|webm)$/, '');
  source_types = optionConsume(options, 'source_types', []);
  source_transformation = optionConsume(options, 'source_transformation', {});
  fallback = optionConsume(options, 'fallback_content', '');

  if (source_types.length === 0) source_types = cloudinary.utils.DEFAULT_VIDEO_SOURCE_TYPES;
  video_options = _.cloneDeep(options);

  if (video_options.hasOwnProperty('poster')) {
    if (_.isPlainObject(video_options.poster)) {
      if (video_options.poster.hasOwnProperty('public_id')) {
        video_options.poster = cloudinary.utils.url(video_options.poster.public_id, video_options.poster);
      } else {
        video_options.poster = cloudinary.utils.url(public_id, _.extend({}, cloudinary.utils.DEFAULT_POSTER_OPTIONS, video_options.poster));
      }
    }
  } else {
    video_options.poster = cloudinary.utils.url(public_id, _.extend({}, cloudinary.utils.DEFAULT_POSTER_OPTIONS, options));
  }

  if (!video_options.poster) delete video_options.poster;

  html = '<video ';

  if (!video_options.hasOwnProperty('resource_type')) video_options.resource_type = 'video';
  multi_source = _.isArray(source_types) && source_types.length > 1;
  source = public_id;
  if (!multi_source) {
    source = source + '.' + cloudinary.utils.build_array(source_types)[0];
  }
  src = cloudinary.utils.url(source, video_options);
  if (!multi_source) video_options.src = src;
  if (video_options.hasOwnProperty("html_width")) video_options.width = optionConsume(video_options, 'html_width');
  if (video_options.hasOwnProperty("html_height")) video_options.height = optionConsume(video_options, 'html_height');
  html = html + cloudinary.utils.html_attrs(video_options) + '>';
  if (multi_source) {
    var source_type, transformation, video_type, mime_type;
    for (var i = 0; i < source_types.length; i++) {
      source_type = source_types[i];
      transformation = source_transformation[source_type] || {};
      src = cloudinary.utils.url(source + "." + source_type, _.extend({resource_type: 'video'}, _.cloneDeep(options), _.cloneDeep(transformation)));
      video_type = source_type === 'ogv' ? 'ogg' : source_type;
      mime_type = "video/" + video_type;
      html = html + '<source ' + cloudinary.utils.html_attrs({
        src: src,
        type: mime_type
      }) + '>';
    }
  }

  html = html + fallback;
  html = html + '</video>';
  return html;
};
exports.cloudinary_js_config = cloudinary.utils.cloudinary_js_config;

exports.CF_SHARED_CDN = cloudinary.utils.CF_SHARED_CDN;
exports.AKAMAI_SHARED_CDN = cloudinary.utils.AKAMAI_SHARED_CDN;
exports.SHARED_CDN = cloudinary.utils.SHARED_CDN;
exports.BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
exports.v2 = require('./lib/v2');
