"use strict";

var Q, api, call_api, config, delete_resources_params, extend, https, includes, isString, only, publishResource, querystring, transformation_string, update_resources_access_mode, utils;
config = require("./config");

if (config().upload_prefix && config().upload_prefix.slice(0, 5) === 'http:') {
  https = require('http');
} else {
  https = require('https');
}

utils = require("./utils");
var _utils = utils;
extend = _utils.extend;
includes = _utils.includes;
isString = _utils.isString;
only = _utils.only;
querystring = require("querystring");
Q = require('q');
api = module.exports;

call_api = function call_api(method, uri, params, callback, options) {
  var api_key, api_secret, api_url, cloud_name, cloudinary, content_type, deferred, handle_response, query_params, ref, ref1, ref2, ref3, ref4, ref5, request, request_options;
  deferred = Q.defer();
  cloudinary = (ref = (ref1 = options["upload_prefix"]) != null ? ref1 : config("upload_prefix")) != null ? ref : "https://api.cloudinary.com";

  cloud_name = function () {
    var ref3;

    if ((ref2 = (ref3 = options["cloud_name"]) != null ? ref3 : config("cloud_name")) != null) {
      return ref2;
    } else {
      throw "Must supply cloud_name";
    }
  }();

  api_key = function () {
    var ref4;

    if ((ref3 = (ref4 = options["api_key"]) != null ? ref4 : config("api_key")) != null) {
      return ref3;
    } else {
      throw "Must supply api_key";
    }
  }();

  api_secret = function () {
    var ref5;

    if ((ref4 = (ref5 = options["api_secret"]) != null ? ref5 : config("api_secret")) != null) {
      return ref4;
    } else {
      throw "Must supply api_secret";
    }
  }();

  api_url = [cloudinary, "v1_1", cloud_name].concat(uri).join("/");
  content_type = 'application/x-www-form-urlencoded';

  if (options['content_type'] === 'json') {
    query_params = JSON.stringify(params);
    content_type = 'application/json';
  } else {
    query_params = querystring.stringify(params);
  }

  if (method === "get") {
    api_url += "?" + query_params;
  }

  request_options = require('url').parse(api_url);
  request_options = extend(request_options, {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': content_type,
      'User-Agent': utils.getUserAgent()
    },
    auth: "".concat(api_key, ":").concat(api_secret)
  });

  if (options.agent != null) {
    request_options.agent = options.agent;
  }

  if (method !== "get") {
    request_options.headers['Content-Length'] = Buffer.byteLength(query_params);
  }

  handle_response = function handle_response(res) {
    var buffer, err_obj, error;

    if (includes([200, 400, 401, 403, 404, 409, 420, 500], res.statusCode)) {
      buffer = "";
      error = false;
      res.on("data", function (d) {
        return buffer += d;
      });
      res.on("end", function () {
        var e, result;

        if (error) {
          return;
        }

        try {
          result = JSON.parse(buffer);
        } catch (error1) {
          e = error1;
          result = {
            error: {
              message: "Server return invalid JSON response. Status Code ".concat(res.statusCode)
            }
          };
        }

        if (result["error"]) {
          result["error"]["http_code"] = res.statusCode;
        } else {
          result["rate_limit_allowed"] = parseInt(res.headers["x-featureratelimit-limit"]);
          result["rate_limit_reset_at"] = new Date(res.headers["x-featureratelimit-reset"]);
          result["rate_limit_remaining"] = parseInt(res.headers["x-featureratelimit-remaining"]);
        }

        if (result.error) {
          deferred.reject(result);
        } else {
          deferred.resolve(result);
        }

        return typeof callback === "function" ? callback(result) : void 0;
      });
      return res.on("error", function (e) {
        var err_obj;
        error = true;
        err_obj = {
          error: {
            message: e,
            http_code: res.statusCode
          }
        };
        deferred.reject(err_obj.error);
        return typeof callback === "function" ? callback(err_obj) : void 0;
      });
    } else {
      err_obj = {
        error: {
          message: "Server returned unexpected status code - ".concat(res.statusCode),
          http_code: res.statusCode
        }
      };
      deferred.reject(err_obj.error);
      return typeof callback === "function" ? callback(err_obj) : void 0;
    }
  };

  request = https.request(request_options, handle_response);
  request.on("error", function (e) {
    return typeof callback === "function" ? callback({
      error: e
    }) : void 0;
  });
  request.setTimeout((ref5 = options["timeout"]) != null ? ref5 : 60000);

  if (method !== "get") {
    request.write(query_params);
  }

  request.end();
  return deferred.promise;
};

transformation_string = function transformation_string(transformation) {
  if (isString(transformation)) {
    return transformation;
  } else {
    return utils.generate_transformation_string(extend({}, transformation));
  }
};

delete_resources_params = function delete_resources_params(options) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return extend(params, only(options, "keep_original", "invalidate", "next_cursor", "transformations"));
};

exports.ping = function (callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return call_api("get", ["ping"], {}, callback, options);
};

exports.usage = function (callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return call_api("get", ["usage"], {}, callback, options);
};

exports.resource_types = function (callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return call_api("get", ["resources"], {}, callback, options);
};

exports.resources = function (callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var ref, resource_type, type, uri;
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  type = options["type"];
  uri = ["resources", resource_type];

  if (type != null) {
    uri.push(type);
  }

  if (options.start_at != null && Object.prototype.toString.call(options.start_at) === '[object Date]') {
    options.start_at = options.start_at.toUTCString();
  }

  return call_api("get", uri, only(options, "next_cursor", "max_results", "prefix", "tags", "context", "direction", "moderations", "start_at"), callback, options);
};

exports.resources_by_tag = function (tag, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var ref, resource_type, uri;
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  uri = ["resources", resource_type, "tags", tag];
  return call_api("get", uri, only(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations"), callback, options);
};

exports.resources_by_context = function (key, value, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var params, ref, resource_type, uri;
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  uri = ["resources", resource_type, "context"];
  params = only(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations");
  params.key = key;

  if (value != null) {
    params.value = value;
  }

  return call_api("get", uri, params, callback, options);
};

exports.resources_by_moderation = function (kind, status, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var ref, resource_type, uri;
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  uri = ["resources", resource_type, "moderations", kind, status];
  return call_api("get", uri, only(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations"), callback, options);
};

exports.resources_by_ids = function (public_ids, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var params, ref, ref1, resource_type, type, uri;
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  type = (ref1 = options["type"]) != null ? ref1 : "upload";
  uri = ["resources", resource_type, type];
  params = only(options, "tags", "context", "moderations");
  params["public_ids[]"] = public_ids;
  return call_api("get", uri, params, callback, options);
};

exports.resource = function (public_id, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var ref, ref1, resource_type, type, uri;
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  type = (ref1 = options["type"]) != null ? ref1 : "upload";
  uri = ["resources", resource_type, type, public_id];
  return call_api("get", uri, only(options, "exif", "colors", "faces", "image_metadata", "pages", "phash", "coordinates", "max_results"), callback, options);
};

exports.restore = function (public_ids, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var ref, ref1, resource_type, type, uri;
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  type = (ref1 = options["type"]) != null ? ref1 : "upload";
  uri = ["resources", resource_type, type, "restore"];
  return call_api("post", uri, {
    public_ids: public_ids
  }, callback, options);
};

exports.update = function (public_id, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var params, ref, ref1, resource_type, type, uri;
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  type = (ref1 = options["type"]) != null ? ref1 : "upload";
  uri = ["resources", resource_type, type, public_id];
  params = utils.updateable_resource_params(options);

  if (options.moderation_status != null) {
    params.moderation_status = options.moderation_status;
  }

  return call_api("post", uri, params, callback, options);
};

exports.delete_resources = function (public_ids, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var ref, ref1, resource_type, type, uri;
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  type = (ref1 = options["type"]) != null ? ref1 : "upload";
  uri = ["resources", resource_type, type];
  return call_api("delete", uri, delete_resources_params(options, {
    "public_ids[]": public_ids
  }), callback, options);
};

exports.delete_resources_by_prefix = function (prefix, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var ref, ref1, resource_type, type, uri;
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  type = (ref1 = options["type"]) != null ? ref1 : "upload";
  uri = ["resources", resource_type, type];
  return call_api("delete", uri, delete_resources_params(options, {
    prefix: prefix
  }), callback, options);
};

exports.delete_resources_by_tag = function (tag, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var ref, resource_type, uri;
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  uri = ["resources", resource_type, "tags", tag];
  return call_api("delete", uri, delete_resources_params(options), callback, options);
};

exports.delete_all_resources = function (callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var ref, ref1, resource_type, type, uri;
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  type = (ref1 = options["type"]) != null ? ref1 : "upload";
  uri = ["resources", resource_type, type];
  return call_api("delete", uri, delete_resources_params(options, {
    all: true
  }), callback, options);
};

exports.delete_derived_resources = function (derived_resource_ids, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var uri;
  uri = ["derived_resources"];
  return call_api("delete", uri, {
    "derived_resource_ids[]": derived_resource_ids
  }, callback, options);
};

exports.delete_derived_by_transformation = function (public_ids, transformations, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var params, resource_type, type, uri;
  resource_type = options["resource_type"] || "image";
  type = options["type"] || "upload";
  uri = "resources/".concat(resource_type, "/").concat(type);
  params = extend({
    "public_ids[]": public_ids
  }, only(options, "invalidate"));
  params["keep_original"] = true;
  params["transformations"] = utils.build_eager(transformations);
  return call_api("delete", uri, params, callback, options);
};

exports.tags = function (callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var ref, resource_type, uri;
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  uri = ["tags", resource_type];
  return call_api("get", uri, only(options, "next_cursor", "max_results", "prefix"), callback, options);
};

exports.transformations = function (callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return call_api("get", ["transformations"], only(options, "next_cursor", "max_results"), callback, options);
};

exports.transformation = function (transformation, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var uri;
  uri = ["transformations", transformation_string(transformation)];
  return call_api("get", uri, only(options, "next_cursor", "max_results"), callback, options);
};

exports.delete_transformation = function (transformation, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var uri;
  uri = ["transformations", transformation_string(transformation)];
  return call_api("delete", uri, {}, callback, options);
}; // updates - currently only supported update is the "allowed_for_strict" boolean flag


exports.update_transformation = function (transformation, updates, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var params, uri;
  uri = ["transformations", transformation_string(transformation)];
  params = only(updates, "allowed_for_strict");

  if (updates.unsafe_update != null) {
    params.unsafe_update = transformation_string(updates.unsafe_update);
  }

  return call_api("put", uri, params, callback, options);
};

exports.create_transformation = function (name, definition, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var uri;
  uri = ["transformations", name];
  return call_api("post", uri, {
    transformation: transformation_string(definition)
  }, callback, options);
};

exports.upload_presets = function (callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return call_api("get", ["upload_presets"], only(options, "next_cursor", "max_results"), callback, options);
};

exports.upload_preset = function (name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var uri;
  uri = ["upload_presets", name];
  return call_api("get", uri, {}, callback, options);
};

exports.delete_upload_preset = function (name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var uri;
  uri = ["upload_presets", name];
  return call_api("delete", uri, {}, callback, options);
};

exports.update_upload_preset = function (name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var params, uri;
  uri = ["upload_presets", name];
  params = utils.merge(utils.clear_blank(utils.build_upload_params(options)), only(options, "unsigned", "disallow_public_id"));
  return call_api("put", uri, params, callback, options);
};

exports.create_upload_preset = function (callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var params, uri;
  uri = ["upload_presets"];
  params = utils.merge(utils.clear_blank(utils.build_upload_params(options)), only(options, "name", "unsigned", "disallow_public_id"));
  return call_api("post", uri, params, callback, options);
};

exports.root_folders = function (callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var uri;
  uri = ["folders"];
  return call_api("get", uri, {}, callback, options);
};

exports.sub_folders = function (path, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var uri;
  uri = ["folders", path];
  return call_api("get", uri, {}, callback, options);
};

exports.upload_mappings = function (callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var params;
  params = only(options, "next_cursor", "max_results");
  return call_api("get", "upload_mappings", params, callback, options);
};

exports.upload_mapping = function () {
  var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var callback = arguments.length > 1 ? arguments[1] : undefined;
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return call_api("get", 'upload_mappings', {
    folder: name
  }, callback, options);
};

exports.delete_upload_mapping = function (name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return call_api("delete", 'upload_mappings', {
    folder: name
  }, callback, options);
};

exports.update_upload_mapping = function (name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var params;
  params = only(options, "template");
  params["folder"] = name;
  return call_api("put", 'upload_mappings', params, callback, options);
};

exports.create_upload_mapping = function (name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var params;
  params = only(options, "template");
  params["folder"] = name;
  return call_api("post", 'upload_mappings', params, callback, options);
};

publishResource = function publishResource(byKey, value, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var params, ref, resource_type, uri;
  params = only(options, "type", "invalidate", "overwrite");
  params[byKey] = value;
  resource_type = (ref = options.resource_type) != null ? ref : "image";
  uri = ["resources", resource_type, "publish_resources"];
  options = extend({
    resource_type: resource_type
  }, options);
  return call_api("post", uri, params, callback, options);
};

exports.publish_by_prefix = function (prefix, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return publishResource("prefix", prefix, callback, options);
};

exports.publish_by_tag = function (tag, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return publishResource("tag", tag, callback, options);
};

exports.publish_by_ids = function (public_ids, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return publishResource("public_ids", public_ids, callback, options);
};

exports.list_streaming_profiles = function (callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return call_api("get", "streaming_profiles", {}, callback, options);
};

exports.get_streaming_profile = function (name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return call_api("get", "streaming_profiles/".concat(name), {}, callback, options);
};

exports.delete_streaming_profile = function (name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return call_api("delete", "streaming_profiles/".concat(name), {}, callback, options);
};

exports.update_streaming_profile = function (name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var params;
  params = utils.build_streaming_profiles_param(options);
  return call_api("put", "streaming_profiles/".concat(name), params, callback, options);
};

exports.create_streaming_profile = function (name, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var params;
  params = utils.build_streaming_profiles_param(options);
  params["name"] = name;
  return call_api("post", 'streaming_profiles', params, callback, options);
};

update_resources_access_mode = function update_resources_access_mode(access_mode, by_key, value, callback) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var params, ref, ref1, resource_type, type;
  resource_type = (ref = options.resource_type) != null ? ref : "image";
  type = (ref1 = options.type) != null ? ref1 : "upload";
  params = {
    access_mode: access_mode
  }; //  by_key = by_key == 'ids' ? 'ids[]' : by_key

  params[by_key] = value;
  return call_api("post", "resources/".concat(resource_type, "/").concat(type, "/update_access_mode"), params, callback, options);
};

exports.search = function (params, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  options['content_type'] = 'json';
  return call_api("post", "resources/search", params, callback, options);
};

exports.update_resources_access_mode_by_prefix = function (access_mode, prefix, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return update_resources_access_mode(access_mode, "prefix", prefix, callback, options);
};

exports.update_resources_access_mode_by_tag = function (access_mode, tag, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return update_resources_access_mode(access_mode, "tag", tag, callback, options);
};

exports.update_resources_access_mode_by_ids = function (access_mode, ids, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return update_resources_access_mode(access_mode, "public_ids[]", ids, callback, options);
};