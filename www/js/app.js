// 'use strict'

angular.module('IntelligentDetector', ['ui.router', 'ui.bootstrap', 'controllers', 'services', 'directives', 'ngTable', 'ngAnimate', 'filters'])

    .config(['$stateProvider', '$urlRouterProvider',
      function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/login')

        $stateProvider
                // 登录
                .state('login', {
                  url: '/login',
                  templateUrl: 'templates/login.html',
                  controller: 'LoginCtrl'
                })

                // 主页面
                .state('main', {
                  url: '/main',
                  cache: false,
                  templateUrl: 'templates/main.html',
                  controller: 'MainCtrl'
                })
                .state('main.selectlist', {
                  url: '/selectlist',
                  templateUrl: 'templates/main/selectlist.html',
                  controller: 'selectlistCtrl'
                })
                .state('main.selectlist.select', {
                  url: '/select',
                  templateUrl: 'templates/main/selectlist/select.html',
                  controller: 'selectCtrl'
                })

                .state('main.selectlist.input', {
                  url: '/input',
                  templateUrl: 'templates/main/selectlist/input.html',
                  controller: 'inputCtrl'
                })
                .state('main.selectlist.create', {
                  url: '/input',
                  templateUrl: 'templates/main/selectlist/create.html',
                  controller: 'createCtrl'
                })
                .state('main.monitors', {
                  url: '/monitors',
                  templateUrl: 'templates/main/monitors.html',
                  controller: 'MonitorsCtrl'
                })

                .state('main.monitors.inspection', {
                  url: '/inspection',
                  templateUrl: 'templates/main/monitors/inspection.html',
                  controller: 'inspectionCtrl'
                })
                .state('main.monitors.diagnosis', {
                  url: '/inspection',
                  templateUrl: 'templates/main/monitors/diagnosis.html',
                  controller: 'diagnosisCtrl'
                })
                .state('main.monitors.risk', {
                  url: '/risk',
                  templateUrl: 'templates/main/monitors/risk.html',
                  controller: 'riskCtrl'
                })
                .state('main.monitors.medicine', {
                  url: '/medicine',
                  templateUrl: 'templates/main/monitors/medicine.html',
                  controller: 'medicineCtrl'
                })
                .state('main.monitors.medicineGroup', {
                  url: '/medicineGroup',
                  templateUrl: 'templates/main/monitors/medicineGroup.html',
                  controller: 'medicineGroupCtrl'
                })
                .state('main.monitors.life', {
                  url: '/life',
                  templateUrl: 'templates/main/monitors/life.html',
                  controller: 'lifeCtrl'
                })
                .state('main.monitors.assess', {
                  url: '/assess',
                  templateUrl: 'templates/main/monitors/assess.html',
                  controller: 'assessCtrl'
                })
                .state('fishbone', {
                  url: '/fishbone',
                  templateUrl: 'templates/fishbone.html',
                  controller: 'fishboneCtrl'
                })
      }
    ])

    .config(['$httpProvider', function ($httpProvider) {
      $httpProvider.interceptors.push('myInterceptor')
    }])
    .factory('myInterceptor', ['$rootScope', '$injector', function ($rootScope, $injector) {
      // var loading = $()

      var httpControl = {
        request: function (config) {
          // console.log(config)
          if (config.url.toString().indexOf('http:') === 0) {
            // console.log(config)
            $('body').LoadingOverlay('show')
          }
          return config
        },
        response: function (response) {
          if (response.config.url.toString().indexOf('http:') === 0) {
            if (response.data.flag != 1) {
              var $http = $injector.get('$http')
              return $http(response.config)
            }
            $('body').LoadingOverlay('hide')
          }

          return response
        },
        responseError: function (err) {
          $('body').LoadingOverlay('hide')
          // alert('网络有问题，请刷新！')
          return err
        }
      }
      return httpControl
    }])
