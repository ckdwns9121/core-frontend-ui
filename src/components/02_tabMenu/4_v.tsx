// import cx from './cx';
// import { data } from './data';
// import VanillaWrapper from '../vanillaWrapper';

// type TabItem = {
//   id: string;
//   title: string;
//   description: string;
//   current: boolean;
//   toggle: () => void;
// };

// const TabItem = ({ id, title, description, current, toggle }: TabItem) => {
//   return (
//     <li className={cx('tab', { current })} key={id}>
//       <button className={cx('tab')} onClick={toggle}>
//         {title}
//       </button>
//     </li>
//   );
// };

// const buildTabItem = (item: TabItem) => {
//   const $tabItem = document.createElement('li');
//   $tabItem.className = cx('tab', { current: item.current });
//   $tabItem.innerHTML = item.title;
//   return $tabItem;
// };

// const buildDescription = () => {};
// const initiator = (wrapper: HTMLDivElement) => {
//   const $tabItems = data.map(buildTabItem);
//   const $tabList = document.createElement('ul');
//   $tabList.className = cx('tabList');
//   $tabList.append(...$tabItems);

//   const $description = data.map(buildDescription);

//   const $tabPanel = document.createElement('div');
//   $tabPanel.className = cx('tabPanel');
//   $tabPanel.append(...$description);

//   const $container = document.createElement('div');
//   $container.className = cx('container', 'tabMenu3-2');
//   $container.append($tabList, $tabPanel);

//   wrapper.append($container);
// };

// const TabMenu4 = () => <VanillaWrapper title="#4" initiator={initiator} />;

// export default TabMenu4;
