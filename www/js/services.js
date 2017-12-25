angular.module('services', ['ngResource'])

    .factory('Storage', ['$window', function ($window) {
      return {
        set: function (key, value) {
          $window.localStorage.setItem(key, value)
        },
        get: function (key) {
          return $window.localStorage.getItem(key)
        },
        rm: function (key) {
          $window.localStorage.removeItem(key)
        },
        clear: function () {
          $window.localStorage.clear()
        }
      }
    }])

    .constant('CONFIG', {
      baseUrl: 'http://localhost:1420/api/', // RESTful 服务器
      // localUrl: 'E:/1实验室/9 深圳863项目结题/深圳863—知识库/OWL and Rules/',
      localUrl:'/Users/ruh/Desktop/319/863/深圳863—知识库/OWL and Rules',
      model: 'RMDK v1.2.owl'

        /* List all the roles you wish to use in the app
         * You have a max of 31 before the bit shift pushes the accompanying integer out of
         * the memory footprint for an integer
         */
    })

    .factory('Data', ['$resource', '$q', '$interval', 'CONFIG', 'Storage', function ($resource, $q, $interval, CONFIG, Storage) {
      var serve = {}
      var abort = $q.defer
      // 本体
      var Ontology = function () {
        return $resource(CONFIG.baseUrl + ':path/:route', {
          path: 'OntRead'
        }, {
            // 录入本体
          readONT: { method: 'POST', params: { route: 'readModel', url: '@url', model: '@model', flag: 1}, timeout: 10000 },
          // 验证之前录入是否超过时限
          validateONT: { method: 'GET', params: { route: 'validModel', flag: 1 }, timeout: 10000 }

        })
      }
      // 输入回本体
      var InfoInput = function () {
        return $resource(CONFIG.baseUrl + ':path/:route', {
          path: 'InfoInput'
        }, {
            // 向患者输入数据属性，即添加患者信息,输入：string guid, string value, string property
          addPatProperty: { method: 'POST', params: { route: 'addObjProperty', guid: '@guid' }, timeout: 10000 },
          createPat: { method: 'POST', params: { route: 'crePatient' }, timeout: 10000 }

        })
      }
      // 诊断
      var Diagnosis = function () {
        return $resource(CONFIG.baseUrl + ':path/:route', { path: 'Diagnose' }, {
            // 风险因子
          riskFactor: { method: 'GET', params: { route: 'RiskFactor', guid: '@guid' }, timeout: 1000 },
          // 输出需要调用AddObjProperty输入回本体:防控疾病、生理状态
          // 分析患者需要防控的疾病，不做展示，但需要作为输入添加到患者属性中，即返回结果需要调用addObjProperty方法输入给患者。
          riskDiagnosis: { method: 'GET', params: { route: 'RiskDiagnosis', guid: '@guid' }, timeout: 1000 },
          // 推断患者个人生理状态，不做展示，但需要作为输入添加到患者属性中，即返回结果需要调用addObjProperty方法输入给患者。
          state: { method: 'GET', params: { route: 'state', guid: '@guid' }, timeout: 1000 }

        })
      }
      // 检查建议
      var ExamRecommended = function () {
        return $resource(CONFIG.baseUrl + ':path/:route', { path: 'ExamRec' }, {
            // 推理分析患者需要参与的医学检查，医学检查为检查组合名称，需要调用ExamInfo方法显示具体的检查项目。
          examRecommend: { method: 'GET', params: { route: 'ExamRecGen', guid: '@guid' }, timeout: 1000 },
          // 显示具体的医学检查项目，对接ExamRecGen方法。通过ExamRecGen方法得到的检查组，输入到ExamInfo方法中，得出患者具体需要参加的医学检查项目，结果分类显示。
          examInfo: { method: 'POST', params: { route: 'ExamInfo', list: '@list'}, timeout: 1000 },
          // 推理分析患者需要参与的疾病筛查，筛查为检查组合名称，需要调用ScreenInfo方法显示具体的检查项目。
          screenRecommend: { method: 'GET', params: { route: 'ScreenRecGen', guid: '@guid'}, timeout: 1000 },
          // 显示具体的筛查所需检查项目，注意事项，和筛查周期，对接ScreenRecGen方法。通过ScreenRecGen方法得到筛查组，输入到ScreenInfo方法中，得出患者具体需要参加的检查项目、注意事项，以及筛查周期。
          screenInfo: { method: 'GET', params: { route: 'ScreenInfo', ScreenIn: '@ScreenIn'}, timeout: 1000 }
        })
      }
      // 用药建议
      var MedicationRec = function () {
        return $resource(CONFIG.baseUrl + ':path/:route', { path: 'MedRec' }, {
          // 推理建议使用的药物。结果为药物在本体知识库中的名称，需要调用DrugInfo方法获得药物的具体信息。结果分类返回。
          drugsRec: { method: 'GET', params: { route: 'DrugProvider', guid: '@guid' }, timeout: 1000 },
          // 查询药物具体信息，包括名称、类型、用量、注意事项等，对接DrugProvider方法。需要将DrugProvider得到的DList、DListA和DListC输入到DrugInfo中，得到药物信息。
          drugsInfo: { method: 'POST', params: { route: 'DrugInfo' }, timeout: 1000 }

        })
      }

      // 生活建议
      var LifeAdivce = function () {
        return $resource(CONFIG.baseUrl + ':path/:route', { path: 'LifeRec' }, {
          // 推理给出患者的饮食建议，包括建议补充营养素、不建议补充营养素和适量补充营养素。
          dietRec: { method: 'GET', params: { route: 'DietRec', guid: '@guid'}, timeout: 1000 },
          // 推理给出运动建议，包括运动建议名称、运动内容和运动时间。
          exerciseRec: { method: 'GET', params: { route: 'ExerciseRec', guid: '@guid'}, timeout: 1000 },
          // 推理给出患者生理指标的控制目标。
          controlGoal: { method: 'GET', params: { route: 'ControlGoal', guid: '@guid'}, timeout: 1000 }

        })
      }

        // 评估结果
      var Evaluation = function () {
        return $resource(CONFIG.baseUrl + ':path/:route', { path: 'Evaluation' }, {
          evaluateScore: { method: 'GET', params: { route: 'CGEvalutaion', guid: '@guid', flag: 1 }, timeout: 1000 }

        })
      }

      serve.abort = function ($scope) {
        abort.resolve()
        $interval(function () {
          abort = $q.defer()

          serve.Ontology = Ontology()
          serve.InfoInput = InfoInput()
          serve.Diagnosis = Diagnosis()
          serve.ExamRecommended = ExamRecommended()
          serve.MedicationRec = MedicationRec()
          serve.LifeAdivce = LifeAdivce()

          serve.Evaluation = Evaluation()
        }, 0, 1)
      }

      serve.Ontology = Ontology()
      serve.InfoInput = InfoInput()
      serve.Diagnosis = Diagnosis()
      serve.ExamRecommended = ExamRecommended()
      serve.MedicationRec = MedicationRec()
      serve.LifeAdivce = LifeAdivce()

      serve.Evaluation = Evaluation()
      return serve
    }])

        // 录入本体
    .factory('Ontology', ['$http', '$q', 'CONFIG', 'Data', function ($http, $q, CONFIG, Data) {
      var self = this
      self.readONT = function () {
        var deferred = $q.defer()
        Data.Ontology.readONT({url: CONFIG.localUrl, model: CONFIG.model}, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }

      self.validateONT = function (obj) {
        var deferred = $q.defer()
        Data.Ontology.validateONT(obj, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }
      return self
    }])

    .factory('InfoInput', ['$http', '$q', 'CONFIG', 'Data', function ($http, $q, CONFIG, Data) {
      var self = this
      self.addPatProperty = function (obj) {
        var deferred = $q.defer()
        Data.InfoInput.addPatProperty(obj, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }
      self.createPat = function (obj) {
        var deferred = $q.defer()
        Data.InfoInput.createPat(obj, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }

      return self
    }])

    // 诊断
    .factory('Diagnosis', ['$http', '$q', 'Data', function ($http, $q, Data) {
      var self = this
      // {guid:P000125}
      self.riskFactor = function (obj) {
        var deferred = $q.defer()
        Data.Diagnosis.riskFactor(obj, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }
      self.riskDiagnosis = function (obj) {
        var deferred = $q.defer()
        Data.Diagnosis.riskDiagnosis(obj, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }
      self.state = function (obj) {
        var deferred = $q.defer()
        Data.Diagnosis.state(obj, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }
      return self
    }])

    // 检查建议
    .factory('ExamRecommended', ['$http', '$q', 'Data', 'CONFIG', function ($http, $q, Data, CONFIG) {
      var self = this
      // {guid:P000125}
      var examRecommend = function (obj) {
        var deferred = $q.defer()
        Data.ExamRecommended.examRecommend(obj, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }
      var examInfo = function (obj) {
        var deferred = $q.defer()
        Data.ExamRecommended.examInfo(obj, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }
      var screenRecommend = function (obj) {
        var deferred = $q.defer()
        Data.ExamRecommended.screenRecommend(obj, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }
      var screenInfo = function (obj) {
        var deferred = $q.defer()
        Data.ExamRecommended.screenInfo(obj, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }
      // 将examRecommend和examInfo对接
      self.getExamRec = function (guid) {
        var deferred = $q.defer()
        examRecommend({guid: guid}).then(function (data) {
          var examGroups = data.ExamRec
        })
      }
      // screenRecommend和screenInfo对接
      self.getScreenRec = function (guid) {
        var deferred = $q.defer()
        screenRecommend({guid: guid}).then(function (data) {
          // console.log(data)
          // var screenGroups = data.ScreenRec
          var promiseList = []
          data.ScreenRecNode.forEach(function (value) {
            promiseList.push(screenInfo({ScreenIn: value}))
          })
          $q.all(promiseList).then(function (res) {
            res.forEach(function (value) {
              value['ScreenRec'] = data.ScreenRec.shift()
              value.LabExam = value.LabExam.join()
              value.PhyExam = value.PhyExam.join()
              value.SpeExam = value.SpeExam.join()
              value.LabExamOp = value.LabExamOp.join()
              value.PhyExamOp = value.PhyExamOp.join()
              value.SpeExamOp = value.SpeExamOp.join()
            })
            deferred.resolve(res)
          }, function (err) {
            deferred.reject(err)
          })
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }

      return self
    }])
    // 药物建议
    .factory('MedicationRec', ['$http', '$q', 'Storage', 'Data', function ($http, $q, Storage, Data) {
      var self = this
      // {guid:P000125}
      self.drugsRec = function (obj) {
        var deferred = $q.defer()
        Data.MedicationRec.drugsRec(obj, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }
      self.drugsInfo = function (obj) {
        var deferred = $q.defer()
        Data.MedicationRec.drugsInfo(obj, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }
      return self
    }])
    // 生活建议
    .factory('LifeAdivce', ['$http', '$q', 'Storage', 'Data', function ($http, $q, Storage, Data) {
      var self = this
      // {guid:P000125}
      self.dietRec = function (obj) {
        var deferred = $q.defer()
        Data.LifeAdivce.dietRec(obj, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }
      self.exerciseRec = function (obj) {
        var deferred = $q.defer()
        Data.LifeAdivce.exerciseRec(obj, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }
      self.controlGoal = function (obj) {
        var deferred = $q.defer()
        Data.LifeAdivce.controlGoal(obj, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }

      return self
    }])

    // 评估结果
    .factory('Evaluation', ['$http', '$q', 'Storage', 'Data', function ($http, $q, Storage, Data) {
      var self = this
      // {guid:P000125}
      self.evaluateScore = function (obj) {
        var deferred = $q.defer()
        Data.Evaluation.evaluateScore(obj, function (data, headers) {
          deferred.resolve(data)
        }, function (err) {
          deferred.reject(err)
        })
        return deferred.promise
      }
      return self
    }])

    // 查询诊断结果并输入本体
    .factory('riskToONT', ['Diagnosis', 'InfoInput', function (Diagnosis, InfoInput) {
      var self = this
      self.normalRisk = function (guid) {
        Diagnosis.riskDiagnosis({guid: guid}).then(function (data) {
          if (data.flag === 1) {
            var proList = [], valueList = []
            data.DisRisk.forEach(function (value) {
              proList.push('P_hasRisk_Normal')
              valueList.push(value)
            })
            InfoInput.addPatProperty({guid: guid, property: proList, value: valueList}).then(function (res) {
              // console.log(res)
            })
          }
        })
      }
      self.stateRisk = function (guid) {
        Diagnosis.state({guid: guid}).then(function (data) {
          if (data.flag === 1) {
            var proList = [], valueList = []
            data.State.forEach(function (value) {
              proList.push('P_hasGeneralBodyStateFinding')
              valueList.push(value)
            })
            InfoInput.addPatProperty({guid: guid, property: proList, value: valueList}).then(function (res) {
              // console.log(res)
            })
          }
        })
      }
      return self
    }])
