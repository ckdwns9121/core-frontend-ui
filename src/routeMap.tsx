import { type ComponentType } from 'react';
import Accordions from './components/01_accordion';
import TabMenus from './components/02_tabMenu';
import ToolTips from './components/03_tooltip';
import ReactiveTextBoxes from './components/04_reactiveTextBox';
import LineClamps from './components/05_lineClamp';
import Forms from './components/06_form';
import LazyLoading1 from './components/07_lazyLoading/1_r';
import LazyLoading2 from './components/07_lazyLoading/2_r';
import LazyLoading3 from './components/07_lazyLoading/3_v';
const _routeMap = {
  root: {
    name: 'root',
    children: [
      'accordion',
      'tabMenu',
      'tooltip',
      'reactiveTextBox',
      'lineClamp',
      'form',
      'lazyLoading',
    ],
  },
  accordion: {
    name: '01. 아코디언',
    Component: Accordions,
  },
  tabMenu: {
    name: '02. 탭 메뉴',
    Component: TabMenus,
  },
  tooltip: {
    name: '03. 툴팁',
    Component: ToolTips,
  },
  reactiveTextBox: {
    name: '04. 리액티브 텍스트박스',
    Component: ReactiveTextBoxes,
  },
  lineClamp: {
    name: '05. 말줄임',
    Component: LineClamps,
  },
  form: {
    name: '06. 폼 컨트롤',
    Component: Forms,
  },
  lazyLoading: {
    link: 'lazyLoading/1_r',
    name: '07. 지연로딩',
    children: ['lazyLoading/1_r', 'lazyLoading/2_r', 'lazyLoading/3_v'],
  },
  'lazyLoading/1_r': {
    name: '1R 직접계산',
    Component: LazyLoading1,
  },
  'lazyLoading/2_r': {
    name: '2R IntersectionObserver',
    Component: LazyLoading2,
  },
  'lazyLoading/3_v': {
    name: '3V Vanilla',
    Component: LazyLoading3,
  },
};

export type RoutePath = keyof typeof _routeMap;

type BaseRoute = { name: string; link?: RoutePath };
export type ParentRoute = BaseRoute & { children: RoutePath[] };
export type ChildRoute = BaseRoute & { Component: ComponentType | null };
export type Route = ChildRoute | ParentRoute;
export const routeMap = _routeMap as Record<RoutePath, Route>;

export const isParentRoute = (route: Route): route is ParentRoute =>
  'children' in route;
export const gnbRootList: [RoutePath, Route][] = (
  routeMap.root as ParentRoute
).children.map(r => [r, routeMap[r]]);
