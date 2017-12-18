﻿angular.module('services', ['ngResource'])

    .factory('Storage', ['$window', function($window) {
        return {
            set: function(key, value) {
                $window.localStorage.setItem(key, value);
            },
            get: function(key) {
                return $window.localStorage.getItem(key);
            },
            rm: function(key) {
                $window.localStorage.removeItem(key);
            },
            clear: function() {
                $window.localStorage.clear();
            }
        };
    }])

    .constant('CONFIG', {
        baseUrl: 'http://10.12.43.34:8090/Api/v1/', //RESTful 服务器  10.12.43.34:8090/Api/v1

        // socketPort: 'http://127.0.0.1:8080/realTime', //Socket 端口
        ImageAddressIP: "http://121.43.107.106:8088",
        ImageAddressFile: "/PersonalPhoto",
        ImageAddressFile_Check: "/PersonalPhotoCheck", //lrz20151104
        wsServerIP: "ws://" + "121.43.107.106" + ":4141",
        // ImageAddress = ImageAddressIP + ImageAddressFile + "/" + DoctorId + ".jpg";

        consReceiptUploadPath: 'cons/receiptUpload',
        userResUploadPath: 'user/resUpload',

        cameraOptions: { // 用new的方式创建对象? 可以避免引用同一个内存地址, 可以修改新的对象而不会影响这里的值: 用angular.copy
            quality: 75,
            destinationType: 0, // Camera.DestinationType = {DATA_URL: 0, FILE_URI: 1, NATIVE_URI: 2};
            sourceType: 0, // Camera.PictureSourceType = {PHOTOLIBRARY: 0, CAMERA: 1, SAVEDPHOTOALBUM: 2};
            allowEdit: true, // 会导致照片被正方形框crop, 变成正方形的照片
            encodingType: 0, // Camera.EncodingType = {JPEG: 0, PNG: 1};
            targetWidth: 100, // 单位是pix/px, 必须和下面的属性一起出现, 不会改变原图比例?
            targetHeight: 100,
            // mediaType: 0,  // 可选媒体类型: Camera.MediaType = {PICTURE: 0, VIDEO: 1, ALLMEDIA: 2};
            // correctOrientation: true,
            saveToPhotoAlbum: false,
            popoverOptions: {
                x: 0,
                y: 32,
                width: 320,
                height: 480,
                arrowDir: 15 // Camera.PopoverArrowDirection = {ARROW_UP: 1, ARROW_DOWN: 2, ARROW_LEFT: 4, ARROW_RIGHT: 8, ARROW_ANY: 15};
            },
            cameraDirection: 0 // 默认为前/后摄像头: Camera.Direction = {BACK : 0, FRONT : 1};
        },
        uploadOptions: {
            // fileKey: '',  // The name of the form element. Defaults to file. (DOMString)
            // fileName: '.jpg',  // 后缀名, 在具体controller中会加上文件名; 这里不能用fileName, 否则将CONFIG.uploadOptions赋值给任何变量(引用赋值)后, 如果对该变量的同名属性fileName的修改都会修改CONFIG.uploadOptions.fileName
            fileExt: '.jpg', // 后缀名, 在具体controller中会加上文件名
            httpMethod: 'POST', // 'PUT'
            mimeType: 'image/jpg', // 'image/png'
            //params: {_id: $stateParams.consId},
            // chunkedMode: true,
            //headers: {Authorization: 'Bearer ' + Storage.get('token')}
        }
        /* List all the roles you wish to use in the app
         * You have a max of 31 before the bit shift pushes the accompanying integer out of
         * the memory footprint for an integer
         */
    })

    .factory('extraInfo', function(CONFIG) {
        return {
            postInformation: function() {
                var postInformation = {};
                if (window.localStorage['UserId'] == null) {
                    postInformation.revUserId = 'who'
                } else {
                    postInformation.revUserId = window.localStorage['UserId'];
                }

                postInformation.TerminalIP = 'IP';
                if (window.localStorage['TerminalName'] == null) {
                    postInformation.TerminalName = 'which';
                } else {
                    postInformation.TerminalName = window.localStorage['TerminalName'];
                }
                postInformation.DeviceType = 2;
                return postInformation;
            },
            TerminalIP: function(data) {
                if (data == null) {
                    return angular.fromJson(window.localStorage['TerminalIP']);
                } else {
                    window.localStorage['TerminalIP'] = angular.toJson(data);
                }
            },
            TerminalName: function(data) {
                if (data == null) {
                    return angular.fromJson(window.localStorage['TerminalName']);
                } else {
                    window.localStorage['TerminalName'] = angular.toJson(data);
                }
            },

        }
    })

    .factory('SocketService', ['$rootScope', 'CONFIG', function($rootScope, CONFIG) {

        // console.log(CONFIG.socketPort);
        // var socket = io.connect(CONFIG.socketPort);

        var serve = {};

        serve.on = function(eventName, callback) {

            //     socket.on(eventName,function(){
            //         var args = arguments;
            //         $rootScope.$apply(function(){
            //             callback.apply(socket,args);
            //         })
            //     })

        };

        serve.emit = function(eventName, data, callback) {
            //     socket.emit(eventName, data, function(){
            //         var args = arguments;
            //         $rootScope.$apply(function(){
            //             if(callback){
            //                 callback.apply(socket,args);
            //             }
            //         })
            //     })
        };

        return serve;
    }])
    .factory('Data', ['$resource', '$q', '$interval', 'CONFIG', 'Storage', function($resource, $q, $interval, CONFIG, Storage) {
        var serve = {};
        var abort = $q.defer;
        var getToken = function() {
            return Storage.get('token');
        }

        var Users = function() {
            return $resource(CONFIG.baseUrl + ':path/:route', {
                path: 'UserInfo'
            }, {
                Login: { method: 'POST', headers: { token: getToken() }, params: { route: 'MstUserLogin' }, timeout: 10000 },
                Register: { method: 'POST', params: { route: 'MstUserRegister' }, timeout: 10000 },
                ChangePassword: { method: 'POST', params: { route: 'MstUserChangePassword' }, timeout: 10000 },
                UpdateUserInfo: { method: 'POST', params: { route: 'MstUserUpdateUserInfo' }, timeout: 10000 },
                GetUserInfo: { method: 'GET', params: { route: 'MstUserGetUserInfo' }, timeout: 10000 },
                CreateNewUserId: { method: 'GET', params: { route: 'MstUserCreateNewUserId' }, timeout: 10000 },
                GetUserByPhoneNo: { method: 'GET', params: { route: 'MstUserGetUserByPhoneNo' }, timeout: 10000 },
                GetReagentType: { method: 'GET', params: { route: 'MstReagentTypeGetAll' }, timeout: 10000, isArray: true },
            })
        };

        // 信息统计--张桠童
        var ItemInfo = function() {
            return $resource(CONFIG.baseUrl + ':path/:route', { path: 'ItemInfo' }, {
                GetSamplesInfo: { method: 'POST', params: { route: 'ItemSampleGetSamplesInfoByAnyProperty' }, timeout: 10000, isArray: true },
                GetReagentsInfo: { method: 'POST', params: { route: 'ItemReagentGetReagentsInfoByAnyProperty' }, timeout: 10000, isArray: true },
                GetIsolatorsInfo: { method: 'POST', params: { route: 'ItemIsolatorGetIsolatorsInfoByAnyProperty' }, timeout: 10000, isArray: true },
                GetIncubatorsInfo: { method: 'POST', params: { route: 'ItemIncubatorGetIncubatorsInfoByAnyProperty' }, timeout: 10000, isArray: true },
                SetSampleData: { method: 'POST', params: { route: 'ItemSampleCreateNewSample' }, timeout: 10000, isArray: true },
                CreateReagentId: { method: 'GET', params: { route: 'ItemReagentCreateReagentId', ReagentType: '@ReagentType' }, timeout: 10000 },
                SetReagentData: { method: 'POST', params: { route: 'ItemReagentSetData' }, timeout: 10000 },
                GetIncubatorEnv: { method: 'POST', params: { route: 'EnvIncubatorGetIncubatorEnvsByAnyProperty' }, timeout: 10000, isArray: true },
                GetIsolatorEnv: { method: 'POST', params: { route: 'EnvIsolatorGetIsolatorEnvsByAnyProperty' }, timeout: 10000, isArray: true }
            })
        }
        // 检测结果-张桠童
        var Result = function() {
            return $resource(CONFIG.baseUrl + ':path/:route', { path: 'Result' }, {
                GetTestResultInfo: { method: 'POST', params: { route: 'ResTestResultGetResultInfosByAnyProperty' }, timeout: 10000, isArray: true },
                                GetBreakDowns: { method: 'POST', params: { route: 'BreakDownGetBreakDownsByAnyProperty' }, timeout: 10000, isArray: true }

            })
        }
        // 仪器信息-张桠童
        var Operation = function() {
            return $resource(CONFIG.baseUrl + ':path/:route', { path: 'Operation' }, {
                GetEquipmentOps: { method: 'POST', params: { route: 'OpEquipmentGetEquipmentOpsByAnyProperty' }, timeout: 10000, isArray: true }
            })
        }

        serve.abort = function($scope) {
            abort.resolve();
            $interval(function() {
                abort = $q.defer();

                serve.Users = Users();
                serve.ItemInfo = ItemInfo();
                serve.Result = Result();
                serve.Operation = Operation();
            }, 0, 1);
        };

        serve.Users = Users();
        serve.ItemInfo = ItemInfo();
        serve.Result = Result();
        serve.Operation = Operation();
        return serve;
    }])

    //用户相关操作
    .factory('UserService', ['$http', '$q', 'Storage', 'Data', 'CONFIG', function($http, $q, Storage, Data, CONFIG) {
        // console.log("UserService Initializing");

        var serve = {};

        var phoneReg = /^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

        var idReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;


        var UID = Storage.get("UID");

        var phonenumber = '';

        var personalInfo = {
            UserId: UID,
            Identify: 1,
            PhoneNo: 1,
            UserName: 1,
            Role: 1,
            Password: 0,
            LastLoginTime: 1,
            RevisionInfo: 1
        };

        var personalInfo_n = ["UserId", "Identify", "PhoneNo", "UserName", "Role", "Password", "LastLoginTime", "RevisionInfo"];

        for (n in personalInfo)

            serve.SetPhenoNo = function(no) {
                phonenumber = no;
                console.log("已经缓存电话号码");
            };
        serve.GetPhenoNo = function() {
            return phonenumber;
        };

        serve.GetUID = function() {
            return UID;
        };
        serve.SetUID = function(id) {
            UID = id;
            console.log("已经缓存UID");
        };


        //登陆
        serve.Login = function(uid, password) {
            var deferred = $q.defer();
            Data.Users.Login({ UserId: uid, InPassword: password, TerminalIP: 1, TerminalName: 1, revUserId: uid }, function(data, headers, status) {
                deferred.resolve(data);

            }, function(err) {
                deferred.reject(err);
            });

            return deferred.promise;

        };
        //注册
        serve.RegisterUser = function(info) {
            var deferred = $q.defer();
            if (UID == '' || phonenumber == '') {
                console.log([UID, phonenumber]);
                deferred.resolve({ result: null });
                return deferred.promise;
            }


            Data.Users.Register({
                UserId: info.uid,
                Identify: info.id,
                PhoneNo: phonenumber,
                UserName: info.username,
                Role: info.role,
                Password: info.password,
                TerminalIP: 1,
                revUserId: UID
            }, function(data, headers, status) {
                console.log(data)

                deferred.resolve(data);

            }, function(err) {
                deferred.reject(err);
            });

            return deferred.promise;

        };
        //创建新的用户
        serve.CreateNewUserId = function(phonenumber) {
            var deferred = $q.defer();
            Data.Users.CreateNewUserId({ PhoneNo: phonenumber }, function(data, headers, status) {
                deferred.resolve(data);

            }, function(err) {
                deferred.reject(err);
            });

            return deferred.promise;
        };
        //用手机号获取用户ID
        serve.GetUserByPhoneNo = function(phonenumber) {
            var deferred = $q.defer();
            Data.Users.GetUserByPhoneNo({ PhoneNo: phonenumber }, function(data, headers, status) {
                deferred.resolve(data);

            }, function(err) {
                deferred.reject(err);
            });

            return deferred.promise;
        };

        //获取用户信息 输入下表 返回属性名和值(张桠童修改过)
        serve.GetUserInfo = function(obj) {
            var deferred = $q.defer();
            Data.Users.GetUserInfo(obj, function(data, headers) {
                deferred.resolve(data);
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };

        //修改密码
        serve.ChangePassword = function(password, ifp) {

            var deferred = $q.defer();
            Data.Users.ChangePassword({
                "UserId": UID,
                "IfPhone": ifp,
                "OldPassword": password.password_old,
                "NewPassword": password.password,
                "TerminalIP": CONFIG.baseUrl,
                "revUserId": UID
            }, function(data, headers, status) {
                deferred.resolve(data);
            }, function(err) {
                deferred.reject(err);
            });

            return deferred.promise;
        };

        // 获取试剂类型--张桠童添加
        serve.GetReagentType = function() {
            var deferred = $q.defer();
            Data.Users.GetReagentType(function(data, headers) {
                deferred.resolve(data);
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };

        //登陆


        //获取用户信息
        //获取权限？角色 -- > 如何限制到

        //修改用户信息

        //修改密码


        //二维码？

        //推送

        return serve;
    }])

    // 获取所有记录表
    .factory('RecordsService', ['$http', '$q', 'Storage', 'Data', function($http, $q, Storage, Data) {

        var serve = {};

        // 传导装置信息表
        // 无菌隔离器信息表
        // 培养箱信息表
        // 无菌检测试剂信息表


        // 样品记录表
        //
        //
        // 培养箱环境记录表
        // 隔离器参数记录表
        //
        //
        // 传导装置操作记录表
        // 无菌检测仪器操作记录表
        //
        //
        // 检测结果记录表
        // 样品培养记录表
        // 机器视觉分析记录表
        // 顶空分析记录表
        //
        // 更新信息
        // 故障信息



        //筛选 并且 组装成绘图 或者表格的样子

        //列名？？
        return serve;
    }])

    .factory('OperateService', ['$http', '$q', 'Storage', 'Data', 'UserService', function($http, $q, Storage, Data, UserService) {

        //初始化获得权限，根据权限返回操作的接口

        //初始化从服务器获得目前所处的状态

        var serve = {};
        return serve;
    }])

    // 获取统计信息--张桠童
    .factory('ItemInfo', ['$http', '$q', 'Storage', 'Data', function($http, $q, Storage, Data) {
        var self = this;
        // 获取样品信息表
        self.GetSamplesInfo = function(obj) {
            var deferred = $q.defer();
            Data.ItemInfo.GetSamplesInfo(obj, function(data, headers) {
                deferred.resolve(data);
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
        // 获取试剂信息表
        self.GetReagentsInfo = function(obj) {
            var deferred = $q.defer();
            Data.ItemInfo.GetReagentsInfo(obj, function(data, headers) {
                deferred.resolve(data);
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
        // 获取隔离器信息表
        self.GetIsolatorsInfo = function(obj) {
            var deferred = $q.defer();
            Data.ItemInfo.GetIsolatorsInfo(obj, function(data, headers) {
                deferred.resolve(data);
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
        // 获取培养箱信息表
        self.GetIncubatorsInfo = function(obj) {
            var deferred = $q.defer();
            Data.ItemInfo.GetIncubatorsInfo(obj, function(data, headers) {
                deferred.resolve(data);
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
        // 新建样品
        self.SetSampleData = function(obj) {
            var deferred = $q.defer();
            Data.ItemInfo.SetSampleData(obj, function(data, headers) {
                deferred.resolve(data);
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
        // 创建试剂编号
        self.CreateReagentId = function(ReagentType) {
            var deferred = $q.defer();
            Data.ItemInfo.CreateReagentId({ ReagentType: ReagentType }, function(data, headers) {
                deferred.resolve(data);
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
        // 新建试剂
        self.SetReagentData = function(obj) {
            var deferred = $q.defer();
            Data.ItemInfo.SetReagentData(obj, function(data, headers) {
                deferred.resolve(data);
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
        // 获取培养箱环境信息
        self.GetIncubatorEnv = function(arr) {
            var deferred = $q.defer();
            Data.ItemInfo.GetIncubatorEnv(arr, function(data, headers) {
                deferred.resolve(data);
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
        // 获取隔离器环境信息
        self.GetIsolatorEnv = function(arr) {
            var deferred = $q.defer();
            Data.ItemInfo.GetIsolatorEnv(arr, function(data, headers) {
                deferred.resolve(data);
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        }

        return self;
    }])

    // 获取检测结果--张桠童
    .factory('Result', ['$http', '$q', 'Storage', 'Data', function($http, $q, Storage, Data) {
        var self = this;
        // 获取检测结果信息表
        self.GetTestResultInfo = function(obj) {
            var deferred = $q.defer();
            Data.Result.GetTestResultInfo(obj, function(data, headers) {
                deferred.resolve(data);
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
        self.GetBreakDowns = function(obj) {
            var deferred = $q.defer();
            Data.Result.GetBreakDowns(obj, function(data, headers) {
                deferred.resolve(data);
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
        return self;
    }])

    // 获取仪器信息--张桠童
    .factory('Operation', ['$http', '$q', 'Storage', 'Data', function($http, $q, Storage, Data) {
        var self = this;
        // 获取检测结果信息表
        self.GetEquipmentOps = function(obj) {
            var deferred = $q.defer();
            Data.Operation.GetEquipmentOps(obj, function(data, headers) {
                deferred.resolve(data);
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
        return self;
    }])