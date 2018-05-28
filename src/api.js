const config = require("./config");

const https = /^http:/.test(config().upload_prefix) ? require('http') : require('https');
const utils = require("./utils");

const extend = utils.extend;
const includes = utils.includes;
const isString = utils.isString;
const only = utils.only;

const querystring = require("querystring");

const Q = require('q');

const api = module.exports;

function call_api(method, uri, params, callback, options) {
  let api_key, api_secret, api_url, cloud_name, cloudinary, content_type, deferred, handle_response, query_params, ref,
    ref1, ref2, ref3, ref4, ref5, request, request_options;
  deferred = Q.defer();
  cloudinary = (ref = (ref1 = options["upload_prefix"]) != null ? ref1 : config("upload_prefix")) != null ? ref : "https://api.cloudinary.com";
  cloud_name = (function () {
    let ref3;
    if ((ref2 = (ref3 = options["cloud_name"]) != null ? ref3 : config("cloud_name")) != null) {
      return ref2;
    } else {
      throw "Must supply cloud_name";
    }
  })();
  api_key = (function () {
    let ref4;
    if ((ref3 = (ref4 = options["api_key"]) != null ? ref4 : config("api_key")) != null) {
      return ref3;
    } else {
      throw "Must supply api_key";
    }
  })();
  api_secret = (function () {
    let ref5;
    if ((ref4 = (ref5 = options["api_secret"]) != null ? ref5 : config("api_secret")) != null) {
      return ref4;
    } else {
      throw "Must supply api_secret";
    }
  })();
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
    auth: api_key + ":" + api_secret
  });
  if (options.agent != null) {
    request_options.agent = options.agent;
  }
  if (method !== "get") {
    request_options.headers['Content-Length'] = Buffer.byteLength(query_params);
  }
  handle_response = function (res) {
    let buffer, err_obj, error;
    if (includes([200, 400, 401, 403, 404, 409, 420, 500], res.statusCode)) {
      buffer = "";
      error = false;
      res.on("data", function (d) {
        return buffer += d;
      });
      res.on("end", function () {
        let e, result;
        if (error) {
          return;
        }
        try {
          result = JSON.parse(buffer);
        } catch (error1) {
          e = error1;
          result = {
            error: {
              message: "Server return invalid JSON response. Status Code " + res.statusCode
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
        let err_obj;
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
          message: "Server returned unexpected status code - " + res.statusCode,
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
}

function transformationString(transformation) {
  if (isString(transformation)) {
    return transformation;
  } else {
    return utils.generate_transformation_string(extend({}, transformation));
  }
}

function deleteResourcesParams(options, params) {
  if (params == null) {
    params = {};
  }
  return extend(params, only(options, "keep_original", "invalidate", "next_cursor", "transformations"));
}

exports.ping = function ping(callback, options) {
  if (options == null) {
    options = {};
  }
  return call_api("get", ["ping"], {}, callback, options);
};

exports.usage = function usage(callback, options) {
  if (options == null) {
    options = {};
  }
  return call_api("get", ["usage"], {}, callback, options);
};

exports.resource_types = function resource_types(callback, options) {
  if (options == null) {
    options = {};
  }
  return call_api("get", ["resources"], {}, callback, options);
};

exports.resources = function resources(callback, options) {
  let ref, resource_type, type, uri;
  if (options == null) {
    options = {};
  }
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  type = options["type"];
  uri = ["resources", resource_type];
  if (type != null) {
    uri.push(type);
  }
  if ((options.start_at != null) && Object.prototype.toString.call(options.start_at) === '[object Date]') {
    options.start_at = options.start_at.toUTCString();
  }
  return call_api("get", uri, only(options, "next_cursor", "max_results", "prefix", "tags", "context", "direction", "moderations", "start_at"), callback, options);
};

exports.resources_by_tag = function resources_by_tag(tag, callback, options) {
  let ref, resource_type, uri;
  if (options == null) {
    options = {};
  }
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  uri = ["resources", resource_type, "tags", tag];
  return call_api("get", uri, only(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations"), callback, options);
};

exports.resources_by_context = function resources_by_context(key, value, callback, options) {
  let params, ref, resource_type, uri;
  if (options == null) {
    options = {};
  }
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  uri = ["resources", resource_type, "context"];
  params = only(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations");
  params.key = key;
  if (value != null) {
    params.value = value;
  }
  return call_api("get", uri, params, callback, options);
};

exports.resources_by_moderation = function resources_by_moderation(kind, status, callback, options) {
  let ref, resource_type, uri;
  if (options == null) {
    options = {};
  }
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  uri = ["resources", resource_type, "moderations", kind, status];
  return call_api("get", uri, only(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations"), callback, options);
};

exports.resources_by_ids = function resources_by_ids(public_ids, callback, options) {
  let params, ref, ref1, resource_type, type, uri;
  if (options == null) {
    options = {};
  }
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  type = (ref1 = options["type"]) != null ? ref1 : "upload";
  uri = ["resources", resource_type, type];
  params = only(options, "tags", "context", "moderations");
  params["public_ids[]"] = public_ids;
  return call_api("get", uri, params, callback, options);
};

exports.resource = function resource(public_id, callback, options) {
  let ref, ref1, resource_type, type, uri;
  if (options == null) {
    options = {};
  }
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  type = (ref1 = options["type"]) != null ? ref1 : "upload";
  uri = ["resources", resource_type, type, public_id];
  return call_api("get", uri, only(options, "exif", "colors", "faces", "image_metadata", "pages", "phash", "coordinates", "max_results"), callback, options);
};

exports.restore = function restore(public_ids, callback, options) {
  let ref, ref1, resource_type, type, uri;
  if (options == null) {
    options = {};
  }
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  type = (ref1 = options["type"]) != null ? ref1 : "upload";
  uri = ["resources", resource_type, type, "restore"];
  return call_api("post", uri, {
    public_ids: public_ids
  }, callback, options);
};

exports.update = function update(public_id, callback, options) {
  let params, ref, ref1, resource_type, type, uri;
  if (options == null) {
    options = {};
  }
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  type = (ref1 = options["type"]) != null ? ref1 : "upload";
  uri = ["resources", resource_type, type, public_id];
  params = utils.updateable_resource_params(options);
  if (options.moderation_status != null) {
    params.moderation_status = options.moderation_status;
  }
  return call_api("post", uri, params, callback, options);
};

exports.delete_resources = function delete_resources(public_ids, callback, options) {
  let ref, ref1, resource_type, type, uri;
  if (options == null) {
    options = {};
  }
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  type = (ref1 = options["type"]) != null ? ref1 : "upload";
  uri = ["resources", resource_type, type];
  return call_api("delete", uri, deleteResourcesParams(options, {
    "public_ids[]": public_ids
  }), callback, options);
};

exports.delete_resources_by_prefix = function delete_resources_by_prefix(prefix, callback, options) {
  let ref, ref1, resource_type, type, uri;
  if (options == null) {
    options = {};
  }
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  type = (ref1 = options["type"]) != null ? ref1 : "upload";
  uri = ["resources", resource_type, type];
  return call_api("delete", uri, deleteResourcesParams(options, {
    prefix: prefix
  }), callback, options);
};

exports.delete_resources_by_tag = function delete_resources_by_tag(tag, callback, options) {
  let ref, resource_type, uri;
  if (options == null) {
    options = {};
  }
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  uri = ["resources", resource_type, "tags", tag];
  return call_api("delete", uri, deleteResourcesParams(options), callback, options);
};

exports.delete_all_resources = function delete_all_resources(callback, options) {
  let ref, ref1, resource_type, type, uri;
  if (options == null) {
    options = {};
  }
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  type = (ref1 = options["type"]) != null ? ref1 : "upload";
  uri = ["resources", resource_type, type];
  return call_api("delete", uri, deleteResourcesParams(options, {
    all: true
  }), callback, options);
};

exports.delete_derived_resources = function delete_derived_resources(derived_resource_ids, callback, options) {
  let uri;
  if (options == null) {
    options = {};
  }
  uri = ["derived_resources"];
  return call_api("delete", uri, {
    "derived_resource_ids[]": derived_resource_ids
  }, callback, options);
};

exports.delete_derived_by_transformation = function delete_derived_by_transformation(public_ids, transformations, callback, options) {
  let params, resource_type, type, uri;
  if (options == null) {
    options = {};
  }
  resource_type = options["resource_type"] || "image";
  type = options["type"] || "upload";
  uri = "resources/" + resource_type + "/" + type;
  params = extend({
    "public_ids[]": public_ids
  }, only(options, "invalidate"));
  params["keep_original"] = true;
  params["transformations"] = utils.build_eager(transformations);
  return call_api("delete", uri, params, callback, options);
};

exports.tags = function tags(callback, options) {
  let ref, resource_type, uri;
  if (options == null) {
    options = {};
  }
  resource_type = (ref = options["resource_type"]) != null ? ref : "image";
  uri = ["tags", resource_type];
  return call_api("get", uri, only(options, "next_cursor", "max_results", "prefix"), callback, options);
};

exports.transformations = function transformations(callback, options) {
  if (options == null) {
    options = {};
  }
  return call_api("get", ["transformations"], only(options, "next_cursor", "max_results"), callback, options);
};

exports.transformation = function transformation(transformation, callback, options) {
  let uri;
  if (options == null) {
    options = {};
  }
  uri = ["transformations", transformationString(transformation)];
  return call_api("get", uri, only(options, "next_cursor", "max_results"), callback, options);
};

exports.delete_transformation = function delete_transformation(transformation, callback, options) {
  let uri;
  if (options == null) {
    options = {};
  }
  uri = ["transformations", transformationString(transformation)];
  return call_api("delete", uri, {}, callback, options);
};

exports.update_transformation = function update_transformation(transformation, updates, callback, options) {
  let params, uri;
  if (options == null) {
    options = {};
  }
  uri = ["transformations", transformationString(transformation)];
  params = only(updates, "allowed_for_strict");
  if (updates.unsafe_update != null) {
    params.unsafe_update = transformationString(updates.unsafe_update);
  }
  return call_api("put", uri, params, callback, options);
};

exports.create_transformation = function create_transformation(name, definition, callback, options) {
  let uri;
  if (options == null) {
    options = {};
  }
  uri = ["transformations", name];
  return call_api("post", uri, {
    transformation: transformationString(definition)
  }, callback, options);
};

exports.upload_presets = function upload_presets(callback, options) {
  if (options == null) {
    options = {};
  }
  return call_api("get", ["upload_presets"], only(options, "next_cursor", "max_results"), callback, options);
};

exports.upload_preset = function upload_preset(name, callback, options) {
  let uri;
  if (options == null) {
    options = {};
  }
  uri = ["upload_presets", name];
  return call_api("get", uri, {}, callback, options);
};

exports.delete_upload_preset = function delete_upload_preset(name, callback, options) {
  let uri;
  if (options == null) {
    options = {};
  }
  uri = ["upload_presets", name];
  return call_api("delete", uri, {}, callback, options);
};

exports.update_upload_preset = function update_upload_preset(name, callback, options) {
  let params, uri;
  if (options == null) {
    options = {};
  }
  uri = ["upload_presets", name];
  params = utils.merge(utils.clear_blank(utils.build_upload_params(options)), only(options, "unsigned", "disallow_public_id"));
  return call_api("put", uri, params, callback, options);
};

exports.create_upload_preset = function create_upload_preset(callback, options) {
  let params, uri;
  if (options == null) {
    options = {};
  }
  uri = ["upload_presets"];
  params = utils.merge(utils.clear_blank(utils.build_upload_params(options)), only(options, "name", "unsigned", "disallow_public_id"));
  return call_api("post", uri, params, callback, options);
};

exports.root_folders = function root_folders(callback, options) {
  let uri;
  if (options == null) {
    options = {};
  }
  uri = ["folders"];
  return call_api("get", uri, {}, callback, options);
};

exports.sub_folders = function sub_folders(path, callback, options) {
  let uri;
  if (options == null) {
    options = {};
  }
  uri = ["folders", path];
  return call_api("get", uri, {}, callback, options);
};

exports.upload_mappings = function upload_mappings(callback, options) {
  let params;
  if (options == null) {
    options = {};
  }
  params = only(options, "next_cursor", "max_results");
  return call_api("get", "upload_mappings", params, callback, options);
};

exports.upload_mapping = function upload_mapping(name, callback, options) {
  if (name == null) {
    name = null;
  }
  if (options == null) {
    options = {};
  }
  return call_api("get", 'upload_mappings', {
    folder: name
  }, callback, options);
};

exports.delete_upload_mapping = function delete_upload_mapping(name, callback, options) {
  if (options == null) {
    options = {};
  }
  return call_api("delete", 'upload_mappings', {
    folder: name
  }, callback, options);
};

exports.update_upload_mapping = function update_upload_mapping(name, callback, options) {
  let params;
  if (options == null) {
    options = {};
  }
  params = only(options, "template");
  params["folder"] = name;
  return call_api("put", 'upload_mappings', params, callback, options);
};

exports.create_upload_mapping = function create_upload_mapping(name, callback, options) {
  let params;
  if (options == null) {
    options = {};
  }
  params = only(options, "template");
  params["folder"] = name;
  return call_api("post", 'upload_mappings', params, callback, options);
};

function publishResource(byKey, value, callback, options) {
  let params, ref, resource_type, uri;
  if (options == null) {
    options = {};
  }
  params = only(options, "type", "invalidate", "overwrite");
  params[byKey] = value;
  resource_type = (ref = options.resource_type) != null ? ref : "image";
  uri = ["resources", resource_type, "publish_resources"];
  options = extend({
    resource_type: resource_type
  }, options);
  return call_api("post", uri, params, callback, options);
}

exports.publish_by_prefix = function publish_by_prefix(prefix, callback, options) {
  if (options == null) {
    options = {};
  }
  return publishResource("prefix", prefix, callback, options);
};

exports.publish_by_tag = function publish_by_tag(tag, callback, options) {
  if (options == null) {
    options = {};
  }
  return publishResource("tag", tag, callback, options);
};

exports.publish_by_ids = function publish_by_ids(public_ids, callback, options) {
  if (options == null) {
    options = {};
  }
  return publishResource("public_ids", public_ids, callback, options);
};

exports.list_streaming_profiles = function list_streaming_profiles(callback, options) {
  if (options == null) {
    options = {};
  }
  return call_api("get", "streaming_profiles", {}, callback, options);
};

exports.get_streaming_profile = function get_streaming_profile(name, callback, options) {
  if (options == null) {
    options = {};
  }
  return call_api("get", "streaming_profiles/" + name, {}, callback, options);
};

exports.delete_streaming_profile = function delete_streaming_profile(name, callback, options) {
  if (options == null) {
    options = {};
  }
  return call_api("delete", "streaming_profiles/" + name, {}, callback, options);
};

exports.update_streaming_profile = function update_streaming_profile(name, callback, options) {
  let params;
  if (options == null) {
    options = {};
  }
  params = utils.build_streaming_profiles_param(options);
  return call_api("put", "streaming_profiles/" + name, params, callback, options);
};

exports.create_streaming_profile = function create_streaming_profile(name, callback, options) {
  let params;
  if (options == null) {
    options = {};
  }
  params = utils.build_streaming_profiles_param(options);
  params["name"] = name;
  return call_api("post", 'streaming_profiles', params, callback, options);
};

function updateResourcesAccessMode(access_mode, by_key, value, callback, options) {
  let params, ref, ref1, resource_type, type;
  if (options == null) {
    options = {};
  }
  resource_type = (ref = options.resource_type) != null ? ref : "image";
  type = (ref1 = options.type) != null ? ref1 : "upload";
  params = {
    access_mode: access_mode
  };
  params[by_key] = value;
  return call_api("post", "resources/" + resource_type + "/" + type + "/update_access_mode", params, callback, options);
}

exports.search = function search(params, callback, options) {
  if (options == null) {
    options = {};
  }
  options['content_type'] = 'json';
  return call_api("post", "resources/search", params, callback, options);
};

exports.update_resources_access_mode_by_prefix = function update_resources_access_mode_by_prefix(access_mode, prefix, callback, options) {
  if (options == null) {
    options = {};
  }
  return updateResourcesAccessMode(access_mode, "prefix", prefix, callback, options);
};

exports.update_resources_access_mode_by_tag = function update_resources_access_mode_by_tag(access_mode, tag, callback, options) {
  if (options == null) {
    options = {};
  }
  return updateResourcesAccessMode(access_mode, "tag", tag, callback, options);
};

exports.update_resources_access_mode_by_ids = function update_resources_access_mode_by_ids(access_mode, ids, callback, options) {
  if (options == null) {
    options = {};
  }
  return updateResourcesAccessMode(access_mode, "public_ids[]", ids, callback, options);
};
