import { type ComponentType } from 'react';
import Accordions from './components/01_accordion';
import TabMenus from './components/02_tabMenu';
import ToolTips from './components/03_tooltip';

const _routeMap = {
  root: {
    name: 'root',
    children: ['accordion', 'tabMenu', 'tooltip'],
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
