angular.module('controllers', ['ngResource', 'services'])

    .controller('LoginCtrl', ['$scope', '$state', 'Storage', 'Ontology', function ($scope, $state, Storage, Ontology) {
        // 捆绑变量
      $scope.logStatus = '   '

        // 判断当前本地是否缓存了手机号
      if (Storage.get('Name') != null) { // 缓存了手机号 将其显示到输入栏
        $scope.login = {
          name: Storage.get('Name'),
          password: ''
        }
      } else { // 否则空白显示
        $scope.login = {
          name: '',
          password: ''
        }
      }

      $scope.login.role = 'doctor' // 默认选中医生角色
      var findUser = (function initailDatabase () {
        var User = new Map()
        User.set('marry', { password: 'marry,,,', role: 'doctor' })
        User.set('kingsley', { password: 'kingsley,,,', role: 'administrator' })
        return function (logInfo) {
          var result = User.get(logInfo.name)
          console.log(result)
          if (result) {
            return (result.password === logInfo.password && result.role === logInfo.role) ? logInfo.name : undefined
          }
        }
      }())

      $scope.LogIn = function (login) {
        var user = findUser(login)

        if (user) {
                // 可能是管理员 也可能是 医生
          $scope.logStatus = '恭喜您！登录成功。'

          Storage.set('currentUser', user)
          Storage.set('currentrole', login.role)

            // currentUser记录当前登录用户以及用户角色
          if (login.role === 'doctor') {
            Ontology.readONT().then(function (data) {
                        // 本体读入
              $state.go('main.selectlist.select')
            })
          } else {
            $state.go('fishbone')
          }
        } else {
          $scope.logStatus = '用户名或密码错误。'
        }
      }
    }])

    .controller('MainCtrl', ['$scope', 'Storage', '$state',

      function ($scope, Storage, $state) {
        $scope.UserName = Storage.get('currentUser')
        $scope.Role = Storage.get('currentrole')
        $scope.logout = function () {
          $state.go('login')
          Storage.clear()
        }
        $scope.toMain = function () {
          $state.go('main.selectlist.select')
          Storage.rm('currentPatient')
        }
      }
    ])

    // 主菜单栏
    .controller('MonitorsCtrl', ['$scope', 'Storage', '$state',
      function ($scope, Storage, $state) {
        $scope.pat = JSON.parse(Storage.get('PatientInfo'))
        $scope.todiagnosis = function () {
          $state.go('main.monitors.diagnosis')
        }
        $scope.toinspection = function () {
          $state.go('main.monitors.inspection')
        }
        $scope.torisk = function () {
          $state.go('main.monitors.risk')
        }
        $scope.tomedicine = function () {
          $state.go('main.monitors.medicine')
        }
        $scope.tolife = function () {
          $state.go('main.monitors.life')
        }
        $scope.toassess = function () {
          $state.go('main.monitors.assess')
        }
        $scope.tomedicineGroup = function () {
          $state.go('main.monitors.medicineGroup')
        }
      }
    ])

    .controller('inputCtrl', ['$scope', 'Storage', '$state', 'InfoInput', '$q',
      function ($scope, Storage, $state, InfoInput, $q) {
        $scope.logStatus = ''
        $scope.pat = {}
        $scope.pat.gender = 'Male'

        $scope.readFile = function () {
          if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            $scope.logStatus = 'The File APIs are not fully supported in this browser.'
            return
          }
          input = document.getElementById('inputfile')
          if (!input) {
            $scope.logStatus = "Um, couldn't find the fileinput element."
          } else if (!input.files) {
            $scope.logStatus = "This browser doesn't seem to support the `files` property of file inputs."
          } else if (!input.files[0]) {
            $scope.logStatus = 'Please select a file'
          } else {
            file = input.files[0]
            fr = new FileReader()
            fr.onload = function () {
              // Storage.set('tempInfo', fr.result)
              console.log(fr.result)
              var info = JSON.parse(fr.result)
              $scope.pat = info.basic
            }
            fr.readAsText(file)
          }
        }

        $scope.createPat = function (patient) {
          if (patient.age > 0) {
            InfoInput.createPat({guid: patient.id, time: new Date(), pid: patient.name}).then(function (data) {
              var age = InfoInput.addDataProperty({guid: patient.id, property: ['P_Age'], value: [String(Math.floor(patient.age))], type: ['1']})
              var gender = InfoInput.addPatProperty({guid: patient.id, property: ['P_hasPD_B_Sex'], value: [patient.gender]})
              $q.all([age, gender]).then(function (res) {
                console.log(res)
                if (res[0].flag === 1 && res[1].flag === 1) {
                  $scope.logStatus = '创建成功'
                  Storage.rm('PatientInfo')
                  Storage.set('currentPatient', patient.id)
                  $state.go('main.selectlist.create')
                } else {
                  $scope.logStatus = '出现错误，请重新创建。'
                }
              })
              //
            })
          } else {
            $scope.logStatus = '请输入正确的年龄'
          }
        }
      }
    ])

    .controller('createCtrl', ['$scope', 'Storage', 'Data', '$state', 'InfoInput', '$q', 'riskToONT',
      function ($scope, Storage, Data, $state, InfoInput, $q, riskToONT) {
        $scope.inputPage = 1
        $scope.previous = false
        $scope.buttonText = '下一步'
        $scope.pat = {}
        $scope.multi = {
          multiphysical: {},
          multihaits: {},
          multiendocrines: {},
          multicardios: {},
          multikidneys: {},
          multibloods: {},
          multihearts: {},
          multibreathes: {},
          multibrains: {},
          multiothers: {},
          multiallergy: {}

        }
        $scope.next = function (pat, multi) {
          console.log(multi)

          var id = Storage.get('currentPatient')
          if ($scope.inputPage == 4) {
            // 要把新的患者写进Storage里
            // debugger
            var dataList = {
              property: [],
              value: [],
              type: []
            }
            var objList = {
              property: [],
              value: []
            }
            if (pat.height && pat.weight != 0) {
              dataList.property.push('P_BMI')
              dataList.value.push(Math.round(pat.weight / Math.pow(pat.height, 2)))
              dataList.type.push('1')
            }
            if (pat.Hpressure) {
              dataList.property.push('P_Systolic')
              dataList.value.push(Math.round(pat.Hpressure))
              dataList.type.push('1')
            }
            if (pat.Lpressure) {
              dataList.property.push('P_Diastolic')
              dataList.value.push(Math.round(pat.Lpressure))
              dataList.type.push('1')
            }
            if (pat.sugar) {
              dataList.property.push('P_GLU')
              dataList.value.push(pat.sugar)
              dataList.type.push('2')
            }
            if (pat.sugar2h) {
              dataList.property.push('P_GLU2h')
              dataList.value.push(pat.sugar2h)
              dataList.type.push('2')
            }
            if (pat.sProtein) {
              dataList.property.push('P_HbA1c')
              dataList.value.push(pat.sProtein)
              dataList.type.push('2')
            }
            if (pat.HPL) {
              dataList.property.push('P_HDLC')
              dataList.value.push(pat.HPL)
              dataList.type.push('2')
            }
            if (pat.LPL) {
              dataList.property.push('P_LDLC')
              dataList.value.push(pat.LPL)
              dataList.type.push('2')
            }
            if (pat.cholesterol) {
              dataList.property.push('P_TC')
              dataList.value.push(pat.cholesterol)
              dataList.type.push('2')
            }
            if (pat.Triglycerides) {
              dataList.property.push('P_TG')
              dataList.value.push(pat.Triglycerides)
              dataList.type.push('2')
            }
            if (pat.urineRatio) {
              dataList.property.push('P_ACR')
              dataList.value.push(pat.urineRatio)
              dataList.type.push('2')
            }
            if (pat.ecr) {
              dataList.property.push('P_UAE')
              dataList.value.push(pat.ecr)
              dataList.type.push('2')
            }
            if (pat.Homocysteine) {
              dataList.property.push('P_Hcy')
              dataList.value.push(Math.round(pat.Homocysteine))
              dataList.type.push('1')
            }
            if (pat.phosphokinase) {
              dataList.property.push('P_CPK')
              dataList.value.push(pat.phosphokinase)
              dataList.type.push('2')
            }
            if (pat.aminotransferase) {
              dataList.property.push('P_ALT')
              dataList.value.push(Math.round(pat.aminotransferase))
              dataList.type.push('1')
            }
            if (pat.strokeHour) {
              dataList.property.push('P_StrokeHour')
              dataList.value.push(pat.strokeHour)
              dataList.type.push('2')
            }
            var addData = InfoInput.addDataProperty({guid: id, value: dataList.value, property: dataList.property, type: dataList.type})

            for (outkey in multi) {
              for (inkey in multi[outkey]) {
                if (multi[outkey][inkey] != '') {
                  objList.property.push(multi[outkey][inkey])
                  objList.value.push(inkey)
                }
              }
            }
            if (pat.exercise && pat.exercise < 80) {
              objList.property.push('P_hasBehavior_Exercise')
              objList.value.push('PhysicalInactivity')
            }
            var addObj = InfoInput.addPatProperty({guid: id, value: objList.value, property: objList.property})
            $q.all([addData, addObj]).then(function (res) {
              if (res[0].flag == 1 && res[1].flag == 1) {
                InfoInput.PatientInfo({guid: id}).then(function (data) {
                  Storage.set('PatientInfo', JSON.stringify(data))
                  riskToONT.normalRisk(id)
                  riskToONT.stateRisk(id)
                  $state.go('main.monitors.inspection')
                })
              } else {
                $scope.buttonText = '再次提交'
              }
            })
          } else {
            $scope.inputPage ++
            $scope.buttonText = $scope.inputPage == 4 ? '完成了' : '下一步'
          }
          $scope.previous = true
        }
        $scope.last = function () {
          $scope.inputPage --
          if ($scope.inputPage == 1) {
            $scope.previous = false
          }
          $scope.buttonText = $scope.inputPage == 4 ? '完成了' : '下一步'
        }
        $scope.phys = [
          {
            name: '多饮',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Polydipsia'
          },
          {
            name: '多食',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Polyphagia'
          },
          {
            name: '多尿',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Polyuria'
          },
          {
            name: '呕吐',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Vomiting'
          },
          {
            name: '咳嗽',
            property: 'P_hasGeneralBodyStateFinding',

            value: 'Cough'
          },
          {
            name: '头痛',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Headache'
          },
          {
            name: '呼吸困难',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Dyspnea'
          },
          {
            name: '惊厥',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Convulsion'
          },
          {
            name: '意识障碍',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'DisturbanceOfConsciousness'
          },
          {
            name: '起疹',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Herpes'
          },
          {
            name: '疱疹',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Rash'
          },
          {
            name: '丘疹',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Papule'
          },
          {
            name: '乏力',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Fatigue'
          },
          {
            name: '发热',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Fever'
          },
          {
            name: '高热',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'SevereFever'
          },
          {
            name: '口齿不清',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Inarticulacy'
          },
          {
            name: '肥胖',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Overweight'
          },
          {
            name: '蛋白尿',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Albuminuria'
          },
          {
            name: '吞咽困难',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Dysphagia'
          },
          {
            name: '发绀',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Cyanosis'
          },
          {
            name: '口角歪斜',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'DistortionOfCommissure'
          },
          {
            name: '血脂紊乱',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Dyslipidemia'
          },
          {
            name: '面部麻木',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'FacialNumbness'
          },
          {
            name: '肢体麻木',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'Paraesthesia'
          },
          {
            name: '突发肢体麻木',
            property: 'P_hasGeneralBodyStateFindingAcu',
            value: 'Paraesthesia'
          },
          {
            name: '突发口齿不清',
            property: 'P_hasGeneralBodyStateFindingAcu',
            value: 'Inarticulacy'
          },
          {
            name: '突发惊厥',
            property: 'P_hasGeneralBodyStateFindingAcu',
            value: 'Convulsion'
          },
          {
            name: '突发面部麻木',
            property: 'P_hasGeneralBodyStateFindingAcu',
            value: 'FacialNumbness'
          },
          {
            name: '突发严重头痛',
            property: 'P_hasGeneralBodyStateFindingAcu',
            value: 'SevereHeadache'
          },
          {
            name: '突发意识障碍',
            property: 'P_hasGeneralBodyStateFindingAcu',
            value: 'DisturbanceOfConsciousness'
          }

        ]
        $scope.drugs = [
          {
            name: '卡托普利',
            property: 'P_hasMedicalAllergy',
            value: 'Captopril'
          },
          {
            name: '依那普利',
            property: 'P_hasMedicalAllergy',
            value: 'Enalapril'
          },
          {
            name: '赖诺普利',
            property: 'P_hasMedicalAllergy',
            value: 'Lisinopril'
          },
          {
            name: '氯吡格雷',
            property: 'P_hasMedicalAllergy',
            value: 'Clopidogrel'
          },
          {
            name: '氯沙坦',
            property: 'P_hasMedicalAllergy',
            value: 'Losartan'
          },
          {
            name: '缬沙坦',
            property: 'P_hasMedicalAllergy',
            value: 'Valsartan'
          },
          {
            name: '二甲双胍',
            property: 'P_hasMedicalAllergy',
            value: 'Metformin'
          },
          {
            name: '硝苯地平',
            property: 'P_hasMedicalAllergy',
            value: 'Nifedipine'
          },
          {
            name: '尼卡地平',
            property: 'P_hasMedicalAllergy',
            value: 'Nicardipine'
          },
          {
            name: '地高辛',
            property: 'P_hasMedicalAllergy',
            value: 'Digoxin'
          },
          {
            name: '华法林',
            property: 'P_hasMedicalAllergy',
            value: 'Warfarin'
          },
          {
            name: '阿司匹林',
            property: 'P_hasMedicalAllergy',
            value: 'Aspirin'
          },
          {
            name: '沙格列汀',
            property: 'P_hasMedicalAllergy',
            value: 'Saxagliptin'
          },
          {
            name: '西格列汀',
            property: 'P_hasMedicalAllergy',
            value: 'Sitagliptin'
          },
          {
            name: '维格列汀',
            property: 'P_hasMedicalAllergy',
            value: 'Vildagliptin'
          },
          {
            name: '非诺贝特',
            property: 'P_hasMedicalAllergy',
            value: 'Fenofibrate'
          },
          {
            name: '苯扎贝特',
            property: 'P_hasMedicalAllergy',
            value: 'Benzafibrate'
          },
          {
            name: '那格列奈',
            property: 'P_hasMedicalAllergy',
            value: 'Nateglinide'
          },
          {
            name: '瑞格列奈',
            property: 'P_hasMedicalAllergy',
            value: 'Repaglinide'
          },
          {
            name: '双嘧哒莫',
            property: 'P_hasMedicalAllergy',
            value: 'Dipyridamole'
          },
          {
            name: '氟伐他汀',
            property: 'P_hasMedicalAllergy',
            value: 'Fluvastatin'
          },
          {
            name: '洛伐他汀',
            property: 'P_hasMedicalAllergy',
            value: 'Lovastatin'
          },
          {
            name: '辛伐他汀',
            property: 'P_hasMedicalAllergy',
            value: 'Simvastatin'
          },
          {
            name: '格列本脲',
            property: 'P_hasMedicalAllergy',
            value: 'Glyburide'
          },
          {
            name: '吡格列酮',
            property: 'P_hasMedicalAllergy',
            value: 'Pioglitazone'
          },
          {
            name: '罗格列酮',
            property: 'P_hasMedicalAllergy',
            value: 'Rosiglitazone'
          },
          {
            name: '阿卡波糖',
            property: 'P_hasMedicalAllergy',
            value: 'Acarbose'
          },
          {
            name: '美托洛尔',
            property: 'P_hasMedicalAllergy',
            value: 'Metoprolol'
          },
          {
            name: '普萘洛尔',
            property: 'P_hasMedicalAllergy',
            value: 'Propranolol'
          }

        ]
        $scope.habits = [
          {
            name: '吸烟',
            property: 'P_hasBehavior_Smoke',
            value: 'Smoke'
          },
          {
            name: '过量饮酒',
            property: 'P_hasBehavior_Drink',
            value: 'OverDrink'
          },
          {
            name: '高盐饮食',
            property: 'P_hasBehavior_Diet',
            value: 'HighSaltDiet'
          },
          {
            name: '高脂饮食',
            property: 'P_hasBehavior_Diet',
            value: 'HighFatDiet'
          },
          {
            name: '精神压力大',
            property: 'P_hasBehavior_Mind',
            value: 'Tension_LongDuration'
          },
          {
            name: '近亲糖尿病史',
            property: 'P_hasPD_B_HD',
            value: 'RelativeDiabetes_FirstDegree'
          },
          {
            name: '家族心血管病史',
            property: 'P_hasPD_B_HD',
            value: 'RelativeCVD'
          },
          {
            name: '家族高血压病史',
            property: 'P_hasPD_B_HD',
            value: 'RelativeHypertension'
          },
          {
            name: '流感高发季',
            property: 'P_hasGeneralBodyStateFinding',
            value: 'InfluenzaSeason'
          }

        ]
        $scope.diags = {
          endocrine: [
            {
              name: '2型糖尿病',
              property: 'P_hasDisease',
              value: 'Type2Diabetes'
            },
            {
              name: '多囊卵巢综合症',
              property: 'P_hasDisease',
              value: 'PCOS'
            }

          ],
          heart: [
            {
              name: '冠心病',
              property: 'P_hasDisease',
              value: 'CoronaryHeartDisease'
            },
            {
              name: '心功能不全',
              property: 'P_hasDisease',
              value: 'CardiacInsufficiency'
            },
            {
              name: '心房颤动',
              property: 'P_hasDisease',
              value: 'AtrialFibrillation'
            }
          ],
          cardio: [
            {
              name: '心血管疾病',
              property: 'P_hasDisease',
              value: 'CardiovasucularDisease'
            },
            {
              name: '高血压',
              property: 'P_hasDisease',
              value: 'Hypertension'
            },
            {
              name: '颈动脉狭窄',
              property: 'P_hasDisease',
              value: 'CarotidArteryStenosis'
            },
            {
              name: '重度颈动脉狭窄',
              property: 'P_hasDisease',
              value: 'CarotidArteryStenosis_Severealve'
            },
            {
              name: '主动脉瓣狭窄',
              property: 'P_hasDisease',
              value: 'Aortostenosis'
            },
            {
              name: '深层静脉血栓',
              property: 'P_hasDisease',
              value: 'DeepVeinThrombosis'
            }

          ],
          breathe: [
            {
              name: '甲型流感',
              property: 'P_hasDisease',
              value: 'InfluenzaTypeA'
            },
            {
              name: '乙型流感',
              property: 'P_hasDisease',
              value: 'InfluenzaTypeB'
            }
          ],
          kidney: [
            {
              name: '糖尿病肾病',
              property: 'P_hasDisease',
              value: 'DiabeticNephropathy'
            },
            {
              name: '肾功能不全',
              property: 'P_hasDisease',
              value: 'ReducedKidneyFunction'
            },
            {
              name: '慢性肾病',
              property: 'P_hasDisease',
              value: 'CKD'
            }
          ],
          brain: [

            {
              name: '缺血性脑卒中',
              property: 'P_hasDisease',
              value: 'CerebralIschemicStroke'
            },
            {
              name: '缺血性脑卒中二级预防',
              property: 'P_hasPrevention',
              value: 'CerebralIschemicStroke'
            },
            {
              name: '短暂性脑缺血发作',
              property: 'P_hasDisease',
              value: 'TransientIschemicAttack'
            },
            {
              name: '蛛网膜下腔出血',
              property: 'P_hasDisease',
              value: 'SubarachnoidHemorrhage'
            }
          ],
          blood: [
            {
              name: '高脂血症',
              property: 'P_hasDisease',
              value: 'Hyperlipidemia'
            },
            {
              name: '高胆固醇血症',
              property: 'P_hasDisease',
              value: 'hypercholesteremia'
            },
            {
              name: '高纤维蛋白原血症',
              property: 'P_hasDisease',
              value: 'Hyperfibrinogenemia'
            },
            {
              name: '高同型半胱氨酸血症',
              property: 'P_hasDisease',
              value: 'Hyperhomocystinemia'
            }
          ],
          other: [
            {
              name: '糖尿病视网膜病变',
              property: 'P_hasDisease',
              value: 'DiabeticRetinopathy'
            },
            {
              name: '肝功能不全',
              property: 'P_hasDisease',
              value: 'ReducedLiverFunction'
            },
            {
              name: '手足口病',
              property: 'P_hasDisease',
              value: 'HFMD'
            },
            {
              name: '下肢动脉粥样硬化病变',
              property: 'P_hasDisease',
              value: 'LowerExtremityAtheroscleroticDisease'
            }

          ]
        }
      }
    ])

    .controller('inspectionCtrl', ['$scope', 'Storage', '$state', 'ExamRecommended',
      function ($scope, Storage, $state, ExamRecommended) {
        var id = Storage.get('currentPatient')
        ExamRecommended.getScreenRec(id).then(function (data) {
                // console.log(data)
          $scope.screens = data
        })
        ExamRecommended.getExamRec(id).then(function (data) {
                // console.log(data)
          $scope.exams = data
        })
      }

    ])

    .controller('diagnosisCtrl', ['$scope', 'Storage', '$state', 'Diagnosis',
      function ($scope, Storage, $state, Diagnosis) {
        Diagnosis.diseaseDiag({guid: Storage.get('currentPatient')}).then(function (data) {
          $scope.diags = data
        })
      }

    ])
    .controller('riskCtrl', ['$scope', 'Storage', 'Diagnosis', '$state',
      function ($scope, Storage, Diagnosis, $state) {
        Diagnosis.riskFactor({ guid: Storage.get('currentPatient') }).then(function (data) {
          $scope.risk = data
        })
      }
    ])

    .controller('medicineCtrl', ['$scope', 'Storage', 'MedicationRec', '$state',
      function ($scope, Storage, MedicationRec, Data, $state) {
        var DList = new Array()
        var DListA = new Array()
        var DListC = new Array()

        MedicationRec.drugsRec({ guid: Storage.get('currentPatient') }).then(function (data) {
          // console.log(data)
          $scope.DList = data.DListName
          $scope.DListA = data.DListAName
          $scope.DListC = data.DListCName
          DList = data.DList
          DListA = data.DListA
          DListC = data.DListC
        })

        $scope.modal_close = function (target) {
          $(target).modal('hide')
        }

        $scope.showinfo = function (style, index) {
          console.log($scope.DList[index])
          switch (style) {
            case 1:
              MedicationRec.drugsInfo({ DIn: DList[index] }).then(function (data) {
                console.log(data)
                $scope.info = data
              })
              break
            case 2:
              MedicationRec.drugsInfo({ DIn: DListA[index] }).then(function (data) {
                console.log(data)
                $scope.info = data
              })
              break
            case 3:
              MedicationRec.drugsInfo({ DIn: DListC[index] }).then(function (data) {
                console.log(data)
                $scope.info = data
              })
              break
          }
          $('#drugdetail').modal('show')
        }
      }
    ])
    .controller('medicineGroupCtrl', ['$scope', 'Storage', 'MedicationRec', '$state',
      function ($scope, Storage, MedicationRec, $state) {
        var medRec = [], medUnRec = [], medCaution = []
        MedicationRec.drugGroupsRec({guid: Storage.get('currentPatient')}).then(function (data) {
          $scope.group = data
          medRec = data.MedRecNode
          medUnRec = data.MedUnRecNode
          medCaution = data.MedCauRecNode
        })
        var drugList = []
        $scope.medicine = function (group, index) {
          switch (group) {
            case 'rec':
              MedicationRec.groupsInfo({rec: medRec[index]}).then(function (data) {
                $scope.chosen = true
                $scope.Combine = data.Combine
                $scope.drugs = data.DrugName
                $scope.Level = data.Level
                drugList = data.Drug
              })
              break
            case 'unrec':
              MedicationRec.groupsInfo({rec: medUnRec[index]}).then(function (data) {
                $scope.chosen = true
                $scope.Combine = data.Combine
                $scope.drugs = data.DrugName
                $scope.Level = data.Level

                drugList = data.Drug
              })
              break
            case 'caution':
              MedicationRec.groupsInfo({rec: medCaution[index]}).then(function (data) {
                $scope.chosen = true
                $scope.Combine = data.Combine
                $scope.Level = data.Level

                $scope.drugs = data.DrugName
                drugList = data.Drug
              })
              break
          }
        }
        $scope.modal_close = function (target) {
          $(target).modal('hide')
        }

        $scope.showinfo = function (index) {
          MedicationRec.drugsInfo({ DIn: drugList[index] }).then(function (data) {
            $scope.info = data
          })

          $('#drugdetail').modal('show')
        }
      }
    ])
    .controller('lifeCtrl', ['$scope', 'Storage', 'LifeAdivce', '$state',
      function ($scope, Storage, LifeAdivce, $state) {
        var patId = Storage.get('currentPatient')
        LifeAdivce.dietRec({ guid: patId }).then(function (data) {
          $scope.dietrec = data
        })
        LifeAdivce.exerciseRec({ guid: patId }).then(function (data) {
          $scope.exerreclist = data.exerinfo
        })
        LifeAdivce.controlGoal({ guid: patId }).then(function (data) {
          console.log(data)
          $scope.ctrl = data
        })
        LifeAdivce.habitRec({ guid: patId }).then(function (data) {
          console.log(data)
          $scope.habits = data.habit
        })
      }
    ])
    .controller('assessCtrl', ['$scope', 'Storage', 'Evaluation', '$state', 'LifeAdivce', '$q',
      function ($scope, Storage, Evaluation, $state, LifeAdivce, $q) {
        var id = Storage.get('currentPatient')

        Evaluation.evaluateScore({ guid: id }).then(function (data) {
          var keys = [
                    { word: 'BMI', code: 'bmi' },
                    { word: '收缩压', code: 'sys' },
                    { word: '舒张压', code: 'dia' },
                    { word: '空腹血糖', code: 'glu' },
                    { word: '糖耐受2小时后血糖', code: 'glu2h' },
                    { word: '糖化血红蛋白', code: 'hba1c' },
                    { word: '高密度脂蛋白胆固醇', code: 'hdl' },
                    { word: '低密度脂蛋白胆固醇', code: 'ldl' },
                    { word: '总胆固醇', code: 'tc' },
                    { word: '甘油三酯', code: 'tg' },
                    { word: '尿白蛋白/肌酐比值', code: 'acr' },
                    { word: '尿白蛋白排泄率', code: 'uae' }
          ]
          var results = new Map()
                // console.log(data)
          if (data.total != -1) {
            $scope.hellos = [{ score: data.total }]
          }

                // console.log($scope.totalScore)
          data.score.forEach(function (value, index) {
            if (value != -1) {
              results.set(keys[index].code, { key: keys[index].word, score: value })
            }
          })

          $q.all([LifeAdivce.controlGoal({ guid: id }), LifeAdivce.patControl({ guid: id })]).then(function (data) {
            var arr = []
            console.log(data)
            for (var [key, value] of results) {
              value.control = data[0][key]
              value.personal = data[1][key]
              arr.push(value)
            }
            $scope.items = arr
          })
        })
      }

    ])
    .controller('selectCtrl', ['$scope', 'Storage', 'Data', '$state', 'riskToONT', 'InfoInput',

      function ($scope, Storage, Data, $state, riskToONT, InfoInput) {
        var userlist = new Array()
        InfoInput.PatientInfo({ guid: 'P000125' }).then(function (data) {
          data.patientid = 'P000125'
          userlist.push(data)
        })
        InfoInput.PatientInfo({ guid: 'P000121' }).then(function (data) {
          data.patientid = 'P000121'
          userlist.push(data)
        })

        $scope.userlist = userlist

        $scope.toUserDetail = function (pat) {
          Storage.set('currentPatient', pat.patientid)
          riskToONT.normalRisk(pat.patientid)
          riskToONT.stateRisk(pat.patientid)
          Storage.set('PatientInfo', JSON.stringify(pat))
                // currentPatient记录当前选择的患者
          $state.go('main.monitors.inspection')
        }
      }
    ])

    .controller('selectlistCtrl', ['$scope', 'Storage', 'Data', '$state',

      function ($scope, Storage, Data, $state) {
        $scope.createPats = function () {
          $state.go('main.selectlist.input')
        }
        $scope.currentPats = function () {
          $state.go('main.selectlist.select')
        }
      }
    ])

    .controller('fishboneCtrl', ['$scope', 'Storage', '$state', function ($scope, Storage, $state) {
      $scope.UserName = Storage.get('currentUser')
      $scope.Role = Storage.get('currentrole')
      $scope.logout = function () {
        $state.go('login')
        Storage.clear()
      }
      $scope.level = '1' // 默认蓝
      $scope.changelv = function () {
        if ($scope.level == '1') {
          $('#fishBone01').fishBone(data_h4)
          $('#fishBone02').fishBone(data_f4)
          $('#fishBone03').fishBone(data_b4)
        } else if ($scope.level == '2') {
          $('#fishBone01').fishBone(data_h3)
          $('#fishBone02').fishBone(data_f3)
          $('#fishBone03').fishBone(data_b3)
        } else if ($scope.level == '3') {
          $('#fishBone01').fishBone(data_h2)
          $('#fishBone02').fishBone(data_f2)
          $('#fishBone03').fishBone(data_b2)
        } else if ($scope.level == '4') {
          $('#fishBone01').fishBone(data_h1)
          $('#fishBone02').fishBone(data_f1)
          $('#fishBone03').fishBone(data_b1)
        }
      }
      // var htmlobj = $.ajax({url: '/templates/ONTO1.json', async: false})
      // var dataString = htmlobj.responseText
      // console.log(dataString)
      // var data = JSON.parse(dataString)
      // // var data = eval('(' + dataString + ')')// 转换为json对象();
      // console.log(data)
    }])
