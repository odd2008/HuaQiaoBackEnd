const HANDLER = require('./mysql.handler');
const EXEC_SQL = require('./doctor.interface');

var api = {

    /**
     * 新增 - 医生
     * @param request
     * @param response
     */
    addDoctor: function (request, response) {

        HANDLER
            .setUpConnection({
                sqlBasicInfo: EXEC_SQL.addDoctor,
                sqlInsertGallery: EXEC_SQL.insertDoctorGallery,
                information: request.body.information,
                gallery: request.body.gallery
            })
            .then(HANDLER.beginTransaction)
            .then(HANDLER.setBasicInfo)
            .then(HANDLER.batchCopyWrapper)
            .then(HANDLER.insertGallery)
            .then(HANDLER.commitTransaction)
            .then(HANDLER.deepClean)
            .then(function (result) {
                response(result);
            })
            .catch(function (request) {
                HANDLER.onRejectWithRollback(request, response);
            });
    },

    /**
     * 编辑 - 医生
     * @param request
     * @param response
     */
    editDoctor: function (request, response) {
        HANDLER
            .setUpConnection({
                sqlUpdateInfo: EXEC_SQL.editDoctor,
                sqlFetchGallery: EXEC_SQL.fetchDoctorGallery,
                sqlInsertGallery: EXEC_SQL.insertDoctorGallery,
                sqlDeleteGallery: EXEC_SQL.deleteDoctorGallery,
                updateDataSet: [request.body.information, request.query.id],
                gallery: request.body.gallery,
                id: request.query.id
            })
            .then(HANDLER.beginTransaction)
            .then(HANDLER.updateBasicInfo)
            .then(HANDLER.fetchGallery)
            .then(HANDLER.batchRemoveWrapper)
            .then(HANDLER.removeGallery)
            .then(HANDLER.batchCopyWrapper)
            .then(HANDLER.insertGallery)
            .then(HANDLER.commitTransaction)
            .then(HANDLER.deepClean)
            .then(function (result) {
                response(result);
            })
            .catch(function (request) {
                HANDLER.onReject(request, response);
            });
    },

    deleteDoctor: function (request, response) {

        HANDLER
            .setUpConnection({
                id: request.params.id,
                index: 0,
                sqlFetchGallery: EXEC_SQL.fetchDoctorGallery,
                execSQLs: [
                    EXEC_SQL.deleteDoctorGallery,
                    EXEC_SQL.deleteDoctor
                ],
                information: [request.params.id]
            })
            .then(HANDLER.beginTransaction)
            .then(HANDLER.fetchGallery)
            .then(HANDLER.batchRemoveWrapper)
            .then(HANDLER.deleteDataSet)
            .then(HANDLER.commitTransaction)
            .then(HANDLER.cleanup)
            .then(function (result) {
                response(result);
            })
            .catch(function (request) {
                HANDLER.onReject(request, response);
            });
    },

    /**
     * 获取医生信息
     * @param request
     * @param response
     */
    fetchDoctorList: function (request, response) {

        HANDLER
            .setUpConnection({
                execSQL: EXEC_SQL.fetchDoctorList,
                values: null
            })
            .then(HANDLER.fetchList)
            .then(HANDLER.cleanup)
            .then(function (result) {
                if (result.code === 0) {
                    response(result.msg);
                } else {
                    response([]);
                }
            })
            .catch(function (request) {
                HANDLER.onReject(request, response);
            });
    },

    /**
     * 获取医生信息
     * @param request
     * @param response
     */
    querySpecificDoctor: function (request, response) {

        HANDLER
            .setUpConnection({
                doctor: {
                    sql: EXEC_SQL.querySpecificDoctor,
                    values: request.params.id
                },
                gallery: {
                    sql: EXEC_SQL.fetchDoctorGallery,
                    values: request.params.id
                },
                schedule: {
                    sql: EXEC_SQL.fetchRelativeSchedule,
                    values: [request.params.id]
                }
            })
            .then(HANDLER.fetchDataSet)
            .then(HANDLER.cleanup)
            .then(function (result) {
                response(result);
            })
            .catch(function (request) {
                HANDLER.onReject(request, response);
            });
    },

    queryRelativeDoctors: function (request, response) {

        HANDLER
            .setUpConnection({
                doctors: {
                    sql: EXEC_SQL.fetchRelativeDoctors,
                    values: request.params.id
                }
            })
            .then(HANDLER.fetchDataSet)
            .then(HANDLER.cleanup)
            .then(function (result) {
                response(result);
            })
            .catch(function (request) {
                HANDLER.onReject(request, response);
            });
    }
};

module.exports = api;