const Q = require('q');
const MYSQL = require('mysql');
const CODE = require('./mysql.code');
const CONFIG = require('./mysql.config');
const FORMAT = require('./utility.date');

var handler =
    {
        // 使用mysql.config.js的配置信息创建一个MySQL连接池
        pool: MYSQL.createPool(CONFIG.mysql),

        /**
         * 建立连接
         * @param parameters
         * @returns {*|Promise|promise}
         */
        setUpConnection: function (parameters) {
            var deferred = Q.defer();
            // 从连接池获取连接
            this.pool.getConnection(function (err, connection) {
                console.info("==> setUpConnection ==> callback | " + err);
                if (err) {
                    deferred.reject({
                        connection: connection,
                        code: CODE.databaseErrorCode,
                        errMsg: err
                    });
                }
                deferred.resolve({
                    connection: connection,
                    params: parameters
                });
            });
            return deferred.promise;
        },

        /**
         * 启动事务
         * @param request
         * @returns {*|Promise|promise}
         */
        beginTransaction: function (request) {
            var deferred = Q.defer();
            // 启动事务
            request.connection.beginTransaction(function (err) {
                console.info("==> beginTransaction ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                }
                deferred.resolve(request);
            });

            return deferred.promise;
        },

        /**
         * 提交事务
         * @param request
         * @returns {*|Promise|promise}
         */
        commitTransaction: function (request) {
            var deferred = Q.defer();

            request.connection.commit(function (err) {
                console.info("==> commitTransaction ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                }
                deferred.resolve(request);
            });

            return deferred.promise;
        },

        /**
         * 添加 - 基本信息
         * @param request
         * @returns {*|Promise|promise}
         */
        setBasicInfo: function (request) {
            var deferred = Q.defer();

            request.connection.query(request.params.sqlBasicInfo, request.params.information, function (err, result) {
                console.info("==> setBasicInfo ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                }
                deferred.resolve({
                    connection: request.connection,
                    params: request.params,
                    result: result
                });
            });

            return deferred.promise;
        },

        /**
         * 编辑 - 基本信息
         * @param request
         * @returns {*|Promise|promise}
         */
        updateBasicInfo: function (request) {
            var deferred = Q.defer();

            request.connection.query(request.params.sqlUpdateInfo, request.params.information, function (err, result) {
                console.info("==> updateBasicInfo ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                }
                deferred.resolve({
                    connection: request.connection,
                    params: request.params,
                    result: result
                });
            });

            return deferred.promise;
        },

        /**
         * 删除 - 基本信息
         * @param request
         * @returns {*|Promise|promise}
         */
        deleteBasicInfo: function (request) {
            var deferred = Q.defer();

            request.connection.query(request.params.sqlDeleteInfo, request.params.information, function (err, result) {
                console.info("==> deleteBasicInfo ==> callback |  " + err);
                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                }
                deferred.resolve({
                    connection: request.connection,
                    params: request.params,
                    result: result
                });
            });

            return deferred.promise;
        },

        /**
         * 插入图片
         * @param request
         * @returns {*|Promise|promise}
         */
        insertGallery: function (request) {
            var deferred = Q.defer();

            /**
             * 未找到上传图集 直接跳过
             */
            if(!request.params.gallery.hasOwnProperty("imageurl")||
                request.params.gallery.imageurl === ""){
                deferred.resolve({
                    connection: request.connection,
                    result: "DONE"
                });
            } else {
                request.params.gallery.relative = request.result.insertId;
                request.connection.query(request.params.sqlInsertGallery, request.params.gallery, function (err, result) {
                    console.info("==> insertGallery ==> callback |  " + err);
                    if (err) {
                        deferred.reject({
                            connection: request.connection,
                            code: CODE.failedCode,
                            errMsg: err
                        });
                    }
                    deferred.resolve({
                        connection: request.connection,
                        result: result
                    });
                });
            }

            return deferred.promise;
        },

        /**
         * 获取列表
         * @param request
         * @returns {*|Promise|promise}
         */
        fetchList: function (request) {
            var deferred = Q.defer();

            console.info("==>   fetchList");
            request.connection.query(request.params.execSQL, request.params.values, function (err, result) {

                if (err) {
                    deferred.reject({
                        connection: request.connection,
                        code: CODE.failedCode,
                        errMsg: err
                    });
                }
                deferred.resolve({
                    connection: request.connection,
                    tableName: request.params.tableName,
                    result: result
                });
            });

            return deferred.promise;
        },

        fetchDataSet: function (request) {
            var item,
                value,
                promises = [],
                deferred = Q.defer();

            console.info("==>   fetchDataSet");
            for (item in request.params) {
                value = {
                    connection: request.connection,
                    params: {
                        tableName: item,
                        execSQL: request.params[item],
                        values: null
                    }
                };

                promises.push(handler.fetchList(value));
            }

            Q.all(promises)
                .then(
                    function (result) {
                        var final = {};

                        console.info("==>  Q.all  ==>  callback");
                        result.forEach(function (element) {
                            final[element.tableName] = JSON.stringify(element.result);
                        });

                        deferred.resolve({
                            connection: request.connection,
                            result: final
                        });
                    },
                    function (error) {
                        deferred.reject(error);
                    }
                );

            return deferred.promise;
        },

        /**
         * 扫尾 - 释放连接
         * @param request
         * @returns {*|Promise|promise}
         */
        cleanup: function (request) {
            var deferred = Q.defer();

            console.info("==>   cleanup");
            request.connection.release();
            deferred.resolve({
                code: CODE.successCode,
                msg: request.result
            });

            return deferred.promise;
        },

        /**
         * 错误处理
         * @param request
         * @param response
         */
        onReject: function (request, response) {
            console.info("==>   onReject");
            if (request.code === CODE.failedCode) {
                request.connection.release();
            }
            response({
                code: request.code,
                msg: request.errMsg
            });
        },

        /**
         * 错误处理 - 带回滚
         * @param request
         * @param response
         */
        onRejectWithRollback: function (request, response) {
            console.info("==>   onRejectWithRollback");
            if (request.code === CODE.failedCode) {
                request.connection.rollback(function () {
                    console.info("==>   onRejectWithRollback    ==>     rollback");
                    request.connection.release();
                });
            }
            response({
                code: request.code,
                msg: request.errMsg
            });
        },

        /**
         * 转化时间格式
         * 将 iso-8601 datetime 转换成 MySQL 可识别的 datetime
         * @param request
         * @returns {Promise|*|promise}
         */
        transformRequest: function (request) {
            var deferred = Q.defer();

            console.info("==>   transformRequest");
            Date.prototype.format = FORMAT.format;
            request.body.information.founding = new Date(request.body.information.founding).format("yyyy-MM-dd");
            console.info(request.body.information);

            deferred.resolve(request);

            return deferred.promise;
        },

        transformResponse: function (request) {
            var i,
                length,
                deferred = Q.defer();

            console.info("==>   transformResponse");
            for (i = 0, length = request.result.length; i < length; i++) {
                console.info(request.result[i]);
                if (request.result[i].hasOwnProperty("founding")) {
                    Date.prototype.format = FORMAT.format;
                    request.result[i].founding = new Date(request.result[i].founding).format("yyyy-MM-dd");
                    console.info(request.result[i].founding);
                }
            }

            deferred.resolve({
                connection: request.connection,
                result: request.result
            });

            return deferred.promise;
        }
    };

module.exports = handler;