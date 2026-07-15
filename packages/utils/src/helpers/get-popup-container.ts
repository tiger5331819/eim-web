/**
 * If the node is holding inside a form, return the form element,
 * otherwise return the parent node of the given element or
 * the document body if the element is not provided.
 */
export function getPopupContainer(node?: HTMLElement): HTMLElement {
  return (
    node?.closest('form') ?? (node?.parentNode as HTMLElement) ?? document.body
  );
}

/**
 * VxeTable 操作列弹层挂载节点（Popconfirm / Dropdown 等）
 *
 * 中移项目（ant-design-vue）会挂到固定列容器，避免被遮挡。
 * 本仓库使用 antdv-next，弹层本身已支持滚动跟随；若再挂到
 * `.vxe-table--fixed-*` 容器，会出现确认框坐标偏移。
 * 因此统一挂到 body，调用方式仍与中移保持一致：
 * `:get-popup-container="getVxePopupContainer"`
 *
 * @see https://gitee.com/dapppp/ruoyi-plus-vben5/issues/IB1DM3
 */
export function getVxePopupContainer(_node?: HTMLElement): HTMLElement {
  return document.body;
}
