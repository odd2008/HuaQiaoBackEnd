const HANDLER = require('./mysql.handler');
const EXEC_SQL = require('./patient.interface');

var api = {

    /**
     * 新增 - 病人
     * @param request
     * @param response
     */
    addPatient: function (request, response) {

        HANDLER
            .setUpConnection({
                sqlBasicInfo: EXEC_SQL.addPatient,
                // information: request.body.information,
                information: {
                    name: '李云鹏',
                    sex: 0,
                    birthday: new Date(),
                    identity: '350303198512050039',
                    phone: '18159393355',
                    address: '福建莆田',
                    openid: 'osCkO0a1sPv2YDNBIAw7wFXlTib4'
                }
            })
            .then(HANDLER.beginTransaction)
            .then(HANDLER.setBasicInfo)
            .then(HANDLER.commitTransaction)
            .then(HANDLER.cleanup)
            .then(function (result) {
                response(result);
            })
            .catch(function (request) {
                HANDLER.onRejectWithRollback(request, response);
            });
    },

    /**
     * 编辑 - 病人
     * @param request
     * @param response
     */
    editPatient: function (request, response) {

        HANDLER
            .setUpConnection({
                sqlUpdateInfo: EXEC_SQL.editPatient,
                // information: [request.body.information, request.query.id]
                information: [
                    {
                        name: '李鹏',
                        sex: 1,
                        birthday: new Date(),
                        identity: '350303198512050048',
                        phone: '18760598086',
                        address: '福建莆田涵江',
                        openid: 'osCkO0a1sPv2YDNBIAw7wFXlTib4'
                    },
                    request.query.id
                ]
            })
            .then(HANDLER.beginTransaction)
            .then(HANDLER.updateBasicInfo)
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
     * 删除 - 病人
     * @param request
     * @param response
     */
    deletePatient: function (request, response) {

        HANDLER
            .setUpConnection({
                index: 0,
                execSQLs: [
                    EXEC_SQL.deletePatient
                ],
                information: [request.params.id]
            })
            .then(HANDLER.beginTransaction)
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
     * 获取 - 病人信息
     * @param request
     * @param response
     */
    fetchPatient: function (request, response) {


    }
};

module.exports = api;