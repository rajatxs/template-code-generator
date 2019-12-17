"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var utils_1 = require("./utils");
var cli_1 = require("./cli");
var version = require("../package.json").version;
exports.default = {
    /**
     * Command documentation
     * @type {Object} doc
     */
    doc: {
        /**
         * Absolute path
         * @param {String} docname
         * @return {String}
         */
        abspath: function (docname) {
            return path_1.join(__dirname, 'doc', docname.concat('.txt'));
        },
        /**
         * @param {String} docname
         * @return {void}
         */
        print: function (docname) {
            process.stdout.write(fs_1.readFileSync(this.abspath(docname), 'UTF-8'));
        },
        // App command
        commands: function () {
            this.print('tcg');
        },
        // App version
        version: function () {
            process.stdout.write("\nVersion " + version + "\n");
        },
        generate: function () {
            this.print('generate');
        },
        use: function () {
            this.print('use');
        },
        remove: function () {
            this.print('remove');
        }
    },
    /**
     * Generating templates
     * @return {void}
     */
    generate: function () {
        var files = cli_1.default.files;
        if (files.length) {
            // Flags point to specific origin e.g. tcg g app.js --react
            var flags_1 = (cli_1.default.flags.length) ? cli_1.default.flags : ['_'];
            var _loop_1 = function (file) {
                var ext = path_1.parse(file).ext;
                // By matching extension
                var availtemp = utils_1.default.list
                    .filter(function (temp) { return (path_1.parse(temp).ext === ext) ? temp : null; });
                if (availtemp.length) {
                    // Match the flag value
                    var requiredtemp = availtemp
                        .filter(function (item) { return (flags_1.includes(path_1.parse(item).name)) ? item : null; });
                    for (var _i = 0, requiredtemp_1 = requiredtemp; _i < requiredtemp_1.length; _i++) {
                        var publishtemp = requiredtemp_1[_i];
                        // Copying to the current dir
                        fs_1.writeFileSync(process.env.PWD + "/" + file, fs_1.readFileSync(publishtemp), "UTF-8");
                    }
                }
                else {
                    process.stdout.write("Cannot find template with " + utils_1.default.errorText(ext) + " extension.\n");
                }
            };
            for (var _i = 0, _a = cli_1.default.files; _i < _a.length; _i++) {
                var file = _a[_i];
                _loop_1(file);
            }
        }
        else {
            // If file parameter is not supplied
            this.doc.generate();
        }
    },
    /**
     * Add new template
     * @return {void}
     */
    use: function () {
        var files = cli_1.default.files;
        if (files.length) {
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var file = files_1[_i];
                var abspath = path_1.join(process.env.PWD, file);
                utils_1.default.add(abspath);
            }
        }
        else {
            // Command help
            this.doc.use();
        }
    },
    /**
     * Listing all existing templates
     * @return {void}
     */
    list: function () {
        var list = utils_1.default.list;
        process.stdout.write(list.length + " Active templates\n\n");
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var item = list_1[_i];
            var bdate = new Date(fs_1.statSync(item).birthtime);
            var _a = path_1.parse(item), ext = _a.ext, name_1 = _a.name;
            process.stdout.write(bdate.toLocaleString() + "\t" + utils_1.default.cyanText(ext) + "\t" + utils_1.default.magentaText((name_1 === '_') ? '-' : name_1) + "\n");
        }
    },
    /**
     * Remove template from storage
     * @return {void}
     */
    remove: function () {
        var files = cli_1.default.files;
        if (files.length) {
            var _loop_2 = function (file) {
                // Single template file
                var storagetemp = utils_1.default.list
                    .find(function (temp) { return path_1.parse(temp).base === file; });
                if (storagetemp) {
                    // Delete template file
                    fs_1.unlinkSync(storagetemp);
                }
                else {
                    // Err
                    process.stdout.write("Template <" + utils_1.default.errorText(file) + "> not available inside storage\n");
                }
            };
            for (var _i = 0, files_2 = files; _i < files_2.length; _i++) {
                var file = files_2[_i];
                _loop_2(file);
            }
        }
        else {
            // Command help
            this.doc.remove();
        }
    }
};