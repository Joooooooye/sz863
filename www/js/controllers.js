angular.module('controllers', ['ngResource', 'services'])

    .controller('LoginCtrl', ['$scope', '$state', 'Storage', 'Ontology', function($scope, $state, Storage, Ontology) {
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
        var findUser = (function initailDatabase() {
            var User = new Map()
            User.set('marry', {
                password: 'marry,,,',
                role: 'doctor'
            })
            User.set('kingsley', {
                password: 'kingsley,,,',
                role: 'administrator'
            })
            return function(logInfo) {
                var result = User.get(logInfo.name)
                console.log(result)
                if (result) {
                    return (result.password === logInfo.password && result.role === logInfo.role) ? logInfo.name : undefined
                }
            }
        }())

        $scope.LogIn = function(login) {
            var user = findUser(login)

            if (user) {
                // 可能是管理员 也可能是 医生
                $scope.logStatus = '恭喜您！登录成功。'

                Storage.set('currentUser', user)
                Storage.set('currentrole', login.role)

                // currentUser记录当前登录用户以及用户角色
                if (login.role === 'doctor') {
                    Ontology.readONT().then(function(data) {
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

        function($scope, Storage, $state) {
            $scope.UserName = Storage.get('currentUser')
            $scope.Role = Storage.get('currentrole')
            $scope.logout = function() {
                $state.go('login')
                Storage.clear()
            }
            $scope.toMain = function() {
                $state.go('main.selectlist.select')
                Storage.rm('currentPatient')
            }
        }
    ])

    // 主菜单栏
    .controller('MonitorsCtrl', ['$scope', 'Storage', '$state',
        function($scope, Storage, $state) {
            $scope.pat = JSON.parse(Storage.get('PatientInfo'))
            $scope.todiagnosis = function() {
                $state.go('main.monitors.diagnosis')
            }
            $scope.toinspection = function() {
                $state.go('main.monitors.inspection')
            }
            $scope.torisk = function() {
                $state.go('main.monitors.risk')
            }
            $scope.tomedicine = function() {
                $state.go('main.monitors.medicine')
            }
            $scope.tolife = function() {
                $state.go('main.monitors.life')
            }
            $scope.toassess = function() {
                $state.go('main.monitors.assess')
            }
            $scope.tomedicineGroup = function() {
                $state.go('main.monitors.medicineGroup')
            }
        }
    ])

    .controller('inputCtrl', ['$scope', 'Storage', '$state',
        function($scope, Storage, $state) {
            $scope.logStatus = ''
            $scope.pat = {}
            $scope.pat.gender = 'male'
            $scope.createPat = function(patient) {
                $state.go('main.selectlist.create')
            }
        }
    ])

    .controller('createCtrl', ['$scope', 'Storage', 'Data', '$state',
        function($scope, Storage, Data, $state) {
            $scope.inputPage = 1
            $scope.previous = false
            $scope.buttonText = '下一步'
            $scope.next = function() {
                if ($scope.inputPage == 3) {
                    // 要把新的患者写进Storage里
                    $state.go('main.monitors.inspection')
                } else {
                    $scope.inputPage++
                        $scope.buttonText = $scope.inputPage == 3 ? '完成了' : '下一步'
                }
                $scope.previous = true
            }
            $scope.last = function() {
                $scope.inputPage--
                    if ($scope.inputPage == 1) {
                        $scope.previous = false
                    }
            }
            $scope.phys = [{
                    name: '多饮',
                    value: 'overdrunk'
                }, {
                    name: '多食',
                    value: 'overdine'
                }, {
                    name: '多尿',
                    value: 'overpee'
                }, {
                    name: '呕吐',
                    value: 'vommit'
                }, {
                    name: '咳嗽',
                    value: 'stress'
                }, {
                    name: '头痛',
                    value: 'diabets'
                }, {
                    name: '呼吸困难',
                    value: 'breathe'
                }, {
                    name: '惊厥',
                    value: 'thrill'
                }, {
                    name: '意识障碍',
                    value: 'conscious'
                }, {
                    name: '疱疹',
                    value: 'herpis'
                }, {
                    name: '乏力',
                    value: 'fatigue'
                }, {
                    name: '发热',
                    value: 'toothy'
                }, {
                    name: '口齿不清',
                    value: 'hypertension'
                }, {
                    name: '肥胖',
                    value: 'obesity'
                }, {
                    name: '蛋白尿',
                    value: 'Proteinuria'
                }, {
                    name: '吞咽困难',
                    value: 'swallow'
                }

            ]
            $scope.habits = [{
                    name: '吸烟',
                    value: 'smoke'
                }, {
                    name: '饮酒',
                    value: 'drink'
                }, {
                    name: '高盐饮食',
                    value: 'salt'
                }, {
                    name: '高脂饮食',
                    value: 'oil'
                }, {
                    name: '精神压力大',
                    value: 'stress'
                }, {
                    name: '近亲糖尿病史',
                    value: 'diabets'
                }, {
                    name: '家族心血管病史',
                    value: 'heart'
                }, {
                    name: '家族高血压病史',
                    value: 'hypertension'
                }

            ]
            $scope.diags = {
                endocrine: [{
                    name: '1型糖尿病',
                    value: 'dm1'
                }, {
                    name: '2型糖尿病',
                    value: 'dm2'
                }, {
                    name: '糖尿病',
                    value: 'dm'
                }, {
                    name: '妊娠型糖尿病',
                    value: 'Gestational'
                }],
                heart: [{
                    name: '冠心病',
                    value: 'chd'
                }, {
                    name: '心功能不全',
                    value: 'hf'
                }, {
                    name: '心房颤动',
                    value: 'af'
                }],
                cardio: [{
                        name: '心血管疾病史',
                        value: 'heartHistory'
                    }, {
                        name: '高血压',
                        value: 'hypertension'
                    }

                ],
                breathe: [{
                    name: '甲型流感',
                    value: 'flu1'
                }, {
                    name: '乙型流感',
                    value: 'flu2'
                }, {
                    name: '丙型流感',
                    value: 'flu3'
                }, {
                    name: '流感',
                    value: 'flu'
                }],
                kidney: [{
                    name: '糖尿病肾病',
                    value: 'dmKID'
                }, {
                    name: '肾功能不全',
                    value: 'KF'
                }, {
                    name: '慢性肾病',
                    value: 'CKD'
                }],
                brain: [{
                    name: '脑卒中',
                    value: 'brain1'
                }, {
                    name: '缺血性脑卒中',
                    value: 'brain2'
                }, {
                    name: '短暂性脑缺血发作',
                    value: 'brain3'
                }, {
                    name: '蛛网膜下腔出血',
                    value: 'brain4'
                }],
                blood: [{
                    name: '高脂血症',
                    value: 'blood1'
                }, {
                    name: '高胆固醇血症',
                    value: 'blood2'
                }, {
                    name: '高纤维蛋白原血症',
                    value: 'blood3'
                }, {
                    name: '高同型半胱氨酸血症',
                    value: 'blood4'
                }],
                other: [{
                    name: '糖尿病视网膜病变',
                    value: 'dmEye'
                }, {
                    name: '肝功能不全',
                    value: 'LiverF'
                }, {
                    name: '手足口病',
                    value: 'HFM'
                }, {
                    name: '下肢动脉粥样硬化病变',
                    value: 'LB'
                }, {
                    name: '重度颈动脉狭窄',
                    value: 'valve'
                }]
            }
        }
    ])

    .controller('inspectionCtrl', ['$scope', 'Storage', '$state', 'ExamRecommended',
        function($scope, Storage, $state, ExamRecommended) {
            var id = Storage.get('currentPatient')
            ExamRecommended.getScreenRec(id).then(function(data) {
                // console.log(data)
                $scope.screens = data
            })
            ExamRecommended.getExamRec(id).then(function(data) {
                // console.log(data)
                $scope.exams = data
            })
        }

    ])

    .controller('diagnosisCtrl', ['$scope', 'Storage', '$state', 'Diagnosis',
        function($scope, Storage, $state, Diagnosis) {
            Diagnosis.diseaseDiag({
                guid: Storage.get('currentPatient')
            }).then(function(data) {
                $scope.diags = data
            })
        }

    ])
    .controller('riskCtrl', ['$scope', 'Storage', 'Diagnosis', '$state',
        function($scope, Storage, Diagnosis, $state) {
            Diagnosis.riskFactor({
                guid: Storage.get('currentPatient')
            }).then(function(data) {
                $scope.risk = data
            })
        }
    ])

    .controller('medicineCtrl', ['$scope', 'Storage', 'MedicationRec', '$state',
        function($scope, Storage, MedicationRec, Data, $state) {
            var DList = new Array()
            var DListA = new Array()
            var DListC = new Array()

            MedicationRec.drugsRec({
                guid: Storage.get('currentPatient')
            }).then(function(data) {
                // console.log(data)
                $scope.DList = data.DListName
                $scope.DListA = data.DListAName
                $scope.DListC = data.DListCName
                DList = data.DList
                DListA = data.DListA
                DListC = data.DListC
            })

            $scope.modal_close = function(target) {
                $(target).modal('hide')
            }

            $scope.showinfo = function(style, index) {
                console.log($scope.DList[index])
                switch (style) {
                    case 1:
                        MedicationRec.drugsInfo({
                            DIn: DList[index]
                        }).then(function(data) {
                            console.log(data)
                            $scope.info = data
                        })
                        break
                    case 2:
                        MedicationRec.drugsInfo({
                            DIn: DListA[index]
                        }).then(function(data) {
                            console.log(data)
                            $scope.info = data
                        })
                        break
                    case 3:
                        MedicationRec.drugsInfo({
                            DIn: DListC[index]
                        }).then(function(data) {
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
        function($scope, Storage, MedicationRec, $state) {
            var medRec = [],
                medUnRec = [],
                medCaution = []
            MedicationRec.drugGroupsRec({
                guid: Storage.get('currentPatient')
            }).then(function(data) {
                $scope.group = data
                medRec = data.MedRecNode
                medUnRec = data.MedUnRecNode
                medCaution = data.MedCauRecNode
            })
            var drugList = []
            $scope.medicine = function(group, index) {
                switch (group) {
                    case 'rec':
                        MedicationRec.groupsInfo({
                            rec: medRec[index]
                        }).then(function(data) {
                            $scope.chosen = true
                            $scope.Combine = data.Combine
                            $scope.drugs = data.DrugName
                            $scope.Level = data.Level
                            drugList = data.Drug
                        })
                        break
                    case 'unrec':
                        MedicationRec.groupsInfo({
                            rec: medUnRec[index]
                        }).then(function(data) {
                            $scope.chosen = true
                            $scope.Combine = data.Combine
                            $scope.drugs = data.DrugName
                            $scope.Level = data.Level

                            drugList = data.Drug
                        })
                        break
                    case 'caution':
                        MedicationRec.groupsInfo({
                            rec: medCaution[index]
                        }).then(function(data) {
                            $scope.chosen = true
                            $scope.Combine = data.Combine
                            $scope.Level = data.Level

                            $scope.drugs = data.DrugName
                            drugList = data.Drug
                        })
                        break
                }
            }
            $scope.modal_close = function(target) {
                $(target).modal('hide')
            }

            $scope.showinfo = function(index) {
                MedicationRec.drugsInfo({
                    DIn: drugList[index]
                }).then(function(data) {
                    $scope.info = data
                })

                $('#drugdetail').modal('show')
            }
        }
    ])
    .controller('lifeCtrl', ['$scope', 'Storage', 'LifeAdivce', '$state',
        function($scope, Storage, LifeAdivce, $state) {
            LifeAdivce.dietRec({
                guid: Storage.get('currentPatient')
            }).then(function(data) {
                $scope.dietrec = data
            })
            LifeAdivce.exerciseRec({
                guid: Storage.get('currentPatient')
            }).then(function(data) {
                $scope.exerreclist = data.exerinfo
            })
            LifeAdivce.controlGoal({
                guid: Storage.get('currentPatient')
            }).then(function(data) {
                console.log(data)
                $scope.ctrl = data
            })
        }
    ])
    .controller('assessCtrl', ['$scope', 'Storage', 'Evaluation', '$state', 'LifeAdivce', '$q',
        function($scope, Storage, Evaluation, $state, LifeAdivce, $q) {
            var id = Storage.get('currentPatient')

            Evaluation.evaluateScore({
                guid: id
            }).then(function(data) {
                var keys = [{
                    word: 'BMI',
                    code: 'bmi'
                }, {
                    word: '收缩压',
                    code: 'sys'
                }, {
                    word: '舒张压',
                    code: 'dia'
                }, {
                    word: '空腹血糖',
                    code: 'glu'
                }, {
                    word: '糖耐受2小时后血糖',
                    code: 'glu2h'
                }, {
                    word: '糖化血红蛋白',
                    code: 'hba1c'
                }, {
                    word: '高密度脂蛋白胆固醇',
                    code: 'hdl'
                }, {
                    word: '低密度脂蛋白胆固醇',
                    code: 'ldl'
                }, {
                    word: '总胆固醇',
                    code: 'tc'
                }, {
                    word: '甘油三酯',
                    code: 'tg'
                }, {
                    word: '尿白蛋白/肌酐比值',
                    code: 'acr'
                }, {
                    word: '尿白蛋白排泄率',
                    code: 'uae'
                }]
                var results = new Map()
                // console.log(data)
                $scope.hellos = [{
                    score: data.total
                }]
                // console.log($scope.totalScore)
                data.score.forEach(function(value, index) {
                    if (value != -1) {
                        results.set(keys[index].code, {
                            key: keys[index].word,
                            score: value
                        })
                    }
                })

                $q.all([LifeAdivce.controlGoal({
                    guid: id
                }), LifeAdivce.patControl({
                    guid: id
                })]).then(function(data) {
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
    .controller('selectCtrl', ['$scope', 'Storage', 'Data', '$state', 'riskToONT', 'InfoInput', '$timeout',

        function($scope, Storage, Data, $state, riskToONT, InfoInput, $timeout) {
            var userlist = new Array()
            InfoInput.PatientInfo({
                guid: 'P000125'
            }).then(function(data) {
                data.patientid = 'P000125'
                userlist.push(data)
            })
            $timeout(
                InfoInput.PatientInfo({
                    guid: 'P000121'
                }).then(function(data) {
                    data.patientid = 'P000121'
                    userlist.push(data)
                }),
                500)

            $scope.userlist = userlist

            $scope.toUserDetail = function(pat) {
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

        function($scope, Storage, Data, $state) {
            $scope.createPats = function() {
                $state.go('main.selectlist.input')
            }
            $scope.currentPats = function() {
                $state.go('main.selectlist.select')
            }
        }
    ])

    .controller('fishboneCtrl', ['$scope', 'Storage', '$state', '$timeout', function($scope, Storage, $state, $timeout) {
        $scope.UserName = Storage.get('currentUser')
        $scope.Role = Storage.get('currentrole')
        $scope.logout = function() {
            $state.go('login')
            Storage.clear()
        }
        $scope.level = '1' // 默认蓝
        $scope.changelv = function() {
            if ($scope.level == '1') {
                $('#fishBone01').fishBone(data_h4)
                $('#fishBone02').fishBone(data_f4)
                $('#fishBone03').fishBone(data_b4)
                create_svg(4,1,data_h4);
                create_svg(4,2,data_f4);
                create_svg(4,3,data_b4);
                query_detail()
            } else if ($scope.level == '2') {
                $('#fishBone01').fishBone(data_h3)
                $('#fishBone02').fishBone(data_f3)
                $('#fishBone03').fishBone(data_b3)
                create_svg(3,1,data_h3);
                create_svg(3,2,data_f3);
                create_svg(3,3,data_b3);
                query_detail()
            } else if ($scope.level == '3') {
                $('#fishBone01').fishBone(data_h2)
                $('#fishBone02').fishBone(data_f2)
                $('#fishBone03').fishBone(data_b2)
                create_svg(2,1,data_h2);
                create_svg(2,2,data_f2);
                create_svg(2,3,data_b2);
                query_detail()
            } else if ($scope.level == '4') {
                $('#fishBone01').fishBone(data_h1)
                $('#fishBone02').fishBone(data_f1)
                $('#fishBone03').fishBone(data_b1)                
                create_svg(1,1,data_h1);
                create_svg(1,2,data_f1);
                create_svg(1,3,data_b1);
                query_detail()
            }
        }

        var html_detail = $.ajax({
            url: '/templates/Detail.json',
            async: false
        })
        var dataString = html_detail.responseText
        var data = jQuery.parseJSON(dataString);
        // console.log(data)

        // $("li.step").bind("mouseenter", function(event) {
        //     var str = event.target.innerText
        //     var str_after = str.split("：")[1];
        //     console.log(str_after)
        //     for (i = 0; i < data.length; i++) {
        //         if (str_after == data[i].step) {
        //             people = data[i].people
        //             region = data[i].region
        //             if (people != "" || region != "") {
        //                 detail = "针对人群：" + people + "\n" + "针对地区：" + region
        //             } else if (people == "" || region != "") {
        //                 detail = "针对地区：" + region
        //             } else if (people != "" || region == "") {
        //                 detail = "针对人群：" + people
        //             }
        //         }
        //     }
        // })
        var people = ""
        var region = ""
        var detail = ""

        var query_detail = function() {
            $("li.step").on("mouseenter", function(event) {
                // $scope.people = ""
                // $scope.region = ""
                // $scope.detail = ""
                var str = event.target.innerText
                var str_after = str.split("：")[1];
                for (i = 0; i < data.length; i++) {
                    if (str_after == data[i].step) {
                        $scope.step = data[i].step
                        $scope.people = data[i].people
                        $scope.region = data[i].region
                        if ($scope.people != "" && $scope.region == "") {
                            $scope.detail = "针对人群："+$scope.people 
                        } else if ($scope.people == "" && $scope.region != "") {
                            $scope.detail = "针对地区："+$scope.region 
                        }else if($scope.people != "" && $scope.region != ""){
                             $scope.detail = "针对人群："+$scope.people +'<br />'+"针对地区："+$scope.region
                        }
                    }
                }
                var _this = this;
                $(this).popover({
              // delay:{ show: 500, hide: 100 },
                title: '<div style="width:200px;font-size:17px;height:20px">详情</div>',
                content: '<div style="width:200px;font-size:15px;height:100px">' + $scope.detail + '</div>',
                html: true
            });
                $(this).popover("show");
                $(this).siblings(".popover").on("mouseleave", function() {
                    $(_this).popover('hide');
                });
                // $timeout(function() {
                //     $('#step_detail').modal('show');
                // }, 100);
                // $timeout(function() {
                //     $('#step_detail').modal('hide');
                // }, 2000);
            }).on("mouseleave", function() {
                var _this = this;
                setTimeout(function() {
                    if (!$(".popover:hover").length) {
                        $(_this).popover("hide")
                    }
                }, 100);
            })
        }
        query_detail()
        

        var create_svg = function(level, index, data){
          bd = document.getElementById('fishBone0'+index).getElementsByTagName('ul')[0];
          var svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
          svg.setAttribute("class", "d3_map")
          svg.setAttribute("style", "z-index:1;top:0;position:absolute;left:0;height:350px;width:4000px;visibility:visible")

          bd.appendChild(svg)

          var get_location = function(data,index){
            var n = 0
            for(var x in data[index]){
              n++
            }
            var lines = n-2
            var x = index*150 + 15
            var y = 24*lines + 82
            if(index%2 !=  0){
              y = 350 - y
            }
            return {'x':x, 'y':y}
          }

          var p2p = new Array()
                  
          p2p_1_1 = [[0,1],[1,2],[1,3],[3,4],[1,5],[3,6],[3,7],[7,2],[1,8],[8,9]]
          p2p_1_2 = [[0,1],[1,2],[1,3],[1,4],[3,5],[4,6],[4,8],[1,7],[7,8]]
          p2p_1_3 = [[0,1],[1,2],[1,3],[2,4],[3,5],[4,1],[1,2],[4,6],[5,6]]
          p2p_2_1 = [[0,1],[1,2],[1,3],[2,4],[3,5],[4,5],[3,6]]
          p2p_2_2 = [[0,1],[1,2],[2,3],[1,3],[3,4],[3,5],[5,7],[5,6],[4,6]]
          p2p_2_3 = [[0,1],[0,2],[1,3],[2,4],[2,5],[3,5]]
          p2p_3_1 = [[0,1],[0,2],[1,4],[2,3],[4,5],[3,6],[5,6]]
          p2p_3_2 = [[0,1],[0,2],[1,3],[2,4],[4,5]]
          p2p_3_3 = [[0,1],[0,2],[1,3],[2,4],[4,5],[3,5]]
          p2p_4_1 = [[0,1],[1,3],[2,5],[4,5],[3,5]]
          p2p_4_2 = [[0,2],[2,3],[1,4]]
          p2p_4_3 = [[0,3],[3,4],[2,3],[1,4]]

          p2p_list = [[p2p_1_1,p2p_1_2,p2p_1_3],
                      [p2p_2_1,p2p_2_2,p2p_2_3],
                      [p2p_3_1,p2p_3_2,p2p_3_3],
                      [p2p_4_1,p2p_4_2,p2p_4_3]]

          p2p = p2p_list[level-1][index-1]
          console.log(p2p)

          $(p2p).each(function(index,content){
            resource = get_location(data,content[0])
            target = get_location(data,content[1])
            x1 = resource.x
            y1 = resource.y
            x2 = target.x
            y2 = target.y
            var d3_line = document.createElementNS("http://www.w3.org/2000/svg", "line")
            d3_line.setAttribute('x1',x1)
            d3_line.setAttribute('x2',x2)
            d3_line.setAttribute('y1',y1)
            d3_line.setAttribute('y2',y2)
            d3_line.setAttribute('style','stroke:#cccccc; stroke-width:4;visibility:visible')
            d3_line.setAttribute('stroke-dasharray', "10,5")
           
            svg.appendChild(d3_line)
    })
       
        }
        create_svg(4,1,data_h4);
        create_svg(4,2,data_f4);
        create_svg(4,3,data_b4); 
    }])