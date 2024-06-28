import { createWebHashHistory, createRouter } from 'vue-router';
import { RouteRecordRaw } from 'vue-router';
import store from './store';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/sbomPackages',
  },
  {
    path: '/login',
    name: 'login',
    meta: {
      title: '登录',
    },
    component: () => import('@/views/login/login.vue'),
  },
  {
    path: '/login/hasinfo',
    name: 'loginHasinfo',
    meta: {
      title: '登录',
    },
    component: () => import('@/views/login/login.vue'),
  },
  {
    path: '/sbomLayout',
    name: 'sbomLayout',
    redirect: '/sbomLayout/sbomPackages',
    component: () => import('@/components/Layout.vue'),
    children: [
      // {
      //   path: "/sbomDashboard",
      //   name: "sbomDashboard",
      //   component: () => import("@/views/SbomDashboard/SbomDashboard.vue"),
      // },
      {
        path: '/sbomPackages',
        name: 'sbomPackages',
        component: () => import('@/views/SbomPackagesList.vue'),
      },
      {
        path: '/sbomTraceChain',
        name: 'sbomTraceChain',
        component: () => import('@/views/SbomTraceChain.vue'),
      },
      // {
      //   path: "/sbomVulnerability",
      //   name: "sbomVulnerability",
      //   component: () => import("@/views/SbomVulnerability.vue"),
      // },
      // {
      //   path: '/sbomPanorama',
      //   name: 'sbomPanorama',
      //   component: () => import('@/views/SbomVulnPanorama.vue'),
      // },
    ],
  },

  // {
  //   path: "/packageDetails/:id",
  //   name: "package-details",
  //   component: () => import("@/components/PackagesDetails.vue"),
  // },
  {
    path: '/sbomPackageDetail/:id/:flag',
    name: 'sbomPackageDetail',
    component: () => import('@/views/SbomPackageDetail/SbomPackageDetail.vue'),
  },
  {
    path: '/sbomVulImpactChart',
    name: 'sbomVulImpactChart',
    component: () => import('@/components/SbomVulImpactChart.vue'),
  },
  {
    path: '/404',
    meta: {
      title: '404',
    },
    component: () => import('./components/NotFound.vue'),
  },
  {
    path: '/:pathMatch(.*)',
    redirect: '/404',
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const whiteList = ['/login', '/login/hasinfo', '/404']; // 白名单避免死循环
router.beforeEach(async (to, from, next) => {
  const userId = store.getters.getUser.userId || null;
  if (whiteList.includes(to.path)) {
    next();
  } else {
    if (!userId) {
      next('/login');
    } else {
      next();
    }
  }
});

export default router;
