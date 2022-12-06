// Import stylesheets
import './style.css';
import 'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.7.2/angular.js';

angular
  .module('app', [])
  .service('PostService', [
    '$q',
    '$http',
    function ($q, $http) {
      let _posts = null;
      let _isLoading = false;
      let _postsAsync = null;
      let _isLoadingAsync = false;
      const deferrer = $q.defer();
      const deferrerAsync = $q.defer();
      const service = {
        getAll: getAll,
        getAllAsync: getAllAsync,
      };
      return service;

      function getAll() {
        if (_posts) {
          console.log('fromCache');
          return $q.resolve(_posts);
        }
        if (_isLoading) {
          console.log('fromDeferrer');
          return deferrer.promise;
        }
        _isLoading = true;
        return $http
          .get('https://jsonplaceholder.typicode.com/posts')
          .then((response) => {
            console.log('fromServer');
            const posts = response.data;
            _posts = posts;
            deferrer.resolve(posts);
            return posts;
          });
      }

      async function getAllAsync() {
        if (_postsAsync) {
          console.log('fromCacheAsync');
          return $q.resolve(_postsAsync);
        }
        if (_isLoadingAsync) {
          console.log('fromDeferrerAsync');
          return deferrerAsync.promise;
        }
        _isLoadingAsync = true;
        const response = await $http.get(
          'https://jsonplaceholder.typicode.com/posts'
        );
        console.log('fromServerAsync');
        const posts = response.data;

        _postsAsync = posts;
        deferrerAsync.resolve(posts);
        return posts;
      }
    },
  ])
  .component('postViewer', {
    template: `
    <button ng-click='vm.fetch()'>Fetch</button>
    <button ng-click='vm.fetchAsync()'>Fetch Async</button>
    <button ng-click='vm.fetchAsyncWithDigest()'>Fetch Async (digest)</button>
    <ul>
    <li ng-repeat="post in vm.getAll()">
    {{post.body}}
    </li>
    <li ng-if='!vm.posts.length'>No Posts Available</li>
    </ul>
    `,
    controllerAs: 'vm',
    controller: [
      'PostService',
      '$timeout',
      '$scope',
      function (PostService, $timeout, $scope) {
        var vm = this;

        vm.posts = [];
        vm.$onInit = initialize;
        vm.fetch = getPosts;
        vm.fetchAsync = getPostsAsync;
        vm.fetchAsyncWithDigest = getPostsAsyncWithDigest;
        vm.getAll = () => {
          return vm.posts;
        };

        async function initialize() {
          //runAsync();
        }

        function run() {
          for (let i = 0; i < 3; i++) {
            getPosts();
          }
          $timeout(() => {
            getPosts();
          }, 500);
        }

        function runAsync() {
          for (let i = 0; i < 3; i++) {
            getPostsAsync();
          }
          $timeout(() => {
            getPostsAsync();
          }, 500);
        }

        function getPosts() {
          console.log('getPosts');
          vm.posts = [];
          PostService.getAll().then((posts) => {
            vm.posts = posts;
          });
        }

        async function getPostsAsync() {
          console.log('getPostsAsync');
          vm.posts = [];
          console.log('reset at async posts', vm.posts);
          const posts = await PostService.getAllAsync();
          vm.posts = posts;
          console.log('assigned at async posts', vm.posts);
        }

        async function getPostsAsyncWithDigest() {
          console.log('getPostsAsync');
          vm.posts = [];
          console.log('reset at async posts digest', vm.posts);
          const posts = await PostService.getAllAsync();
          vm.posts = posts;
          console.log('assigned at async posts digest', vm.posts);
          $timeout(() => {
            console.log('digesting...');
            $scope.$digest();
          }, 1000);
        }
      },
    ],
  });

// Write Javascript code!
const appDiv = document.getElementById('app');
appDiv.innerHTML = `<div ng-app="app"><post-viewer></post-viewer></div>`;
