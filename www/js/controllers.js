angular.module('controllers', ['ngResource', 'services'])

    .controller('LoginCtrl', [ '$scope', '$state', 'Storage', 'Ontology', function ($scope, $state, Storage, Ontology) {
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
        User.set('marry', {password: 'marry,,,', role: 'doctor'})
        User.set('kingsley', {password: 'kingsley,,,', role: 'administrator'})
        return function (logInfo) {
          var result = User.get(logInfo.name)
          // console.log(result)
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

          if (login.role === 'doctor') {
            Storage.set('currentUser', user)
            console.log(user)
            // currentUser记录当前登录用户

            Ontology.readONT().then(function (data) {
              // 本体读入
              $state.go('main.select')
            })
          } else {

          }
        } else {
          $scope.logStatus = '用户名或密码错误。'
        }
      }

      // $scope.toRegister = function () { // 跳转到注册页面-电话验证
      //   Storage.set('setPasswordState', 'register')
      //   $state.go('phoneValid')
      // }

      // $scope.toReset = function () { // 跳转到找回密码页面-电话验证
      //   Storage.set('setPasswordState', 'reset')
      //   $state.go('phoneValid')
      // }
    }])

    .controller('outputCtrl', [ '$scope', '$state', 'Storage', '$timeout', function ($scope, $state, Storage, $timeout) {
      // SocketService.on('message', function (data) {
      //       // console.log(data);
      //   $scope.status = 'Connected'
      //   var myChart = echarts.init(document.getElementById('main'))
      //   myChart.showLoading()
      //       // 指定图表的配置项和数据
      //   var option = {
      //     title: {
      //       text: $scope.text
      //     },
      //     tooltip: {},
      //     legend: {
      //       data: ['params']
      //     },
      //     xAxis: {
      //       data: []
      //     },
      //     yAxis: {},
      //     series: [{
      //       name: '销量',
      //       type: 'line',
      //       data: data.data
      //     }]
      //   }

    }])

    .controller('MainCtrl', ['$scope', 'Storage', 'Data', '$state',
      function ($scope, Storage, Data, $state) {
        $scope.username=Storage.get('currentUser')

        $scope.createPats = function () {
          $state.go('main.input')
        }
        $scope.currentPats = function () {
          $state.go('main.select')
        }
      }
    ])

    // 主菜单栏
    .controller('MonitorsCtrl', ['$scope', 'Storage', 'Data', '$state',
      function ($scope, Storage, Data, $state) {
        $scope.toinspection = function () {
          $state.go('monitors.inspection')
        }
        $scope.torisk = function () {
          $state.go('monitors.risk')
        }
        $scope.tomedicine = function () {
          $state.go('monitors.medicine')
        }
        $scope.tolife = function () {
          $state.go('monitors.life')
        }
        $scope.toassess = function () {
          $state.go('monitors.assess')
        }
      }
    ])

    .controller('inputCtrl', ['$scope', 'Storage', 'Data', '$state',
      function ($scope, Storage, Data, $state) {
        $scope.accept = function () {
          console.log('确认了')
          $state.go('monitors.inspection')
        }
        $scope.cancel = function () {
          $scope.textInfo = {}
        }
      }
    ])

    .controller('inspectionCtrl', ['$scope', 'Storage', '$state', 'ExamRecommended',
      function ($scope, Storage, $state, ExamRecommended) {
        ExamRecommended.getScreenRec(Storage.get('currentPatient')).then(function (data) {
          // console.log(data)
          $scope.screens = data
        })
      }
    ])
    .controller('riskCtrl', ['$scope', 'Storage', 'Data', '$state',
      function ($scope, Storage, Data, $state) {

      }
    ])
    .controller('medicineCtrl', ['$scope', 'Storage', '$state',
      function ($scope, Storage, $state) {

      }
    ])
    .controller('lifeCtrl', ['$scope', 'Storage', 'Data', '$state',
      function ($scope, Storage, Data, $state) {

      }
    ])
    .controller('assessCtrl', ['$scope', 'Storage', 'Data', '$state',
      function ($scope, Storage, Data, $state) {

      }
    ])

    .controller('selectCtrl', ['$scope', 'Storage', 'Data', '$state', 'riskToONT',
      function ($scope, Storage, Data, $state, riskToONT) {
        $scope.userlist = [
          {
            patientname: '张三',
            patientid: 'P000125'
          },
          {
            patientname: '李四',
            patientid: 'P000121'
          }]

        $scope.toUserDetail = function (ID) {
          Storage.set('currentPatient', ID)
          riskToONT.normalRisk(ID)
          riskToONT.stateRisk(ID)
          // currentPatient记录当前选择的患者
          $state.go('monitors.inspection')
        }
      }
    ])
